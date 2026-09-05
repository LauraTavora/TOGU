import { beforeEach, describe, expect, it } from "vitest";
import { CreateEventUseCase } from "./create-event.use-case";
import { GetEventUseCase } from "./get-event.use-case";
import { UpdateEventUseCase } from "./update-event.use-case";
import { DeleteEventUseCase } from "./delete-event.use-case";
import { ListCalendarEventsUseCase } from "./list-calendar-events.use-case";
import { EventNotFoundError, ForbiddenEventAccessError, PersonalCalendarNotFoundError } from "./errors";
import { InvalidEventTimeRangeError } from "../domain/event-time";
import { InMemoryEventRepository } from "../adapters/in-memory-event-repository";
import { InMemoryCalendarRepository } from "../adapters/in-memory-calendar-repository";

function buildScenario() {
  const eventRepository = new InMemoryEventRepository();
  const calendarRepository = new InMemoryCalendarRepository();
  calendarRepository.registerPersonalCalendar("ana", "calendar-ana");
  calendarRepository.registerPersonalCalendar("joao", "calendar-joao");

  return {
    eventRepository,
    calendarRepository,
    createEvent: new CreateEventUseCase(eventRepository, calendarRepository),
    getEvent: new GetEventUseCase(eventRepository, calendarRepository),
    updateEvent: new UpdateEventUseCase(eventRepository, calendarRepository),
    deleteEvent: new DeleteEventUseCase(eventRepository, calendarRepository),
    listCalendar: new ListCalendarEventsUseCase(eventRepository, calendarRepository),
  };
}

describe("CreateEventUseCase", () => {
  it("cria um evento no calendário pessoal do dono", async () => {
    const { createEvent } = buildScenario();

    const event = await createEvent.execute({
      ownerUserId: "ana",
      title: "Jantar com João",
      startAt: new Date("2026-01-10T20:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
    });

    expect(event.calendarId).toBe("calendar-ana");
    expect(event.availabilityState).toBe("BUSY"); // default
    expect(event.privacyLevel).toBe("BUSY_ONLY"); // default
  });

  it("rejeita horário inválido (fim antes do início)", async () => {
    const { createEvent } = buildScenario();
    await expect(
      createEvent.execute({
        ownerUserId: "ana",
        title: "Evento inválido",
        startAt: new Date("2026-01-10T22:00:00Z"),
        endAt: new Date("2026-01-10T20:00:00Z"),
      }),
    ).rejects.toThrow(InvalidEventTimeRangeError);
  });

  it("rejeita quando o usuário não possui calendário pessoal provisionado", async () => {
    const { createEvent } = buildScenario();
    await expect(
      createEvent.execute({
        ownerUserId: "usuario-sem-calendario",
        title: "Evento",
        startAt: new Date("2026-01-10T20:00:00Z"),
        endAt: new Date("2026-01-10T22:00:00Z"),
      }),
    ).rejects.toThrow(PersonalCalendarNotFoundError);
  });
});

describe("GetEventUseCase", () => {
  it("permite que o dono veja o evento", async () => {
    const { createEvent, getEvent } = buildScenario();
    const event = await createEvent.execute({
      ownerUserId: "ana",
      title: "Jantar",
      startAt: new Date("2026-01-10T20:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
    });

    const result = await getEvent.execute(event.id, "ana");
    expect(result.id).toBe(event.id);
  });

  it("permite que um participante veja o evento", async () => {
    const { createEvent, getEvent } = buildScenario();
    const event = await createEvent.execute({
      ownerUserId: "ana",
      title: "Jantar",
      startAt: new Date("2026-01-10T20:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
      participantUserIds: ["joao"],
    });

    const result = await getEvent.execute(event.id, "joao");
    expect(result.id).toBe(event.id);
  });

  it("bloqueia acesso de quem não é dono nem participante (IDOR)", async () => {
    const { createEvent, getEvent } = buildScenario();
    const event = await createEvent.execute({
      ownerUserId: "ana",
      title: "Jantar",
      startAt: new Date("2026-01-10T20:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
    });

    await expect(getEvent.execute(event.id, "estranho")).rejects.toThrow(ForbiddenEventAccessError);
  });

  it("retorna EventNotFoundError para id inexistente", async () => {
    const { getEvent } = buildScenario();
    await expect(getEvent.execute("id-inexistente", "ana")).rejects.toThrow(EventNotFoundError);
  });
});

describe("UpdateEventUseCase", () => {
  it("permite que o dono atualize o evento", async () => {
    const { createEvent, updateEvent } = buildScenario();
    const event = await createEvent.execute({
      ownerUserId: "ana",
      title: "Jantar",
      startAt: new Date("2026-01-10T20:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
    });

    const updated = await updateEvent.execute(event.id, "ana", { title: "Jantar especial" });
    expect(updated.title).toBe("Jantar especial");
  });

  it("bloqueia atualização por quem não é dono", async () => {
    const { createEvent, updateEvent } = buildScenario();
    const event = await createEvent.execute({
      ownerUserId: "ana",
      title: "Jantar",
      startAt: new Date("2026-01-10T20:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
      participantUserIds: ["joao"],
    });

    // João é participante, mas não dono — não pode editar.
    await expect(updateEvent.execute(event.id, "joao", { title: "Hackeado" })).rejects.toThrow(
      ForbiddenEventAccessError,
    );
  });

  it("revalida o intervalo de horário ao atualizar", async () => {
    const { createEvent, updateEvent } = buildScenario();
    const event = await createEvent.execute({
      ownerUserId: "ana",
      title: "Jantar",
      startAt: new Date("2026-01-10T20:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
    });

    await expect(
      updateEvent.execute(event.id, "ana", { endAt: new Date("2026-01-10T19:00:00Z") }),
    ).rejects.toThrow(InvalidEventTimeRangeError);
  });
});

describe("DeleteEventUseCase", () => {
  it("permite que o dono exclua o evento", async () => {
    const { createEvent, deleteEvent, getEvent } = buildScenario();
    const event = await createEvent.execute({
      ownerUserId: "ana",
      title: "Jantar",
      startAt: new Date("2026-01-10T20:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
    });

    await deleteEvent.execute(event.id, "ana");
    await expect(getEvent.execute(event.id, "ana")).rejects.toThrow(EventNotFoundError);
  });

  it("bloqueia exclusão por quem não é dono", async () => {
    const { createEvent, deleteEvent } = buildScenario();
    const event = await createEvent.execute({
      ownerUserId: "ana",
      title: "Jantar",
      startAt: new Date("2026-01-10T20:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
    });

    await expect(deleteEvent.execute(event.id, "estranho")).rejects.toThrow(ForbiddenEventAccessError);
  });
});

describe("ListCalendarEventsUseCase", () => {
  let scenario: ReturnType<typeof buildScenario>;

  beforeEach(() => {
    scenario = buildScenario();
  });

  it("lista apenas eventos que sobrepõem o intervalo consultado, em ordem cronológica", async () => {
    const { createEvent, listCalendar } = scenario;

    await createEvent.execute({
      ownerUserId: "ana",
      title: "Evento fora do intervalo",
      startAt: new Date("2026-01-01T10:00:00Z"),
      endAt: new Date("2026-01-01T11:00:00Z"),
    });
    const second = await createEvent.execute({
      ownerUserId: "ana",
      title: "Segundo evento do dia",
      startAt: new Date("2026-01-10T21:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
    });
    const first = await createEvent.execute({
      ownerUserId: "ana",
      title: "Primeiro evento do dia",
      startAt: new Date("2026-01-10T09:00:00Z"),
      endAt: new Date("2026-01-10T10:00:00Z"),
    });

    const events = await listCalendar.execute(
      "ana",
      new Date("2026-01-10T00:00:00Z"),
      new Date("2026-01-11T00:00:00Z"),
    );

    expect(events.map((e) => e.id)).toEqual([first.id, second.id]);
  });

  it("não vaza eventos de outro usuário", async () => {
    const { createEvent, listCalendar } = scenario;
    await createEvent.execute({
      ownerUserId: "joao",
      title: "Evento do João",
      startAt: new Date("2026-01-10T09:00:00Z"),
      endAt: new Date("2026-01-10T10:00:00Z"),
    });

    const events = await listCalendar.execute(
      "ana",
      new Date("2026-01-10T00:00:00Z"),
      new Date("2026-01-11T00:00:00Z"),
    );

    expect(events).toHaveLength(0);
  });

  it("mostra no calendário de um participante o evento criado no calendário de outra pessoa", async () => {
    const { createEvent, listCalendar } = scenario;
    await createEvent.execute({
      ownerUserId: "ana",
      title: "Jantar com João",
      startAt: new Date("2026-01-10T20:00:00Z"),
      endAt: new Date("2026-01-10T22:00:00Z"),
      participantUserIds: ["joao"],
    });

    const joaoEvents = await listCalendar.execute(
      "joao",
      new Date("2026-01-10T00:00:00Z"),
      new Date("2026-01-11T00:00:00Z"),
    );

    expect(joaoEvents).toHaveLength(1);
    expect(joaoEvents[0]?.title).toBe("Jantar com João");
  });
});
