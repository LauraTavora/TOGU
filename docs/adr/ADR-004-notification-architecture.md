# ADR-004 — Arquitetura de Notificações via Transactional Outbox

## Status
Aceito.

## Contexto
Operações críticas (`MeetingAccepted`, `MeetingRejected`, `CounterProposalCreated`, `EventCancelled`) precisam gerar notificações confiavelmente. O risco a evitar: evento de domínio salvo, mas notificação nunca enviada por falha de rede/processo entre a transação e o envio.

## Decisão
Operações críticas publicam Domain Events. Para notificações críticas, utilizar **Transactional Outbox Pattern**: o evento é persistido na mesma transação da mutação de negócio, e um processo separado (worker/handler) lê a outbox e envia via `NotificationGateway` (in-app, push, e-mail; WhatsApp futuro), marcando como processado de forma idempotente.

## Consequências
- Garante que nenhuma notificação crítica se perde por falha momentânea do canal de envio.
- Exige processo de leitura da outbox (poller ou trigger) e handlers idempotentes.
- Desacopla módulos (`meeting-requests` não conhece `notifications` diretamente — comunica via evento de domínio).
