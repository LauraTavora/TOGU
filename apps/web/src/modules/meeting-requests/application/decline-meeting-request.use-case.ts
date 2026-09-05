import { assertCanRespond } from "../domain/negotiation";
import { isOpen, type MeetingRequest } from "../domain/meeting-request";
import { MeetingRequestNotOpenError } from "../domain/negotiation";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";
import type { CounterProposalRepository } from "../ports/counter-proposal-repository";
import { MeetingRequestConcurrentlyModifiedError, MeetingRequestNotFoundError } from "./errors";
import type { OutboxEventPublisher } from "@/shared/outbox";
import { MeetingRequestEventType, type MeetingRequestDeclinedPayload } from "@/shared/outbox/events/meeting-request-events";
import type { AuditLogger } from "@/shared/audit";

export class DeclineMeetingRequestUseCase {
  constructor(
    private readonly meetingRequestRepository: MeetingRequestRepository,
    private readonly counterProposalRepository: CounterProposalRepository,
    private readonly eventPublisher: OutboxEventPublisher,
    private readonly auditLogger: AuditLogger,
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

    let updated: MeetingRequest;
    try {
      updated = await this.meetingRequestRepository.updateStatus(
        meetingRequestId,
        "DECLINED",
        undefined,
        declineMessage,
      );
    } catch {
      throw new MeetingRequestConcurrentlyModifiedError();
    }

    const payload: MeetingRequestDeclinedPayload = {
      meetingRequestId: updated.id,
      requesterId: updated.requesterId,
      participantUserIds: updated.participantUserIds,
      declinedById: actingUserId,
      declineMessage: updated.declineMessage,
      title: updated.title,
    };
    await this.eventPublisher.publish(MeetingRequestEventType.DECLINED, payload as unknown as Record<string, unknown>);

    await this.auditLogger.record({
      action: "REQUEST_REJECTED",
      actorId: actingUserId,
      metadata: { meetingRequestId: updated.id },
    });

    return updated;
  }
}
