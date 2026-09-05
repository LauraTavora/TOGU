export interface CreateAgendaEventFromNearbyInput {
  ownerUserId: string;
  title: string;
  startAt: Date;
  endAt: Date;
  location?: string | undefined;
}

/**
 * Port para materializar um NearbyEvent na agenda pessoal do usuário —
 * delega ao módulo `scheduling` sem que `discovery` conheça seus
 * detalhes internos (Calendar, Prisma, etc.).
 */
export interface AgendaEventCreator {
  createFromNearbyEvent(input: CreateAgendaEventFromNearbyInput): Promise<{ eventId: string }>;
}
