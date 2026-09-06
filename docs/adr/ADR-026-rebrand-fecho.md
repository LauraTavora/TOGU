# ADR-026 — Rebrand: TOGU vira Fechô

## Status
Aceito.

## Contexto
"TOGU" (Together + Time + Go) foi sempre um nome de trabalho, declarado como tal desde a primeira entrega. O usuário pediu um nome definitivo, mais jovial e "descolado" — "Fechô" vem de "fechou?", o jeito informal como brasileiros confirmam um combinado ("Fechou, te vejo lá!"), o que encaixa diretamente no que o produto faz: negociar e confirmar encontros.

## Decisão

### Escopo do rebrand: partes vivas, não o histórico
Trocado em todo código-fonte, interface, `README.md` e docs de referência atual (`docs/*.md`, exceto `docs/adr/`). **Deliberadamente não tocado**: `CHANGELOG.md` e todas as ADRs anteriores (001–025) continuam dizendo "TOGU", porque documentam decisões tomadas quando esse era o nome do produto — reescrever isso apagaria o registro histórico real. Esta ADR é a primeira a existir sob o nome novo; nenhuma anterior foi retroativamente editada.

### Identificadores técnicos usam "fecho" (sem acento) — só o nome de exibição leva o acento
Nomes de pacote npm, slugs, bundle identifiers e nomes de banco não aceitam o "ô". A convenção adotada:
- Escopo dos pacotes do monorepo: `@togu/*` → `@fecho/*` (`database`, `design-system`, `schemas`, `sdk`, `web`, `mobile`).
- App mobile (Expo): `slug: "fecho"`, `bundleIdentifier`/`package: "app.fecho.mobile"` — mas `name: "Fechô"` (nome exibido na tela do usuário, que aceita acento).
- Placeholders técnicos (`fecho_dev`/`fecho_test` no exemplo de `DATABASE_URL`, `fecho.app`/`fecho.invalid` em e-mails de exemplo, o cookie `fecho_refresh_token`, a variável de cache `__fecho_prisma__`) usam a forma sem acento.
- Texto de marca visível (título da página, cabeçalho de login, nome no menu lateral, corpo dos e-mails) usa "Fechô", com acento.

### Repositório GitHub renomeado
`LauraTavora/TOGU` → `LauraTavora/Fecho` (GitHub não aceita "ô" em nomes de repositório). O GitHub redireciona permanentemente a URL antiga, então nada que já apontava para o repositório anterior quebra. O remoto git local e os scripts de automação de PR foram atualizados para o nome novo.

### Cookie de sessão mudou de nome — sessões ativas são desconectadas
`REFRESH_COOKIE_NAME` mudou de `togu_refresh_token` para `fecho_refresh_token`. Qualquer sessão ativa no navegador de alguém (inclusive a conta de teste usada para validar o primeiro deploy — ADR-024) para de ser reconhecida no próximo refresh, exigindo login de novo. Aceitável nesta fase pré-lançamento (poucas contas reais); numa base de usuários maior, isso seria uma escolha a evitar ou migrar com cuidado (aceitar os dois nomes de cookie por um tempo).

### Projeto Vercel renomeado
`web` → `fecho`, via `vercel project rename`. O alias de produção já existente (`web-psi-one-95.vercel.app`) continuou funcionando normalmente depois do rename — é um alias "limpo" preso ao id do projeto, não ao nome — mas novos domínios gerados a partir de agora usam o nome novo do projeto.

## Consequências
- O diretório de trabalho local no computador do usuário continua se chamando `TOGU` — é só um caminho de pasta local, não afeta nada visível no produto; renomear no meio da sessão quebraria referências de ferramentas em uso sem nenhum ganho real.
- Domínio próprio (`fecho.app` ou equivalente) continua sendo um placeholder — nada foi registrado de verdade; é só o texto usado em exemplos e como valor padrão de `EMAIL_FROM`.
