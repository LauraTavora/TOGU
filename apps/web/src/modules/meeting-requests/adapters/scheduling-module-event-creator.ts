import { createCreateEventUseCase } from "../../scheduling";
import type { CreateConfirmedEventInput, EventCreator } from "../ports/event-creator";

export class SchedulingModuleEventCreator implements EventCreator {
  async createConfirmedEvent(input: CreateConfirmedEventInput): Promise<{ eventId: string }> {
    const useCase = createCreateEventUseCase();
    const event = await useCase.execute({
      ownerUserId: input.ownerUserId,
      title: input.title,
      startAt: input.startAt,
      endAt: input.endAt,
      availabilityState: "BUSY",
      privacyLevel: "PARTICIPANTS",
      meetingKind: input.meetingKind,
      location: input.location,
      onlineLink: input.onlineLink,
      participantUserIds: input.participantUserIds,
    });
    return { eventId: event.id };
  }
}
