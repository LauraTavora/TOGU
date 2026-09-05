import type { Notification } from "../domain/notification";
import type { NotificationRepository } from "../ports/notification-repository";
import { ForbiddenNotificationAccessError, NotificationNotFoundError } from "./errors";

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(notificationId: string, requesterUserId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotificationNotFoundError();
    }
    if (notification.userId !== requesterUserId) {
      throw new ForbiddenNotificationAccessError();
    }
    if (notification.readAt) {
      return notification;
    }
    return this.notificationRepository.markRead(notificationId, new Date());
  }
}

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(userId: string): Promise<void> {
    await this.notificationRepository.markAllRead(userId, new Date());
  }
}
