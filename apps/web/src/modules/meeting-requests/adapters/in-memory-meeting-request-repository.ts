import { isOpen, type MeetingRequest, type MeetingRequestStatus } from "../domain/meeting-request";
import type {
  CreateMeetingRequestInput,
  MeetingRequestRepository,
} from "../ports/meeting-request-repository";

export class InMemoryMeetingRequestRepository implements MeetingRequestRepository {
  private readonly requests = new Map<string, MeetingRequest>();

  async create(input: CreateMeetingRequestInput): Promise<MeetingRequest> {
    const now = new Date();
    const request: MeetingRequest = {
      id: input.id,
      requesterId: input.requesterId,
      title: input.title,
      message: input.message ?? null,
      startAt: input.startAt,
      endAt: input.endAt,
      meetingKind: input.meetingKind,
      location: input.location ?? null,
      onlineLink: input.onlineLink ?? null,
      status: "PENDING",
      participantUserIds: input.participantUserIds,
      resolvedEventId: null,
      declineMessage: null,
      createdAt: now,
      updatedAt: now,
    };
    this.requests.set(request.id, request);
    return request;
  }

  async findById(id: string): Promise<MeetingRequest | null> {
    return this.requests.get(id) ?? null;
  }

  async listReceived(userId: string, status?: MeetingRequestStatus | undefined): Promise<MeetingRequest[]> {
    return Array.from(this.requests.values()).filter(
      (r) => r.participantUserIds.includes(userId) && (!status || r.status === status),
    );
  }

  async listSent(userId: string, status?: MeetingRequestStatus | undefined): Promise<MeetingRequest[]> {
    return Array.from(this.requests.values()).filter(
      (r) => r.requesterId === userId && (!status || r.status === status),
    );
  }

  async updateStatus(
    id: string,
    status: MeetingRequestStatus,
    resolvedEventId?: string | undefined,
    declineMessage?: string | undefined,
  ): Promise<MeetingRequest> {
    const existing = this.requests.get(id);
    if (!existing) {
      throw new Error("not found");
    }
    if (!isOpen(existing.status)) {
      throw new Error("no longer open");
    }

    const updated: MeetingRequest = {
      ...existing,
      status,
      resolvedEventId: resolvedEventId ?? existing.resolvedEventId,
      declineMessage: declineMessage ?? existing.declineMessage,
      updatedAt: new Date(),
    };
    this.requests.set(id, updated);
    return updated;
  }
}
