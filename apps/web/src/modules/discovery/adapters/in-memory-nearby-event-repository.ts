import { randomUUID } from "node:crypto";
import type { NearbyEvent } from "../domain/nearby-event";
import type {
  FindNearbyEventsFilter,
  NearbyEventRepository,
  UpsertNearbyEventInput,
} from "../ports/nearby-event-repository";

export class InMemoryNearbyEventRepository implements NearbyEventRepository {
  private readonly events = new Map<string, NearbyEvent>();

  async upsert(input: UpsertNearbyEventInput): Promise<NearbyEvent> {
    const existing = Array.from(this.events.values()).find((e) => e.providerRef === input.providerRef);
    const event: NearbyEvent = {
      id: existing?.id ?? randomUUID(),
      providerRef: input.providerRef,
      title: input.title,
      category: input.category,
      startAt: input.startAt,
      endAt: input.endAt ?? null,
      locationName: input.locationName ?? null,
      location: { latitude: input.latitude, longitude: input.longitude },
      priceInfo: input.priceInfo ?? null,
      isFree: input.isFree,
      createdAt: existing?.createdAt ?? new Date(),
    };
    this.events.set(event.id, event);
    return event;
  }

  async findById(id: string): Promise<NearbyEvent | null> {
    return this.events.get(id) ?? null;
  }

  async findInRange(filter: FindNearbyEventsFilter): Promise<NearbyEvent[]> {
    return Array.from(this.events.values()).filter(
      (event) =>
        event.startAt >= filter.from &&
        event.startAt <= filter.to &&
        (!filter.category || event.category === filter.category) &&
        (!filter.onlyFree || event.isFree),
    );
  }
}
