import { NextResponse } from "next/server";
import { createListCounterProposalsUseCase } from "@/modules/meeting-requests";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import { mapMeetingRequestError } from "@/shared/http/map-meeting-request-error";
import type { RouteParams } from "@/shared/http/route-params";

export async function GET(request: Request, { params }: RouteParams<{ id: string }>) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { id } = await params;

  try {
    const useCase = createListCounterProposalsUseCase();
    const counterProposals = await useCase.execute(id, auth.userId);
    return NextResponse.json({ counterProposals });
  } catch (error) {
    const mapped = mapMeetingRequestError(error);
    if (mapped) return mapped;
    throw error;
  }
}
