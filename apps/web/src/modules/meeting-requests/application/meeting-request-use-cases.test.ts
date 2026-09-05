import { beforeEach, describe, expect, it } from "vitest";
import { CreateMeetingRequestUseCase } from "./create-meeting-request.use-case";
import { AcceptMeetingRequestUseCase } from "./accept-meeting-request.use-case";
import { DeclineMeetingRequestUseCase } from "./decline-meeting-request.use-case";
import { CounterProposeUseCase } from "./counter-propose.use-case";
import { CancelMeetingRequestUseCase } from "./cancel-meeting-request.use-case";
import {
  AvailabilityConflictError,
  ForbiddenMeetingRequestActionError,
  MeetingRequestConcurrentlyModifiedError,
  MeetingRequestNotFoundError,
} from "./errors";
import { MeetingRequestNotOpenError, NotAPartyError, NotAResponderError } from "../domain/negotiation";
import { InvalidTimeRangeError } from "../domain/time-range";
import { InMemoryMeetingRequestRepository } from "../adapters/in-memory-meeting-request-repository";
import { InMemoryCounterProposalRepository } from "../adapters/in-memory-counter-proposal-repository";
import { StubAvailabilityChecker } from "../adapters/stub-availability-checker";
import { StubEventCreator } from "../adapters/stub-event-creator";
import { InMemoryOutboxRepository } from "@/shared/outbox/in-memory-outbox-repository";

function buildScenario() {
  const meetingRequestRepository = new InMemoryMeetingRequestRepository();
  const counterProposalRepository = new InMemoryCounterProposalRepository();
  const availabilityChecker = new StubAvailabilityChecker("AVAILABLE");
  const eventCreator = new StubEventCreator();
  const outbox = new InMemoryOutboxRepository();

  return {
    meetingRequestRepository,
    counterProposalRepository,
    availabilityChecker,
    eventCreator,
    outbox,
    createRequest: new CreateMeetingRequestUseCase(meetingRequestRepository, outbox),
    accept: new AcceptMeetingRequestUseCase(
      meetingRequestRepository,
      counterProposalRepository,
      availabilityChecker,
      eventCreator,
      outbox,
    ),
    decline: new DeclineMeetingRequestUseCase(meetingRequestRepository, counterProposalRepository, outbox),
    counterPropose: new CounterProposeUseCase(meetingRequestRepository, counterProposalRepository, outbox),
    cancel: new CancelMeetingRequestUseCase(meetingRequestRepository, outbox),
  };
}

async function createBasicRequest(scenario: ReturnType<typeof buildScenario>) {
  return scenario.createRequest.execute({
    requesterId: "ana",
    title: "Jantar",
    startAt: new Date("2026-01-10T20:00:00Z"),
    endAt: new Date("2026-01-10T22:00:00Z"),
    participantUserIds: ["joao"],
  });
}

describe("CreateMeetingRequestUseCase", () => {
  it("cria uma solicitação PENDING", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);
    expect(request.status).toBe("PENDING");
    expect(request.participantUserIds).toEqual(["joao"]);
  });

  it("rejeita horário inválido", async () => {
    const scenario = buildScenario();
    await expect(
      scenario.createRequest.execute({
        requesterId: "ana",
        title: "Jantar",
        startAt: new Date("2026-01-10T22:00:00Z"),
        endAt: new Date("2026-01-10T20:00:00Z"),
        participantUserIds: ["joao"],
      }),
    ).rejects.toThrow(InvalidTimeRangeError);
  });
});

describe("AcceptMeetingRequestUseCase", () => {
  it("aceita a solicitação, cria o evento e marca como ACCEPTED", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);

    const result = await scenario.accept.execute(request.id, "joao");

    expect(result.meetingRequest.status).toBe("ACCEPTED");
    expect(result.meetingRequest.resolvedEventId).toBe(result.eventId);
    expect(scenario.eventCreator.calls).toHaveLength(1);
    expect(scenario.eventCreator.calls[0]?.participantUserIds).toEqual(["joao"]);

    const events = scenario.outbox.events.map((e) => e.type);
    expect(events).toEqual(["MEETING_REQUEST_CREATED", "MEETING_REQUEST_ACCEPTED"]);
  });

  it("bloqueia o requester de aceitar sua própria solicitação inicial", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);
    await expect(scenario.accept.execute(request.id, "ana")).rejects.toThrow(NotAResponderError);
  });

  it("bloqueia quem não faz parte da solicitação", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);
    await expect(scenario.accept.execute(request.id, "estranho")).rejects.toThrow(NotAPartyError);
  });

  it("revalida disponibilidade e rejeita se houver conflito real (nunca confia no estado anterior)", async () => {
    const scenario = buildScenario();
    scenario.availabilityChecker.result = "HARD_CONFLICT";
    const request = await createBasicRequest(scenario);

    await expect(scenario.accept.execute(request.id, "joao")).rejects.toThrow(AvailabilityConflictError);
    expect(scenario.eventCreator.calls).toHaveLength(0);

    const stillPending = await scenario.meetingRequestRepository.findById(request.id);
    expect(stillPending?.status).toBe("PENDING");
  });

  it("permite aceitar mesmo com SOFT_CONFLICT (apenas HARD_CONFLICT bloqueia)", async () => {
    const scenario = buildScenario();
    scenario.availabilityChecker.result = "SOFT_CONFLICT";
    const request = await createBasicRequest(scenario);

    const result = await scenario.accept.execute(request.id, "joao");
    expect(result.meetingRequest.status).toBe("ACCEPTED");
  });

  it("rejeita aceitar solicitação já resolvida", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);
    await scenario.cancel.execute(request.id, "ana");

    await expect(scenario.accept.execute(request.id, "joao")).rejects.toThrow(MeetingRequestNotOpenError);
  });

  it("retorna MeetingRequestNotFoundError para id inexistente", async () => {
    const scenario = buildScenario();
    await expect(scenario.accept.execute("id-inexistente", "joao")).rejects.toThrow(
      MeetingRequestNotFoundError,
    );
  });

  it("depois de uma contraproposta, apenas quem não propôs pode aceitar", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);
    await scenario.counterPropose.execute({
      meetingRequestId: request.id,
      actingUserId: "joao",
      startAt: new Date("2026-01-11T20:00:00Z"),
      endAt: new Date("2026-01-11T22:00:00Z"),
    });

    // João propôs — só Ana pode aceitar agora.
    await expect(scenario.accept.execute(request.id, "joao")).rejects.toThrow(NotAResponderError);

    const result = await scenario.accept.execute(request.id, "ana");
    expect(result.meetingRequest.status).toBe("ACCEPTED");
    // O evento deve usar o horário da contraproposta, não o original.
    expect(scenario.eventCreator.calls[0]?.startAt.toISOString()).toBe("2026-01-11T20:00:00.000Z");
  });
});

describe("DeclineMeetingRequestUseCase", () => {
  it("permite negar com mensagem opcional", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);

    const declined = await scenario.decline.execute(request.id, "joao", "Não consigo nesse horário.");
    expect(declined.status).toBe("DECLINED");
    expect(declined.declineMessage).toBe("Não consigo nesse horário.");
  });

  it("permite negar sem mensagem", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);
    const declined = await scenario.decline.execute(request.id, "joao");
    expect(declined.status).toBe("DECLINED");
    expect(declined.declineMessage).toBeNull();
  });

  it("bloqueia o requester de negar sua própria proposta", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);
    await expect(scenario.decline.execute(request.id, "ana")).rejects.toThrow(NotAResponderError);
  });
});

describe("CounterProposeUseCase", () => {
  it("preserva o histórico de múltiplas contrapropostas", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);

    await scenario.counterPropose.execute({
      meetingRequestId: request.id,
      actingUserId: "joao",
      startAt: new Date("2026-01-11T20:00:00Z"),
      endAt: new Date("2026-01-11T22:00:00Z"),
    });
    await scenario.counterPropose.execute({
      meetingRequestId: request.id,
      actingUserId: "ana",
      startAt: new Date("2026-01-12T20:00:00Z"),
      endAt: new Date("2026-01-12T22:00:00Z"),
    });

    const history = await scenario.counterProposalRepository.listForRequest(request.id);
    expect(history).toHaveLength(2);
    expect(history[0]?.proposedById).toBe("joao");
    expect(history[1]?.proposedById).toBe("ana");

    const updated = await scenario.meetingRequestRepository.findById(request.id);
    expect(updated?.status).toBe("COUNTER_PROPOSED");
  });

  it("rejeita horário inválido na contraproposta", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);
    await expect(
      scenario.counterPropose.execute({
        meetingRequestId: request.id,
        actingUserId: "joao",
        startAt: new Date("2026-01-11T22:00:00Z"),
        endAt: new Date("2026-01-11T20:00:00Z"),
      }),
    ).rejects.toThrow(InvalidTimeRangeError);
  });
});

describe("CancelMeetingRequestUseCase", () => {
  it("permite que o requester cancele", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);
    const cancelled = await scenario.cancel.execute(request.id, "ana");
    expect(cancelled.status).toBe("CANCELLED");
  });

  it("bloqueia quem não é o requester de cancelar", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);
    await expect(scenario.cancel.execute(request.id, "joao")).rejects.toThrow(
      ForbiddenMeetingRequestActionError,
    );
  });
});

describe("Proteção contra condição de corrida (docs/ARCHITECTURE.md §Concorrência)", () => {
  it("a segunda escrita concorrente falha quando o status já não está mais aberto", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);

    // Simula duas respostas quase simultâneas: a primeira resolve a solicitação...
    await scenario.meetingRequestRepository.updateStatus(request.id, "DECLINED");

    // ...a segunda não pode mais aplicar sua mudança, mesmo operando sobre o mesmo id.
    await expect(scenario.meetingRequestRepository.updateStatus(request.id, "ACCEPTED")).rejects.toThrow();
  });

  it("AcceptMeetingRequestUseCase traduz a corrida em MeetingRequestConcurrentlyModifiedError", async () => {
    const scenario = buildScenario();
    const request = await createBasicRequest(scenario);

    // Resolve a solicitação por fora, entre a leitura e a escrita do use case
    // seria o cenário real; aqui simulamos diretamente a falha na escrita
    // fazendo o repositório já estar fechado no momento do updateStatus.
    const originalUpdateStatus = scenario.meetingRequestRepository.updateStatus.bind(
      scenario.meetingRequestRepository,
    );
    scenario.meetingRequestRepository.updateStatus = async () => {
      throw new Error("simulated race");
    };

    await expect(scenario.accept.execute(request.id, "joao")).rejects.toThrow(
      MeetingRequestConcurrentlyModifiedError,
    );

    scenario.meetingRequestRepository.updateStatus = originalUpdateStatus;
  });
});
