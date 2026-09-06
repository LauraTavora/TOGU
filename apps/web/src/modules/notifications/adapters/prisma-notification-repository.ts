import type { PrismaClient, Prisma } from "@fecho/database";
import type { Notification } from "../domain/notification";
import type { CreateNotificationInput, NotificationRepository } from "../ports/notification-repository";
import { NotificationNotFoundError } from "../application/errors";

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    const record = await this.prisma.notification.create({
      data: {
        id: input.id,
        userId: input.userId,
        type: input.type,
        payload: input.payload as Prisma.InputJsonValue,
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<Notification | null> {
    const record = await this.prisma.notification.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async listForUser(userId: string, onlyUnread: boolean): Promise<Notification[]> {
    const records = await this.prisma.notification.findMany({
      where: { userId, ...(onlyUnread && { readAt: null }) },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markRead(id: string, readAt: Date): Promise<Notification> {
    const record = await this.prisma.notification.update({ where: { id }, data: { readAt } }).catch(() => null);
    if (!record) throw new NotificationNotFoundError();
    return this.toDomain(record);
  }

  async markAllRead(userId: string, readAt: Date): Promise<void> {
    await this.prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt } });
  }

  private toDomain(record: {
    id: string;
    userId: string;
    type: string;
    payload: Prisma.JsonValue;
    readAt: Date | null;
    createdAt: Date;
  }): Notification {
    return {
      id: record.id,
      userId: record.userId,
      type: record.type as Notification["type"],
      payload: record.payload as Record<string, unknown>,
      readAt: record.readAt,
      createdAt: record.createdAt,
    };
  }
}
