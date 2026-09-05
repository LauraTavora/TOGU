export class CircleNotFoundError extends Error {
  constructor() {
    super("Círculo não encontrado.");
  }
}

export class ForbiddenCircleAccessError extends Error {
  constructor() {
    super("Você não tem permissão para gerenciar este círculo.");
  }
}

export class PersonalWorkspaceNotFoundError extends Error {
  constructor() {
    super("Workspace pessoal não encontrado para este usuário.");
  }
}
