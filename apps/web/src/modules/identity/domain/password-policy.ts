export class WeakPasswordError extends Error {
  constructor(reasons: string[]) {
    super(`Senha não atende aos requisitos mínimos: ${reasons.join(", ")}`);
  }
}

const MIN_LENGTH = 8;

/**
 * Regras mínimas de força de senha. A escolha do algoritmo de hash
 * (bcrypt/argon2) fica no adapter — o domínio só valida a senha em texto
 * plano antes de ela ser descartada.
 */
export function assertPasswordStrength(rawPassword: string): void {
  const reasons: string[] = [];

  if (rawPassword.length < MIN_LENGTH) {
    reasons.push(`mínimo de ${MIN_LENGTH} caracteres`);
  }
  if (!/[a-z]/.test(rawPassword)) {
    reasons.push("ao menos uma letra minúscula");
  }
  if (!/[A-Z]/.test(rawPassword)) {
    reasons.push("ao menos uma letra maiúscula");
  }
  if (!/[0-9]/.test(rawPassword)) {
    reasons.push("ao menos um número");
  }

  if (reasons.length > 0) {
    throw new WeakPasswordError(reasons);
  }
}
