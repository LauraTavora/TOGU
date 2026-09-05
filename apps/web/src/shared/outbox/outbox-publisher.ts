/**
 * Port usado por qualquer módulo produtor (ex.: meeting-requests) para
 * registrar fatos de domínio importantes sem conhecer quem os consome —
 * ver docs/adr/ADR-004 (Transactional Outbox).
 */
export interface OutboxEventPublisher {
  publish(type: string, payload: Record<string, unknown>): Promise<void>;
}
