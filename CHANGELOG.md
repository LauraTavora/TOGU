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
