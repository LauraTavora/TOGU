import type { Notification, NotificationType } from "../domain/notification";

export interface CreateNotificationInput {
  id: string;
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
}

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  listForUser(userId: string, onlyUnread: boolean): Promise<Notification[]>;
  countUnread(userId: string): Promise<number>;
  markRead(id: string, readAt: Date): Promise<Notification>;
  markAllRead(userId: string, readAt: Date): Promise<void>;
}
