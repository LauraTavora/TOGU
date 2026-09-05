import { prisma } from "@togu/database";
import { CreateMeetingRequestUseCase } from "../application/create-meeting-request.use-case";
import { AcceptMeetingRequestUseCase } from "../application/accept-meeting-request.use-case";
import { DeclineMeetingRequestUseCase } from "../application/decline-meeting-request.use-case";
import { CounterProposeUseCase } from "../application/counter-propose.use-case";
import { CancelMeetingRequestUseCase } from "../application/cancel-meeting-request.use-case";
import {
  ListReceivedMeetingRequestsUseCase,
  ListSentMeetingRequestsUseCase,
} from "../application/list-meeting-requests.use-case";
import { PrismaMeetingRequestRepository } from "../adapters/prisma-meeting-request-repository";
import { PrismaCounterProposalRepository } from "../adapters/prisma-counter-proposal-repository";
import { AvailabilityModuleChecker } from "../adapters/availability-module-checker";
import { SchedulingModuleEventCreator } from "../adapters/scheduling-module-event-creator";

const meetingRequestRepository = new PrismaMeetingRequestRepository(prisma);
const counterProposalRepository = new PrismaCounterProposalRepository(prisma);
const availabilityChecker = new AvailabilityModuleChecker();
const eventCreator = new SchedulingModuleEventCreator();

export function createCreateMeetingRequestUseCase(): CreateMeetingRequestUseCase {
  return new CreateMeetingRequestUseCase(meetingRequestRepository);
}

export function createAcceptMeetingRequestUseCase(): AcceptMeetingRequestUseCase {
  return new AcceptMeetingRequestUseCase(
    meetingRequestRepository,
    counterProposalRepository,
    availabilityChecker,
    eventCreator,
  );
}

export function createDeclineMeetingRequestUseCase(): DeclineMeetingRequestUseCase {
  return new DeclineMeetingRequestUseCase(meetingRequestRepository, counterProposalRepository);
}

export function createCounterProposeUseCase(): CounterProposeUseCase {
  return new CounterProposeUseCase(meetingRequestRepository, counterProposalRepository);
}

export function createCancelMeetingRequestUseCase(): CancelMeetingRequestUseCase {
  return new CancelMeetingRequestUseCase(meetingRequestRepository);
}

export function createListReceivedMeetingRequestsUseCase(): ListReceivedMeetingRequestsUseCase {
  return new ListReceivedMeetingRequestsUseCase(meetingRequestRepository);
}

export function createListSentMeetingRequestsUseCase(): ListSentMeetingRequestsUseCase {
  return new ListSentMeetingRequestsUseCase(meetingRequestRepository);
}
