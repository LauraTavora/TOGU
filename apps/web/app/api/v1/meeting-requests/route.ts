import { NextResponse } from "next/server";
import { createMeetingRequestSchema, listMeetingRequestsQuerySchema } from "@togu/schemas";
import {
  createCreateMeetingRequestUseCase,
  createListReceivedMeetingRequestsUseCase,
  createListSentMeetingRequestsUseCase,
} from "@/modules/meeting-requests";
import { flushOutboxBestEffort } from "@/modules/notifications";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const url = new URL(request.url);
  const parsed = listMeetingRequestsQuerySchema.safeParse({
    box: url.searchParams.get("box"),
    status: url.searchParams.get("status") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
  });
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  const meetingRequests =
    parsed.data.box === "received"
      ? await createListReceivedMeetingRequestsUseCase().execute(
          auth.userId,
          parsed.data.status,
          parsed.data.sort,
        )
      : await createListSentMeetingRequestsUseCase().execute(auth.userId, parsed.data.status);

  return NextResponse.json({ meetingRequests });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const body = await request.json().catch(() => null);
  const parsed = createMeetingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createCreateMeetingRequestUseCase();
    const meetingRequest = await useCase.execute({
      requesterId: auth.userId,
      title: parsed.data.title,
      message: parsed.data.message,
      startAt: new Date(parsed.data.startAt),
      endAt: new Date(parsed.data.endAt),
      meetingKind: parsed.data.meetingKind,
      location: parsed.data.location,
      onlineLink: parsed.data.onlineLink,
      participantUserIds: parsed.data.participantUserIds,
    });
    await flushOutboxBestEffort();
    return NextResponse.json({ meetingRequest }, { status: 201 });
  } catch (error) {
    return apiError(400, "invalid_input", error instanceof Error ? error.message : "Erro desconhecido.");
  }
}
