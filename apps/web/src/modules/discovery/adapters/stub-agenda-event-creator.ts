import { randomUUID } from "node:crypto";
import type { AgendaEventCreator, CreateAgendaEventFromNearbyInput } from "../ports/agenda-event-creator";

export class StubAgendaEventCreator implements AgendaEventCreator {
  readonly calls: CreateAgendaEventFromNearbyInput[] = [];

  async createFromNearbyEvent(input: CreateAgendaEventFromNearbyInput): Promise<{ eventId: string }> {
    this.calls.push(input);
    return { eventId: randomUUID() };
  }
}
