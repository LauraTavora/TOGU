import { NextResponse } from "next/server";
import { listCalendarQuerySchema } from "@fecho/schemas";
import { createListCalendarEventsUseCase, PersonalCalendarNotFoundError } from "@/modules/scheduling";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const url = new URL(request.url);
  const parsed = listCalendarQuerySchema.safeParse({
    start: url.searchParams.get("start"),
    end: url.searchParams.get("end"),
  });
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createListCalendarEventsUseCase();
    const events = await useCase.execute(
      auth.userId,
      new Date(parsed.data.start),
      new Date(parsed.data.end),
    );
    return NextResponse.json({ events });
  } catch (error) {
    if (error instanceof PersonalCalendarNotFoundError) {
      return apiError(409, "calendar_not_found", error.message);
    }
    throw error;
  }
}
