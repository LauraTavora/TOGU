# TOGU — Security

Segurança tratada como requisito funcional: **Security by Design** e **Privacy by Design**.

## Proteção de rotas
- Middleware/authorization layer protege todas as rotas privadas; a UI nunca é a única barreira.
- Toda API valida: `authentication`, `authorization`, `tenant`, `resource ownership`, `permission`.

## Autorização
- RBAC + ownership + permissions + policy checks.
- Recursos compartilhados exigem autorização explícita (ex.: ver disponibilidade de terceiro requer `CalendarPermission` ou `Friendship`/`CircleMember` válido).
- Proteções específicas contra IDOR, BOLA, escalonamento horizontal e vertical: todo acesso a recurso por ID revalida ownership/tenant/permissão no backend, nunca apenas no client.

## Dados no navegador
- Se o usuário não pode ver um campo, o backend não o envia — nunca esconder apenas visualmente.
- Nenhum secret, database URL, API key privada, token ou credencial no bundle client-side.

## Environment variables
- Segredos apenas server-side; nunca usar `NEXT_PUBLIC_` para dados privados.
- Ambientes separados: development / preview / production.
- `.env.example` sem valores reais versionado no repositório.

## Superfícies de ataque cobertas
SQL Injection, XSS, CSRF, SSRF, IDOR, brute-force, credential stuffing, enumeration, clickjacking, open redirect, mass assignment, uploads maliciosos, replay attacks.

## Controles aplicados
- **Implementado**: Content Security Policy (nonce por requisição via `middleware.ts`, todo o app renderizado dinamicamente para isso funcionar — ver `ADR-020`), HSTS (produção), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, cookies seguros (`Secure` em produção, `HttpOnly`, `SameSite=Lax` — `shared/http/refresh-cookie.ts`, desde a `ADR-006`), validação de entrada (schemas Zod em toda rota).
- **Depende da infraestrutura de deploy, não do código**: HTTPS obrigatório (Vercel/plataforma).
- **Pendente**: CORS restritivo — nenhum handling de CORS existe ainda; só passa a ser necessário quando um cliente cross-origin real existir (ex.: o app mobile, ainda não implementado). Encoding de saída depende de cada renderização específica (React já escapa por padrão; não há um controle central dedicado a isso).

## Rate limiting
Implementado (`shared/rate-limit`) e aplicado em `/auth/register`, `/auth/login`, `/auth/password-reset/{request,confirm}` (por IP), `/availability/check`, `/discovery/events`, `/events` (por usuário autenticado). Sempre a primeira verificação da rota, antes de qualquer acesso a banco. Ver `ADR-011` para o mapeamento completo de limites e a limitação conhecida do adapter atual (em memória por instância — precisa de armazenamento compartilhado como Redis antes de produção com múltiplas instâncias).

## Proteção de infraestrutura
Ataques de rede/DDoS não são resolvidos só na aplicação — depende de proteção de infraestrutura (Vercel, WAF, CDN, firewall, proteção antibot, mitigação DDoS; avaliar Cloudflare como camada adicional). Código Next.js sozinho não bloqueia ataques de rede.

## Banco de dados
TLS obrigatório, usuário de menor privilégio, credenciais por ambiente, backups e restore testado, nunca acesso direto do browser ao banco.

## Dados sensíveis
- Tokens OAuth criptografados em repouso.
- Senhas com algoritmo consolidado (ex.: argon2/bcrypt) — nunca criptografia própria.

## Auditoria
Implementado (`shared/audit`, best-effort — nunca bloqueia a ação principal) e conectado a `LOGIN`, `PASSWORD_CHANGED`, `EVENT_CREATED`, `EVENT_UPDATED`, `EVENT_DELETED`, `REQUEST_ACCEPTED`, `REQUEST_REJECTED`. `CALENDAR_CONNECTED`, `PERMISSION_CHANGED` e `ACCOUNT_DELETED` aguardam os módulos correspondentes existirem (ver `ADR-012`). Nunca registrar senhas, tokens ou dados sensíveis em log.

## Observabilidade
Logs estruturados, correlation ID / request ID, error tracking, health checks, métricas e alertas.

Ver detalhamento de ameaças em `THREAT-MODEL.md` e privacidade/LGPD em `PRIVACY-LGPD.md`.
