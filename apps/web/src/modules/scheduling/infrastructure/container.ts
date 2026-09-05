import { prisma } from "@togu/database";
import { CreateEventUseCase } from "../application/create-event.use-case";
import { GetEventUseCase } from "../application/get-event.use-case";
import { UpdateEventUseCase } from "../application/update-event.use-case";
import { DeleteEventUseCase } from "../application/delete-event.use-case";
import { ListCalendarEventsUseCase } from "../application/list-calendar-events.use-case";
import { PrismaEventRepository } from "../adapters/prisma-event-repository";
import { PrismaCalendarRepository } from "../adapters/prisma-calendar-repository";

const eventRepository = new PrismaEventRepository(prisma);
const calendarRepository = new PrismaCalendarRepository(prisma);

export function createCreateEventUseCase(): CreateEventUseCase {
  return new CreateEventUseCase(eventRepository, calendarRepository);
}

export function createGetEventUseCase(): GetEventUseCase {
  return new GetEventUseCase(eventRepository, calendarRepository);
}

export function createUpdateEventUseCase(): UpdateEventUseCase {
  return new UpdateEventUseCase(eventRepository, calendarRepository);
}

export function createDeleteEventUseCase(): DeleteEventUseCase {
  return new DeleteEventUseCase(eventRepository, calendarRepository);
}

export function createListCalendarEventsUseCase(): ListCalendarEventsUseCase {
  return new ListCalendarEventsUseCase(eventRepository, calendarRepository);
}
