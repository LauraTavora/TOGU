# ADR-005 — Estratégia de integração com calendários externos

## Status
Aceito (arquitetura preparada; implementação de adapters concretos é incremental — ver `ROADMAP.md` v1.1).

## Contexto
O TOGU precisará futuramente sincronizar com Google Calendar, Microsoft Outlook e arquivos ICS, idealmente de forma bidirecional, sem acoplar o domínio a um provedor específico.

## Decisão
Definir o port `ExternalCalendarProvider` desde o início (mesmo antes de qualquer adapter concreto existir). Tokens OAuth de provedores externos são criptografados em repouso e nunca logados. Cada provedor é implementado como adapter isolado, ativável via feature flag/entitlement.

## Consequências
- Permite priorizar apenas um provedor no MVP e adicionar os demais depois sem retrabalho de domínio.
- Exige que o modelo de `ExternalCalendarAccount`/`ExternalCalendar` seja genérico o suficiente para múltiplos provedores desde o desenho inicial (`DATABASE.md`).
- Sincronização bidirecional real fica marcada como objetivo futuro, não obrigação do MVP.
