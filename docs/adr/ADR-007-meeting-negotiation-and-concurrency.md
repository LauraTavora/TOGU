# ADR-007 — Negociação de encontros e proteção contra condição de corrida

## Status
Aceito.

## Contexto
O módulo `meeting-requests` amarra `availability`, `scheduling` e `circles` no fluxo central do produto (seção 114 do PRD): solicitar → checar disponibilidade → aceitar/negar/contrapropor. Duas preocupações centrais:
1. Nunca confiar no estado de disponibilidade exibido anteriormente ao aceitar (seção 22).
2. Evitar dupla reserva quando duas respostas chegam quase simultaneamente (seção 66).

## Decisão

### Quem pode responder
A parte que apresentou a proposta de horário **atualmente em aberto** (o requester, na primeira oferta, ou o autor da contraproposta mais recente) nunca pode aceitar/negar/contrapropor a própria oferta — apenas a "outra parte" responde. Isso generaliza corretamente tanto o caso 1:1 quanto múltiplas rodadas de negociação, sem precisar modelar "de quem é a vez" explicitamente: basta olhar quem propôs por último.

### Revalidação de disponibilidade
`AcceptMeetingRequestUseCase` sempre reconsulta o `AvailabilityChecker` (adapter que delega ao módulo `availability`) no horário efetivo (original ou da última contraproposta) antes de materializar o evento. `SOFT_CONFLICT` não bloqueia; apenas `HARD_CONFLICT` impede o aceite.

### Proteção contra condição de corrida
`MeetingRequestRepository.updateStatus` é uma escrita condicional: só aplica a mudança se o registro ainda estiver em um status aberto (`PENDING`/`COUNTER_PROPOSED`) no momento exato da escrita. No Prisma isso é feito com `updateMany({ where: { id, status: { in: OPEN_STATUSES } } })` e checagem de `count === 0`. Se duas respostas concorrentes chegam, a segunda falha e o caso de uso traduz isso em `MeetingRequestConcurrentlyModifiedError`, pedindo para o cliente atualizar a tela — em vez de criar dois eventos ou sobrescrever silenciosamente o resultado.

### Ports cruzando módulos
`meeting-requests` não importa `availability`/`scheduling` diretamente em seu domínio — define os ports `AvailabilityChecker` e `EventCreator`, cujos adapters (`AvailabilityModuleChecker`, `SchedulingModuleEventCreator`) chamam os casos de uso públicos desses módulos. O evento confirmado é criado no calendário do requester, com os demais participantes associados via `EventParticipant`; a visibilidade no calendário de cada participante é resolvida pelo `scheduling` (`findVisibleToUserInRange`), não duplicando o registro do evento por pessoa.

### Correção retroativa
Esta entrega também substitui o `AvailabilityRepository` do módulo `availability`, que até então rodava sobre um repositório em memória sempre vazio (retornava `AVAILABLE` para qualquer consulta). Um `PrismaAvailabilityRepository` real agora consulta os calendários pessoais e eventos reais dos participantes — sem essa correção, a revalidação de disponibilidade no aceite seria sempre um "sim" vazio.

## Consequências
- Nenhuma transação de banco cruza os módulos `meeting-requests`→`scheduling` (são chamadas de use case sequenciais, não uma transação Prisma única) — uma falha entre criar o evento e atualizar o status deixaria o evento órfão. Aceitável para o MVP; mitigação futura via Transactional Outbox (ADR-004) ou uma transação Prisma explícita quando os dois módulos compartilharem o mesmo `PrismaClient` de forma mais direta.
- O teste de "caminho feliz" de `POST /api/v1/availability/check` agora exige um Postgres real e foi movido para a categoria de teste de integração (`it.skip` no arquivo, documentado).
