import { NextResponse } from "next/server";
import { createCountUnreadNotificationsUseCase } from "@/modules/notifications";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const useCase = createCountUnreadNotificationsUseCase();
  const count = await useCase.execute(auth.userId);
  return NextResponse.json({ count });
}
