# ADR-021 — Pipeline de CI (GitHub Actions)

## Status
Aceito.

## Contexto
`docs/DEPLOYMENT.md` já falava em "pipeline de CI completo" como pré-requisito para deploy de produção, mas nenhum pipeline existia — nenhum arquivo em `.github/workflows/`. Toda verificação (`tsc`, `vitest`, `next build`) até aqui era manual, rodada por mim a cada entrega. Esta entrega fecha essa lacuna.

## Decisão

### GitHub Actions, um job único: typecheck → lint → test → build
`.github/workflows/ci.yml` roda em todo push/PR para `main` (mais `workflow_dispatch` para disparo manual). Um único job sequencial, na ordem que falha mais rápido primeiro: `npm run typecheck --workspaces`, depois `lint`, depois `test`, depois `build` — todos via os scripts raiz já existentes em `package.json` (`--workspaces --if-present`), os mesmos comandos que eu já rodava manualmente a cada PR desde o início do projeto. Nenhum script novo foi inventado só para CI.

`npm run generate --workspace packages/database` roda antes de tudo: o Prisma Client precisa existir em `node_modules` para qualquer coisa que importe `@togu/database` typecheckar ou buildar. Isso só lê `schema.prisma` — não precisa de `DATABASE_URL` real nem de conexão com banco (verificado localmente: `prisma generate` funciona sem nenhuma variável de ambiente configurada).

### `test:integration` e `test:e2e` ficam de fora do pipeline
Os scripts existem na raiz (`package.json`), mas nenhum workspace de fato os implementa hoje — são um placeholder para quando integração com banco real (Neon) e testes end-to-end (navegador) existirem. Incluir esses passos agora seria simular cobertura que não existe; ADR-013 já registra que os testes de "caminho feliz" que tocam Prisma estão marcados `it.skip` por falta de banco real neste tipo de ambiente.

### Dois bugs reais descobertos rodando a pipeline localmente antes de commitar — não hipotéticos
Só ao rodar `npm run typecheck --workspaces --if-present` de verdade (em vez de só `apps/web` isoladamente, como cada ADR anterior fazia) apareceram dois problemas que já existiam no repositório:

1. **`next lint` é interativo e está depreciado no Next 15** (removido no Next 16). Sem nenhum `eslint.config.mjs` ou dependência `eslint` instalada, `next lint` faz uma pergunta interativa na primeira execução — em CI (sem TTY) isso trava ou falha, nunca passa. Corrigido instalando `eslint` + `eslint-config-next@15.5.25` (a mesma versão do Next instalado) + `@eslint/eslintrc`, criando `apps/web/eslint.config.mjs` (flat config, o mesmo template que `create-next-app` geraria hoje) e trocando o script `lint` de `next lint` para `eslint .` — seguindo a própria recomendação de migração do Next. Rodar de verdade revelou 5 erros e 3 avisos reais no código (aspas não escapadas em JSX, export anônimo, imports não usados, referência triple-slash no `next-env.d.ts` gerado) — todos corrigidos, exceto `next-env.d.ts`, que fica no `ignores` por ser regenerado automaticamente pelo próprio Next.

2. **`apps/mobile` não compilava** por um conflito real de versões de `@types/react` entre workspaces: `apps/web`/`packages/design-system` usam React 19, `apps/mobile` usa React 18 (exigido pelo Expo 51/React Native 0.74). `App.tsx` importava `lightColors` do barrel `@togu/design-system`, que reexporta também os componentes `.tsx` (Button, Card, Dialog...) — todos elementos DOM (`<div>`, `<button>`), incompatíveis com React Native por definição, e cuja compilação arrastava os tipos de React 19 para dentro do typecheck do mobile (React 18), gerando erros de `ReactNode`/`bigint` incompatível. Corrigido trocando o import para o módulo de tokens direto (`@togu/design-system/src/tokens/colors`, um arquivo sem nenhuma dependência de React) em vez do barrel completo. Isso não é só uma correção pontual: registra que **`apps/mobile` nunca deve importar o barrel de componentes de `@togu/design-system`** — só tokens/valores puros — até que exista um design system próprio para React Native (ou uma versão platform-agnostic separada dos tokens).

Esses dois problemas já existiam antes desta entrega; a pipeline de CI só os tornou visíveis porque, pela primeira vez, alguém rodou `typecheck`/`lint` no nível do monorepo inteiro, não só em `apps/web` isoladamente.

## Consequências
- Todo push/PR para `main` agora falha visivelmente se `tsc`, `eslint`, `vitest` ou `next build` quebrarem — antes disso dependia inteiramente de eu lembrar de rodar cada verificação manualmente, o que já tinha causado a descoberta tardia do bug de `params` assíncrono do Next 15 (ADR-013) e, agora, estes dois problemas de tooling.
- Nenhuma integração com Vercel (deploy automático de preview/produção) foi configurada — só a verificação de CI. Ver `docs/DEPLOYMENT.md` para o status real.
- `apps/mobile` e `packages/database` não têm teste algum ainda (nenhum arquivo `*.test.ts`) — a CI roda os scripts que existem, mas isso não é cobertura de fato para esses dois pacotes.
