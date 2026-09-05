import type { NearbyEvent } from "../domain/nearby-event";
import type { NearbyEventRepository } from "../ports/nearby-event-repository";
import type { SavedEventRepository } from "../ports/saved-event-repository";
import { NearbyEventNotFoundError } from "./errors";

export class SaveEventUseCase {
  constructor(
    private readonly nearbyEventRepository: NearbyEventRepository,
    private readonly savedEventRepository: SavedEventRepository,
  ) {}

  async execute(userId: string, nearbyEventId: string): Promise<void> {
    const event = await this.nearbyEventRepository.findById(nearbyEventId);
    if (!event) {
      throw new NearbyEventNotFoundError();
    }
    await this.savedEventRepository.save(userId, nearbyEventId);
  }
}

export class UnsaveEventUseCase {
  constructor(private readonly savedEventRepository: SavedEventRepository) {}

  async execute(userId: string, nearbyEventId: string): Promise<void> {
    await this.savedEventRepository.unsave(userId, nearbyEventId);
  }
}

export class ListSavedEventsUseCase {
  constructor(private readonly savedEventRepository: SavedEventRepository) {}

  async execute(userId: string): Promise<NearbyEvent[]> {
    return this.savedEventRepository.listForUser(userId);
  }
}
