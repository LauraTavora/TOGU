export type AvailabilityCheckStatus = "AVAILABLE" | "SOFT_CONFLICT" | "HARD_CONFLICT";

/**
 * Port para reconsultar disponibilidade real no momento de aceitar uma
 * solicitação — nunca confiar apenas no estado exibido anteriormente
 * (docs/PRODUCT.md §22). Implementado por um adapter que delega ao
 * módulo `availability`.
 */
export interface AvailabilityChecker {
  check(participantIds: string[], start: Date, end: Date): Promise<AvailabilityCheckStatus>;
}
