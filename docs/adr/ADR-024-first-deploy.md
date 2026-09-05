# ADR-024 — Primeiro deploy real: Neon + Vercel

## Status
Aceito.

## Contexto
Depois de fechar os gaps de rate limiting (Upstash) e e-mail (Resend) na ADR-023, restavam dois bloqueadores para o primeiro deploy: nenhum banco real jamais tinha rodado o schema, e nenhum projeto Vercel existia. Diferente das entregas anteriores, isso não é código novo — é a primeira execução real de infraestrutura que só existia em documentação e ADRs até aqui.

## Decisão

### Provisionamento via CLI autenticado, não via dashboard manual
Tanto o Vercel CLI quanto o Neon CLI já tinham (ou passaram a ter, após uma única autorização no navegador para o Neon) uma sessão válida nesta máquina. Todo o provisionamento — criação do projeto Vercel, conexão do repositório GitHub, instalação da integração Neon, configuração de variáveis de ambiente, migração do banco e dois deploys de produção — foi feito via `vercel`/`neonctl`/`prisma` a partir do terminal, sem passar por nenhum dashboard manualmente. Nenhuma credencial nova foi criada nem exposta no chat; conexões de banco foram sempre lidas e regravadas por script, nunca impressas.

### Neon provisionado através da integração nativa do Vercel, não como projeto Neon avulso
A conta Neon já existente do usuário só tinha uma organização (`Vercel: lauratavora's projects`), gerenciada pela integração/marketplace do Vercel — `neonctl projects create` direto falhou com `"organization is managed by Vercel"`. A forma correta é `vercel integration add neon`, que cria o banco **e** já popula as variáveis de ambiente do projeto Vercel automaticamente (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, etc.) em todos os ambientes (Production/Preview/Development) de uma vez.

### `DIRECT_URL` precisou ser adicionada manualmente
O schema Prisma usa a convenção `DATABASE_URL`/`DIRECT_URL`; a integração Neon usa `DATABASE_URL`/`DATABASE_URL_UNPOOLED`. Adicionada `DIRECT_URL` como cópia do valor de `DATABASE_URL_UNPOOLED`, tanto localmente (`packages/database/.env`) quanto no Vercel (`vercel env add`). Um erro real aconteceu aqui: a primeira tentativa copiou o valor incluindo as aspas literais do arquivo `.env.local` (`DIRECT_URL="postgresql://...\"` como string, aspas incluídas) — corrigido removendo e recriando a variável com as aspas removidas antes de gravar.

### Layout do monorepo no Vercel: link na raiz do repositório, Root Directory como configuração do projeto
A primeira tentativa (`vercel link --cwd apps/web`) tratou `apps/web` como se fosse a raiz do projeto, então o upload não incluiu `packages/*` nem o `package-lock.json` da raiz — o `npm install` no build falhou com `404 @togu/database`, porque o pacote do workspace nunca foi enviado. Corrigido religando a partir da raiz real do repositório e configurando `Root Directory: apps/web` como *configuração do projeto* (`vercel project update web --root-directory apps/web`), não como diretório de execução do CLI — é assim que o Vercel entende monorepos com npm workspaces: sobe o repositório inteiro, mas builda a partir do subdiretório indicado.

### Bug real descoberto no primeiro build de verdade no Vercel: Prisma Client nunca era gerado
Corrigido o layout do monorepo, o build ainda falhava — agora com um erro de tipo (`Parameter 'c' implicitly has an 'any' type`) em `prisma-availability-repository.ts`, um arquivo que nunca deu erro em nenhum `next build` rodado localmente durante toda a sessão. Causa raiz: **este ambiente de desenvolvimento tinha `@prisma/client` gerado manualmente dezenas de vezes ao longo da sessão**, então `node_modules/@prisma/client` sempre tinha tipos válidos localmente — mascarando que **nada no pipeline de build gera o Prisma Client automaticamente**. Numa instalação limpa (exatamente o que o Vercel faz a cada build), `@prisma/client` existe mas sem os tipos gerados a partir do `schema.prisma`, e o TypeScript degrada silenciosamente para `any` em vez de dar um erro óbvio de "tipo não encontrado".

Corrigido adicionando um script `prebuild` em `apps/web/package.json`:
```json
"prebuild": "prisma generate --schema=../../packages/database/prisma/schema.prisma"
```
`prebuild` é um hook automático do npm — roda antes de `build` tanto localmente (`npm run build`) quanto no pipeline do Vercel (que também invoca `npm run build`), sem precisar mudar o Build Command no dashboard. Verificado apagando `node_modules/@prisma/client` localmente para simular uma instalação limpa antes de confirmar a correção — só depois disso o segundo deploy real foi tentado.

### Migração inicial criada e aplicada pela primeira vez
`prisma migrate dev --name init`, rodado contra o banco Neon de verdade, gerou `packages/database/prisma/migrations/20260905232433_init/migration.sql` — a primeira migração já existente do projeto (nunca havia nenhuma até aqui, porque nenhum banco real existia para gerar o diff). Verificado com um teste end-to-end manual real: registro → verificação de e-mail (token lido do log, já que `EMAIL_PROVIDER_API_KEY` não está configurado neste ambiente local) → login → criação de evento → listagem no calendário, tudo contra o Neon de produção. Os dados de teste foram removidos do banco logo em seguida (não é seed nem fixture — só verificação manual pontual).

## Consequências
- **A aplicação está no ar**: `https://web-psi-one-95.vercel.app`, com GitHub conectado (deploy automático de produção a cada push em `main`, preview automático a cada PR).
- `UPSTASH_REDIS_REST_URL`/`TOKEN` e `EMAIL_PROVIDER_API_KEY`/`EMAIL_FROM` (Upstash e Resend, ADR-023) **não foram configurados no Vercel** — ficam fora do escopo desta entrega (o pedido era especificamente Neon + Vercel). Em produção agora mesmo: rate limiting cai para memória (não confiável com múltiplas instâncias) e e-mails de verificação/reset só vão para o log do servidor — os dois avisos configurados na ADR-023 devem aparecer nos logs do Vercel.
- **Gap descoberto e não corrigido, fora de escopo desta ADR**: `LoginUseCase` não verifica `emailVerifiedAt` — uma conta consegue logar e usar o produto inteiro sem nunca clicar no link de verificação. Pré-existente, não introduzido por este trabalho; decisão de produto (bloquear login vs. só bloquear features específicas) fica para quando alguém decidir tratar isso.
- O projeto Vercel se chama `web` (nome padrão derivado do diretório) — cosmético, pode ser renomeado depois sem impacto técnico.
- Nenhum domínio próprio configurado — a aplicação vive no domínio `.vercel.app` gerado automaticamente.
