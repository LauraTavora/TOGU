import { distanceKm } from "../domain/haversine";
import type { EventCategory } from "../domain/event-category";
import type { GeoPoint, NearbyEventWithDistance } from "../domain/nearby-event";
import type { NearbyEventRepository } from "../ports/nearby-event-repository";

export interface SearchNearbyEventsInput {
  origin: GeoPoint;
  radiusKm: number;
  from: Date;
  to: Date;
  category?: EventCategory | undefined;
  onlyFree?: boolean | undefined;
}

export class SearchNearbyEventsUseCase {
  constructor(private readonly repository: NearbyEventRepository) {}

  async execute(input: SearchNearbyEventsInput): Promise<NearbyEventWithDistance[]> {
    const candidates = await this.repository.findInRange({
      from: input.from,
      to: input.to,
      category: input.category,
      onlyFree: input.onlyFree,
    });

    return candidates
      .map((event) => ({ ...event, distanceKm: distanceKm(input.origin, event.location) }))
      .filter((event) => event.distanceKm <= input.radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
}
