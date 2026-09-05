import { assertCanRespond } from "../domain/negotiation";
import { isOpen, type MeetingRequest } from "../domain/meeting-request";
import { MeetingRequestNotOpenError } from "../domain/negotiation";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";
import type { CounterProposalRepository } from "../ports/counter-proposal-repository";
import { MeetingRequestConcurrentlyModifiedError, MeetingRequestNotFoundError } from "./errors";

export class DeclineMeetingRequestUseCase {
  constructor(
    private readonly meetingRequestRepository: MeetingRequestRepository,
    private readonly counterProposalRepository: CounterProposalRepository,
  ) {}

  async execute(
    meetingRequestId: string,
    actingUserId: string,
    declineMessage?: string | undefined,
  ): Promise<MeetingRequest> {
    const meetingRequest = await this.meetingRequestRepository.findById(meetingRequestId);
    if (!meetingRequest) {
      throw new MeetingRequestNotFoundError();
    }
    if (!isOpen(meetingRequest.status)) {
      throw new MeetingRequestNotOpenError();
    }

    const counterProposals = await this.counterProposalRepository.listForRequest(meetingRequestId);
    assertCanRespond(meetingRequest, counterProposals, actingUserId);

    try {
      return await this.meetingRequestRepository.updateStatus(meetingRequestId, "DECLINED", undefined, declineMessage);
    } catch {
      throw new MeetingRequestConcurrentlyModifiedError();
    }
  }
}
