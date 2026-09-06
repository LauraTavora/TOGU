import { NextResponse } from "next/server";
import { verifyEmailRequestSchema } from "@fecho/schemas";
import { createVerifyEmailUseCase, InvalidOrExpiredTokenError } from "@/modules/identity";
import { apiError } from "@/shared/http/api-error";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifyEmailRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createVerifyEmailUseCase();
    await useCase.execute(parsed.data.token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InvalidOrExpiredTokenError) {
      return apiError(400, "invalid_token", error.message);
    }
    throw error;
  }
}
