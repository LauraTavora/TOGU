import { NextResponse } from "next/server";
import { registerRequestSchema } from "@fecho/schemas";
import {
  createRegisterUserUseCase,
  EmailAlreadyRegisteredError,
  WeakPasswordError,
  InvalidEmailError,
} from "@/modules/identity";
import { apiError } from "@/shared/http/api-error";
import { enforceRateLimit, getClientIp } from "@/shared/rate-limit";

export async function POST(request: Request) {
  const rateLimited = await enforceRateLimit(getClientIp(request), {
    bucket: "auth:register",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  const body = await request.json().catch(() => null);
  const parsed = registerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createRegisterUserUseCase();
    const { user } = await useCase.execute({
      email: parsed.data.email,
      rawPassword: parsed.data.password,
    });
    return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) {
      return apiError(409, "email_already_registered", error.message);
    }
    if (error instanceof WeakPasswordError || error instanceof InvalidEmailError) {
      return apiError(400, "invalid_input", error.message);
    }
    throw error;
  }
}
