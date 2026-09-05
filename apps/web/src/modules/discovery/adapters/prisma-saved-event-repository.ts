import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@togu/database";
import { isEventCategory } from "../domain/event-category";
import type { NearbyEvent } from "../domain/nearby-event";
import type { SavedEventRepository } from "../ports/saved-event-repository";

export class PrismaSavedEventRepository implements SavedEventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(userId: string, nearbyEventId: string): Promise<void> {
    await this.prisma.savedEvent.upsert({
      where: { userId_nearbyEventId: { userId, nearbyEventId } },
      create: { id: randomUUID(), userId, nearbyEventId },
      update: {},
    });
  }

  async unsave(userId: string, nearbyEventId: string): Promise<void> {
    await this.prisma.savedEvent.deleteMany({ where: { userId, nearbyEventId } });
  }

  async isSaved(userId: string, nearbyEventId: string): Promise<boolean> {
    const found = await this.prisma.savedEvent.findUnique({
      where: { userId_nearbyEventId: { userId, nearbyEventId } },
    });
    return found !== null;
  }

  async listForUser(userId: string): Promise<NearbyEvent[]> {
    const saved = await this.prisma.savedEvent.findMany({
      where: { userId },
      include: { nearbyEvent: true },
      orderBy: { createdAt: "desc" },
    });
    return saved.map((s) => ({
      id: s.nearbyEvent.id,
      providerRef: s.nearbyEvent.providerRef,
      title: s.nearbyEvent.title,
      category: isEventCategory(s.nearbyEvent.category) ? s.nearbyEvent.category : "OUTDOOR",
      startAt: s.nearbyEvent.startAt,
      endAt: s.nearbyEvent.endAt,
      locationName: s.nearbyEvent.locationName,
      location: { latitude: s.nearbyEvent.latitude, longitude: s.nearbyEvent.longitude },
      priceInfo: s.nearbyEvent.priceInfo,
      isFree: s.nearbyEvent.isFree,
      createdAt: s.nearbyEvent.createdAt,
    }));
  }

  async listSaversAmong(nearbyEventId: string, candidateUserIds: string[]): Promise<string[]> {
    const saved = await this.prisma.savedEvent.findMany({
      where: { nearbyEventId, userId: { in: candidateUserIds } },
      select: { userId: true },
    });
    return saved.map((s) => s.userId);
  }
}
