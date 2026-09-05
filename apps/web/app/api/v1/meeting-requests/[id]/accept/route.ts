import { NextResponse } from "next/server";
import { createAcceptMeetingRequestUseCase } from "@/modules/meeting-requests";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import { mapMeetingRequestError } from "@/shared/http/map-meeting-request-error";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  try {
    const useCase = createAcceptMeetingRequestUseCase();
    const result = await useCase.execute(params.id, auth.userId);
    return NextResponse.json(result);
  } catch (error) {
    const mapped = mapMeetingRequestError(error);
    if (mapped) return mapped;
    throw error;
  }
}
