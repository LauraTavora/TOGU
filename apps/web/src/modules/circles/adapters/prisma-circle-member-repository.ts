import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@fecho/database";
import type { CircleMember } from "../domain/circle";
import {
  MemberAlreadyInCircleError,
  MemberUserNotFoundError,
  type CircleMemberRepository,
} from "../ports/circle-member-repository";

export class PrismaCircleMemberRepository implements CircleMemberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async add(circleId: string, userId: string): Promise<CircleMember> {
    try {
      return await this.prisma.circleMember.create({
        data: { id: randomUUID(), circleId, userId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") throw new MemberAlreadyInCircleError();
        if (error.code === "P2003") throw new MemberUserNotFoundError();
      }
      throw error;
    }
  }

  async remove(circleId: string, userId: string): Promise<void> {
    await this.prisma.circleMember.deleteMany({ where: { circleId, userId } });
  }

  async list(circleId: string): Promise<CircleMember[]> {
    return this.prisma.circleMember.findMany({ where: { circleId } });
  }

  async isMember(circleId: string, userId: string): Promise<boolean> {
    const found = await this.prisma.circleMember.findUnique({
      where: { circleId_userId: { circleId, userId } },
    });
    return found !== null;
  }
}
