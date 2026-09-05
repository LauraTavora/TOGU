import { createProcessOutboxUseCase } from "./infrastructure/container";

/**
 * Dispara o processamento da outbox de forma best-effort logo após uma
 * ação que emitiu eventos (ex.: aceitar uma solicitação). Simplificação
 * pragmática para este ambiente, que não tem um worker/cron real
 * drenando a outbox periodicamente — ver docs/adr/ADR-009. Nunca deve
 * afetar a resposta da ação principal: falhas aqui são apenas logadas.
 */
export async function flushOutboxBestEffort(): Promise<void> {
  try {
    await createProcessOutboxUseCase().execute();
  } catch (error) {
    console.error("[outbox] falha ao processar eventos pendentes", error);
  }
}
