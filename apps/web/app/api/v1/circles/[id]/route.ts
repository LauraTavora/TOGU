import { NextResponse } from "next/server";
import { renameCircleRequestSchema } from "@togu/schemas";
import {
  createRenameCircleUseCase,
  createDeleteCircleUseCase,
  CircleNotFoundError,
  ForbiddenCircleAccessError,
  InvalidCircleNameError,
} from "@/modules/circles";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const body = await request.json().catch(() => null);
  const parsed = renameCircleRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createRenameCircleUseCase();
    const circle = await useCase.execute(params.id, auth.userId, parsed.data.name);
    return NextResponse.json({ circle });
  } catch (error) {
    if (error instanceof CircleNotFoundError) return apiError(404, "not_found", error.message);
    if (error instanceof ForbiddenCircleAccessError) return apiError(403, "forbidden", error.message);
    if (error instanceof InvalidCircleNameError) return apiError(400, "invalid_input", error.message);
    throw error;
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  try {
    const useCase = createDeleteCircleUseCase();
    await useCase.execute(params.id, auth.userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CircleNotFoundError) return apiError(404, "not_found", error.message);
    if (error instanceof ForbiddenCircleAccessError) return apiError(403, "forbidden", error.message);
    throw error;
  }
}
