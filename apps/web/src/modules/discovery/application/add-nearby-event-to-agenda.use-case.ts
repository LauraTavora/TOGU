import type { NearbyEventRepository } from "../ports/nearby-event-repository";
import type { AgendaEventCreator } from "../ports/agenda-event-creator";
import { NearbyEventNotFoundError } from "./errors";

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas — usado quando o provedor não informa o fim

export class AddNearbyEventToAgendaUseCase {
  constructor(
    private readonly nearbyEventRepository: NearbyEventRepository,
    private readonly agendaEventCreator: AgendaEventCreator,
  ) {}

  async execute(userId: string, nearbyEventId: string): Promise<{ eventId: string }> {
    const event = await this.nearbyEventRepository.findById(nearbyEventId);
    if (!event) {
      throw new NearbyEventNotFoundError();
    }

    const endAt = event.endAt ?? new Date(event.startAt.getTime() + DEFAULT_DURATION_MS);

    return this.agendaEventCreator.createFromNearbyEvent({
      ownerUserId: userId,
      title: event.title,
      startAt: event.startAt,
      endAt,
      location: event.locationName ?? undefined,
    });
  }
}
