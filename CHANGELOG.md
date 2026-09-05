# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui. Formato baseado em [Keep a Changelog](https://keepachangelog.com/) e [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Estrutura inicial de documentação (`docs/`): Product Brief, Strategy, Commercial, Competitors, Architecture, Database, API, Security, Threat Model, Privacy/LGPD, Testing, Deployment, Onboarding, Design System, Integrations, Roadmap, Decisions, Runbook.
- ADRs iniciais: arquitetura hexagonal, multi-tenancy, Neon Postgres, notificações via outbox, integração de calendários.
- Estrutura do monorepo (`apps/web`, `apps/mobile`, `packages/design-system`).
- Módulo `availability` completo (domain/ports/application/adapters/infrastructure/presentation) com `AvailabilityEngine` e endpoint `POST /api/v1/availability/check`.
- Módulo `identity` completo: cadastro, login, logout, refresh de sessão (com rotação de refresh token), verificação de e-mail e redefinição de senha. Endpoints `POST /api/v1/auth/{register,login,logout,refresh,verify-email}`, `POST /api/v1/auth/password-reset/{request,confirm}`, `GET /api/v1/auth/me`.
- Guard de autenticação compartilhado (`requireAuth`) aplicado à rota `/api/v1/availability/check`, fechando a lacuna de rota desprotegida da entrega anterior.
- ADR-006: estratégia de autenticação (JWT de acesso + refresh token opaco rotativo, bcrypt, anti-enumeration).
- Schema Prisma estendido com o modelo `AuthToken` (verificação de e-mail / redefinição de senha).
- 45 testes automatizados (unitários + segurança) cobrindo `AvailabilityEngine` e todo o módulo `identity`; `tsc --noEmit` limpo.
- Módulo `scheduling` completo: CRUD de eventos (criar, ler, atualizar, excluir) e listagem de calendário por intervalo, com checagem de ownership/participante (proteção contra IDOR) e provisionamento automático do calendário pessoal no cadastro. Endpoints `POST /api/v1/events`, `GET/PATCH/DELETE /api/v1/events/:id`, `GET /api/v1/calendar`.
- 24 novos testes (domínio, casos de uso e segurança de rota), totalizando 69 testes.
- Fluxo de contribuição alterado para branch por feature + Pull Request + merge (em vez de push direto em `main`).
- Módulo `circles` completo: criar/renomear/excluir círculo, adicionar/remover/listar membros. Círculos pertencem ao workspace pessoal do criador; apenas quem gerencia o workspace pode administrar, membros podem visualizar a lista. Endpoints `POST/GET /api/v1/circles`, `PATCH/DELETE /api/v1/circles/:id`, `GET/POST /api/v1/circles/:id/members`, `DELETE /api/v1/circles/:id/members/:userId`.
- 21 novos testes (domínio, casos de uso e segurança de rota), totalizando 90 testes.
- Modelo Prisma `CircleMember` ganhou `createdAt`.
- **Correção:** `AvailabilityRepository` do módulo `availability` passou a consultar calendários/eventos reais via Prisma (`PrismaAvailabilityRepository`), substituindo o repositório em memória sempre vazio usado até então (todo `/api/v1/availability/check` retornava `AVAILABLE` incondicionalmente).
- `scheduling`: `GET /api/v1/calendar` agora também mostra eventos em que o usuário é apenas participante (não só dono do calendário), necessário para o encontro confirmado aparecer na agenda de ambas as partes.
- Módulo `meeting-requests` completo: criar solicitação, aceitar (com revalidação de disponibilidade e proteção contra condição de corrida), negar (com/sem mensagem), contrapropor (histórico completo preservado) e cancelar. Regra de negociação: só quem não fez a proposta corrente pode responder. Endpoints `POST/GET /api/v1/meeting-requests`, `POST /api/v1/meeting-requests/:id/{accept,decline,counter-proposal,cancel}`.
- ADR-007 documenta a estratégia de negociação e concorrência.
- Modelo Prisma `MeetingRequest` ganhou `declineMessage`.
- 34 novos testes (domínio de negociação, casos de uso, condição de corrida, segurança de rota), totalizando 124 testes (+1 marcado como integração, pendente de banco real).
- Módulo `priority` completo: `PriorityEngine` (domínio puro), CRUD de regras (`PERSON`/`CIRCLE`/`PLACE`/`EVENT_TYPE` × `LOW`/`NORMAL`/`HIGH`/`MAXIMUM`), sempre privado ao próprio usuário. Endpoints `GET/POST /api/v1/priority/rules`, `DELETE /api/v1/priority/rules/:targetType/:targetId`.
- `GET /api/v1/meeting-requests?box=received` agora ordena por prioridade por padrão (`sort=priority`), calculada via círculos em comum e regras do destinatário; `sort=recent` mantém a ordem cronológica.
- ADR-008 documenta o design do Priority Engine.
- 15 novos testes (domínio do engine, casos de uso, ordenação, segurança de rota), totalizando 139 testes.
