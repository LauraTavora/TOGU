import { NextResponse } from "next/server";
import { syncNearbyEventsSchema } from "@fecho/schemas";
import { createSyncNearbyEventsUseCase } from "@/modules/discovery";
import { apiError } from "@/shared/http/api-error";

/**
 * Ponto de entrada para um worker/cron real sincronizar o catálogo local
 * com o(s) provedor(es) de eventos autorizados (docs/PRODUCT.md §33).
 * Protegido por segredo compartilhado, não por sessão de usuário.
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

  const body = await request.json().catch(() => null);
  const parsed = syncNearbyEventsSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  const useCase = createSyncNearbyEventsUseCase();
  const result = await useCase.execute({ from: new Date(parsed.data.from), to: new Date(parsed.data.to) });
  return NextResponse.json(result);
}
