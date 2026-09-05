import type { CounterProposal } from "../domain/counter-proposal";
import { getAllParties } from "../domain/negotiation";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";
import type { CounterProposalRepository } from "../ports/counter-proposal-repository";
import { ForbiddenMeetingRequestActionError, MeetingRequestNotFoundError } from "./errors";

export class ListCounterProposalsUseCase {
  constructor(
    private readonly meetingRequestRepository: MeetingRequestRepository,
    private readonly counterProposalRepository: CounterProposalRepository,
  ) {}

  async execute(meetingRequestId: string, actingUserId: string): Promise<CounterProposal[]> {
    const meetingRequest = await this.meetingRequestRepository.findById(meetingRequestId);
    if (!meetingRequest) {
      throw new MeetingRequestNotFoundError();
    }

    if (!getAllParties(meetingRequest).includes(actingUserId)) {
      throw new ForbiddenMeetingRequestActionError();
    }

    return this.counterProposalRepository.listForRequest(meetingRequestId);
  }
}
