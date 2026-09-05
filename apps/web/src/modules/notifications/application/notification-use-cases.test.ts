import { describe, expect, it } from "vitest";
import { ListNotificationsUseCase, CountUnreadNotificationsUseCase } from "./list-notifications.use-case";
import { MarkNotificationReadUseCase, MarkAllNotificationsReadUseCase } from "./mark-notification-read.use-case";
import {
  GetNotificationPreferencesUseCase,
  UpdateNotificationPreferencesUseCase,
} from "./notification-preferences.use-case";
import { ForbiddenNotificationAccessError, NotificationNotFoundError } from "./errors";
import { InMemoryNotificationRepository } from "../adapters/in-memory-notification-repository";
import { InMemoryNotificationPreferenceRepository } from "../adapters/in-memory-notification-preference-repository";

function buildScenario() {
  const notificationRepository = new InMemoryNotificationRepository();
  const preferenceRepository = new InMemoryNotificationPreferenceRepository();
  return {
    notificationRepository,
    preferenceRepository,
    listNotifications: new ListNotificationsUseCase(notificationRepository),
    countUnread: new CountUnreadNotificationsUseCase(notificationRepository),
    markRead: new MarkNotificationReadUseCase(notificationRepository),
    markAllRead: new MarkAllNotificationsReadUseCase(notificationRepository),
    getPreferences: new GetNotificationPreferencesUseCase(preferenceRepository),
    updatePreferences: new UpdateNotificationPreferencesUseCase(preferenceRepository),
  };
}

describe("Listagem e leitura de notificações", () => {
  it("lista apenas notificações do próprio usuário, mais recentes primeiro", async () => {
    const { notificationRepository, listNotifications } = buildScenario();
    await notificationRepository.create({ id: "n1", userId: "ana", type: "NEW_REQUEST", payload: {} });
    await notificationRepository.create({ id: "n2", userId: "joao", type: "NEW_REQUEST", payload: {} });
    await notificationRepository.create({ id: "n3", userId: "ana", type: "REQUEST_ACCEPTED", payload: {} });

    const results = await listNotifications.execute("ana");
    expect(results.map((n) => n.id)).toEqual(["n3", "n1"]);
  });

  it("filtra apenas não lidas quando solicitado", async () => {
    const { notificationRepository, markRead, listNotifications } = buildScenario();
    await notificationRepository.create({ id: "n1", userId: "ana", type: "NEW_REQUEST", payload: {} });
    await notificationRepository.create({ id: "n2", userId: "ana", type: "NEW_REQUEST", payload: {} });
    await markRead.execute("n1", "ana");

    const unread = await listNotifications.execute("ana", true);
    expect(unread.map((n) => n.id)).toEqual(["n2"]);
  });

  it("bloqueia marcar como lida notificação de outro usuário (IDOR)", async () => {
    const { notificationRepository, markRead } = buildScenario();
    await notificationRepository.create({ id: "n1", userId: "ana", type: "NEW_REQUEST", payload: {} });
    await expect(markRead.execute("n1", "joao")).rejects.toThrow(ForbiddenNotificationAccessError);
  });

  it("retorna erro para notificação inexistente", async () => {
    const { markRead } = buildScenario();
    await expect(markRead.execute("inexistente", "ana")).rejects.toThrow(NotificationNotFoundError);
  });

  it("marca todas como lidas de uma vez", async () => {
    const { notificationRepository, markAllRead, countUnread } = buildScenario();
    await notificationRepository.create({ id: "n1", userId: "ana", type: "NEW_REQUEST", payload: {} });
    await notificationRepository.create({ id: "n2", userId: "ana", type: "NEW_REQUEST", payload: {} });

    await markAllRead.execute("ana");
    expect(await countUnread.execute("ana")).toBe(0);
  });
});

describe("Preferências de notificação", () => {
  it("retorna os padrões na primeira leitura", async () => {
    const { getPreferences } = buildScenario();
    const prefs = await getPreferences.execute("ana");
    expect(prefs).toEqual({ userId: "ana", inApp: true, push: true, email: true, webPush: false });
  });

  it("permite atualizar parcialmente", async () => {
    const { updatePreferences, getPreferences } = buildScenario();
    await updatePreferences.execute("ana", { email: false });
    const prefs = await getPreferences.execute("ana");
    expect(prefs.email).toBe(false);
    expect(prefs.inApp).toBe(true);
  });
});
