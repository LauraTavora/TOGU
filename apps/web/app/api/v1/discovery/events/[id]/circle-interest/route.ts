import { NextResponse } from "next/server";
import { createCountCircleInterestUseCase } from "@/modules/discovery";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import type { RouteParams } from "@/shared/http/route-params";

export async function GET(request: Request, { params }: RouteParams<{ id: string }>) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { id } = await params;

  const useCase = createCountCircleInterestUseCase();
  const count = await useCase.execute(auth.userId, id);
  return NextResponse.json({ count });
}
