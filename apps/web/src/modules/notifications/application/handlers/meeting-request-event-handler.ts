import type { OutboxEvent } from "@/shared/outbox";
import {
  MeetingRequestEventType,
  type MeetingRequestAcceptedPayload,
  type MeetingRequestCancelledPayload,
  type MeetingRequestCounterProposedPayload,
  type MeetingRequestCreatedPayload,
  type MeetingRequestDeclinedPayload,
} from "@/shared/outbox/events/meeting-request-events";
import type { NotificationType } from "../../domain/notification";

export interface NotificationToCreate {
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
}

function allParties(requesterId: string, participantUserIds: string[]): string[] {
  return [requesterId, ...participantUserIds];
}

/**
 * Traduz um evento público de `meeting-requests` em notificações a criar.
 * Conhece apenas o contrato do evento (shared/outbox/events), nunca o
 * código interno do módulo que o emitiu — ver docs/adr/ADR-009.
 */
export function handleMeetingRequestEvent(event: OutboxEvent): NotificationToCreate[] {
  switch (event.type) {
    case MeetingRequestEventType.CREATED: {
      const payload = event.payload as unknown as MeetingRequestCreatedPayload;
      return payload.participantUserIds.map((userId) => ({
        userId,
        type: "NEW_REQUEST",
        payload: { meetingRequestId: payload.meetingRequestId, title: payload.title, requesterId: payload.requesterId },
      }));
    }

    case MeetingRequestEventType.ACCEPTED: {
      const payload = event.payload as unknown as MeetingRequestAcceptedPayload;
      return allParties(payload.requesterId, payload.participantUserIds)
        .filter((userId) => userId !== payload.acceptedById)
        .map((userId) => ({
          userId,
          type: "REQUEST_ACCEPTED",
          payload: {
            meetingRequestId: payload.meetingRequestId,
            title: payload.title,
            eventId: payload.eventId,
            acceptedById: payload.acceptedById,
          },
        }));
    }

    case MeetingRequestEventType.DECLINED: {
      const payload = event.payload as unknown as MeetingRequestDeclinedPayload;
      return allParties(payload.requesterId, payload.participantUserIds)
        .filter((userId) => userId !== payload.declinedById)
        .map((userId) => ({
          userId,
          type: "REQUEST_DECLINED",
          payload: {
            meetingRequestId: payload.meetingRequestId,
            title: payload.title,
            declinedById: payload.declinedById,
            declineMessage: payload.declineMessage,
          },
        }));
    }

    case MeetingRequestEventType.COUNTER_PROPOSED: {
      const payload = event.payload as unknown as MeetingRequestCounterProposedPayload;
      return allParties(payload.requesterId, payload.participantUserIds)
        .filter((userId) => userId !== payload.proposedById)
        .map((userId) => ({
          userId,
          type: "COUNTER_PROPOSAL",
          payload: {
            meetingRequestId: payload.meetingRequestId,
            title: payload.title,
            proposedById: payload.proposedById,
            startAt: payload.startAt,
            endAt: payload.endAt,
          },
        }));
    }

    case MeetingRequestEventType.CANCELLED: {
      const payload = event.payload as unknown as MeetingRequestCancelledPayload;
      return payload.participantUserIds.map((userId) => ({
        userId,
        type: "EVENT_CANCELLED",
        payload: { meetingRequestId: payload.meetingRequestId, title: payload.title },
      }));
    }

    default:
      return [];
  }
}
