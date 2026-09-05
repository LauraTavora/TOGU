# ADR-012 — Auditoria

## Status
Aceito.

## Contexto
docs/SECURITY.md §Auditoria e docs/PRODUCT.md §62 exigem registrar eventos importantes de segurança (`LOGIN`, `PASSWORD_CHANGED`, `CALENDAR_CONNECTED`, `EVENT_CREATED`, `EVENT_UPDATED`, `EVENT_DELETED`, `REQUEST_ACCEPTED`, `REQUEST_REJECTED`, `PERMISSION_CHANGED`, `ACCOUNT_DELETED`), nunca incluindo senhas, tokens ou dados sensíveis.

## Decisão

### Kernel compartilhado
`shared/audit` define o port `AuditLogger` (`record({ action, actorId?, workspaceId?, metadata? })`) e o adapter `PrismaAuditLogger`, escrevendo na tabela `AuditLog` já prevista desde a primeira entrega. Mesma categoria de infraestrutura compartilhada que `shared/outbox` e `shared/rate-limit` — nenhum módulo de domínio "dono" da tabela de auditoria.

### Best-effort por design
`PrismaAuditLogger.record()` nunca propaga exceção — captura qualquer falha de escrita e apenas loga no console. Uma indisponibilidade momentânea do subsistema de auditoria não pode derrubar login, criação de evento ou aceite de solicitação. Esta é uma escolha deliberada e diferente do padrão usado no Outbox (ADR-004/009), que precisa de garantia de entrega para notificações; aqui, perder ocasionalmente uma entrada de auditoria sob falha é um risco aceito, documentado, e não o inverso (bloquear a ação de negócio por causa do log).

### Onde foi conectado nesta entrega
| Ação | Módulo | Ponto de instrumentação |
|---|---|---|
| `LOGIN` | `identity` | `LoginUseCase`, após autenticação bem-sucedida |
| `PASSWORD_CHANGED` | `identity` | `ResetPasswordUseCase`, após trocar a senha |
| `EVENT_CREATED` | `scheduling` | `CreateEventUseCase` |
| `EVENT_UPDATED` | `scheduling` | `UpdateEventUseCase` |
| `EVENT_DELETED` | `scheduling` | `DeleteEventUseCase` |
| `REQUEST_ACCEPTED` | `meeting-requests` | `AcceptMeetingRequestUseCase` |
| `REQUEST_REJECTED` | `meeting-requests` | `DeclineMeetingRequestUseCase` |

`metadata` carrega apenas identificadores (ex.: `eventId`, `meetingRequestId`) — nunca o conteúdo do evento/solicitação em si.

### Fora de escopo nesta entrega
`CALENDAR_CONNECTED` (integração de calendário externo — módulo ainda não construído), `PERMISSION_CHANGED` (não há hoje um caso de uso de conceder/revogar `CalendarPermission` explicitamente) e `ACCOUNT_DELETED` (deleção de conta — seção 104 do PRD, não implementada). Os três permanecem no enum `AuditAction` do schema, prontos para uso assim que os módulos correspondentes existirem — não são retrabalho, apenas instrumentação pendente.

## Consequências
- Nenhum endpoint de leitura de auditoria existe ainda (seria parte do futuro TOGU Admin, seção 105 do PRD) — os registros hoje só são consultáveis diretamente no banco.
- `workspaceId` não é preenchido em nenhuma das instrumentações desta entrega (sempre `undefined`) — os casos de uso atuais não tinham essa informação prontamente disponível sem uma consulta adicional; aceitável porque `actorId` já identifica quem fez o quê, e `workspaceId` é opcional no schema.
