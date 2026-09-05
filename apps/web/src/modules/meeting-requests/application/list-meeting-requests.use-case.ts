import type { MeetingRequest, MeetingRequestStatus } from "../domain/meeting-request";
import type { MeetingRequestRepository } from "../ports/meeting-request-repository";
import type { PriorityRanker } from "../ports/priority-ranker";

export type ReceivedSortMode = "priority" | "recent";

export class ListReceivedMeetingRequestsUseCase {
  constructor(
    private readonly meetingRequestRepository: MeetingRequestRepository,
    private readonly priorityRanker: PriorityRanker,
  ) {}

  async execute(
    userId: string,
    status?: MeetingRequestStatus | undefined,
    sortBy: ReceivedSortMode = "priority",
  ): Promise<MeetingRequest[]> {
    const requests = await this.meetingRequestRepository.listReceived(userId, status);

    if (sortBy === "recent") {
      return requests; // já vem ordenado por createdAt desc do repositório
    }

    // Ordena por prioridade (docs/PRODUCT.md §20): maior score primeiro;
    // dentro do mesmo nível, o PriorityEngine já favorece quem chegou antes.
    const scored = await Promise.all(
      requests.map(async (request) => ({
        request,
        score: await this.priorityRanker.score(userId, {
          requesterId: request.requesterId,
          createdAt: request.createdAt,
        }),
      })),
    );
    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.request);
  }
}

export class ListSentMeetingRequestsUseCase {
  constructor(private readonly meetingRequestRepository: MeetingRequestRepository) {}

  async execute(userId: string, status?: MeetingRequestStatus | undefined): Promise<MeetingRequest[]> {
    return this.meetingRequestRepository.listSent(userId, status);
  }
}
