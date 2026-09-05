import { randomUUID } from "node:crypto";
import { assertCanRespond } from "../domain/negotiation";
import { assertValidTimeRange } from "../domain/time-range";
import { isOpen } from "../domain/meeting-request";
import { MeetingRequestNotOpenError } from "../domain/negotiation";
import type { CounterProposal } from "../domain/counter-proposal";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";
import type { CounterProposalRepository } from "../ports/counter-proposal-repository";
import { MeetingRequestConcurrentlyModifiedError, MeetingRequestNotFoundError } from "./errors";

export interface CounterProposeInput {
  meetingRequestId: string;
  actingUserId: string;
  startAt: Date;
  endAt: Date;
  message?: string | undefined;
}

export class CounterProposeUseCase {
  constructor(
    private readonly meetingRequestRepository: MeetingRequestRepository,
    private readonly counterProposalRepository: CounterProposalRepository,
  ) {}

  async execute(input: CounterProposeInput): Promise<CounterProposal> {
    assertValidTimeRange(input.startAt, input.endAt);

    const meetingRequest = await this.meetingRequestRepository.findById(input.meetingRequestId);
    if (!meetingRequest) {
      throw new MeetingRequestNotFoundError();
    }
    if (!isOpen(meetingRequest.status)) {
      throw new MeetingRequestNotOpenError();
    }

    const existingProposals = await this.counterProposalRepository.listForRequest(input.meetingRequestId);
    assertCanRespond(meetingRequest, existingProposals, input.actingUserId);

    const proposal = await this.counterProposalRepository.create({
      id: randomUUID(),
      meetingRequestId: input.meetingRequestId,
      proposedById: input.actingUserId,
      startAt: input.startAt,
      endAt: input.endAt,
      message: input.message,
    });

    try {
      await this.meetingRequestRepository.updateStatus(input.meetingRequestId, "COUNTER_PROPOSED");
    } catch {
      throw new MeetingRequestConcurrentlyModifiedError();
    }

    return proposal;
  }
}
