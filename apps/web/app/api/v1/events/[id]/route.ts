import { NextResponse } from "next/server";
import { updateEventRequestSchema } from "@fecho/schemas";
import {
  createGetEventUseCase,
  createUpdateEventUseCase,
  createDeleteEventUseCase,
  EventNotFoundError,
  ForbiddenEventAccessError,
  InvalidEventTimeRangeError,
} from "@/modules/scheduling";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import type { RouteParams } from "@/shared/http/route-params";

export async function GET(request: Request, { params }: RouteParams<{ id: string }>) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { id } = await params;

  try {
    const useCase = createGetEventUseCase();
    const event = await useCase.execute(id, auth.userId);
    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return apiError(404, "not_found", error.message);
    }
    if (error instanceof ForbiddenEventAccessError) {
      return apiError(403, "forbidden", error.message);
    }
    throw error;
  }
}

export async function PATCH(request: Request, { params }: RouteParams<{ id: string }>) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateEventRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createUpdateEventUseCase();
    const event = await useCase.execute(id, auth.userId, {
      title: parsed.data.title,
      notes: parsed.data.notes,
      startAt: parsed.data.startAt ? new Date(parsed.data.startAt) : undefined,
      endAt: parsed.data.endAt ? new Date(parsed.data.endAt) : undefined,
      availabilityState: parsed.data.availabilityState,
      privacyLevel: parsed.data.privacyLevel,
      meetingKind: parsed.data.meetingKind,
      location: parsed.data.location,
      onlineLink: parsed.data.onlineLink,
      bufferBeforeMin: parsed.data.bufferBeforeMin,
      bufferAfterMin: parsed.data.bufferAfterMin,
    });
    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return apiError(404, "not_found", error.message);
    }
    if (error instanceof ForbiddenEventAccessError) {
      return apiError(403, "forbidden", error.message);
    }
    if (error instanceof InvalidEventTimeRangeError) {
      return apiError(400, "invalid_input", error.message);
    }
    throw error;
  }
}

export async function DELETE(request: Request, { params }: RouteParams<{ id: string }>) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { id } = await params;

  try {
    const useCase = createDeleteEventUseCase();
    await useCase.execute(id, auth.userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return apiError(404, "not_found", error.message);
    }
    if (error instanceof ForbiddenEventAccessError) {
      return apiError(403, "forbidden", error.message);
    }
    throw error;
  }
}
