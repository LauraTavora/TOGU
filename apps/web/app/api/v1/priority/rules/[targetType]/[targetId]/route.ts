import { NextResponse } from "next/server";
import { priorityTargetTypeSchema } from "@togu/schemas";
import { createRemovePriorityRuleUseCase } from "@/modules/priority";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

interface RouteParams {
  params: { targetType: string; targetId: string };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const targetType = priorityTargetTypeSchema.safeParse(params.targetType);
  if (!targetType.success) {
    return apiError(400, "invalid_input", targetType.error.message);
  }

  const useCase = createRemovePriorityRuleUseCase();
  await useCase.execute(auth.userId, targetType.data, params.targetId);
  return NextResponse.json({ ok: true });
}
