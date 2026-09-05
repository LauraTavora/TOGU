# TOGU — Runbook

Guia operacional para incidentes e operações comuns.

## Health checks
`GET /api/v1/health` deve validar conectividade com banco (Neon) e dependências críticas.

## Incidentes comuns

### Falha de conexão com Neon
1. Verificar status da Neon (painel/API de status).
2. Verificar pool de conexões da aplicação (limite de conexões do plano Neon).
3. Failover: nenhuma automação de failover multi-região no MVP — escalar manualmente.

### Pico de rate limit / abuso em `/login` ou `/invite`
1. Checar dashboard de rate limiting (por IP/usuário/endpoint).
2. Se ataque confirmado, acionar proteção de infraestrutura (WAF/Cloudflare) além do limite aplicativo.

### Migration com falha em produção
1. Nunca reexecutar migration destrutiva sem revisão.
2. Restaurar a partir do último backup validado se dados foram corrompidos.
3. Abrir ADR retroativa documentando causa raiz e correção.

### Notificação perdida (Outbox)
1. Verificar fila/outbox de eventos de domínio não processados.
2. Reprocessar eventos pendentes idempotentemente (handlers devem ser idempotentes).

## Rollback de deploy
Vercel: reverter para deployment anterior estável via painel/CLI. Banco: aplicar apenas migrations com rollback documentado.

## Contatos e escalonamento
A definir conforme squads formados (ver `README.md` §Squads).
