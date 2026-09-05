# ADR-003 — PostgreSQL via Neon em produção

## Status
Aceito.

## Contexto
O TOGU precisa de um banco relacional robusto, com suporte a transações fortes (necessário para evitar dupla reserva em `MeetingRequest`), branching de banco para preview environments, e boa integração com o ecossistema Vercel/Next.js.

## Decisão
PostgreSQL como banco relacional. Desenvolvimento local com Postgres local; produção obrigatoriamente Neon PostgreSQL. ORM padrão: Prisma, salvo ADR futura justificando alternativa.

## Consequências
- Neon oferece branching de banco por ambiente/preview, alinhado ao fluxo de PRs na Vercel.
- Acesso ao banco exclusivamente server-side; nunca do browser.
- Exige gestão cuidadosa de pool de conexões (serverless) — a validar em `RUNBOOK.md` conforme uso real.
