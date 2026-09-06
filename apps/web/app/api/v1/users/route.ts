import { NextResponse } from "next/server";
import { findUserByEmailQuerySchema, listUsersByIdsQuerySchema } from "@fecho/schemas";
import { createFindUserByEmailUseCase, createGetUsersPublicInfoUseCase } from "@/modules/identity";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

/**
 * Informação pública mínima (id + e-mail) para exibir "quem é" alguém em
 * telas que só têm o id (ex.: cards de solicitação), ou para resolver um
 * e-mail digitado num id (ex.: adicionar membro a um círculo). Nunca expõe
 * dados sensíveis. Sem Profile/displayName ainda — ver docs/PRODUCT.md §101.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (email !== null) {
    const parsedEmail = findUserByEmailQuerySchema.safeParse({ email });
    if (!parsedEmail.success) {
      return apiError(400, "invalid_input", parsedEmail.error.message);
    }
    const user = await createFindUserByEmailUseCase().execute(parsedEmail.data.email);
    return NextResponse.json({ user });
  }

  const parsed = listUsersByIdsQuerySchema.safeParse({ ids: url.searchParams.get("ids") });
  if (!parsed.success) {
    return apiError(400, "invalid_input", parsed.error.message);
  }

  const useCase = createGetUsersPublicInfoUseCase();
  const users = await useCase.execute(parsed.data.ids);
  return NextResponse.json({ users });
}
