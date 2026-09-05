# TOGU — Architecture

## 1. Princípio central: Arquitetura Hexagonal (Ports and Adapters)

Não negociável. Nenhuma regra de negócio importante depende diretamente de framework, banco de dados ou API externa.

```text
src/
  modules/
    <module>/
      domain/        # Entidades, Value Objects, regras puras
      application/   # Casos de uso (orquestram domínio + ports)
      ports/          # Interfaces (Repository, Gateway, Provider)
      adapters/       # Implementações concretas (Prisma, e-mail, mapas...)
      infrastructure/ # Wiring, config, DI
      presentation/   # Route Handlers / Server Actions (adapters de entrada)
```

O domínio nunca conhece Next.js, React, Prisma, Neon, Vercel, ou qualquer API externa. Conhece apenas entidades, Value Objects, regras e casos de uso, expostos via interfaces (ports):

```text
CalendarRepository
AvailabilityRepository
NotificationGateway
EventDiscoveryProvider
GeolocationProvider
MeetingProvider
EmailProvider
PushNotificationProvider
```

As implementações concretas vivem em `adapters/`, permitindo trocar fornecedores (ex: Google Meet → Zoom, SendGrid → Resend) sem tocar no domínio.

## 2. Módulos previstos

```text
identity          (User, Session, Auth, Workspace, Membership)
billing           (Plan, Subscription, Entitlement, Feature, Limit)
scheduling         (Calendar, Event, EventParticipant, Recurrence, Reminder)
availability       (AvailabilityEngine, buffers, deslocamento)
meeting-requests   (MeetingRequest, CounterProposal, negociação)
priority           (PriorityEngine, PriorityRule, PriorityProfile)
circles            (Circle, CircleMember, Friendship, Contact)
notifications      (Notification, NotificationPreference, Outbox)
discovery          (Explore, NearbyEvent, SavedEvent, EventDiscoveryProvider)
integrations       (ExternalCalendar, ExternalCalendarAccount, OAuth)
invites            (Invite, link externo seguro)
audit              (AuditLog)
```

## 3. Diagrama de módulos (dependências)

```text
presentation (Next.js Route Handlers / Server Actions)
        │
        ▼
application (casos de uso por módulo)
        │
        ▼
domain (regras puras, sem dependências externas)
        ▲
        │ implementa ports
adapters (Prisma, e-mail, push, mapas, provedores de eventos, OAuth)
```

Módulos se comunicam entre si apenas via ports/casos de uso publicados — nunca importando `domain`/`adapters` internos uns dos outros diretamente. Eventos de domínio (`MeetingAccepted`, `EventCancelled`...) desacoplam módulos como `meeting-requests` → `notifications` (ver Outbox Pattern, `DECISIONS.md`).

## 4. Multi-tenant

Toda conta possui um **Personal Workspace** desde o cadastro. Workspaces adicionais (Family, Friends, Team, Company, Community) são criados posteriormente.

- Toda tabela relevante possui `workspace_id` (tenant) com isolamento aplicado na camada de repository/adapter — nunca confiar apenas em filtro no frontend.
- Relacionamentos cross-tenant (convites, amizades, disponibilidade entre pessoas de workspaces diferentes, Circles) são modelados como **cross-tenant permission** explícita: uma tabela de grant (`CrossTenantGrant`/`Friendship`/`CircleMember`) autoriza a consulta pontual de disponibilidade sem remover isolamento do restante dos dados do tenant.
- Nunca usar "desligar tenant" como atalho para resolver um caso de uso cross-tenant.

## 5. Sistema de Planos (Entitlements)

Não usar checagens espalhadas (`if (plan === 'pro')`). Modelo:

```text
Plan            (FREE, PLUS, CIRCLE, BUSINESS)
Subscription    (workspace/usuário → plano ativo)
Feature         (feature.ai_scheduler, feature.external_calendars, ...)
Entitlement     (resolve Feature × Plan × Limit em tempo de execução)
Limit           (ex.: max_circles, max_members_per_circle)
```

Casos de uso consultam `EntitlementService.can(workspaceId, 'feature.smart_slots')`.

## 6. Monorepo

```text
apps/
  web/       # Next.js (App Router) — TypeScript, Tailwind
  mobile/    # React Native + Expo — TypeScript
packages/
  design-system/   # tokens, componentes, primitives
  domain/           # (opcional) núcleo de domínio compartilhável entre apps se aplicável
  sdk/              # cliente HTTP tipado consumido por web e mobile
  schemas/          # validação runtime compartilhada (ex.: Zod)
docs/
  adr/
```

Web e mobile compartilham tipos, schemas, SDK e Design Tokens — nunca componentes visuais forçados quando isso prejudica a experiência nativa (mobile usa componentes nativos próprios consumindo os mesmos tokens).

## 7. Concorrência e consistência

Ao aceitar uma `MeetingRequest`: recalcular disponibilidade → iniciar operação transacional → validar conflito novamente dentro da transação → criar evento → marcar solicitação como aceita. Uso de transação de banco + verificação otimista (versão/`updated_at`) para evitar dupla reserva em requisições simultâneas.

## 8. Timezone

Persistência sempre em UTC; timezone do usuário armazenado em `Profile` para apresentação. `AvailabilityEngine` e `PriorityEngine` operam em UTC internamente e convertem apenas na borda de apresentação.
