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

**Status real:** o pipeline de CI (GitHub Actions, `.github/workflows/ci.yml` — typecheck, lint, testes, build em todo push/PR para `main`) existe desde `ADR-021`. O projeto **ainda não está conectado a nenhum ambiente Vercel** — não há Preview automático nem deploy de Production configurado; isso é o próximo passo antes do primeiro deploy real, não algo já em funcionamento.

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
