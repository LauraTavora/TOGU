import { NextResponse } from "next/server";
import { checkAvailabilityRequestSchema } from "@fecho/schemas";
import { createCheckAvailabilityUseCase } from "@/modules/availability/infrastructure/container";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import { enforceRateLimit } from "@/shared/rate-limit";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const rateLimited = await enforceRateLimit(auth.userId, {
    bucket: "availability:check",
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  const body = await request.json().catch(() => null);
  const parsed = checkAvailabilityRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  const { participantIds, start, end, bufferMinutes } = parsed.data;
  const useCase = createCheckAvailabilityUseCase();

  const result = await useCase.execute({
    participantIds,
    range: { start: new Date(start), end: new Date(end) },
    bufferMinutes,
  });

  return NextResponse.json(result);
}
