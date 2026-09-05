import type {
  AvailabilityState,
  Event,
  MeetingKind,
  PrivacyLevel,
} from "../domain/event";

export interface CreateEventInput {
  id: string;
  calendarId: string;
  title: string;
  notes?: string | undefined;
  startAt: Date;
  endAt: Date;
  availabilityState: AvailabilityState;
  privacyLevel: PrivacyLevel;
  meetingKind: MeetingKind;
  location?: string | undefined;
  onlineLink?: string | undefined;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  participantUserIds: string[];
}

export interface UpdateEventInput {
  title?: string | undefined;
  notes?: string | undefined;
  startAt?: Date | undefined;
  endAt?: Date | undefined;
  availabilityState?: AvailabilityState | undefined;
  privacyLevel?: PrivacyLevel | undefined;
  meetingKind?: MeetingKind | undefined;
  location?: string | undefined;
  onlineLink?: string | undefined;
  bufferBeforeMin?: number | undefined;
  bufferAfterMin?: number | undefined;
}

export interface EventRepository {
  create(input: CreateEventInput): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  findInRange(calendarId: string, start: Date, end: Date): Promise<Event[]>;
  /**
   * Eventos visíveis para o usuário no intervalo: os do seu próprio
   * calendário mais aqueles em que ele é apenas participante (ex.: um
   * encontro confirmado a partir de outra pessoa) — ver módulo
   * `meeting-requests`.
   */
  findVisibleToUserInRange(userId: string, calendarId: string, start: Date, end: Date): Promise<Event[]>;
  update(id: string, patch: UpdateEventInput): Promise<Event>;
  delete(id: string): Promise<void>;
}
