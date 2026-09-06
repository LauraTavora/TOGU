import { NextResponse } from "next/server";
import { priorityTargetTypeSchema } from "@fecho/schemas";
import { createRemovePriorityRuleUseCase } from "@/modules/priority";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import type { RouteParams } from "@/shared/http/route-params";

export async function DELETE(
  request: Request,
  { params }: RouteParams<{ targetType: string; targetId: string }>,
) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { targetType: rawTargetType, targetId } = await params;

  const targetType = priorityTargetTypeSchema.safeParse(rawTargetType);
  if (!targetType.success) {
    return apiError(400, "invalid_input", targetType.error.message);
  }

  const useCase = createRemovePriorityRuleUseCase();
  await useCase.execute(auth.userId, targetType.data, targetId);
  return NextResponse.json({ ok: true });
}
