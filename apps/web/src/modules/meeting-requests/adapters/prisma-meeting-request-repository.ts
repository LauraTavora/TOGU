import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@fecho/database";
import { OPEN_STATUSES, type MeetingRequest, type MeetingRequestStatus } from "../domain/meeting-request";
import type {
  CreateMeetingRequestInput,
  MeetingRequestRepository,
} from "../ports/meeting-request-repository";

type RecordWithParticipants = {
  id: string;
  requesterId: string;
  title: string;
  message: string | null;
  startAt: Date;
  endAt: Date;
  meetingKind: MeetingRequest["meetingKind"];
  location: string | null;
  onlineLink: string | null;
  status: MeetingRequestStatus;
  resolvedEventId: string | null;
  declineMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  participants: { userId: string }[];
};

export class PrismaMeetingRequestRepository implements MeetingRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateMeetingRequestInput): Promise<MeetingRequest> {
    const record = await this.prisma.meetingRequest.create({
      data: {
        id: input.id,
        requesterId: input.requesterId,
        title: input.title,
        startAt: input.startAt,
        endAt: input.endAt,
        meetingKind: input.meetingKind,
        ...(input.message !== undefined && { message: input.message }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.onlineLink !== undefined && { onlineLink: input.onlineLink }),
        participants: {
          create: input.participantUserIds.map((userId) => ({ id: randomUUID(), userId })),
        },
      },
      include: { participants: { select: { userId: true } } },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<MeetingRequest | null> {
    const record = await this.prisma.meetingRequest.findUnique({
      where: { id },
      include: { participants: { select: { userId: true } } },
    });
    return record ? this.toDomain(record) : null;
  }

  async listReceived(userId: string, status?: MeetingRequestStatus | undefined): Promise<MeetingRequest[]> {
    const records = await this.prisma.meetingRequest.findMany({
      where: {
        participants: { some: { userId } },
        ...(status && { status }),
      },
      include: { participants: { select: { userId: true } } },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r) => this.toDomain(r));
  }

  async listSent(userId: string, status?: MeetingRequestStatus | undefined): Promise<MeetingRequest[]> {
    const records = await this.prisma.meetingRequest.findMany({
      where: {
        requesterId: userId,
        ...(status && { status }),
      },
      include: { participants: { select: { userId: true } } },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r) => this.toDomain(r));
  }

  async updateStatus(
    id: string,
    status: MeetingRequestStatus,
    resolvedEventId?: string | undefined,
    declineMessage?: string | undefined,
  ): Promise<MeetingRequest> {
    const result = await this.prisma.meetingRequest.updateMany({
      where: { id, status: { in: [...OPEN_STATUSES] } },
      data: {
        status,
        ...(resolvedEventId !== undefined && { resolvedEventId }),
        ...(declineMessage !== undefined && { declineMessage }),
      },
    });

    if (result.count === 0) {
      throw new Error("Meeting request is no longer open (concurrent modification).");
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("Meeting request disappeared after update.");
    }
    return updated;
  }

  private toDomain(record: RecordWithParticipants): MeetingRequest {
    return {
      id: record.id,
      requesterId: record.requesterId,
      title: record.title,
      message: record.message,
      startAt: record.startAt,
      endAt: record.endAt,
      meetingKind: record.meetingKind,
      location: record.location,
      onlineLink: record.onlineLink,
      status: record.status,
      participantUserIds: record.participants.map((p) => p.userId),
      resolvedEventId: record.resolvedEventId,
      declineMessage: record.declineMessage,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
