# TOGU — API

API versionada sob `/api/v1/`. Route Handlers atuam apenas como adapters de entrada — nenhuma regra de negócio vive no endpoint; toda lógica é delegada a casos de uso da camada `application`.

## Convenções

- Autenticação obrigatória em toda rota privada (nenhuma exceção).
- Toda requisição valida: `authentication`, `authorization`, `tenant`, `resource ownership`, `permission`.
- Validação de entrada via schema runtime compartilhado (nunca confiar apenas em tipos TypeScript).
- Erros seguem formato padronizado `{ error: { code, message } }`, sem vazar detalhes internos.

## Endpoints iniciais

### Eventos
```text
POST /api/v1/events
GET  /api/v1/events/:id
PATCH /api/v1/events/:id
DELETE /api/v1/events/:id
GET  /api/v1/calendar
```

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

### Exemplo: `POST /api/v1/meeting-requests/:id/accept`

- **Objetivo:** aceitar uma solicitação de encontro pendente, criando o evento correspondente na agenda de todos os participantes.
- **Autorização:** usuário autenticado deve ser um dos destinatários (`MeetingParticipant`) da solicitação.
- **Entrada:** nenhum corpo obrigatório (id via path param).
- **Saída:** `{ meetingRequest, event }`.
- **Erros:** `404 not_found`, `403 forbidden` (não é participante), `409 conflict` (disponibilidade mudou desde a exibição), `410 gone` (expirada/cancelada).
- **Regras executadas:** `AvailabilityEngine.recheck()` → transação → `Event.create()` → `MeetingRequest.markAccepted()` → publica evento de domínio `MeetingAccepted` (Outbox).
- **Ports envolvidos:** `CalendarRepository`, `AvailabilityRepository`, `NotificationGateway` (via outbox, assíncrono).
