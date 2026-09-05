import { NextResponse } from "next/server";
import { createEventRequestSchema } from "@togu/schemas";
import {
  createCreateEventUseCase,
  InvalidEventTimeRangeError,
  PersonalCalendarNotFoundError,
} from "@/modules/scheduling";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const body = await request.json().catch(() => null);
  const parsed = createEventRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createCreateEventUseCase();
    const event = await useCase.execute({
      ownerUserId: auth.userId,
      title: parsed.data.title,
      notes: parsed.data.notes,
      startAt: new Date(parsed.data.startAt),
      endAt: new Date(parsed.data.endAt),
      availabilityState: parsed.data.availabilityState,
      privacyLevel: parsed.data.privacyLevel,
      meetingKind: parsed.data.meetingKind,
      location: parsed.data.location,
      onlineLink: parsed.data.onlineLink,
      bufferBeforeMin: parsed.data.bufferBeforeMin,
      bufferAfterMin: parsed.data.bufferAfterMin,
      participantUserIds: parsed.data.participantUserIds,
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidEventTimeRangeError) {
      return apiError(400, "invalid_input", error.message);
    }
    if (error instanceof PersonalCalendarNotFoundError) {
      return apiError(409, "calendar_not_found", error.message);
    }
    throw error;
  }
}
