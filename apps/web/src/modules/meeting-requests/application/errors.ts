export class MeetingRequestNotFoundError extends Error {
  constructor() {
    super("Solicitação não encontrada.");
  }
}

export class AvailabilityConflictError extends Error {
  constructor() {
    super("Você já possui outro compromisso nesse horário.");
  }
}

/**
 * A solicitação mudou de estado entre a exibição e a ação do usuário
 * (ex.: duas respostas simultâneas) — ver docs/ARCHITECTURE.md §Concorrência.
 */
export class MeetingRequestConcurrentlyModifiedError extends Error {
  constructor() {
    super("Esta solicitação já foi respondida em outro lugar. Atualize a página.");
  }
}

export class ForbiddenMeetingRequestActionError extends Error {
  constructor() {
    super("Você não tem permissão para executar esta ação nesta solicitação.");
  }
}
