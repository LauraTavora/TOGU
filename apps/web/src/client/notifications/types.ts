export type NotificationType =
  | "NEW_REQUEST"
  | "REQUEST_ACCEPTED"
  | "REQUEST_DECLINED"
  | "COUNTER_PROPOSAL"
  | "EVENT_UPDATED"
  | "EVENT_CANCELLED"
  | "REMINDER"
  | "CONFLICT"
  | "INVITE"
  | "NEARBY_EVENT";

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}
