import type { CounterProposal } from "./counter-proposal";
import type { MeetingRequest } from "./meeting-request";

export class MeetingRequestNotOpenError extends Error {
  constructor() {
    super("Esta solicitação já foi resolvida e não aceita mais respostas.");
  }
}

export class NotAResponderError extends Error {
  constructor() {
    super("Você não pode responder à sua própria proposta — aguarde a outra parte.");
  }
}

export class NotAPartyError extends Error {
  constructor() {
    super("Você não faz parte desta solicitação.");
  }
}

/** Quem apresentou a proposta de horário atualmente em aberto. */
export function getProposingPartyId(
  meetingRequest: Pick<MeetingRequest, "requesterId">,
  counterProposals: CounterProposal[],
): string {
  const last = counterProposals.at(-1);
  return last ? last.proposedById : meetingRequest.requesterId;
}

/** Todas as partes envolvidas na solicitação (quem propôs + participantes). */
export function getAllParties(
  meetingRequest: Pick<MeetingRequest, "requesterId" | "participantUserIds">,
): string[] {
  return [meetingRequest.requesterId, ...meetingRequest.participantUserIds];
}

/**
 * Só quem NÃO apresentou a proposta corrente pode aceitar, negar ou
 * contrapropor — evita que alguém "responda" à própria oferta.
 */
export function assertCanRespond(
  meetingRequest: MeetingRequest,
  counterProposals: CounterProposal[],
  actingUserId: string,
): void {
  const allParties = getAllParties(meetingRequest);
  if (!allParties.includes(actingUserId)) {
    throw new NotAPartyError();
  }

  const proposingPartyId = getProposingPartyId(meetingRequest, counterProposals);
  if (actingUserId === proposingPartyId) {
    throw new NotAResponderError();
  }
}

export function effectiveTimeRange(
  meetingRequest: Pick<MeetingRequest, "startAt" | "endAt">,
  counterProposals: CounterProposal[],
): { startAt: Date; endAt: Date } {
  const last = counterProposals.at(-1);
  return last ? { startAt: last.startAt, endAt: last.endAt } : meetingRequest;
}
