import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@togu/database";
import type { PriorityLevel } from "../domain/priority-level";
import type { PriorityRule, PriorityTargetType } from "../domain/priority-rule";
import type { PriorityRuleRepository } from "../ports/priority-rule-repository";

export class PrismaPriorityRuleRepository implements PriorityRuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private async ensureProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.priorityProfile.upsert({
      where: { userId },
      create: { id: randomUUID(), userId },
      update: {},
    });
    return profile.id;
  }

  async upsert(
    userId: string,
    targetType: PriorityTargetType,
    targetId: string,
    level: PriorityLevel,
  ): Promise<PriorityRule> {
    const priorityProfileId = await this.ensureProfileId(userId);
    const rule = await this.prisma.priorityRule.upsert({
      where: { priorityProfileId_targetType_targetId: { priorityProfileId, targetType, targetId } },
      create: { id: randomUUID(), priorityProfileId, targetType, targetId, level },
      update: { level },
    });
    return { id: rule.id, userId, targetType: rule.targetType, targetId: rule.targetId, level: rule.level };
  }

  async list(userId: string): Promise<PriorityRule[]> {
    const profile = await this.prisma.priorityProfile.findUnique({
      where: { userId },
      include: { rules: true },
    });
    if (!profile) return [];
    return profile.rules.map((rule) => ({
      id: rule.id,
      userId,
      targetType: rule.targetType,
      targetId: rule.targetId,
      level: rule.level,
    }));
  }

  async remove(userId: string, targetType: PriorityTargetType, targetId: string): Promise<void> {
    const profile = await this.prisma.priorityProfile.findUnique({ where: { userId } });
    if (!profile) return;
    await this.prisma.priorityRule.deleteMany({
      where: { priorityProfileId: profile.id, targetType, targetId },
    });
  }
}
