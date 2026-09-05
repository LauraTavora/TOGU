import { describe, expect, it } from "vitest";
import { ListReceivedMeetingRequestsUseCase, ListSentMeetingRequestsUseCase } from "./list-meeting-requests.use-case";
import { CreateMeetingRequestUseCase } from "./create-meeting-request.use-case";
import { InMemoryMeetingRequestRepository } from "../adapters/in-memory-meeting-request-repository";
import { StubPriorityRanker } from "../adapters/stub-priority-ranker";

async function createRequestAt(
  createRequest: CreateMeetingRequestUseCase,
  requesterId: string,
  participantUserIds: string[],
) {
  return createRequest.execute({
    requesterId,
    title: `Convite de ${requesterId}`,
    startAt: new Date("2026-01-10T20:00:00Z"),
    endAt: new Date("2026-01-10T22:00:00Z"),
    participantUserIds,
  });
}

describe("ListReceivedMeetingRequestsUseCase", () => {
  it("por padrão ordena por prioridade (maior score primeiro)", async () => {
    const repository = new InMemoryMeetingRequestRepository();
    const createRequest = new CreateMeetingRequestUseCase(repository);

    await createRequestAt(createRequest, "pouco-prioritario", ["ana"]);
    await createRequestAt(createRequest, "muito-prioritario", ["ana"]);

    const ranker = new StubPriorityRanker({ "muito-prioritario": 4, "pouco-prioritario": 0.5 });
    const listReceived = new ListReceivedMeetingRequestsUseCase(repository, ranker);

    const results = await listReceived.execute("ana");
    expect(results.map((r) => r.requesterId)).toEqual(["muito-prioritario", "pouco-prioritario"]);
  });

  it("com sort=recent ignora prioridade e mantém a ordem do repositório (mais recente primeiro)", async () => {
    const repository = new InMemoryMeetingRequestRepository();
    const createRequest = new CreateMeetingRequestUseCase(repository);

    const first = await createRequestAt(createRequest, "muito-prioritario", ["ana"]);
    const second = await createRequestAt(createRequest, "pouco-prioritario", ["ana"]);

    const ranker = new StubPriorityRanker({ "muito-prioritario": 4, "pouco-prioritario": 0.5 });
    const listReceived = new ListReceivedMeetingRequestsUseCase(repository, ranker);

    const results = await listReceived.execute("ana", undefined, "recent");
    expect(results.map((r) => r.id)).toEqual([first.id, second.id]);
  });
});

describe("ListSentMeetingRequestsUseCase", () => {
  it("lista apenas solicitações enviadas pelo usuário", async () => {
    const repository = new InMemoryMeetingRequestRepository();
    const createRequest = new CreateMeetingRequestUseCase(repository);
    await createRequestAt(createRequest, "ana", ["joao"]);
    await createRequestAt(createRequest, "joao", ["ana"]);

    const listSent = new ListSentMeetingRequestsUseCase(repository);
    const results = await listSent.execute("ana");
    expect(results).toHaveLength(1);
    expect(results[0]?.requesterId).toBe("ana");
  });
});
