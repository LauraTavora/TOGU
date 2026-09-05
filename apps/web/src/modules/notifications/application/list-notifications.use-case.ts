import type { Notification } from "../domain/notification";
import type { NotificationRepository } from "../ports/notification-repository";

export class ListNotificationsUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(userId: string, onlyUnread = false): Promise<Notification[]> {
    return this.notificationRepository.listForUser(userId, onlyUnread);
  }
}

export class CountUnreadNotificationsUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }
}
