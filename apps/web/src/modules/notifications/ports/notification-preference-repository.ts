import type { NotificationPreference } from "../domain/notification-preference";

export interface UpdateNotificationPreferenceInput {
  inApp?: boolean | undefined;
  push?: boolean | undefined;
  email?: boolean | undefined;
  webPush?: boolean | undefined;
}

export interface NotificationPreferenceRepository {
  /** Cria com os padrões se ainda não existir. */
  get(userId: string): Promise<NotificationPreference>;
  update(userId: string, patch: UpdateNotificationPreferenceInput): Promise<NotificationPreference>;
}
