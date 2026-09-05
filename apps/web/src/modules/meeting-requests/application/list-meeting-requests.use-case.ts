import type { MeetingRequest, MeetingRequestStatus } from "../domain/meeting-request";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";

export class ListReceivedMeetingRequestsUseCase {
  constructor(private readonly meetingRequestRepository: MeetingRequestRepository) {}

  async execute(userId: string, status?: MeetingRequestStatus | undefined): Promise<MeetingRequest[]> {
    return this.meetingRequestRepository.listReceived(userId, status);
  }
}

export class ListSentMeetingRequestsUseCase {
  constructor(private readonly meetingRequestRepository: MeetingRequestRepository) {}

  async execute(userId: string, status?: MeetingRequestStatus | undefined): Promise<MeetingRequest[]> {
    return this.meetingRequestRepository.listSent(userId, status);
  }
}
