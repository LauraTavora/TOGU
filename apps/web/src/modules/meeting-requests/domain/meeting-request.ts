export type MeetingKind = "IN_PERSON" | "ONLINE" | "HYBRID";

export type MeetingRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "COUNTER_PROPOSED"
  | "CANCELLED"
  | "EXPIRED";

export interface MeetingRequest {
  id: string;
  requesterId: string;
  title: string;
  message: string | null;
  startAt: Date;
  endAt: Date;
  meetingKind: MeetingKind;
  location: string | null;
  onlineLink: string | null;
  status: MeetingRequestStatus;
  participantUserIds: string[];
  resolvedEventId: string | null;
  declineMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const OPEN_STATUSES: readonly MeetingRequestStatus[] = ["PENDING", "COUNTER_PROPOSED"];

export function isOpen(status: MeetingRequestStatus): boolean {
  return OPEN_STATUSES.includes(status);
}
