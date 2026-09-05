import { isOpen, type MeetingRequest } from "../domain/meeting-request";
import { MeetingRequestNotOpenError } from "../domain/negotiation";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";
import { ForbiddenMeetingRequestActionError, MeetingRequestConcurrentlyModifiedError, MeetingRequestNotFoundError } from "./errors";
import type { OutboxEventPublisher } from "@/shared/outbox";
import { MeetingRequestEventType, type MeetingRequestCancelledPayload } from "@/shared/outbox/events/meeting-request-events";

export class CancelMeetingRequestUseCase {
  constructor(
    private readonly meetingRequestRepository: MeetingRequestRepository,
    private readonly eventPublisher: OutboxEventPublisher,
  ) {}

  async execute(meetingRequestId: string, requesterId: string): Promise<MeetingRequest> {
    const meetingRequest = await this.meetingRequestRepository.findById(meetingRequestId);
    if (!meetingRequest) {
      throw new MeetingRequestNotFoundError();
    }
    if (meetingRequest.requesterId !== requesterId) {
      throw new ForbiddenMeetingRequestActionError();
    }
    if (!isOpen(meetingRequest.status)) {
      throw new MeetingRequestNotOpenError();
    }

    let updated: MeetingRequest;
    try {
      updated = await this.meetingRequestRepository.updateStatus(meetingRequestId, "CANCELLED");
    } catch {
      throw new MeetingRequestConcurrentlyModifiedError();
    }

    const payload: MeetingRequestCancelledPayload = {
      meetingRequestId: updated.id,
      requesterId: updated.requesterId,
      participantUserIds: updated.participantUserIds,
      title: updated.title,
    };
    await this.eventPublisher.publish(MeetingRequestEventType.CANCELLED, payload as unknown as Record<string, unknown>);

    return updated;
  }
}
