import { NextResponse } from "next/server";
import { checkAvailabilityRequestSchema } from "@togu/schemas";
import { createCheckAvailabilityUseCase } from "@/modules/availability/infrastructure/container";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkAvailabilityRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "invalid_input", message: parsed.error.message } },
      { status: 400 },
    );
  }

  const { participantIds, start, end, bufferMinutes } = parsed.data;
  const useCase = createCheckAvailabilityUseCase();

  const result = await useCase.execute({
    participantIds,
    range: { start: new Date(start), end: new Date(end) },
    bufferMinutes,
  });

  return NextResponse.json(result);
}
