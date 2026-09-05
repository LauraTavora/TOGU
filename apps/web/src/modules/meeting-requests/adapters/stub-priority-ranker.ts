import type { PriorityRanker, PriorityRankableRequest } from "../ports/priority-ranker";

/** Test double — pontua por requesterId via mapa configurável, padrão 1 (NORMAL). */
export class StubPriorityRanker implements PriorityRanker {
  constructor(private readonly scoresByRequesterId: Record<string, number> = {}) {}

  async score(_receiverId: string, request: PriorityRankableRequest): Promise<number> {
    return this.scoresByRequesterId[request.requesterId] ?? 1;
  }
}
