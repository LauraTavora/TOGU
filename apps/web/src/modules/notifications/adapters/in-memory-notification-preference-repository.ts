import { DEFAULT_NOTIFICATION_PREFERENCE, type NotificationPreference } from "../domain/notification-preference";
import type {
  NotificationPreferenceRepository,
  UpdateNotificationPreferenceInput,
} from "../ports/notification-preference-repository";

export class InMemoryNotificationPreferenceRepository implements NotificationPreferenceRepository {
  private readonly preferences = new Map<string, NotificationPreference>();

  async get(userId: string): Promise<NotificationPreference> {
    const existing = this.preferences.get(userId);
    if (existing) return existing;
    const created: NotificationPreference = { userId, ...DEFAULT_NOTIFICATION_PREFERENCE };
    this.preferences.set(userId, created);
    return created;
  }

  async update(userId: string, patch: UpdateNotificationPreferenceInput): Promise<NotificationPreference> {
    const current = await this.get(userId);
    const updated: NotificationPreference = {
      ...current,
      ...(patch.inApp !== undefined && { inApp: patch.inApp }),
      ...(patch.push !== undefined && { push: patch.push }),
      ...(patch.email !== undefined && { email: patch.email }),
      ...(patch.webPush !== undefined && { webPush: patch.webPush }),
    };
    this.preferences.set(userId, updated);
    return updated;
  }
}
