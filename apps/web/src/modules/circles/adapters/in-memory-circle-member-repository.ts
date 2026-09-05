import { randomUUID } from "node:crypto";
import type { CircleMember } from "../domain/circle";
import type { CircleMemberRepository } from "../ports/circle-member-repository";
import { MemberAlreadyInCircleError } from "../ports/circle-member-repository";

export class InMemoryCircleMemberRepository implements CircleMemberRepository {
  private readonly members: CircleMember[] = [];

  async add(circleId: string, userId: string): Promise<CircleMember> {
    if (await this.isMember(circleId, userId)) {
      throw new MemberAlreadyInCircleError();
    }
    const member: CircleMember = { id: randomUUID(), circleId, userId, createdAt: new Date() };
    this.members.push(member);
    return member;
  }

  async remove(circleId: string, userId: string): Promise<void> {
    const index = this.members.findIndex((m) => m.circleId === circleId && m.userId === userId);
    if (index >= 0) this.members.splice(index, 1);
  }

  async list(circleId: string): Promise<CircleMember[]> {
    return this.members.filter((m) => m.circleId === circleId);
  }

  async isMember(circleId: string, userId: string): Promise<boolean> {
    return this.members.some((m) => m.circleId === circleId && m.userId === userId);
  }
}
