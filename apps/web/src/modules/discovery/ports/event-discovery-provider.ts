import type { UpsertNearbyEventInput } from "./nearby-event-repository";

export interface EventDiscoveryQuery {
  from: Date;
  to: Date;
}

/**
 * Port desacoplando o Fechô de qualquer provedor específico de eventos
 * (docs/PRODUCT.md §33). Nunca implementado via scraping — apenas
 * integrações autorizadas (ex.: Eventbrite, Sympla) no futuro. Por ora,
 * um adapter mock alimenta o catálogo local para desenvolvimento.
 */
export interface EventDiscoveryProvider {
  fetchEvents(query: EventDiscoveryQuery): Promise<UpsertNearbyEventInput[]>;
}
