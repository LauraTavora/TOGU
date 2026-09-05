import type { NearbyEvent } from "../domain/nearby-event";

export interface SavedEventRepository {
  save(userId: string, nearbyEventId: string): Promise<void>;
  unsave(userId: string, nearbyEventId: string): Promise<void>;
  isSaved(userId: string, nearbyEventId: string): Promise<boolean>;
  listForUser(userId: string): Promise<NearbyEvent[]>;
  /** Dos candidatos informados, quais também salvaram este evento. */
  listSaversAmong(nearbyEventId: string, candidateUserIds: string[]): Promise<string[]>;
}
