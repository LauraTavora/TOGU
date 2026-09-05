# TOGU — API

API versionada sob `/api/v1/`. Route Handlers atuam apenas como adapters de entrada — nenhuma regra de negócio vive no endpoint; toda lógica é delegada a casos de uso da camada `application`.

## Convenções

- Autenticação obrigatória em toda rota privada (nenhuma exceção).
- Toda requisição valida: `authentication`, `authorization`, `tenant`, `resource ownership`, `permission`.
- Validação de entrada via schema runtime compartilhado (nunca confiar apenas em tipos TypeScript).
- Erros seguem formato padronizado `{ error: { code, message } }`, sem vazar detalhes internos.

## Endpoints iniciais

### Autenticação (módulo `identity`)
```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/verify-email
POST /api/v1/auth/password-reset/request
POST /api/v1/auth/password-reset/confirm
GET  /api/v1/auth/me
```
Detalhamento da estratégia (JWT de acesso + refresh token opaco rotativo) em `docs/adr/ADR-006-authentication-strategy.md`.

### Solicitações de encontro (módulo `meeting-requests`)
```text
POST /api/v1/meeting-requests
GET  /api/v1/meeting-requests?box=received|sent&status=...&sort=priority|recent
POST /api/v1/meeting-requests/:id/accept
POST /api/v1/meeting-requests/:id/decline
POST /api/v1/meeting-requests/:id/counter-proposal
GET  /api/v1/meeting-requests/:id/counter-proposals
POST /api/v1/meeting-requests/:id/cancel
```
Somente quem não apresentou a proposta de horário em aberto (o requester na primeira oferta, ou o autor da última contraproposta) pode aceitar/negar/contrapropor. `accept` sempre revalida disponibilidade real antes de confirmar (nunca confia no estado exibido antes) e é protegido contra condição de corrida (ver `ADR-007`). `box=received` é ordenado por prioridade por padrão (`sort=priority`), usando o Priority Engine do destinatário (ver `ADR-008`); `sort=recent` ordena por data de criação, mais recente primeiro. `GET .../counter-proposals` lista o histórico de contrapropostas de uma solicitação (necessário para o cliente saber o horário renegociado quando `status=COUNTER_PROPOSED`); só quem faz parte da solicitação (requester ou participantes) pode ver — `403` para qualquer outra pessoa. Ver `ADR-016`.

### Identidade pública (módulo `identity`)
```text
GET /api/v1/users?ids=id1,id2,id3
GET /api/v1/users?email=alguem@example.com
```
`ids` resolve `{id, email}` para até 50 ids de uma vez — usado por telas que só têm ids de outros usuários (ex.: Central de Solicitações) e precisam mostrar "quem é" alguém. `email` resolve um único e-mail para `{ user: {id, email} | null }` — `null` quando ninguém tem esse e-mail (nunca `404`, para não ajudar enumeração); usado para resolver e-mail digitado em id antes de ações como adicionar membro a um círculo (ver `ADR-017`). Nenhum dos dois modos expõe `passwordHash` ou qualquer outro campo. Ainda não existe `Profile` (nome de exibição, foto); o e-mail é usado como identificador visível temporário — ver `ADR-016`.

### Notificações (módulo `notifications`)
```text
GET  /api/v1/notifications?onlyUnread=true|false
GET  /api/v1/notifications/unread-count
POST /api/v1/notifications/:id/read
POST /api/v1/notifications/read-all
GET  /api/v1/notifications/preferences
PATCH /api/v1/notifications/preferences
POST /api/v1/internal/process-outbox   (rota interna, protegida por segredo X-Internal-Secret — não é para usuário final)
```
`meeting-requests` emite eventos de domínio (criada, aceita, negada, contraproposta, cancelada) para uma outbox compartilhada; `notifications` os traduz em notificações in-app. Ver `ADR-004` e `ADR-009` para a implementação e suas limitações conhecidas (ainda não há transação compartilhada entre a mutação de negócio e o registro do evento).

### Prioridade (módulo `priority`)
```text
GET    /api/v1/priority/rules
POST   /api/v1/priority/rules
DELETE /api/v1/priority/rules/:targetType/:targetId
```
Regras são sempre privadas e escopadas ao próprio usuário — não há endpoint para consultar a prioridade que alguém atribuiu a outra pessoa (ver `ADR-008`). `targetType` é um de `PERSON`, `CIRCLE`, `PLACE`, `EVENT_TYPE`; `level` um de `LOW`, `NORMAL`, `HIGH`, `MAXIMUM`.

### Círculos (módulo `circles`)
```text
POST   /api/v1/circles
GET    /api/v1/circles
PATCH  /api/v1/circles/:id
DELETE /api/v1/circles/:id
GET    /api/v1/circles/:id/members
POST   /api/v1/circles/:id/members
DELETE /api/v1/circles/:id/members/:userId
```
Círculos pertencem ao workspace pessoal do criador. Apenas quem gerencia o workspace (`OWNER`/`ADMIN`) pode renomear, excluir ou gerenciar membros; membros do próprio círculo também podem visualizar a lista de membros.

### Explore / Descoberta (módulo `discovery`)
```text
GET    /api/v1/discovery/events?latitude=&longitude=&radiusKm=&from=&to=&category=&onlyFree=
POST   /api/v1/discovery/events/:id/save
DELETE /api/v1/discovery/events/:id/save
GET    /api/v1/discovery/saved-events
POST   /api/v1/discovery/events/:id/add-to-agenda
GET    /api/v1/discovery/events/:id/circle-interest
POST   /api/v1/internal/sync-nearby-events   (rota interna, protegida por segredo X-Internal-Secret)
```
`EventDiscoveryProvider` desacopla o catálogo local de qualquer provedor externo específico (hoje um mock — ver `ADR-010`); a busca sempre lê do catálogo local (`NearbyEvent`), nunca do provedor diretamente. `circle-interest` retorna apenas uma contagem, nunca os nomes de quem também salvou o evento. Para convidar alguém para um evento descoberto, usar `POST /api/v1/meeting-requests` normalmente com os dados do evento.

### Eventos (módulo `scheduling`)
```text
POST /api/v1/events
GET  /api/v1/events/:id
PATCH /api/v1/events/:id
DELETE /api/v1/events/:id
GET  /api/v1/calendar?start=...&end=...
```
Todo evento pertence ao calendário pessoal do usuário autenticado (provisionado automaticamente no cadastro — ver `ADR-002`). Apenas o dono do calendário pode editar/excluir; dono e participantes podem visualizar o detalhe completo — qualquer outra pessoa recebe `403`.

### Solicitações de encontro
```text
POST /api/v1/meeting-requests
GET  /api/v1/meeting-requests
POST /api/v1/meeting-requests/:id/accept
POST /api/v1/meeting-requests/:id/decline
POST /api/v1/meeting-requests/:id/counter-proposal
POST /api/v1/meeting-requests/:id/cancel
```

### Disponibilidade
```text
POST /api/v1/availability/check
```

### Descoberta
```text
GET /api/v1/nearby-events
```

## Modelo de documentação por endpoint

Cada endpoint deve documentar, sem assinaturas pessoais no código:

```text
Objetivo
Autorização (papéis/permissões exigidas)
Entrada (schema)
Saída (schema)
Erros possíveis
Regras de negócio executadas (casos de uso invocados)
Serviços/ports envolvidos
```

### Exemplo: `POST /api/v1/auth/login`

- **Objetivo:** autenticar um usuário com e-mail e senha, iniciando uma sessão.
- **Autorização:** nenhuma (rota pública).
- **Entrada:** `{ email, password }`.
- **Saída:** `{ accessToken }` (JWT, 15 min) + cookie `HttpOnly` com refresh token (30 dias, escopado a `/api/v1/auth`).
- **Erros:** `400 invalid_input`, `401 invalid_credentials` (mensagem genérica — nunca revela se o e-mail existe).
- **Regras executadas:** `LoginUseCase` — verifica hash de senha (bcrypt), cria `Session`, assina access token.
- **Ports envolvidos:** `UserRepository`, `SessionRepository`, `PasswordHasher`, `OpaqueTokenGenerator`, `AccessTokenSigner`.

### Exemplo: `POST /api/v1/meeting-requests/:id/accept`

- **Objetivo:** aceitar uma solicitação de encontro pendente, criando o evento correspondente na agenda de todos os participantes.
- **Autorização:** usuário autenticado deve ser um dos destinatários (`MeetingParticipant`) da solicitação.
- **Entrada:** nenhum corpo obrigatório (id via path param).
- **Saída:** `{ meetingRequest, event }`.
- **Erros:** `404 not_found`, `403 forbidden` (não é participante), `409 conflict` (disponibilidade mudou desde a exibição), `410 gone` (expirada/cancelada).
- **Regras executadas:** `AvailabilityEngine.recheck()` → transação → `Event.create()` → `MeetingRequest.markAccepted()` → publica evento de domínio `MeetingAccepted` (Outbox).
- **Ports envolvidos:** `CalendarRepository`, `AvailabilityRepository`, `NotificationGateway` (via outbox, assíncrono).
