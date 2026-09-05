import { NextResponse } from "next/server";
import { createRefreshSessionUseCase, InvalidSessionError } from "@/modules/identity";
import { apiError } from "@/shared/http/api-error";
import { readRefreshCookie, setRefreshCookie, clearRefreshCookie } from "@/shared/http/refresh-cookie";

export async function POST(request: Request) {
  const refreshToken = readRefreshCookie(request);
  if (!refreshToken) {
    return apiError(401, "missing_session", "Sessão não encontrada.");
  }

  try {
    const useCase = createRefreshSessionUseCase();
    const result = await useCase.execute(refreshToken);

    const response = NextResponse.json({ accessToken: result.accessToken });
    setRefreshCookie(response, result.refreshToken, result.refreshTokenExpiresAt);
    return response;
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      const response = apiError(401, "invalid_session", error.message);
      clearRefreshCookie(response);
      return response;
    }
    throw error;
  }
}
