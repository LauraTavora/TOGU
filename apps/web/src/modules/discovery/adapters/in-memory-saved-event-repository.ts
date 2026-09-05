import type { NearbyEvent } from "../domain/nearby-event";
import type { NearbyEventRepository } from "../ports/nearby-event-repository";
import type { SavedEventRepository } from "../ports/saved-event-repository";

export class InMemorySavedEventRepository implements SavedEventRepository {
  private readonly saves = new Set<string>(); // `${userId}::${nearbyEventId}`

  constructor(private readonly nearbyEventRepository: NearbyEventRepository) {}

  private key(userId: string, nearbyEventId: string): string {
    return `${userId}::${nearbyEventId}`;
  }

  async save(userId: string, nearbyEventId: string): Promise<void> {
    this.saves.add(this.key(userId, nearbyEventId));
  }

  async unsave(userId: string, nearbyEventId: string): Promise<void> {
    this.saves.delete(this.key(userId, nearbyEventId));
  }

  async isSaved(userId: string, nearbyEventId: string): Promise<boolean> {
    return this.saves.has(this.key(userId, nearbyEventId));
  }

  async listForUser(userId: string): Promise<NearbyEvent[]> {
    const ids = Array.from(this.saves)
      .filter((key) => key.startsWith(`${userId}::`))
      .map((key) => key.split("::")[1]!);
    const events = await Promise.all(ids.map((id) => this.nearbyEventRepository.findById(id)));
    return events.filter((e): e is NearbyEvent => e !== null);
  }

  async listSaversAmong(nearbyEventId: string, candidateUserIds: string[]): Promise<string[]> {
    return candidateUserIds.filter((userId) => this.saves.has(this.key(userId, nearbyEventId)));
  }
}
