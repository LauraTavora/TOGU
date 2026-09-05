import type { MeetingKind } from "../domain/meeting-request";

export interface CreateConfirmedEventInput {
  ownerUserId: string;
  title: string;
  startAt: Date;
  endAt: Date;
  meetingKind: MeetingKind;
  location?: string | undefined;
  onlineLink?: string | undefined;
  participantUserIds: string[];
}

/**
 * Port para materializar o compromisso confirmado na agenda — delega ao
 * módulo `scheduling` sem que `meeting-requests` conheça seus detalhes
 * internos (Calendar, Prisma, etc.).
 */
export interface EventCreator {
  createConfirmedEvent(input: CreateConfirmedEventInput): Promise<{ eventId: string }>;
}
