import { NextResponse } from "next/server";
import { createCountCircleInterestUseCase } from "@/modules/discovery";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const useCase = createCountCircleInterestUseCase();
  const count = await useCase.execute(auth.userId, params.id);
  return NextResponse.json({ count });
}
