import { randomUUID } from "node:crypto";
import { assertCanRespond } from "../domain/negotiation";
import { assertValidTimeRange } from "../domain/time-range";
import { isOpen } from "../domain/meeting-request";
import { MeetingRequestNotOpenError } from "../domain/negotiation";
import type { CounterProposal } from "../domain/counter-proposal";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";
import type { CounterProposalRepository } from "../ports/counter-proposal-repository";
import { MeetingRequestConcurrentlyModifiedError, MeetingRequestNotFoundError } from "./errors";
import type { OutboxEventPublisher } from "@/shared/outbox";
import {
  MeetingRequestEventType,
  type MeetingRequestCounterProposedPayload,
} from "@/shared/outbox/events/meeting-request-events";

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
    private readonly eventPublisher: OutboxEventPublisher,
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

    const payload: MeetingRequestCounterProposedPayload = {
      meetingRequestId: meetingRequest.id,
      requesterId: meetingRequest.requesterId,
      participantUserIds: meetingRequest.participantUserIds,
      proposedById: input.actingUserId,
      startAt: proposal.startAt.toISOString(),
      endAt: proposal.endAt.toISOString(),
      title: meetingRequest.title,
    };
    await this.eventPublisher.publish(
      MeetingRequestEventType.COUNTER_PROPOSED,
      payload as unknown as Record<string, unknown>,
    );

    return proposal;
  }
}
