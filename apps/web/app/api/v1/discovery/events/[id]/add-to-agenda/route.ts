import { NextResponse } from "next/server";
import { createAddNearbyEventToAgendaUseCase, NearbyEventNotFoundError } from "@/modules/discovery";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  try {
    const useCase = createAddNearbyEventToAgendaUseCase();
    const result = await useCase.execute(auth.userId, params.id);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof NearbyEventNotFoundError) return apiError(404, "not_found", error.message);
    throw error;
  }
}
