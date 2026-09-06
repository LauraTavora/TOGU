import type { BadgeTone, StatusKind } from "@fecho/design-system";
import type { MeetingRequestDto, MeetingRequestStatus } from "./types";

export const STATUS_LABEL: Record<MeetingRequestStatus, string> = {
  PENDING: "Aguardando resposta",
  ACCEPTED: "Aceita",
  DECLINED: "Negada",
  COUNTER_PROPOSED: "Novo horário proposto",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};

export const STATUS_TONE: Record<MeetingRequestStatus, BadgeTone> = {
  PENDING: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
  COUNTER_PROPOSED: "primary",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
};

const MEETING_KIND_LABEL: Record<string, string> = {
  IN_PERSON: "Presencial",
  ONLINE: "Online",
  HYBRID: "Híbrido",
};

export function formatMeetingKind(kind: string): string {
  return MEETING_KIND_LABEL[kind] ?? kind;
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function formatDateRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${dateTimeFormatter.format(start)} – ${timeFormatter.format(end)}`;
}

export type AvailabilityCheckStatus = "AVAILABLE" | "SOFT_CONFLICT" | "HARD_CONFLICT";

export function toAvailabilityStatusKind(status: AvailabilityCheckStatus): StatusKind {
  switch (status) {
    case "AVAILABLE":
      return "available";
    case "SOFT_CONFLICT":
      return "soft-hold";
    case "HARD_CONFLICT":
      return "busy";
  }
}

/** Rótulos contextualizados para "sua própria agenda", usados antes de aceitar/contrapropor. */
export const OWN_AVAILABILITY_LABEL: Record<StatusKind, string> = {
  available: "Você está livre nesse horário",
  "soft-hold": "Você tem uma reserva parcial nesse horário",
  busy: "Você já tem um compromisso nesse horário",
  priority: "Você está livre nesse horário",
};

export function buildCounterpartyLabel(
  request: Pick<MeetingRequestDto, "requesterId" | "participantUserIds">,
  box: "received" | "sent",
  currentUserId: string,
  emailById: Record<string, string>,
): string {
  const emailFor = (id: string) => emailById[id] ?? id;

  if (box === "received") {
    return `De: ${emailFor(request.requesterId)}`;
  }

  const others = request.participantUserIds.filter((id) => id !== currentUserId);
  return `Para: ${others.map(emailFor).join(", ")}`;
}
