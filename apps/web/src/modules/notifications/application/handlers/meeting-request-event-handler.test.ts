import { describe, expect, it } from "vitest";
import { handleMeetingRequestEvent } from "./meeting-request-event-handler";
import { MeetingRequestEventType } from "@/shared/outbox/events/meeting-request-events";
import type { OutboxEvent } from "@/shared/outbox";

function event(type: string, payload: Record<string, unknown>): OutboxEvent {
  return { id: "evt-1", type, payload, createdAt: new Date(), processedAt: null };
}

describe("handleMeetingRequestEvent", () => {
  it("CREATED notifica todos os participantes, não o requester", () => {
    const notifications = handleMeetingRequestEvent(
      event(MeetingRequestEventType.CREATED, {
        meetingRequestId: "req-1",
        requesterId: "ana",
        participantUserIds: ["joao", "pedro"],
        title: "Jantar",
      }),
    );
    expect(notifications.map((n) => n.userId)).toEqual(["joao", "pedro"]);
    expect(notifications.every((n) => n.type === "NEW_REQUEST")).toBe(true);
  });

  it("ACCEPTED notifica todas as partes exceto quem aceitou", () => {
    const notifications = handleMeetingRequestEvent(
      event(MeetingRequestEventType.ACCEPTED, {
        meetingRequestId: "req-1",
        requesterId: "ana",
        participantUserIds: ["joao"],
        acceptedById: "joao",
        eventId: "event-1",
        title: "Jantar",
      }),
    );
    expect(notifications.map((n) => n.userId)).toEqual(["ana"]);
    expect(notifications[0]?.type).toBe("REQUEST_ACCEPTED");
  });

  it("DECLINED notifica todas as partes exceto quem negou", () => {
    const notifications = handleMeetingRequestEvent(
      event(MeetingRequestEventType.DECLINED, {
        meetingRequestId: "req-1",
        requesterId: "ana",
        participantUserIds: ["joao"],
        declinedById: "joao",
        declineMessage: "Não posso",
        title: "Jantar",
      }),
    );
    expect(notifications.map((n) => n.userId)).toEqual(["ana"]);
    expect(notifications[0]?.payload.declineMessage).toBe("Não posso");
  });

  it("COUNTER_PROPOSED notifica todas as partes exceto quem propôs", () => {
    const notifications = handleMeetingRequestEvent(
      event(MeetingRequestEventType.COUNTER_PROPOSED, {
        meetingRequestId: "req-1",
        requesterId: "ana",
        participantUserIds: ["joao"],
        proposedById: "ana",
        startAt: "2026-01-11T20:00:00.000Z",
        endAt: "2026-01-11T22:00:00.000Z",
        title: "Jantar",
      }),
    );
    expect(notifications.map((n) => n.userId)).toEqual(["joao"]);
  });

  it("CANCELLED notifica os participantes", () => {
    const notifications = handleMeetingRequestEvent(
      event(MeetingRequestEventType.CANCELLED, {
        meetingRequestId: "req-1",
        requesterId: "ana",
        participantUserIds: ["joao", "pedro"],
        title: "Jantar",
      }),
    );
    expect(notifications.map((n) => n.userId)).toEqual(["joao", "pedro"]);
    expect(notifications.every((n) => n.type === "EVENT_CANCELLED")).toBe(true);
  });

  it("ignora tipos de evento desconhecidos", () => {
    const notifications = handleMeetingRequestEvent(event("SOME_UNKNOWN_EVENT", {}));
    expect(notifications).toHaveLength(0);
  });
});
