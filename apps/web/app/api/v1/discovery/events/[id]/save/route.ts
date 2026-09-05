import { NextResponse } from "next/server";
import { createSaveEventUseCase, createUnsaveEventUseCase, NearbyEventNotFoundError } from "@/modules/discovery";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

interface RouteParams {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  try {
    const useCase = createSaveEventUseCase();
    await useCase.execute(auth.userId, params.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof NearbyEventNotFoundError) return apiError(404, "not_found", error.message);
    throw error;
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const useCase = createUnsaveEventUseCase();
  await useCase.execute(auth.userId, params.id);
  return NextResponse.json({ ok: true });
}
