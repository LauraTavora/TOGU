import { NextResponse } from "next/server";
import { requestAccountDeletionSchema } from "@togu/schemas";
import {
  createCancelAccountDeletionUseCase,
  createGetAccountDeletionStatusUseCase,
  createRequestAccountDeletionUseCase,
  IncorrectPasswordError,
} from "@/modules/identity";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";
import { enforceRateLimit } from "@/shared/rate-limit";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const useCase = createGetAccountDeletionStatusUseCase();
  const status = await useCase.execute(auth.userId);
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const rateLimited = await enforceRateLimit(auth.userId, {
    bucket: "account:request-deletion",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (rateLimited) return rateLimited;

  const body = await request.json().catch(() => null);
  const parsed = requestAccountDeletionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  try {
    const useCase = createRequestAccountDeletionUseCase();
    const result = await useCase.execute(auth.userId, parsed.data.password);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof IncorrectPasswordError) {
      return apiError(401, "incorrect_password", error.message);
    }
    throw error;
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const useCase = createCancelAccountDeletionUseCase();
  await useCase.execute(auth.userId);
  return NextResponse.json({ ok: true });
}
