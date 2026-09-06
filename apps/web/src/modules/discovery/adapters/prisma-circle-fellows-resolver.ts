import type { PrismaClient } from "@fecho/database";
import type { CircleFellowsResolver } from "../ports/circle-fellows-resolver";

export class PrismaCircleFellowsResolver implements CircleFellowsResolver {
  constructor(private readonly prisma: PrismaClient) {}

  async findFellowUserIds(userId: string): Promise<string[]> {
    const myCircles = await this.prisma.circleMember.findMany({
      where: { userId },
      select: { circleId: true },
    });
    if (myCircles.length === 0) return [];

    const fellows = await this.prisma.circleMember.findMany({
      where: { circleId: { in: myCircles.map((c) => c.circleId) }, userId: { not: userId } },
      select: { userId: true },
      distinct: ["userId"],
    });
    return fellows.map((f) => f.userId);
  }
}
