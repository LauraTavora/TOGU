import { NextResponse } from "next/server";
import { createRemoveCircleMemberUseCase, CircleNotFoundError, ForbiddenCircleAccessError } from "@/modules/circles";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

interface RouteParams {
  params: { id: string; userId: string };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  try {
    const useCase = createRemoveCircleMemberUseCase();
    await useCase.execute(params.id, auth.userId, params.userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CircleNotFoundError) return apiError(404, "not_found", error.message);
    if (error instanceof ForbiddenCircleAccessError) return apiError(403, "forbidden", error.message);
    throw error;
  }
}
