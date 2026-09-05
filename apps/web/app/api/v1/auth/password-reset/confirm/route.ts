import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@togu/schemas";
import {
  createResetPasswordUseCase,
  InvalidOrExpiredTokenError,
  WeakPasswordError,
} from "@/modules/identity";
import { apiError } from "@/shared/http/api-error";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createResetPasswordUseCase();
    await useCase.execute({ rawToken: parsed.data.token, newRawPassword: parsed.data.password });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InvalidOrExpiredTokenError) {
      return apiError(400, "invalid_token", error.message);
    }
    if (error instanceof WeakPasswordError) {
      return apiError(400, "invalid_input", error.message);
    }
    throw error;
  }
}
