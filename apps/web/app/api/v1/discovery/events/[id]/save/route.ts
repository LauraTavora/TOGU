import { NextResponse } from "next/server";
import { createSaveEventUseCase, createUnsaveEventUseCase, NearbyEventNotFoundError } from "@/modules/discovery";
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
    const useCase = createSaveEventUseCase();
    await useCase.execute(auth.userId, id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof NearbyEventNotFoundError) return apiError(404, "not_found", error.message);
    throw error;
  }
}

export async function DELETE(request: Request, { params }: RouteParams<{ id: string }>) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { id } = await params;

  const useCase = createUnsaveEventUseCase();
  await useCase.execute(auth.userId, id);
  return NextResponse.json({ ok: true });
}
