import { randomUUID } from "node:crypto";
import { assertValidTimeRange } from "../domain/time-range";
import type { MeetingKind, MeetingRequest } from "../domain/meeting-request";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";
import type { OutboxEventPublisher } from "@/shared/outbox";
import { MeetingRequestEventType, type MeetingRequestCreatedPayload } from "@/shared/outbox/events/meeting-request-events";

export interface CreateMeetingRequestInput {
  requesterId: string;
  title: string;
  message?: string | undefined;
  startAt: Date;
  endAt: Date;
  meetingKind?: MeetingKind | undefined;
  location?: string | undefined;
  onlineLink?: string | undefined;
  participantUserIds: string[];
}

export class CreateMeetingRequestUseCase {
  constructor(
    private readonly meetingRequestRepository: MeetingRequestRepository,
    private readonly eventPublisher: OutboxEventPublisher,
  ) {}

  async execute(input: CreateMeetingRequestInput): Promise<MeetingRequest> {
    assertValidTimeRange(input.startAt, input.endAt);

    const meetingRequest = await this.meetingRequestRepository.create({
      id: randomUUID(),
      requesterId: input.requesterId,
      title: input.title,
      message: input.message,
      startAt: input.startAt,
      endAt: input.endAt,
      meetingKind: input.meetingKind ?? "IN_PERSON",
      location: input.location,
      onlineLink: input.onlineLink,
      participantUserIds: input.participantUserIds,
    });

    const payload: MeetingRequestCreatedPayload = {
      meetingRequestId: meetingRequest.id,
      requesterId: meetingRequest.requesterId,
      participantUserIds: meetingRequest.participantUserIds,
      title: meetingRequest.title,
    };
    await this.eventPublisher.publish(MeetingRequestEventType.CREATED, payload as unknown as Record<string, unknown>);

    return meetingRequest;
  }
}
