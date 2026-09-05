import type { CounterProposal } from "../domain/counter-proposal";
import type {
  CounterProposalRepository,
  CreateCounterProposalInput,
} from "../ports/counter-proposal-repository";

export class InMemoryCounterProposalRepository implements CounterProposalRepository {
  private readonly proposals: CounterProposal[] = [];

  async create(input: CreateCounterProposalInput): Promise<CounterProposal> {
    const proposal: CounterProposal = {
      id: input.id,
      meetingRequestId: input.meetingRequestId,
      proposedById: input.proposedById,
      startAt: input.startAt,
      endAt: input.endAt,
      message: input.message ?? null,
      createdAt: new Date(),
    };
    this.proposals.push(proposal);
    return proposal;
  }

  async listForRequest(meetingRequestId: string): Promise<CounterProposal[]> {
    return this.proposals
      .filter((p) => p.meetingRequestId === meetingRequestId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
