export class NearbyEventNotFoundError extends Error {
  constructor() {
    super("Evento não encontrado.");
  }
}
