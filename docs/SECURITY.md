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
Content Security Policy, HSTS, cookies seguros (`Secure`, `HttpOnly`, `SameSite`), HTTPS obrigatório, CORS restritivo, validação de entrada, encoding de saída.

## Rate limiting
Aplicado especialmente em: `/login`, `/register`, `/password-reset`, `/invite`, `/search`, `/events`, `/availability`. Considera IP, usuário, tenant e endpoint combinados (não apenas IP isolado).

## Proteção de infraestrutura
Ataques de rede/DDoS não são resolvidos só na aplicação — depende de proteção de infraestrutura (Vercel, WAF, CDN, firewall, proteção antibot, mitigação DDoS; avaliar Cloudflare como camada adicional). Código Next.js sozinho não bloqueia ataques de rede.

## Banco de dados
TLS obrigatório, usuário de menor privilégio, credenciais por ambiente, backups e restore testado, nunca acesso direto do browser ao banco.

## Dados sensíveis
- Tokens OAuth criptografados em repouso.
- Senhas com algoritmo consolidado (ex.: argon2/bcrypt) — nunca criptografia própria.

## Auditoria
Eventos registrados: `LOGIN`, `PASSWORD_CHANGED`, `CALENDAR_CONNECTED`, `EVENT_CREATED`, `EVENT_UPDATED`, `EVENT_DELETED`, `REQUEST_ACCEPTED`, `REQUEST_REJECTED`, `PERMISSION_CHANGED`, `ACCOUNT_DELETED`. Nunca registrar senhas, tokens ou dados sensíveis em log.

## Observabilidade
Logs estruturados, correlation ID / request ID, error tracking, health checks, métricas e alertas.

Ver detalhamento de ameaças em `THREAT-MODEL.md` e privacidade/LGPD em `PRIVACY-LGPD.md`.
