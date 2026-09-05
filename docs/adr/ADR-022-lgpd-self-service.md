# ADR-022 — Autoatendimento LGPD: exportar dados e apagar conta

## Status
Aceito.

## Contexto
`docs/PRIVACY-LGPD.md` promete, desde a primeira entrega de documentação, "solicitar seus dados (exportação estruturada)" e "apagar a conta... confirmação, reautenticação, grace period, anonimização/remoção conforme obrigação legal" — remetendo a um fluxo detalhado em `docs/PRODUCT.md` que, na prática, **não existe** naquele documento (referência solta). Nenhuma das duas capacidades tinha uma linha de código até esta entrega.

## Decisão

### Apagar conta = anonimizar em vez de `DELETE` — decisão técnica, não só de produto
O schema tem três relações que apontam para `User` sem `onDelete: Cascade`/`SetNull` (`Calendar.ownerId`, `MeetingRequest.requesterId`, `Invite.senderId`) — um `DELETE FROM users` real falharia por violação de FK para qualquer pessoa que já criou um evento, uma solicitação ou um convite (ou seja, qualquer usuário real do produto). Mesmo se essas relações fossem ajustadas, cascatear a exclusão apagaria eventos e solicitações que **outras pessoas** ainda enxergam na própria agenda — apagar sua conta não deveria fazer o compromisso sumir da agenda de quem você combinou de se encontrar.

Por isso, "apagar conta" aqui significa: anonimizar a linha de `User` (e-mail vira `deleted-{id}@togu.invalid`, senha e verificação de e-mail são limpas) e limpar o campo de agendamento — a linha continua existindo, então nada que aponta para ela (calendários, solicitações, convites) quebra ou some da visão de terceiros.

### Fluxo: pedir → carência de 14 dias → executar
1. `POST /api/v1/account/deletion` — reautentica com a senha atual (`IncorrectPasswordError` se errar), marca `User.deletionRequestedAt = now`, revoga todas as sessões ativas (mesma fricção do reset de senha: quem quiser cancelar precisa entrar de novo com a senha) e devolve a data agendada.
2. `DELETE /api/v1/account/deletion` — cancela a qualquer momento dentro da carência, zerando `deletionRequestedAt`.
3. `POST /api/v1/internal/execute-account-deletions` — protegida por segredo compartilhado (mesmo padrão de `sync-nearby-events`), pensada para rodar via cron externo; processa só quem já passou dos 14 dias (`findScheduledForDeletion` recebe um corte já com a carência subtraída — um teste pego bugado nesta mesma entrega: a primeira versão esquecia de subtrair a carência e anonimizava todo mundo na hora).

### Escopo explícito da anonimização — o que fica de fora nesta entrega
`anonymize()` só toca a linha de `User` (módulo `identity`). Dados pessoais em outros módulos (regras de prioridade, eventos salvos, membros de círculo, contatos, amizades, permissões de calendário concedidas, preferências de notificação, contas de calendário externo) **continuam no banco**, vinculados ao id agora anonimizado. Isso satisfaz a garantia central — ninguém mais consegue identificar a pessoa pelo e-mail ou entrar na conta — mas não é uma purga completa de dados por módulo. Fazer isso direito exigiria um método "apagar tudo do usuário X" em cada um dos ~8 módulos que guardam algo por `userId`, o que é trabalho real e vai além do que esta entrega cobre. Registrado aqui como o próximo passo, não escondido.

### Exportação: um adapter Prisma só, sem port em memória — exceção deliberada ao padrão do resto do projeto
Todo outro módulo do sistema tem adapter em memória + adapter Prisma lado a lado, com testes rodando contra o em memória (padrão hexagonal seguido à risca desde a ADR-001). Este é o único port sem essa dupla: exportar dados é, por definição, uma leitura que atravessa quase todo o schema (workspaces, calendários, eventos, solicitações, círculos, prioridades, contatos, preferências, auditoria) — um fake em memória fiel replicaria o grafo inteiro do Prisma sem agregar cobertura de verdade. `PrismaAccountDataExporter` faz uma única query com `include` aninhado; a estrutura foi validada por `tsc` (os nomes de campo/relação batem exatamente com o client gerado), mas — como todo código que toca Prisma neste ambiente — nunca rodou contra um banco real.

### `GET /api/v1/account/export` devolve o arquivo direto, com `Content-Disposition: attachment`
Em vez de devolver JSON para o cliente montar um blob manualmente, a rota já manda o header de anexo — o navegador baixa como arquivo. O SDK ganhou um método novo, `http.download(path, filename)`, que busca com o access token (do jeito que só o `AuthProvider` sabe fazer — a página nunca vê o token) e dispara o download via URL de objeto temporária, sem expor nada nem duplicar lógica de autenticação na página.

## Consequências
- A carência de 14 dias é um valor escolhido por mim, não especificado em nenhum documento do projeto — ajustável em `domain/account-deletion.ts` (`ACCOUNT_DELETION_GRACE_PERIOD_DAYS`) sem tocar em nenhum outro arquivo.
- `POST /api/v1/internal/execute-account-deletions` não tem nenhum agendamento automático configurado (mesma situação de `sync-nearby-events` — ADR-010): precisa ser chamada por um cron/worker externo.
- Testes: fluxo completo de solicitar/cancelar/executar coberto com `InMemoryUserRepository` (4 testes, incluindo o bug real do corte de carência pego durante a escrita do teste); rotas novas com teste de segurança (401/segredo interno). O exportador Prisma não tem nenhum teste automatizado — mesma lacuna documentada de todo código Prisma neste ambiente sem banco real (ADR-013 em diante).
- Antes de considerar isto pronto para produção: (1) rodar de verdade contra um Postgres real pelo menos uma vez; (2) configurar o cron externo; (3) decidir se/quando implementar a purga cross-módulo mencionada acima.
