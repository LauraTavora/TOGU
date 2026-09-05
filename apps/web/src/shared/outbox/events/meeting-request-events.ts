/**
 * Contratos públicos dos eventos de domínio emitidos pelo módulo
 * `meeting-requests` via outbox. Nem o produtor nem os consumidores
 * (ex.: `notifications`) dependem um do outro diretamente — apenas
 * deste contrato compartilhado (docs/adr/ADR-004 e ADR-009).
 */
export const MeetingRequestEventType = {
  CREATED: "MEETING_REQUEST_CREATED",
  ACCEPTED: "MEETING_REQUEST_ACCEPTED",
  DECLINED: "MEETING_REQUEST_DECLINED",
  COUNTER_PROPOSED: "MEETING_REQUEST_COUNTER_PROPOSED",
  CANCELLED: "MEETING_REQUEST_CANCELLED",
} as const;

export interface MeetingRequestCreatedPayload {
  meetingRequestId: string;
  requesterId: string;
  participantUserIds: string[];
  title: string;
}

export interface MeetingRequestAcceptedPayload {
  meetingRequestId: string;
  requesterId: string;
  participantUserIds: string[];
  acceptedById: string;
  eventId: string;
  title: string;
}

export interface MeetingRequestDeclinedPayload {
  meetingRequestId: string;
  requesterId: string;
  participantUserIds: string[];
  declinedById: string;
  declineMessage: string | null;
  title: string;
}

export interface MeetingRequestCounterProposedPayload {
  meetingRequestId: string;
  requesterId: string;
  participantUserIds: string[];
  proposedById: string;
  startAt: string;
  endAt: string;
  title: string;
}

export interface MeetingRequestCancelledPayload {
  meetingRequestId: string;
  requesterId: string;
  participantUserIds: string[];
  title: string;
}
