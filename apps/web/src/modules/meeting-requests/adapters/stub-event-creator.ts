import { randomUUID } from "node:crypto";
import type { CreateConfirmedEventInput, EventCreator } from "../ports/event-creator";

export class StubEventCreator implements EventCreator {
  readonly calls: CreateConfirmedEventInput[] = [];

  async createConfirmedEvent(input: CreateConfirmedEventInput): Promise<{ eventId: string }> {
    this.calls.push(input);
    return { eventId: randomUUID() };
  }
}
