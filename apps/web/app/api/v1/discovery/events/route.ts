import { NextResponse } from "next/server";
import { searchNearbyEventsQuerySchema } from "@togu/schemas";
import { createSearchNearbyEventsUseCase } from "@/modules/discovery";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import { enforceRateLimit } from "@/shared/rate-limit";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const rateLimited = await enforceRateLimit(auth.userId, {
    bucket: "discovery:search",
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  const url = new URL(request.url);
  const parsed = searchNearbyEventsQuerySchema.safeParse({
    latitude: url.searchParams.get("latitude"),
    longitude: url.searchParams.get("longitude"),
    radiusKm: url.searchParams.get("radiusKm"),
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
    category: url.searchParams.get("category") ?? undefined,
    onlyFree: url.searchParams.get("onlyFree") ?? undefined,
  });
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  const useCase = createSearchNearbyEventsUseCase();
  const events = await useCase.execute({
    origin: { latitude: parsed.data.latitude, longitude: parsed.data.longitude },
    radiusKm: parsed.data.radiusKm,
    from: new Date(parsed.data.from),
    to: new Date(parsed.data.to),
    category: parsed.data.category,
    onlyFree: parsed.data.onlyFree === "true",
  });
  return NextResponse.json({ events });
}
