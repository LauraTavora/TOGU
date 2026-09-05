import type { EventCategory } from "../domain/event-category";
import type { NearbyEvent } from "../domain/nearby-event";

export interface UpsertNearbyEventInput {
  providerRef: string;
  title: string;
  category: EventCategory;
  startAt: Date;
  endAt?: Date | undefined;
  locationName?: string | undefined;
  latitude: number;
  longitude: number;
  priceInfo?: string | undefined;
  isFree: boolean;
}

export interface FindNearbyEventsFilter {
  from: Date;
  to: Date;
  category?: EventCategory | undefined;
  onlyFree?: boolean | undefined;
}

export interface NearbyEventRepository {
  upsert(input: UpsertNearbyEventInput): Promise<NearbyEvent>;
  findById(id: string): Promise<NearbyEvent | null>;
  findInRange(filter: FindNearbyEventsFilter): Promise<NearbyEvent[]>;
}
