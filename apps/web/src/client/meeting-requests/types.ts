export type MeetingRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "COUNTER_PROPOSED"
  | "CANCELLED"
  | "EXPIRED";

export interface MeetingRequestDto {
  id: string;
  requesterId: string;
  title: string;
  message: string | null;
  startAt: string;
  endAt: string;
  meetingKind: string;
  location: string | null;
  onlineLink: string | null;
  status: MeetingRequestStatus;
  participantUserIds: string[];
  resolvedEventId: string | null;
  declineMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CounterProposalDto {
  id: string;
  meetingRequestId: string;
  proposedById: string;
  startAt: string;
  endAt: string;
  message: string | null;
  createdAt: string;
}
