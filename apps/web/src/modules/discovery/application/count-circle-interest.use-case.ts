import type { SavedEventRepository } from "../ports/saved-event-repository";
import type { CircleFellowsResolver } from "../ports/circle-fellows-resolver";

/**
 * "N pessoas do seu círculo também querem ir" (docs/PRODUCT.md §35) —
 * conta apenas quem compartilha algum círculo com o requester, nunca
 * expõe a lista de quem exatamente sem uma permissão explícita.
 */
export class CountCircleInterestUseCase {
  constructor(
    private readonly savedEventRepository: SavedEventRepository,
    private readonly circleFellowsResolver: CircleFellowsResolver,
  ) {}

  async execute(userId: string, nearbyEventId: string): Promise<number> {
    const fellows = await this.circleFellowsResolver.findFellowUserIds(userId);
    if (fellows.length === 0) return 0;
    const interested = await this.savedEventRepository.listSaversAmong(nearbyEventId, fellows);
    return interested.length;
  }
}
