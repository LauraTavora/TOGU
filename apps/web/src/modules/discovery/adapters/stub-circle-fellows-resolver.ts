import type { CircleFellowsResolver } from "../ports/circle-fellows-resolver";

export class StubCircleFellowsResolver implements CircleFellowsResolver {
  constructor(private readonly fellowsByUserId: Record<string, string[]> = {}) {}

  async findFellowUserIds(userId: string): Promise<string[]> {
    return this.fellowsByUserId[userId] ?? [];
  }
}
