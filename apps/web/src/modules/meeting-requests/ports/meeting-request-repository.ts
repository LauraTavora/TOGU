import type { MeetingKind, MeetingRequest, MeetingRequestStatus } from "../domain/meeting-request";

export interface CreateMeetingRequestInput {
  id: string;
  requesterId: string;
  title: string;
  message?: string | undefined;
  startAt: Date;
  endAt: Date;
  meetingKind: MeetingKind;
  location?: string | undefined;
  onlineLink?: string | undefined;
  participantUserIds: string[];
}

export interface MeetingRequestRepository {
  create(input: CreateMeetingRequestInput): Promise<MeetingRequest>;
  findById(id: string): Promise<MeetingRequest | null>;
  listReceived(userId: string, status?: MeetingRequestStatus | undefined): Promise<MeetingRequest[]>;
  listSent(userId: string, status?: MeetingRequestStatus | undefined): Promise<MeetingRequest[]>;
  /**
   * Atualização condicional: só aplica se o registro ainda estiver em um
   * status aberto no momento da escrita — evita corrida entre duas
   * respostas simultâneas (docs/ARCHITECTURE.md §Concorrência). Deve
   * rejeitar (lançar) se o status já não for mais aberto.
   */
  updateStatus(
    id: string,
    status: MeetingRequestStatus,
    resolvedEventId?: string | undefined,
    declineMessage?: string | undefined,
  ): Promise<MeetingRequest>;
}
