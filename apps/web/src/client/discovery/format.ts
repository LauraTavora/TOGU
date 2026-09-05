import type { EventCategory } from "./types";

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  MUSICA: "Música",
  GASTRONOMIA: "Gastronomia",
  IGREJA: "Igreja",
  ESPORTES: "Esportes",
  TEATRO: "Teatro",
  CINEMA: "Cinema",
  CULTURA: "Cultura",
  NETWORKING: "Networking",
  TECNOLOGIA: "Tecnologia",
  FEIRAS: "Feiras",
  FESTAS: "Festas",
  FAMILIA: "Família",
  OUTDOOR: "Ar livre",
};

export const EVENT_CATEGORIES: EventCategory[] = [
  "MUSICA",
  "GASTRONOMIA",
  "IGREJA",
  "ESPORTES",
  "TEATRO",
  "CINEMA",
  "CULTURA",
  "NETWORKING",
  "TECNOLOGIA",
  "FEIRAS",
  "FESTAS",
  "FAMILIA",
  "OUTDOOR",
];

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatEventDateTime(startAt: string): string {
  return dateTimeFormatter.format(new Date(startAt));
}

export function formatPrice(isFree: boolean, priceInfo: string | null): string {
  if (isFree) return "Gratuito";
  return priceInfo ?? "Pago";
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}
