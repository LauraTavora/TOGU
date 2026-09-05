import { assertCanRespond, effectiveTimeRange, getAllParties } from "../domain/negotiation";
import { isOpen, type MeetingRequest } from "../domain/meeting-request";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";
import type { CounterProposalRepository } from "../ports/counter-proposal-repository";
import type { AvailabilityChecker } from "../ports/availability-checker";
import type { EventCreator } from "../ports/event-creator";
import { AvailabilityConflictError, MeetingRequestConcurrentlyModifiedError, MeetingRequestNotFoundError } from "./errors";
import { MeetingRequestNotOpenError } from "../domain/negotiation";
import type { OutboxEventPublisher } from "@/shared/outbox";
import { MeetingRequestEventType, type MeetingRequestAcceptedPayload } from "@/shared/outbox/events/meeting-request-events";

export interface AcceptMeetingRequestOutput {
  meetingRequest: MeetingRequest;
  eventId: string;
}

/**
 * Fluxo crítico: recalcula disponibilidade real (nunca confia no estado
 * exibido anteriormente), só então materializa o evento e marca a
 * solicitação como aceita — ver docs/PRODUCT.md §22 e §66.
 */
export class AcceptMeetingRequestUseCase {
  constructor(
    private readonly meetingRequestRepository: MeetingRequestRepository,
    private readonly counterProposalRepository: CounterProposalRepository,
    private readonly availabilityChecker: AvailabilityChecker,
    private readonly eventCreator: EventCreator,
    private readonly eventPublisher: OutboxEventPublisher,
  ) {}

  async execute(meetingRequestId: string, actingUserId: string): Promise<AcceptMeetingRequestOutput> {
    const meetingRequest = await this.meetingRequestRepository.findById(meetingRequestId);
    if (!meetingRequest) {
      throw new MeetingRequestNotFoundError();
    }
    if (!isOpen(meetingRequest.status)) {
      throw new MeetingRequestNotOpenError();
    }

    const counterProposals = await this.counterProposalRepository.listForRequest(meetingRequestId);
    assertCanRespond(meetingRequest, counterProposals, actingUserId);

    const { startAt, endAt } = effectiveTimeRange(meetingRequest, counterProposals);
    const allParties = getAllParties(meetingRequest);

    const availability = await this.availabilityChecker.check(allParties, startAt, endAt);
    if (availability === "HARD_CONFLICT") {
      throw new AvailabilityConflictError();
    }

    const { eventId } = await this.eventCreator.createConfirmedEvent({
      ownerUserId: meetingRequest.requesterId,
      title: meetingRequest.title,
      startAt,
      endAt,
      meetingKind: meetingRequest.meetingKind,
      location: meetingRequest.location ?? undefined,
      onlineLink: meetingRequest.onlineLink ?? undefined,
      participantUserIds: allParties.filter((id) => id !== meetingRequest.requesterId),
    });

    let updated: MeetingRequest;
    try {
      updated = await this.meetingRequestRepository.updateStatus(meetingRequestId, "ACCEPTED", eventId);
    } catch {
      throw new MeetingRequestConcurrentlyModifiedError();
    }

    const payload: MeetingRequestAcceptedPayload = {
      meetingRequestId: updated.id,
      requesterId: updated.requesterId,
      participantUserIds: updated.participantUserIds,
      acceptedById: actingUserId,
      eventId,
      title: updated.title,
    };
    await this.eventPublisher.publish(MeetingRequestEventType.ACCEPTED, payload as unknown as Record<string, unknown>);

    return { meetingRequest: updated, eventId };
  }
}
