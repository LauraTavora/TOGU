import { NextResponse } from "next/server";
import { updateNotificationPreferencesSchema } from "@fecho/schemas";
import {
  createGetNotificationPreferencesUseCase,
  createUpdateNotificationPreferencesUseCase,
} from "@/modules/notifications";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const useCase = createGetNotificationPreferencesUseCase();
  const preferences = await useCase.execute(auth.userId);
  return NextResponse.json({ preferences });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const body = await request.json().catch(() => null);
  const parsed = updateNotificationPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  const useCase = createUpdateNotificationPreferencesUseCase();
  const preferences = await useCase.execute(auth.userId, parsed.data);
  return NextResponse.json({ preferences });
}
