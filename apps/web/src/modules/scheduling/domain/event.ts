export type AvailabilityState = "AVAILABLE" | "SOFT_HOLD" | "BUSY" | "PRIVATE_BUSY";

export type PrivacyLevel = "PRIVATE" | "BUSY_ONLY" | "CIRCLE" | "PARTICIPANTS" | "PUBLIC";

export type MeetingKind = "IN_PERSON" | "ONLINE" | "HYBRID";

export interface Event {
  id: string;
  calendarId: string;
  title: string;
  notes: string | null;
  startAt: Date;
  endAt: Date;
  availabilityState: AvailabilityState;
  privacyLevel: PrivacyLevel;
  meetingKind: MeetingKind;
  location: string | null;
  onlineLink: string | null;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  participantUserIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
