import { prisma } from "@fecho/database";
import { getOutboxRepository } from "@/shared/outbox";
import { ListNotificationsUseCase, CountUnreadNotificationsUseCase } from "../application/list-notifications.use-case";
import { MarkNotificationReadUseCase, MarkAllNotificationsReadUseCase } from "../application/mark-notification-read.use-case";
import {
  GetNotificationPreferencesUseCase,
  UpdateNotificationPreferencesUseCase,
} from "../application/notification-preferences.use-case";
import { ProcessOutboxUseCase } from "../application/process-outbox.use-case";
import { PrismaNotificationRepository } from "../adapters/prisma-notification-repository";
import { PrismaNotificationPreferenceRepository } from "../adapters/prisma-notification-preference-repository";

const notificationRepository = new PrismaNotificationRepository(prisma);
const notificationPreferenceRepository = new PrismaNotificationPreferenceRepository(prisma);
const outboxStore = getOutboxRepository();

export function createListNotificationsUseCase(): ListNotificationsUseCase {
  return new ListNotificationsUseCase(notificationRepository);
}

export function createCountUnreadNotificationsUseCase(): CountUnreadNotificationsUseCase {
  return new CountUnreadNotificationsUseCase(notificationRepository);
}

export function createMarkNotificationReadUseCase(): MarkNotificationReadUseCase {
  return new MarkNotificationReadUseCase(notificationRepository);
}

export function createMarkAllNotificationsReadUseCase(): MarkAllNotificationsReadUseCase {
  return new MarkAllNotificationsReadUseCase(notificationRepository);
}

export function createGetNotificationPreferencesUseCase(): GetNotificationPreferencesUseCase {
  return new GetNotificationPreferencesUseCase(notificationPreferenceRepository);
}

export function createUpdateNotificationPreferencesUseCase(): UpdateNotificationPreferencesUseCase {
  return new UpdateNotificationPreferencesUseCase(notificationPreferenceRepository);
}

export function createProcessOutboxUseCase(): ProcessOutboxUseCase {
  return new ProcessOutboxUseCase(outboxStore, notificationRepository);
}
