import type { PrismaClient } from "@fecho/database";
import { createComputePriorityScoreUseCase } from "../../priority";
import type { PriorityRanker, PriorityRankableRequest } from "../ports/priority-ranker";

export class PriorityModuleRanker implements PriorityRanker {
  constructor(private readonly prisma: PrismaClient) {}

  async score(receiverId: string, request: PriorityRankableRequest): Promise<number> {
    const circleIds = await this.findCommonCircleIds(receiverId, request.requesterId);
    const useCase = createComputePriorityScoreUseCase();
    return useCase.execute(receiverId, {
      personId: request.requesterId,
      circleIds,
      createdAt: request.createdAt,
    });
  }

  private async findCommonCircleIds(userA: string, userB: string): Promise<string[]> {
    const [circlesA, circlesB] = await Promise.all([
      this.prisma.circleMember.findMany({ where: { userId: userA }, select: { circleId: true } }),
      this.prisma.circleMember.findMany({ where: { userId: userB }, select: { circleId: true } }),
    ]);
    const setB = new Set(circlesB.map((c) => c.circleId));
    return circlesA.map((c) => c.circleId).filter((id) => setB.has(id));
  }
}
