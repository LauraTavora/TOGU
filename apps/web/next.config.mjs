const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy fica no middleware.ts (precisa de um nonce por
// requisição). Os demais headers de segurança são estáticos, então vivem
// aqui. Permissions-Policy libera geolocalização para o próprio site (usada
// pela busca de eventos próximos em /explorar) e nega câmera/microfone, que
// nenhuma feature usa. Ver ADR-020.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=()" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@fecho/design-system"],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
