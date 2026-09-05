export {
  createSyncNearbyEventsUseCase,
  createSearchNearbyEventsUseCase,
  createSaveEventUseCase,
  createUnsaveEventUseCase,
  createListSavedEventsUseCase,
  createAddNearbyEventToAgendaUseCase,
  createCountCircleInterestUseCase,
} from "./infrastructure/container";

export { NearbyEventNotFoundError } from "./application/errors";
export { EVENT_CATEGORIES, isEventCategory } from "./domain/event-category";
export type { EventCategory } from "./domain/event-category";
export type { NearbyEvent, NearbyEventWithDistance, GeoPoint } from "./domain/nearby-event";
