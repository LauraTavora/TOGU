import { NextResponse } from "next/server";
import { resendVerificationEmailSchema } from "@fecho/schemas";
import { createResendVerificationEmailUseCase } from "@/modules/identity";
import { apiError } from "@/shared/http/api-error";
import { enforceRateLimit, getClientIp } from "@/shared/rate-limit";

export async function POST(request: Request) {
  const rateLimited = await enforceRateLimit(getClientIp(request), {
    bucket: "auth:resend-verification",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  const body = await request.json().catch(() => null);
  const parsed = resendVerificationEmailSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  // Sempre responde 200, exista a conta ou já esteja verificada — anti-enumeration.
  const useCase = createResendVerificationEmailUseCase();
  await useCase.execute(parsed.data.email);

  return NextResponse.json({ ok: true });
}
