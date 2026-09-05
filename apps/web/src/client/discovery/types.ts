export type EventCategory =
  | "MUSICA"
  | "GASTRONOMIA"
  | "IGREJA"
  | "ESPORTES"
  | "TEATRO"
  | "CINEMA"
  | "CULTURA"
  | "NETWORKING"
  | "TECNOLOGIA"
  | "FEIRAS"
  | "FESTAS"
  | "FAMILIA"
  | "OUTDOOR";

export interface GeoPointDto {
  latitude: number;
  longitude: number;
}

export interface NearbyEventDto {
  id: string;
  providerRef: string;
  title: string;
  category: EventCategory;
  startAt: string;
  endAt: string | null;
  locationName: string | null;
  location: GeoPointDto;
  priceInfo: string | null;
  isFree: boolean;
  createdAt: string;
}

export interface NearbyEventWithDistanceDto extends NearbyEventDto {
  distanceKm: number;
}
