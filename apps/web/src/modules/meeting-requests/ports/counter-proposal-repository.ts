import type { CounterProposal } from "../domain/counter-proposal";

export interface CreateCounterProposalInput {
  id: string;
  meetingRequestId: string;
  proposedById: string;
  startAt: Date;
  endAt: Date;
  message?: string | undefined;
}

export interface CounterProposalRepository {
  create(input: CreateCounterProposalInput): Promise<CounterProposal>;
  listForRequest(meetingRequestId: string): Promise<CounterProposal[]>;
}
