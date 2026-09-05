import { NextResponse } from "next/server";
import { createMarkAllNotificationsReadUseCase } from "@/modules/notifications";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const useCase = createMarkAllNotificationsReadUseCase();
  await useCase.execute(auth.userId);
  return NextResponse.json({ ok: true });
}
