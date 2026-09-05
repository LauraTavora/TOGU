import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CSP com nonce por requisição — padrão recomendado pelo Next.js para o App
 * Router: ao ver um nonce no header `Content-Security-Policy` da resposta,
 * o próprio Next injeta esse nonce em todo <script> que ele gera (chunks,
 * bootstrap de hidratação), sem precisar passar nonce manualmente em cada
 * layout. `upgrade-insecure-requests` fica de fora em desenvolvimento
 * porque forçaria `next dev` (servido em http://localhost) a tentar
 * recarregar seus próprios scripts via https, quebrando o servidor local.
 * Ver ADR-020.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV !== "production";

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? "" : "upgrade-insecure-requests;"}
  `;
  const contentSecurityPolicy = cspHeader.replace(/\s{2,}/g, " ").trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
