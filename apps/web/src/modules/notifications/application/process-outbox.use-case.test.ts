import { describe, expect, it } from "vitest";
import { ProcessOutboxUseCase } from "./process-outbox.use-case";
import { InMemoryNotificationRepository } from "../adapters/in-memory-notification-repository";
import { InMemoryOutboxRepository } from "@/shared/outbox/in-memory-outbox-repository";
import { MeetingRequestEventType } from "@/shared/outbox/events/meeting-request-events";

describe("ProcessOutboxUseCase", () => {
  it("cria notificações a partir de eventos pendentes e marca como processados", async () => {
    const outbox = new InMemoryOutboxRepository();
    const notificationRepository = new InMemoryNotificationRepository();
    const useCase = new ProcessOutboxUseCase(outbox, notificationRepository);

    await outbox.publish(MeetingRequestEventType.CREATED, {
      meetingRequestId: "req-1",
      requesterId: "ana",
      participantUserIds: ["joao"],
      title: "Jantar",
    });

    const result = await useCase.execute();
    expect(result.processedEvents).toBe(1);
    expect(result.createdNotifications).toBe(1);

    const joaoNotifications = await notificationRepository.listForUser("joao", false);
    expect(joaoNotifications).toHaveLength(1);
    expect(joaoNotifications[0]?.type).toBe("NEW_REQUEST");

    expect(outbox.events[0]?.processedAt).not.toBeNull();
  });

  it("não reprocessa eventos já marcados como processados", async () => {
    const outbox = new InMemoryOutboxRepository();
    const notificationRepository = new InMemoryNotificationRepository();
    const useCase = new ProcessOutboxUseCase(outbox, notificationRepository);

    await outbox.publish(MeetingRequestEventType.CREATED, {
      meetingRequestId: "req-1",
      requesterId: "ana",
      participantUserIds: ["joao"],
      title: "Jantar",
    });

    await useCase.execute();
    const second = await useCase.execute();

    expect(second.processedEvents).toBe(0);
    expect(await notificationRepository.listForUser("joao", false)).toHaveLength(1);
  });

  it("ignora eventos de tipos desconhecidos sem falhar", async () => {
    const outbox = new InMemoryOutboxRepository();
    const notificationRepository = new InMemoryNotificationRepository();
    const useCase = new ProcessOutboxUseCase(outbox, notificationRepository);

    await outbox.publish("ALGUM_EVENTO_DESCONHECIDO", { foo: "bar" });

    const result = await useCase.execute();
    expect(result.processedEvents).toBe(1);
    expect(result.createdNotifications).toBe(0);
  });
});
