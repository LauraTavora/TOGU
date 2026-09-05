import type { CounterProposalDto, MeetingRequestDto } from "./types";

const OPEN_STATUSES = ["PENDING", "COUNTER_PROPOSED"];

export function isOpenStatus(status: MeetingRequestDto["status"]): boolean {
  return OPEN_STATUSES.includes(status);
}

/** Quem apresentou a proposta de horário atualmente em aberto — espelha domain/negotiation.ts do backend só para decidir o que exibir na UI; a autorização real é sempre validada no servidor. */
export function resolveProposingPartyId(
  request: Pick<MeetingRequestDto, "requesterId">,
  counterProposals: CounterProposalDto[],
): string {
  const last = counterProposals.at(-1);
  return last ? last.proposedById : request.requesterId;
}

export function resolveEffectiveTimeRange(
  request: Pick<MeetingRequestDto, "startAt" | "endAt">,
  counterProposals: CounterProposalDto[],
): { startAt: string; endAt: string } {
  const last = counterProposals.at(-1);
  return last ? { startAt: last.startAt, endAt: last.endAt } : request;
}
