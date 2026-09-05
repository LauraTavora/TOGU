import { NextResponse } from "next/server";
import { requestPasswordResetSchema } from "@togu/schemas";
import { createRequestPasswordResetUseCase } from "@/modules/identity";
import { apiError } from "@/shared/http/api-error";
import { enforceRateLimit, getClientIp } from "@/shared/rate-limit";

export async function POST(request: Request) {
  const rateLimited = await enforceRateLimit(getClientIp(request), {
    bucket: "auth:password-reset-request",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  const body = await request.json().catch(() => null);
  const parsed = requestPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  // Sempre responde 200, exista ou não a conta — anti-enumeration (docs/THREAT-MODEL.md).
  const useCase = createRequestPasswordResetUseCase();
  await useCase.execute(parsed.data.email);

  return NextResponse.json({ ok: true });
}
