import { isOpen, type MeetingRequest } from "../domain/meeting-request";
import { MeetingRequestNotOpenError } from "../domain/negotiation";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";
import { ForbiddenMeetingRequestActionError, MeetingRequestConcurrentlyModifiedError, MeetingRequestNotFoundError } from "./errors";

export class CancelMeetingRequestUseCase {
  constructor(private readonly meetingRequestRepository: MeetingRequestRepository) {}

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

    try {
      return await this.meetingRequestRepository.updateStatus(meetingRequestId, "CANCELLED");
    } catch {
      throw new MeetingRequestConcurrentlyModifiedError();
    }
  }
}
