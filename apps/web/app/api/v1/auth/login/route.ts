import { NextResponse } from "next/server";
import { loginRequestSchema } from "@togu/schemas";
import { createLoginUseCase, InvalidCredentialsError } from "@/modules/identity";
import { apiError } from "@/shared/http/api-error";
import { setRefreshCookie } from "@/shared/http/refresh-cookie";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createLoginUseCase();
    const { accessToken, refreshToken, refreshTokenExpiresAt } = await useCase.execute({
      email: parsed.data.email,
      rawPassword: parsed.data.password,
    });

    const response = NextResponse.json({ accessToken });
    setRefreshCookie(response, refreshToken, refreshTokenExpiresAt);
    return response;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return apiError(401, "invalid_credentials", error.message);
    }
    throw error;
  }
}
