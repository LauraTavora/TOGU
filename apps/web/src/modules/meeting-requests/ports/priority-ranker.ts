export interface PriorityRankableRequest {
  requesterId: string;
  createdAt: Date;
}

/**
 * Port para ordenar solicitações recebidas por prioridade — delega ao
 * módulo `priority` sem que `meeting-requests` conheça suas regras
 * internas (docs/PRODUCT.md §18 — Priority Engine).
 */
export interface PriorityRanker {
  score(receiverId: string, request: PriorityRankableRequest): Promise<number>;
}
