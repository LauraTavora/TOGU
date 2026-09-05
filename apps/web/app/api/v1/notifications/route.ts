import { NextResponse } from "next/server";
import { listNotificationsQuerySchema } from "@togu/schemas";
import { createListNotificationsUseCase } from "@/modules/notifications";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const url = new URL(request.url);
  const parsed = listNotificationsQuerySchema.safeParse({
    onlyUnread: url.searchParams.get("onlyUnread") ?? undefined,
  });
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  const useCase = createListNotificationsUseCase();
  const notifications = await useCase.execute(auth.userId, parsed.data.onlyUnread === "true");
  return NextResponse.json({ notifications });
}
