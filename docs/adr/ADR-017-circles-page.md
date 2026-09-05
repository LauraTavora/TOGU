# ADR-017 — Página de Círculos

## Status
Aceito.

## Contexto
O módulo `circles` já tinha CRUD completo e testado (criar/renomear/excluir círculo, adicionar/remover/listar membros — ver `docs/API.md`), mas nenhuma UI. `listCircles` só devolve círculos do workspace pessoal de quem chama, então o usuário autenticado **é sempre** o dono desse workspace para qualquer círculo que aparece na lista (provisionamento automático — ADR-002). Isso simplifica a UI: não existe cenário, nesta tela, em que o usuário vê um círculo que não pode gerenciar — os controles de renomear/excluir/gerenciar membros aparecem incondicionalmente para todo item da lista.

Uma lacuna real de backend impedia "adicionar membro" funcionar de forma utilizável: o endpoint `POST /api/v1/circles/:id/members` exige um `userId`, mas a pessoa comum só sabe o e-mail de quem quer adicionar. Não existe (ainda) um sistema de amizades/contatos (`Friendship`/`Contact` já estão no schema Prisma, mas sem módulo construído) — a única forma de resolver e-mail → id hoje é o próprio módulo `identity`.

## Decisão

### `GET /api/v1/users?email=...` — novo modo de busca no mesmo endpoint
Em vez de criar um endpoint separado, o `GET /api/v1/users` (ADR-016) ganhou um segundo modo: quando a query string tem `email` (em vez de `ids`), devolve `{ user: {id, email} | null }` — `null` quando ninguém no TOGU tem esse e-mail, nunca um erro 404 (evita distinguir "e-mail inválido" de "e-mail não encontrado" de um jeito que ajude enumeração). A UI trata `user: null` mostrando "Não encontramos ninguém no TOGU com esse e-mail" — **adicionar alguém que ainda não tem conta não é suportado nesta entrega** (isso exigiria um fluxo de convite por e-mail, que é outra feature).

### Lista com expansão inline, não navegação para outra página
Clicar num círculo expande a lista de membros no próprio card (estado local `expandedCircleId`), em vez de navegar para `/circulos/:id`. Mais simples de implementar e evita uma rota dinâmica nova só para isto; reconsiderar se a lista de membros crescer a ponto de precisar de paginação própria.

### Contagem de membros e e-mails resolvidos de uma vez, para todos os círculos
Ao carregar a página, busca os membros de **todos** os círculos em paralelo (`Promise.all`) e resolve todos os e-mails envolvidos numa única chamada em lote a `/api/v1/users?ids=...` (mesmo endpoint e mesmo padrão usado na Central de Solicitações — ADR-016). Aceitável na escala de círculos pessoais (tipicamente poucos, com poucos membros); não otimizado para dezenas de círculos com centenas de membros cada.

### Excluir círculo pede confirmação no próprio botão, sem diálogo
Primeiro clique em "Excluir" muda o rótulo do botão para "Confirmar"; segundo clique executa. Mesmo padrão já usado no formulário de evento do Calendário (ADR-015), evitando abrir mais um modal para uma ação de dois cliques.

## Consequências
- Adicionar membro por e-mail é uma solução de transição: assim que existir um sistema de amizades/contatos (ou convite por e-mail para quem ainda não tem conta), o `AddMemberDialog` deve trocar de "digitar e-mail" para "escolher de uma lista de amigos/contatos" — a chamada a `POST /api/v1/circles/:id/members` com `userId` não muda.
- Nenhum teste de renderização de componente (mesma lacuna registrada nas ADR-013 a ADR-016); o novo modo de busca por e-mail ganhou teste de segurança (401 sem autenticação), seguindo o padrão já estabelecido.
