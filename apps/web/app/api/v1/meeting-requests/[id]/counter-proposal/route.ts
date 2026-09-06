import { NextResponse } from "next/server";
import { counterProposeSchema } from "@fecho/schemas";
import { createCounterProposeUseCase } from "@/modules/meeting-requests";
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

  const body = await request.json().catch(() => null);
  const parsed = counterProposeSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createCounterProposeUseCase();
    const counterProposal = await useCase.execute({
      meetingRequestId: id,
      actingUserId: auth.userId,
      startAt: new Date(parsed.data.startAt),
      endAt: new Date(parsed.data.endAt),
      message: parsed.data.message,
    });
    await flushOutboxBestEffort();
    return NextResponse.json({ counterProposal }, { status: 201 });
  } catch (error) {
    const mapped = mapMeetingRequestError(error);
    if (mapped) return mapped;
    throw error;
  }
}
