import { NextResponse } from "next/server";
import { createCircleRequestSchema } from "@togu/schemas";
import {
  createCreateCircleUseCase,
  createListCirclesUseCase,
  InvalidCircleNameError,
  PersonalWorkspaceNotFoundError,
} from "@/modules/circles";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  try {
    const useCase = createListCirclesUseCase();
    const circles = await useCase.execute(auth.userId);
    return NextResponse.json({ circles });
  } catch (error) {
    if (error instanceof PersonalWorkspaceNotFoundError) {
      return apiError(409, "workspace_not_found", error.message);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const body = await request.json().catch(() => null);
  const parsed = createCircleRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createCreateCircleUseCase();
    const circle = await useCase.execute(auth.userId, parsed.data.name);
    return NextResponse.json({ circle }, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidCircleNameError) {
      return apiError(400, "invalid_input", error.message);
    }
    if (error instanceof PersonalWorkspaceNotFoundError) {
      return apiError(409, "workspace_not_found", error.message);
    }
    throw error;
  }
}
