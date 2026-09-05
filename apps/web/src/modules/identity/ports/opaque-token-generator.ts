export interface GeneratedToken {
  /** Valor enviado ao cliente (cookie, e-mail) — nunca persistido em texto puro. */
  token: string;
  /** Hash determinístico do token, persistido para permitir a busca posterior. */
  tokenHash: string;
}

/**
 * Gera tokens opacos de alta entropia (refresh token, verificação de e-mail,
 * redefinição de senha). Nunca previsível — mitigação de enumeration (ver
 * docs/THREAT-MODEL.md).
 */
export interface OpaqueTokenGenerator {
  generate(): GeneratedToken;
  hash(token: string): string;
}
