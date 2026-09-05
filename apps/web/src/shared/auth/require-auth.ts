import { getAccessTokenSigner } from "@/modules/identity/infrastructure/container";

export interface AuthContext {
  userId: string;
}

/**
 * Extrai e valida o access token (Bearer) de toda rota privada.
 * Nenhuma rota privada deve confiar apenas na UI para bloquear acesso —
 * ver docs/SECURITY.md §Proteção de rotas.
 */
export async function requireAuth(request: Request): Promise<AuthContext | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length);
  const payload = await getAccessTokenSigner().verify(token);
  if (!payload) {
    return null;
  }

  return { userId: payload.userId };
}
