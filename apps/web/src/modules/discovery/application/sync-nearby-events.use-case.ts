import type { EventDiscoveryProvider, EventDiscoveryQuery } from "../ports/event-discovery-provider";
import type { NearbyEventRepository } from "../ports/nearby-event-repository";

export class SyncNearbyEventsUseCase {
  constructor(
    private readonly provider: EventDiscoveryProvider,
    private readonly repository: NearbyEventRepository,
  ) {}

  async execute(query: EventDiscoveryQuery): Promise<{ synced: number }> {
    const events = await this.provider.fetchEvents(query);
    for (const event of events) {
      await this.repository.upsert(event);
    }
    return { synced: events.length };
  }
}
