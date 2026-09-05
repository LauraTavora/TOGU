export interface OutboxEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  processedAt: Date | null;
}
