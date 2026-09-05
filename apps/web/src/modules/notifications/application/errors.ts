export class NotificationNotFoundError extends Error {
  constructor() {
    super("Notificação não encontrada.");
  }
}

export class ForbiddenNotificationAccessError extends Error {
  constructor() {
    super("Você não tem permissão para acessar esta notificação.");
  }
}
