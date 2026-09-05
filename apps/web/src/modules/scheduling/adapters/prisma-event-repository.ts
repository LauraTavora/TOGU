import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@togu/database";
import type { Event } from "../domain/event";
import type { CreateEventInput, EventRepository, UpdateEventInput } from "../ports/event-repository";

type EventRecordWithParticipants = {
  id: string;
  calendarId: string;
  title: string;
  notes: string | null;
  startAt: Date;
  endAt: Date;
  availabilityState: Event["availabilityState"];
  privacyLevel: Event["privacyLevel"];
  meetingKind: Event["meetingKind"];
  location: string | null;
  onlineLink: string | null;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  createdAt: Date;
  updatedAt: Date;
  participants: { userId: string }[];
};

export class PrismaEventRepository implements EventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateEventInput): Promise<Event> {
    const record = await this.prisma.event.create({
      data: {
        id: input.id,
        calendarId: input.calendarId,
        title: input.title,
        startAt: input.startAt,
        endAt: input.endAt,
        availabilityState: input.availabilityState,
        privacyLevel: input.privacyLevel,
        meetingKind: input.meetingKind,
        bufferBeforeMin: input.bufferBeforeMin,
        bufferAfterMin: input.bufferAfterMin,
        ...(input.notes !== undefined && { notes: input.notes }),
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

  async findById(id: string): Promise<Event | null> {
    const record = await this.prisma.event.findUnique({
      where: { id },
      include: { participants: { select: { userId: true } } },
    });
    return record ? this.toDomain(record) : null;
  }

  async findInRange(calendarId: string, start: Date, end: Date): Promise<Event[]> {
    const records = await this.prisma.event.findMany({
      where: {
        calendarId,
        startAt: { lt: end },
        endAt: { gt: start },
      },
      include: { participants: { select: { userId: true } } },
      orderBy: { startAt: "asc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  async update(id: string, patch: UpdateEventInput): Promise<Event> {
    const record = await this.prisma.event.update({
      where: { id },
      data: {
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.notes !== undefined && { notes: patch.notes }),
        ...(patch.startAt !== undefined && { startAt: patch.startAt }),
        ...(patch.endAt !== undefined && { endAt: patch.endAt }),
        ...(patch.availabilityState !== undefined && { availabilityState: patch.availabilityState }),
        ...(patch.privacyLevel !== undefined && { privacyLevel: patch.privacyLevel }),
        ...(patch.meetingKind !== undefined && { meetingKind: patch.meetingKind }),
        ...(patch.location !== undefined && { location: patch.location }),
        ...(patch.onlineLink !== undefined && { onlineLink: patch.onlineLink }),
        ...(patch.bufferBeforeMin !== undefined && { bufferBeforeMin: patch.bufferBeforeMin }),
        ...(patch.bufferAfterMin !== undefined && { bufferAfterMin: patch.bufferAfterMin }),
      },
      include: { participants: { select: { userId: true } } },
    });
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }

  private toDomain(record: EventRecordWithParticipants): Event {
    return {
      id: record.id,
      calendarId: record.calendarId,
      title: record.title,
      notes: record.notes,
      startAt: record.startAt,
      endAt: record.endAt,
      availabilityState: record.availabilityState,
      privacyLevel: record.privacyLevel,
      meetingKind: record.meetingKind,
      location: record.location,
      onlineLink: record.onlineLink,
      bufferBeforeMin: record.bufferBeforeMin,
      bufferAfterMin: record.bufferAfterMin,
      participantUserIds: record.participants.map((p) => p.userId),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
