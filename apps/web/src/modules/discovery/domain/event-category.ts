export const EVENT_CATEGORIES = [
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
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export function isEventCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as readonly string[]).includes(value);
}
