import { NextResponse } from "next/server";
import {
  createMarkNotificationReadUseCase,
  ForbiddenNotificationAccessError,
  NotificationNotFoundError,
} from "@/modules/notifications";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import type { RouteParams } from "@/shared/http/route-params";

export async function POST(request: Request, { params }: RouteParams<{ id: string }>) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { id } = await params;

  try {
    const useCase = createMarkNotificationReadUseCase();
    const notification = await useCase.execute(id, auth.userId);
    return NextResponse.json({ notification });
  } catch (error) {
    if (error instanceof NotificationNotFoundError) return apiError(404, "not_found", error.message);
    if (error instanceof ForbiddenNotificationAccessError) return apiError(403, "forbidden", error.message);
    throw error;
  }
}
