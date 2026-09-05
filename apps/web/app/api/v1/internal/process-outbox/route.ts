import { NextResponse } from "next/server";
import { createProcessOutboxUseCase } from "@/modules/notifications";
import { apiError } from "@/shared/http/api-error";

/**
 * Ponto de entrada para um worker/cron real (ex.: Vercel Cron) drenar a
 * outbox periodicamente em produção — ver docs/adr/ADR-009. Protegido por
 * segredo compartilhado, não por sessão de usuário (não é uma rota de
 * usuário final).
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

  const useCase = createProcessOutboxUseCase();
  const result = await useCase.execute();
  return NextResponse.json(result);
}
