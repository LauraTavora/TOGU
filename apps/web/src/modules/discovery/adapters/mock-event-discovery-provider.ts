import type { EventDiscoveryProvider, EventDiscoveryQuery } from "../ports/event-discovery-provider";
import type { UpsertNearbyEventInput } from "../ports/nearby-event-repository";

/**
 * Adapter de desenvolvimento: dados fixos, nunca scraping. Em produção,
 * substituir por um adapter que consulte um provedor autorizado (ex.:
 * Eventbrite, Sympla) — nenhum caso de uso precisa mudar (docs/PRODUCT.md §33).
 */
export class MockEventDiscoveryProvider implements EventDiscoveryProvider {
  async fetchEvents(query: EventDiscoveryQuery): Promise<UpsertNearbyEventInput[]> {
    const seed: UpsertNearbyEventInput[] = [
      {
        providerRef: "mock-1",
        title: "Festival Gastronômico da Cidade",
        category: "GASTRONOMIA",
        startAt: new Date(query.from.getTime() + 2 * 24 * 60 * 60 * 1000),
        locationName: "Praça Central",
        latitude: -23.5505,
        longitude: -46.6333,
        priceInfo: "Entrada gratuita",
        isFree: true,
      },
      {
        providerRef: "mock-2",
        title: "Show de Rock Independente",
        category: "MUSICA",
        startAt: new Date(query.from.getTime() + 4 * 24 * 60 * 60 * 1000),
        locationName: "Casa de Shows Central",
        latitude: -23.5613,
        longitude: -46.6565,
        priceInfo: "R$ 40",
        isFree: false,
      },
      {
        providerRef: "mock-3",
        title: "Culto de Celebração",
        category: "IGREJA",
        startAt: new Date(query.from.getTime() + 6 * 24 * 60 * 60 * 1000),
        locationName: "Igreja Comunidade Viva",
        latitude: -23.5489,
        longitude: -46.6388,
        isFree: true,
      },
    ];

    return seed.filter((event) => event.startAt >= query.from && event.startAt <= query.to);
  }
}
