import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@fecho/database";
import { isEventCategory } from "../domain/event-category";
import type { NearbyEvent } from "../domain/nearby-event";
import type {
  FindNearbyEventsFilter,
  NearbyEventRepository,
  UpsertNearbyEventInput,
} from "../ports/nearby-event-repository";

type NearbyEventRecord = {
  id: string;
  providerRef: string;
  title: string;
  category: string;
  startAt: Date;
  endAt: Date | null;
  locationName: string | null;
  latitude: number;
  longitude: number;
  priceInfo: string | null;
  isFree: boolean;
  createdAt: Date;
};

export class PrismaNearbyEventRepository implements NearbyEventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(input: UpsertNearbyEventInput): Promise<NearbyEvent> {
    const record = await this.prisma.nearbyEvent.upsert({
      where: { providerRef: input.providerRef },
      create: {
        id: randomUUID(),
        providerRef: input.providerRef,
        title: input.title,
        category: input.category,
        startAt: input.startAt,
        latitude: input.latitude,
        longitude: input.longitude,
        isFree: input.isFree,
        ...(input.endAt !== undefined && { endAt: input.endAt }),
        ...(input.locationName !== undefined && { locationName: input.locationName }),
        ...(input.priceInfo !== undefined && { priceInfo: input.priceInfo }),
      },
      update: {
        title: input.title,
        category: input.category,
        startAt: input.startAt,
        latitude: input.latitude,
        longitude: input.longitude,
        isFree: input.isFree,
        ...(input.endAt !== undefined && { endAt: input.endAt }),
        ...(input.locationName !== undefined && { locationName: input.locationName }),
        ...(input.priceInfo !== undefined && { priceInfo: input.priceInfo }),
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<NearbyEvent | null> {
    const record = await this.prisma.nearbyEvent.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findInRange(filter: FindNearbyEventsFilter): Promise<NearbyEvent[]> {
    const records = await this.prisma.nearbyEvent.findMany({
      where: {
        startAt: { gte: filter.from, lte: filter.to },
        ...(filter.category && { category: filter.category }),
        ...(filter.onlyFree && { isFree: true }),
      },
      orderBy: { startAt: "asc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: NearbyEventRecord): NearbyEvent {
    return {
      id: record.id,
      providerRef: record.providerRef,
      title: record.title,
      category: isEventCategory(record.category) ? record.category : "OUTDOOR",
      startAt: record.startAt,
      endAt: record.endAt,
      locationName: record.locationName,
      location: { latitude: record.latitude, longitude: record.longitude },
      priceInfo: record.priceInfo,
      isFree: record.isFree,
      createdAt: record.createdAt,
    };
  }
}
