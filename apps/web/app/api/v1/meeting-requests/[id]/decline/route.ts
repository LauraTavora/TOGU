import { NextResponse } from "next/server";
import { declineMeetingRequestSchema } from "@fecho/schemas";
import { createDeclineMeetingRequestUseCase } from "@/modules/meeting-requests";
import { flushOutboxBestEffort } from "@/modules/notifications";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import { mapMeetingRequestError } from "@/shared/http/map-meeting-request-error";
import type { RouteParams } from "@/shared/http/route-params";

export async function POST(request: Request, { params }: RouteParams<{ id: string }>) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = declineMeetingRequestSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createDeclineMeetingRequestUseCase();
    const meetingRequest = await useCase.execute(id, auth.userId, parsed.data.message);
    await flushOutboxBestEffort();
    return NextResponse.json({ meetingRequest });
  } catch (error) {
    const mapped = mapMeetingRequestError(error);
    if (mapped) return mapped;
    throw error;
  }
}
