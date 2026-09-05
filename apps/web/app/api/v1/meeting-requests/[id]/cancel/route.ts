import { NextResponse } from "next/server";
import { createCancelMeetingRequestUseCase } from "@/modules/meeting-requests";
import { flushOutboxBestEffort } from "@/modules/notifications";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import { mapMeetingRequestError } from "@/shared/http/map-meeting-request-error";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  try {
    const useCase = createCancelMeetingRequestUseCase();
    const meetingRequest = await useCase.execute(params.id, auth.userId);
    await flushOutboxBestEffort();
    return NextResponse.json({ meetingRequest });
  } catch (error) {
    const mapped = mapMeetingRequestError(error);
    if (mapped) return mapped;
    throw error;
  }
}
