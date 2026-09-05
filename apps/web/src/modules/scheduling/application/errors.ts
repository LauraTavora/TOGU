export class EventNotFoundError extends Error {
  constructor() {
    super("Evento não encontrado.");
  }
}

export class ForbiddenEventAccessError extends Error {
  constructor() {
    super("Você não tem permissão para acessar este evento.");
  }
}

export class PersonalCalendarNotFoundError extends Error {
  constructor() {
    super("Calendário pessoal não encontrado para este usuário.");
  }
}
