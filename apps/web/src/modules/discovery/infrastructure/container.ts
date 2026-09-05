import { prisma } from "@togu/database";
import { SyncNearbyEventsUseCase } from "../application/sync-nearby-events.use-case";
import { SearchNearbyEventsUseCase } from "../application/search-nearby-events.use-case";
import { SaveEventUseCase, UnsaveEventUseCase, ListSavedEventsUseCase } from "../application/saved-events.use-case";
import { AddNearbyEventToAgendaUseCase } from "../application/add-nearby-event-to-agenda.use-case";
import { CountCircleInterestUseCase } from "../application/count-circle-interest.use-case";
import { PrismaNearbyEventRepository } from "../adapters/prisma-nearby-event-repository";
import { PrismaSavedEventRepository } from "../adapters/prisma-saved-event-repository";
import { MockEventDiscoveryProvider } from "../adapters/mock-event-discovery-provider";
import { SchedulingModuleAgendaEventCreator } from "../adapters/scheduling-module-agenda-event-creator";
import { PrismaCircleFellowsResolver } from "../adapters/prisma-circle-fellows-resolver";

const nearbyEventRepository = new PrismaNearbyEventRepository(prisma);
const savedEventRepository = new PrismaSavedEventRepository(prisma);
const eventDiscoveryProvider = new MockEventDiscoveryProvider();
const agendaEventCreator = new SchedulingModuleAgendaEventCreator();
const circleFellowsResolver = new PrismaCircleFellowsResolver(prisma);

export function createSyncNearbyEventsUseCase(): SyncNearbyEventsUseCase {
  return new SyncNearbyEventsUseCase(eventDiscoveryProvider, nearbyEventRepository);
}

export function createSearchNearbyEventsUseCase(): SearchNearbyEventsUseCase {
  return new SearchNearbyEventsUseCase(nearbyEventRepository);
}

export function createSaveEventUseCase(): SaveEventUseCase {
  return new SaveEventUseCase(nearbyEventRepository, savedEventRepository);
}

export function createUnsaveEventUseCase(): UnsaveEventUseCase {
  return new UnsaveEventUseCase(savedEventRepository);
}

export function createListSavedEventsUseCase(): ListSavedEventsUseCase {
  return new ListSavedEventsUseCase(savedEventRepository);
}

export function createAddNearbyEventToAgendaUseCase(): AddNearbyEventToAgendaUseCase {
  return new AddNearbyEventToAgendaUseCase(nearbyEventRepository, agendaEventCreator);
}

export function createCountCircleInterestUseCase(): CountCircleInterestUseCase {
  return new CountCircleInterestUseCase(savedEventRepository, circleFellowsResolver);
}
