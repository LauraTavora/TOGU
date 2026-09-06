# TOGU — Deployment

## Web
Deploy final: **Vercel**.

Ambientes:
```text
Development
Preview/Staging
Production
```

Cada PR gera Preview automático (Vercel); Production só recebe deploy após pipeline de CI completo (`TESTING.md`) aprovado.

**Status real:** o pipeline de CI (GitHub Actions, `.github/workflows/ci.yml` — typecheck, lint, testes, build em todo push/PR para `main`) existe desde `ADR-021`. Desde `ADR-024`, o projeto está de fato no ar: `https://web-psi-one-95.vercel.app`, com o repositório GitHub conectado (Preview automático por PR, deploy de Production automático em push para `main`), banco Neon real provisionado e migrado. Desde `ADR-025`, rate limiting também usa Redis real em produção (Upstash, via `vercel integration add upstash/upstash-kv`) — verificado com tráfego real (11 tentativas de login confirmaram o `429` no limite certo). `EMAIL_PROVIDER_API_KEY`/`EMAIL_FROM` (Resend, ADR-023) continuam sem valor: a integração do Resend no Vercel exige um domínio verificado, que o produto ainda não tem — e-mail transacional segue no fallback de log até isso ser resolvido.

## Banco de dados
- Desenvolvimento: PostgreSQL local.
- Produção: **Neon PostgreSQL** (obrigatório).
- Migrations aplicadas via pipeline controlado, nunca manualmente em produção sem revisão.

## Mobile
- Projeto preparado para Android e iOS.
- Build via Expo/EAS.
- Ambientes espelhando web (dev/staging/prod) via variáveis de build do Expo.

## Variáveis de ambiente
- `.env.example` versionado, sem valores reais.
- Segredos apenas server-side; nunca `NEXT_PUBLIC_` para dados sensíveis.
- Separação estrita entre credenciais de dev/preview/produção (inclusive banco).

## Rollback
- Vercel: rollback instantâneo para deploy anterior.
- Banco: toda migration destrutiva documenta estratégia de reversão antes de subir para produção.

## Observabilidade pós-deploy
Health checks, logs estruturados com correlation ID, error tracking e alertas configurados antes do primeiro release público (ver `SECURITY.md` §Observabilidade).
