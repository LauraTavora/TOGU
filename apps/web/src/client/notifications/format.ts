import type { NotificationDto } from "./types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Traduz o payload de cada tipo de notificação numa frase legível. */
export function formatNotificationMessage(notification: NotificationDto): string {
  const title = asString(notification.payload.title, "um compromisso");

  switch (notification.type) {
    case "NEW_REQUEST":
      return `Você recebeu uma nova solicitação: "${title}".`;
    case "REQUEST_ACCEPTED":
      return `Sua solicitação "${title}" foi aceita.`;
    case "REQUEST_DECLINED":
      return `Sua solicitação "${title}" foi negada.`;
    case "COUNTER_PROPOSAL":
      return `Propuseram um novo horário para "${title}".`;
    case "EVENT_UPDATED":
      return `O evento "${title}" foi atualizado.`;
    case "EVENT_CANCELLED":
      return `O evento "${title}" foi cancelado.`;
    case "REMINDER":
      return `Lembrete: "${title}".`;
    case "CONFLICT":
      return `Conflito de horário detectado em "${title}".`;
    case "INVITE":
      return "Você recebeu um convite.";
    case "NEARBY_EVENT":
      return `Novo evento perto de você: "${title}".`;
    default:
      return "Você tem uma nova notificação.";
  }
}
