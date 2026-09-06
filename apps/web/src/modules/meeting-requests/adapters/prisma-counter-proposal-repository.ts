import type { PrismaClient } from "@fecho/database";
import type { CounterProposal } from "../domain/counter-proposal";
import type {
  CounterProposalRepository,
  CreateCounterProposalInput,
} from "../ports/counter-proposal-repository";

export class PrismaCounterProposalRepository implements CounterProposalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateCounterProposalInput): Promise<CounterProposal> {
    return this.prisma.counterProposal.create({
      data: {
        id: input.id,
        meetingRequestId: input.meetingRequestId,
        proposedById: input.proposedById,
        startAt: input.startAt,
        endAt: input.endAt,
        ...(input.message !== undefined && { message: input.message }),
      },
    });
  }

  async listForRequest(meetingRequestId: string): Promise<CounterProposal[]> {
    return this.prisma.counterProposal.findMany({
      where: { meetingRequestId },
      orderBy: { createdAt: "asc" },
    });
  }
}
