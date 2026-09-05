import { NextResponse } from "next/server";
import { createExecuteScheduledAccountDeletionsUseCase } from "@/modules/identity";
import { apiError } from "@/shared/http/api-error";

/**
 * Ponto de entrada para um worker/cron real anonimizar contas cuja carência
 * de exclusão (14 dias — ADR-022) já venceu. Protegido por segredo
 * compartilhado, mesmo padrão de `sync-nearby-events`.
 */
export async function POST(request: Request) {
  const secret = process.env.INTERNAL_JOB_SECRET;
  if (!secret) {
    return apiError(500, "not_configured", "INTERNAL_JOB_SECRET não configurado.");
  }

  const provided = request.headers.get("x-internal-secret");
  if (provided !== secret) {
    return apiError(401, "unauthorized", "Segredo interno inválido.");
  }

  const useCase = createExecuteScheduledAccountDeletionsUseCase();
  const result = await useCase.execute();
  return NextResponse.json(result);
}
