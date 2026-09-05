import type { NextResponse } from "next/server";

export const REFRESH_COOKIE_NAME = "togu_refresh_token";

export function setRefreshCookie(response: NextResponse, token: string, expiresAt: Date): void {
  response.cookies.set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    expires: expiresAt,
  });
}

export function readRefreshCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${REFRESH_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.slice(REFRESH_COOKIE_NAME.length + 1)) : null;
}

export function clearRefreshCookie(response: NextResponse): void {
  response.cookies.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: 0,
  });
}
