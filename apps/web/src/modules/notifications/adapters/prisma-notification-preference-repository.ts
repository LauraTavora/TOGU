import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@fecho/database";
import { DEFAULT_NOTIFICATION_PREFERENCE, type NotificationPreference } from "../domain/notification-preference";
import type {
  NotificationPreferenceRepository,
  UpdateNotificationPreferenceInput,
} from "../ports/notification-preference-repository";

export class PrismaNotificationPreferenceRepository implements NotificationPreferenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(userId: string): Promise<NotificationPreference> {
    const record = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { id: randomUUID(), userId, ...DEFAULT_NOTIFICATION_PREFERENCE },
      update: {},
    });
    return this.toDomain(record);
  }

  async update(userId: string, patch: UpdateNotificationPreferenceInput): Promise<NotificationPreference> {
    await this.get(userId); // garante que a linha existe antes do update parcial
    const record = await this.prisma.notificationPreference.update({
      where: { userId },
      data: {
        ...(patch.inApp !== undefined && { inApp: patch.inApp }),
        ...(patch.push !== undefined && { push: patch.push }),
        ...(patch.email !== undefined && { email: patch.email }),
        ...(patch.webPush !== undefined && { webPush: patch.webPush }),
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: {
    userId: string;
    inApp: boolean;
    push: boolean;
    email: boolean;
    webPush: boolean;
  }): NotificationPreference {
    return {
      userId: record.userId,
      inApp: record.inApp,
      push: record.push,
      email: record.email,
      webPush: record.webPush,
    };
  }
}
