import { describe, expect, it } from "vitest";
import { SyncNearbyEventsUseCase } from "./sync-nearby-events.use-case";
import { SearchNearbyEventsUseCase } from "./search-nearby-events.use-case";
import { SaveEventUseCase, UnsaveEventUseCase, ListSavedEventsUseCase } from "./saved-events.use-case";
import { AddNearbyEventToAgendaUseCase } from "./add-nearby-event-to-agenda.use-case";
import { CountCircleInterestUseCase } from "./count-circle-interest.use-case";
import { NearbyEventNotFoundError } from "./errors";
import { InMemoryNearbyEventRepository } from "../adapters/in-memory-nearby-event-repository";
import { InMemorySavedEventRepository } from "../adapters/in-memory-saved-event-repository";
import { MockEventDiscoveryProvider } from "../adapters/mock-event-discovery-provider";
import { StubAgendaEventCreator } from "../adapters/stub-agenda-event-creator";
import { StubCircleFellowsResolver } from "../adapters/stub-circle-fellows-resolver";

const SAO_PAULO = { latitude: -23.5505, longitude: -46.6333 };

function buildScenario() {
  const nearbyEventRepository = new InMemoryNearbyEventRepository();
  const savedEventRepository = new InMemorySavedEventRepository(nearbyEventRepository);
  const provider = new MockEventDiscoveryProvider();
  const agendaEventCreator = new StubAgendaEventCreator();

  return {
    nearbyEventRepository,
    savedEventRepository,
    provider,
    agendaEventCreator,
    sync: new SyncNearbyEventsUseCase(provider, nearbyEventRepository),
    search: new SearchNearbyEventsUseCase(nearbyEventRepository),
    save: new SaveEventUseCase(nearbyEventRepository, savedEventRepository),
    unsave: new UnsaveEventUseCase(savedEventRepository),
    listSaved: new ListSavedEventsUseCase(savedEventRepository),
    addToAgenda: new AddNearbyEventToAgendaUseCase(nearbyEventRepository, agendaEventCreator),
  };
}

describe("SyncNearbyEventsUseCase + SearchNearbyEventsUseCase", () => {
  it("sincroniza eventos do provedor e permite buscá-los por raio, data e categoria", async () => {
    const { sync, search } = buildScenario();
    const from = new Date("2026-01-01T00:00:00Z");
    const to = new Date("2026-01-15T00:00:00Z");

    const result = await sync.execute({ from, to });
    expect(result.synced).toBe(3);

    const found = await search.execute({ origin: SAO_PAULO, radiusKm: 20, from, to });
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((e) => e.distanceKm <= 20)).toBe(true);
    // ordenado por distância crescente
    expect(found).toEqual([...found].sort((a, b) => a.distanceKm - b.distanceKm));
  });

  it("filtra por categoria", async () => {
    const { sync, search } = buildScenario();
    const from = new Date("2026-01-01T00:00:00Z");
    const to = new Date("2026-01-15T00:00:00Z");
    await sync.execute({ from, to });

    const found = await search.execute({ origin: SAO_PAULO, radiusKm: 50, from, to, category: "MUSICA" });
    expect(found.every((e) => e.category === "MUSICA")).toBe(true);
    expect(found.length).toBeGreaterThan(0);
  });

  it("filtra apenas eventos gratuitos", async () => {
    const { sync, search } = buildScenario();
    const from = new Date("2026-01-01T00:00:00Z");
    const to = new Date("2026-01-15T00:00:00Z");
    await sync.execute({ from, to });

    const found = await search.execute({ origin: SAO_PAULO, radiusKm: 50, from, to, onlyFree: true });
    expect(found.every((e) => e.isFree)).toBe(true);
  });

  it("exclui eventos fora do raio de busca", async () => {
    const { sync, search } = buildScenario();
    const from = new Date("2026-01-01T00:00:00Z");
    const to = new Date("2026-01-15T00:00:00Z");
    await sync.execute({ from, to });

    const farAway = { latitude: 48.8566, longitude: 2.3522 }; // Paris — longe de todos os eventos mock
    const found = await search.execute({ origin: farAway, radiusKm: 10, from, to });
    expect(found).toHaveLength(0);
  });
});

describe("Quero ir (save/unsave/list)", () => {
  it("salva, lista e remove um evento salvo", async () => {
    const { sync, save, unsave, listSaved, nearbyEventRepository } = buildScenario();
    await sync.execute({ from: new Date("2026-01-01T00:00:00Z"), to: new Date("2026-01-15T00:00:00Z") });
    const [event] = await nearbyEventRepository.findInRange({
      from: new Date("2026-01-01T00:00:00Z"),
      to: new Date("2026-01-15T00:00:00Z"),
    });

    await save.execute("ana", event!.id);
    expect((await listSaved.execute("ana")).map((e) => e.id)).toEqual([event!.id]);

    await unsave.execute("ana", event!.id);
    expect(await listSaved.execute("ana")).toHaveLength(0);
  });

  it("rejeita salvar evento inexistente", async () => {
    const { save } = buildScenario();
    await expect(save.execute("ana", "id-inexistente")).rejects.toThrow(NearbyEventNotFoundError);
  });
});

describe("AddNearbyEventToAgendaUseCase", () => {
  it("cria o evento na agenda com duração padrão de 2h quando o provedor não informa o fim", async () => {
    const { sync, addToAgenda, agendaEventCreator, nearbyEventRepository } = buildScenario();
    await sync.execute({ from: new Date("2026-01-01T00:00:00Z"), to: new Date("2026-01-15T00:00:00Z") });
    const [event] = await nearbyEventRepository.findInRange({
      from: new Date("2026-01-01T00:00:00Z"),
      to: new Date("2026-01-15T00:00:00Z"),
    });

    const result = await addToAgenda.execute("ana", event!.id);
    expect(result.eventId).toBeTruthy();
    expect(agendaEventCreator.calls[0]?.ownerUserId).toBe("ana");
    const durationMs = agendaEventCreator.calls[0]!.endAt.getTime() - agendaEventCreator.calls[0]!.startAt.getTime();
    expect(durationMs).toBe(2 * 60 * 60 * 1000);
  });

  it("rejeita adicionar evento inexistente", async () => {
    const { addToAgenda } = buildScenario();
    await expect(addToAgenda.execute("ana", "id-inexistente")).rejects.toThrow(NearbyEventNotFoundError);
  });
});

describe("CountCircleInterestUseCase", () => {
  it("conta quantos colegas de círculo também salvaram o evento", async () => {
    const nearbyEventRepository = new InMemoryNearbyEventRepository();
    const savedEventRepository = new InMemorySavedEventRepository(nearbyEventRepository);
    const event = await nearbyEventRepository.upsert({
      providerRef: "evt-1",
      title: "Festival",
      category: "MUSICA",
      startAt: new Date(),
      latitude: 0,
      longitude: 0,
      isFree: true,
    });

    await savedEventRepository.save("joao", event.id);
    await savedEventRepository.save("pedro", event.id);
    await savedEventRepository.save("estranho", event.id); // não é colega de círculo da ana

    const fellowsResolver = new StubCircleFellowsResolver({ ana: ["joao", "pedro", "carla"] });
    const useCase = new CountCircleInterestUseCase(savedEventRepository, fellowsResolver);

    expect(await useCase.execute("ana", event.id)).toBe(2);
  });

  it("retorna 0 quando o usuário não tem círculos", async () => {
    const nearbyEventRepository = new InMemoryNearbyEventRepository();
    const savedEventRepository = new InMemorySavedEventRepository(nearbyEventRepository);
    const fellowsResolver = new StubCircleFellowsResolver({});
    const useCase = new CountCircleInterestUseCase(savedEventRepository, fellowsResolver);

    expect(await useCase.execute("ana", "qualquer-evento")).toBe(0);
  });
});
