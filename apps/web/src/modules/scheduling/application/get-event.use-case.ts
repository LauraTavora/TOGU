import type { Event } from "../domain/event";
import type { EventRepository } from "../ports/event-repository";
import type { CalendarRepository } from "../ports/calendar-repository";
import { EventNotFoundError, ForbiddenEventAccessError } from "./errors";

export class GetEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly calendarRepository: CalendarRepository,
  ) {}

  async execute(eventId: string, requesterUserId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new EventNotFoundError();
    }

    const ownerId = await this.calendarRepository.findOwnerId(event.calendarId);
    const isOwner = ownerId === requesterUserId;
    const isParticipant = event.participantUserIds.includes(requesterUserId);

    // Acesso completo restrito a dono/participante. Visualização parcial de
    // disponibilidade para terceiros é responsabilidade do módulo
    // `availability` (docs/PRIVACY-LGPD.md) — nunca desta rota de detalhe.
    if (!isOwner && !isParticipant) {
      throw new ForbiddenEventAccessError();
    }

    return event;
  }
}
