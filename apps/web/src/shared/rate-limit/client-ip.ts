/**
 * Extrai o IP do cliente a partir de cabeçalhos de proxy (Vercel define
 * `x-forwarded-for`). Sem proxy confiável na frente, cai para um valor
 * fixo — nesse caso o rate limit por IP degrada para um bucket global,
 * o que é aceitável apenas em desenvolvimento.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
