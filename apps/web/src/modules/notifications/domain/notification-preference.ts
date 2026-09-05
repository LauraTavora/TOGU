export interface NotificationPreference {
  userId: string;
  inApp: boolean;
  push: boolean;
  email: boolean;
  webPush: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCE: Omit<NotificationPreference, "userId"> = {
  inApp: true,
  push: true,
  email: true,
  webPush: false,
};
