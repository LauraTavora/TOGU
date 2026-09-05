import { NextResponse } from "next/server";
import { createLogoutUseCase } from "@/modules/identity";
import { clearRefreshCookie, readRefreshCookie } from "@/shared/http/refresh-cookie";

export async function POST(request: Request) {
  const refreshToken = readRefreshCookie(request);

  if (refreshToken) {
    const useCase = createLogoutUseCase();
    await useCase.execute(refreshToken);
  }

  const response = NextResponse.json({ ok: true });
  clearRefreshCookie(response);
  return response;
}
