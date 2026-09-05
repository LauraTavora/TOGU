# TOGU — Database

PostgreSQL. Desenvolvimento local via Postgres local; produção obrigatoriamente **Neon PostgreSQL**. ORM: Prisma (padrão), salvo ADR justificando alternativa.

Schema versionado em [`packages/database/prisma/schema.prisma`](../packages/database/prisma/schema.prisma), consumido apenas por adapters (nunca pelo domínio ou casos de uso diretamente).

## Modelo de domínio inicial (entidades)

```text
User, Profile
Workspace, Membership
Plan, Subscription, Entitlement, Feature, Limit

Calendar, CalendarPermission
Event, EventParticipant, EventRecurrence, EventReminder

MeetingRequest, MeetingParticipant, CounterProposal

Circle, CircleMember

PriorityRule, PriorityProfile

Friendship, Contact

Notification, NotificationPreference

ExternalCalendar, ExternalCalendarAccount

SavedEvent, NearbyEvent

AuditLog, Session, Invite
```

## ERD inicial (texto)

```text
User 1---1 Profile
User 1---N Membership N---1 Workspace
Workspace 1---N Calendar
Calendar 1---N Event
Calendar 1---N CalendarPermission N---1 User        (permissão de terceiros ver disponibilidade)
Event 1---N EventParticipant N---1 User
Event 1---0..1 EventRecurrence
Event 1---N EventReminder
Event 1---0..1 EventLocation (embutido ou tabela própria)

User 1---N MeetingRequest (as requester)
MeetingRequest 1---N MeetingParticipant N---1 User
MeetingRequest 1---N CounterProposal

Workspace 1---N Circle
Circle 1---N CircleMember N---1 User

User 1---N Friendship N---1 User (self-relation, cross-tenant permitido)

User 1---N PriorityProfile
PriorityProfile 1---N PriorityRule (target: person | circle | place | event_type)

User 1---N Notification
User 1---1 NotificationPreference

User 1---N ExternalCalendarAccount 1---N ExternalCalendar

User 1---N SavedEvent N---1 NearbyEvent

Workspace 1---N AuditLog
User 1---N Session
Workspace 1---N Invite
```

## Estados (evitar múltiplos booleanos)

```text
MeetingRequest.status: PENDING | ACCEPTED | DECLINED | COUNTER_PROPOSED | CANCELLED | EXPIRED
Event.availabilityState (por bloco): AVAILABLE | SOFT_HOLD | BUSY | PRIVATE_BUSY
Event.privacyLevel: PRIVATE | BUSY_ONLY | CIRCLE | PARTICIPANTS | PUBLIC
```

## Migrations

- Versionadas (Prisma Migrate).
- Toda migration destrutiva exige estratégia de rollback documentada no PR.
- Testadas em ambiente de staging antes de produção.
- Nenhuma alteração destrutiva em produção sem mecanismo explícito de proteção (flag de confirmação + revisão obrigatória).

## Índices previstos

Orientados pelas queries reais do `AvailabilityEngine` e da Central de Solicitações:

```text
Event(calendar_id, start_at, end_at)
Event(workspace_id, status)
MeetingRequest(status, created_at)
MeetingRequest(recipient_user_id, status)
CircleMember(circle_id, user_id)
Membership(user_id, workspace_id)
AuditLog(workspace_id, created_at)
```

## Segurança do banco

- TLS obrigatório (Neon já força TLS).
- Usuário de menor privilégio por ambiente.
- Credenciais separadas por ambiente (dev/preview/prod), nunca compartilhadas.
- Backups automáticos (Neon) + teste periódico de restore.
- Nenhum acesso direto do browser ao banco — sempre via camada de aplicação.
