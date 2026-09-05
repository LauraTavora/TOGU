# ADR-009 — Implementação prática do Transactional Outbox

## Status
Aceito.

## Contexto
ADR-004 definiu a estratégia de notificações via Transactional Outbox para evitar o cenário "evento salvo, notificação perdida". Esta entrega implementa o módulo `notifications` e liga `meeting-requests` a ele. É preciso registrar honestamente onde a implementação atual se afasta do ideal descrito em ADR-004, e por quê.

## Decisão

### Contratos de evento compartilhados
Eventos de domínio emitidos por um módulo produtor (`meeting-requests`) e consumidos por outro (`notifications`) são definidos como um contrato neutro em `apps/web/src/shared/outbox/events/` — nem o produtor nem o consumidor dependem do código interno um do outro, apenas deste contrato (tipo de evento + payload). Isso permite adicionar novos produtores (ex.: `scheduling` emitindo `EVENT_CANCELLED` quando um evento é excluído diretamente) ou novos consumidores (ex.: um futuro `EmailDigestWorker`) sem acoplamento cruzado.

### Onde vive a outbox
A tabela `OutboxEvent` e os ports `OutboxEventPublisher`/`OutboxEventStore` vivem em `shared/outbox` — infraestrutura verdadeiramente compartilhada, não pertence a nenhum módulo de domínio específico (mesma categoria de `shared/auth` e `shared/http`).

### Desvio conhecido em relação ao ideal
ADR-004 descreve o evento sendo persistido **na mesma transação** da mutação de negócio. Nesta implementação, `meeting-requests` escreve o registro de negócio (ex.: `MeetingRequest.updateStatus`) e só depois, em uma chamada Prisma separada, publica o evento na outbox — não há uma transação Prisma compartilhada entre os dois. Isso significa que, no pior caso (o processo cai exatamente entre as duas escritas), a mutação de negócio é persistida mas o evento correspondente nunca é gerado, e a notificação nunca acontece — exatamente o cenário que o Outbox Pattern existe para prevenir.

Esse desvio é uma simplificação deliberada desta entrega, não do padrão em si: os módulos `meeting-requests` e `notifications` cada um tem seu próprio conjunto de repositórios com queries Prisma independentes, e não existe hoje um mecanismo de transação cruzando as chamadas de um caso de uso a outro. Fechar essa lacuna exigiria uma de duas mudanças arquiteturais: (a) um `TransactionManager` compartilhado, injetado tanto no `MeetingRequestRepository` quanto no `OutboxEventPublisher`, permitindo `prisma.$transaction([...])` sobre ambas as escritas; ou (b) mover a responsabilidade de emitir eventos para dentro do próprio Prisma (ex.: triggers/CDC), fora do código da aplicação. Ambas ficam registradas aqui como trabalho futuro, não implementadas agora.

### Processamento sem worker real
Não existe hoje um worker/cron rodando neste ambiente. Duas pontas foram criadas:
1. `POST /api/v1/internal/process-outbox` — protegido por segredo compartilhado (`INTERNAL_JOB_SECRET`), pensado para ser chamado por um Vercel Cron (ou equivalente) em produção, drenando a outbox periodicamente e de forma verdadeiramente assíncrona/desacoplada da requisição que gerou o evento.
2. `flushOutboxBestEffort()` — chamado nas próprias rotas de `meeting-requests` (criar, aceitar, negar, contrapropor, cancelar) logo após a ação principal ter sucesso. É uma conveniência para este ambiente de desenvolvimento sem infraestrutura de fila/cron: garante que a notificação apareça imediatamente, mas reintroduz acoplamento temporal entre a requisição HTTP e o processamento — o oposto do que o outbox deveria oferecer. Erros no flush são capturados e apenas logados; nunca derrubam a resposta da ação principal.

Em produção, a expectativa é desligar/ignorar o flush inline em favor exclusivo do worker agendado — a chamada best-effort deve ser vista como andaime (scaffolding) de desenvolvimento, não como a arquitetura-alvo.

### Idempotência
`ProcessOutboxUseCase` marca cada evento como processado somente depois de criar todas as notificações correspondentes. Se o processo falhar no meio, o evento permanece pendente e será reprocessado — os handlers (`handleMeetingRequestEvent`) são funções puras que apenas leem o payload, então reprocessar um evento parcialmente aplicado é seguro (na pior hipótese, cria notificações duplicadas se a falha ocorreu depois de criar algumas mas antes de marcar processado — aceitável para o MVP, não idealmente exatamente-uma-vez).

## Consequências
- Push e e-mail reais não são disparados ainda — apenas notificações in-app são materializadas (`Notification`). `NotificationPreference` já existe e é respeitada pela UI futura, mas nenhum adapter de push/e-mail para notificações foi conectado (o `ConsoleEmailProvider` existente é específico do módulo `identity`, para fluxos de autenticação).
- Antes de produção, revisar este ADR e decidir explicitamente entre fechar a lacuna transacional (opção a/b acima) ou aceitar o risco documentado para o volume esperado do MVP.
