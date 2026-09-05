import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  onlyUnread: z.enum(["true", "false"]).optional(),
});
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

export const updateNotificationPreferencesSchema = z.object({
  inApp: z.boolean().optional(),
  push: z.boolean().optional(),
  email: z.boolean().optional(),
  webPush: z.boolean().optional(),
});
export type UpdateNotificationPreferencesBody = z.infer<typeof updateNotificationPreferencesSchema>;
