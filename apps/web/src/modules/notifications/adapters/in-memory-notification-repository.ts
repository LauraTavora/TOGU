import type { Notification } from "../domain/notification";
import type { CreateNotificationInput, NotificationRepository } from "../ports/notification-repository";
import { NotificationNotFoundError } from "../application/errors";

export class InMemoryNotificationRepository implements NotificationRepository {
  private readonly notifications: Notification[] = [];

  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification: Notification = {
      id: input.id,
      userId: input.userId,
      type: input.type,
      payload: input.payload,
      readAt: null,
      createdAt: new Date(),
    };
    this.notifications.push(notification);
    return notification;
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notifications.find((n) => n.id === id) ?? null;
  }

  async listForUser(userId: string, onlyUnread: boolean): Promise<Notification[]> {
    // Reverte a ordem de inserção antes de ordenar por createdAt: como o
    // sort é estável, isso garante "mais recente primeiro" mesmo quando
    // duas notificações são criadas no mesmo milissegundo (comum em testes).
    return this.notifications
      .filter((n) => n.userId === userId && (!onlyUnread || n.readAt === null))
      .reverse()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async countUnread(userId: string): Promise<number> {
    return this.notifications.filter((n) => n.userId === userId && n.readAt === null).length;
  }

  async markRead(id: string, readAt: Date): Promise<Notification> {
    const notification = this.notifications.find((n) => n.id === id);
    if (!notification) throw new NotificationNotFoundError();
    notification.readAt = readAt;
    return notification;
  }

  async markAllRead(userId: string, readAt: Date): Promise<void> {
    for (const notification of this.notifications) {
      if (notification.userId === userId && notification.readAt === null) {
        notification.readAt = readAt;
      }
    }
  }
}
