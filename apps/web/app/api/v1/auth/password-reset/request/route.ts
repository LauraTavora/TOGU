import { NextResponse } from "next/server";
import { requestPasswordResetSchema } from "@togu/schemas";
import { createRequestPasswordResetUseCase } from "@/modules/identity";
import { apiError } from "@/shared/http/api-error";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  // Sempre responde 200, exista ou não a conta — anti-enumeration (docs/THREAT-MODEL.md).
  const useCase = createRequestPasswordResetUseCase();
  await useCase.execute(parsed.data.email);

  return NextResponse.json({ ok: true });
}
