import { createCreateEventUseCase } from "../../scheduling";
import type { AgendaEventCreator, CreateAgendaEventFromNearbyInput } from "../ports/agenda-event-creator";

export class SchedulingModuleAgendaEventCreator implements AgendaEventCreator {
  async createFromNearbyEvent(input: CreateAgendaEventFromNearbyInput): Promise<{ eventId: string }> {
    const useCase = createCreateEventUseCase();
    const event = await useCase.execute({
      ownerUserId: input.ownerUserId,
      title: input.title,
      startAt: input.startAt,
      endAt: input.endAt,
      availabilityState: "BUSY",
      privacyLevel: "BUSY_ONLY",
      meetingKind: "IN_PERSON",
      location: input.location,
    });
    return { eventId: event.id };
  }
}
