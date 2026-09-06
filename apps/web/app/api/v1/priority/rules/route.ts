import { NextResponse } from "next/server";
import { setPriorityRuleSchema } from "@fecho/schemas";
import { createListPriorityRulesUseCase, createSetPriorityRuleUseCase } from "@/modules/priority";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const useCase = createListPriorityRulesUseCase();
  const rules = await useCase.execute(auth.userId);
  return NextResponse.json({ rules });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const body = await request.json().catch(() => null);
  const parsed = setPriorityRuleSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  const useCase = createSetPriorityRuleUseCase();
  const rule = await useCase.execute(
    auth.userId,
    parsed.data.targetType,
    parsed.data.targetId,
    parsed.data.level,
  );
  return NextResponse.json({ rule }, { status: 201 });
}
