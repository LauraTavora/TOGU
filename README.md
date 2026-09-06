# Fechô

![Logo do Fechô](docs/assets/logo.png)

**Versão 1.0.0** (em desenvolvimento — ver `CHANGELOG.md`)

> Seu tempo. Suas pessoas. Juntos.

## O que é o Fechô

Fechô é uma plataforma social de organização de tempo, encontros, compromissos e experiências — não apenas um calendário digital. Ela combina três elementos centrais: **Tempo + Pessoas + Prioridade**, permitindo que pessoas compartilhem disponibilidade (sem expor compromissos), encontrem horários em comum, negociem encontros e descubram eventos próximos alinhados à disponibilidade real de seus círculos sociais.

Documentação completa de produto em [`docs/PRODUCT.md`](docs/PRODUCT.md).

## Problema resolvido

Marcar algo com outra pessoa hoje exige um vaivém manual entre apps de mensagem e calendários que não conversam entre si, não respeitam prioridade social e não oferecem negociação nativa de horário. Ver detalhamento em [`docs/STRATEGY.md`](docs/STRATEGY.md) e comparação com concorrentes em [`docs/COMPETITORS.md`](docs/COMPETITORS.md).

## Principais funcionalidades

- Calendário próprio (dia/semana/mês/agenda/timeline) com estados `Available`, `Soft Hold`, `Busy`, `Private Busy`.
- Circles — agrupamento social de contatos (família, amigos, igreja, trabalho, faculdade...).
- Priority Engine — prioridade privada por pessoa, círculo, local e tipo de evento.
- Central de Solicitações — enviar, receber, aceitar, negar, contrapropor e cancelar encontros.
- Availability Engine — checagem de conflito em tempo real, multiparticipante.
- Smart Slots — sugestão automática dos melhores horários.
- Explore — descoberta de eventos próximos por geolocalização e categoria.
- Planejar Rolê — cruzamento de eventos com disponibilidade real do grupo.
- Convites externos via link seguro para quem ainda não usa o Fechô.
- Notificações multi-canal (in-app, push, e-mail; WhatsApp futuro).

## Arquitetura

O Fechô usa **Arquitetura Hexagonal (Ports and Adapters)** de forma obrigatória: o domínio nunca conhece Next.js, React, Prisma, Neon, Vercel ou qualquer API externa — apenas entidades, Value Objects, regras e casos de uso, expostos via interfaces (ports) e implementados em adapters substituíveis.

```text
src/modules/<modulo>/
  domain/          # Entidades, Value Objects, regras puras
  application/     # Casos de uso
  ports/           # Interfaces (Repository, Gateway, Provider)
  adapters/        # Implementações concretas (Prisma, e-mail, mapas...)
  infrastructure/  # Wiring, config, DI
  presentation/    # Route Handlers / Server Actions
```

Detalhamento completo, diagrama de módulos, multi-tenancy e sistema de planos em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Tecnologias

| Camada | Stack |
|---|---|
| Web | React, TypeScript, Next.js (App Router), Tailwind CSS |
| Mobile | React Native, TypeScript, Expo |
| Backend | Next.js Route Handlers / Server Actions (adapters de entrada) |
| Banco | PostgreSQL — local em dev, **Neon** obrigatório em produção |
| ORM | Prisma (padrão) |
| Deploy web | Vercel (Development / Preview / Production) |
| Deploy mobile | Expo / EAS (Android e iOS) |

## Estrutura de diretórios

```text
apps/
  web/               # Next.js
  mobile/            # React Native + Expo
packages/
  design-system/     # tokens + componentes React
  sdk/               # cliente HTTP tipado (web hoje, mobile depois)
  schemas/           # validação runtime compartilhada (Zod)
  database/          # schema Prisma + client compartilhado
docs/
  adr/               # Architecture Decision Records
  PRODUCT.md, ARCHITECTURE.md, DATABASE.md, API.md, SECURITY.md,
  THREAT-MODEL.md, PRIVACY-LGPD.md, TESTING.md, DEPLOYMENT.md,
  ONBOARDING.md, DESIGN-SYSTEM.md, INTEGRATIONS.md, COMMERCIAL.md,
  STRATEGY.md, COMPETITORS.md, ROADMAP.md, RUNBOOK.md, DECISIONS.md
CHANGELOG.md
.env.example
```

## Instalação

> Scaffolding de código (Next.js/Expo/Prisma) ainda será adicionado incrementalmente — ver `docs/ROADMAP.md` e o changelog para o estado atual. Os passos abaixo refletem o fluxo alvo do monorepo.

```bash
# instalar dependências (a partir da raiz do monorepo)
npm install

# copiar variáveis de ambiente
cp .env.example .env.local
```

## Variáveis de ambiente

Ver [`.env.example`](.env.example). Segredos são exclusivamente server-side; nenhuma variável privada usa o prefixo `NEXT_PUBLIC_`. Ambientes de development, preview e production usam credenciais separadas — ver [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) e [`docs/SECURITY.md`](docs/SECURITY.md).

## Banco de dados e migrations

PostgreSQL local em desenvolvimento; **Neon PostgreSQL** obrigatório em produção. Migrations são versionadas, testadas e nunca destrutivas sem estratégia de rollback explícita. Modelo de domínio e ERD inicial em [`docs/DATABASE.md`](docs/DATABASE.md).

```bash
# exemplo de fluxo Prisma (quando o schema for adicionado)
npx prisma migrate dev
npx prisma migrate deploy
```

## Testes

Unitários (domínio, `AvailabilityEngine`, `PriorityEngine`), integração (repositories/adapters) e E2E (fluxos críticos). Ver [`docs/TESTING.md`](docs/TESTING.md).

```bash
npm run test
npm run test:integration
npm run test:e2e
```

## Executar (web)

```bash
npm run dev --workspace apps/web
```

## Executar (mobile)

```bash
npm run start --workspace apps/mobile
```

## Deploy

Web via Vercel (Development/Preview/Production). Mobile via Expo/EAS para Android e iOS. Detalhes em [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Segurança

Security by Design e Privacy by Design como princípios fundamentais: nenhuma rota privada sem autenticação/autorização, nenhum dado sensível enviado ao frontend só para ser escondido visualmente, rate limiting, proteção contra OWASP Top 10, criptografia de tokens em repouso. Ver [`docs/SECURITY.md`](docs/SECURITY.md) e [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md). Privacidade e conformidade LGPD em [`docs/PRIVACY-LGPD.md`](docs/PRIVACY-LGPD.md).

## Troubleshooting

- **Erro de conexão com o banco:** confira `DATABASE_URL`/`DIRECT_URL` e se o Postgres local está rodando (dev) ou se as credenciais Neon do ambiente estão corretas (preview/prod).
- **Rotas privadas retornando 401/403:** verifique se a sessão/token está válido e se o usuário pertence ao `workspace_id` do recurso.
- **Migration falhou em produção:** siga [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — nunca reexecutar migration destrutiva sem revisão.

## Versão

A versão exibida em **Configurações → Sobre** é derivada automaticamente do versionamento semântico do projeto (`package.json` / tags de release). Ver [`CHANGELOG.md`](CHANGELOG.md).

## Squads

Product, UX/UI, Web, Mobile, Backend, Data, Security, DevOps, QA, AI & Automation, Growth & Commercial. Responsabilidades detalhadas nos documentos correspondentes em `docs/`.

## Documentação completa

Todos os documentos de produto, arquitetura, segurança e operação estão em [`docs/`](docs/), incluindo as [Architecture Decision Records](docs/adr/).
