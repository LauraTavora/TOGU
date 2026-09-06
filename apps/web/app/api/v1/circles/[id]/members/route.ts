import { NextResponse } from "next/server";
import { addCircleMemberRequestSchema } from "@fecho/schemas";
import {
  createAddCircleMemberUseCase,
  createListCircleMembersUseCase,
  CircleNotFoundError,
  ForbiddenCircleAccessError,
  MemberAlreadyInCircleError,
  MemberUserNotFoundError,
} from "@/modules/circles";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import type { RouteParams } from "@/shared/http/route-params";

export async function GET(request: Request, { params }: RouteParams<{ id: string }>) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { id } = await params;

  try {
    const useCase = createListCircleMembersUseCase();
    const members = await useCase.execute(id, auth.userId);
    return NextResponse.json({ members });
  } catch (error) {
    if (error instanceof CircleNotFoundError) return apiError(404, "not_found", error.message);
    if (error instanceof ForbiddenCircleAccessError) return apiError(403, "forbidden", error.message);
    throw error;
  }
}

export async function POST(request: Request, { params }: RouteParams<{ id: string }>) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = addCircleMemberRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createAddCircleMemberUseCase();
    const member = await useCase.execute(id, auth.userId, parsed.data.userId);
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof CircleNotFoundError) return apiError(404, "not_found", error.message);
    if (error instanceof ForbiddenCircleAccessError) return apiError(403, "forbidden", error.message);
    if (error instanceof MemberAlreadyInCircleError) return apiError(409, "already_member", error.message);
    if (error instanceof MemberUserNotFoundError) return apiError(404, "user_not_found", error.message);
    throw error;
  }
}
