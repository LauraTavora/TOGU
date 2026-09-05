import type { EventCategory } from "./event-category";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface NearbyEvent {
  id: string;
  providerRef: string;
  title: string;
  category: EventCategory;
  startAt: Date;
  endAt: Date | null;
  locationName: string | null;
  location: GeoPoint;
  priceInfo: string | null;
  isFree: boolean;
  createdAt: Date;
}

export interface NearbyEventWithDistance extends NearbyEvent {
  distanceKm: number;
}
