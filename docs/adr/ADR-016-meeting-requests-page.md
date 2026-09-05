# ADR-016 — Central de Solicitações (recebidas, enviadas e renegociação)

## Status
Aceito.

## Contexto
O módulo `meeting-requests` já tinha toda a lógica de negociação implementada e testada (aceitar, negar, contrapropor, cancelar, listagem por caixa/prioridade — ADR-007), mas nenhuma UI. Duas lacunas de backend impediam construir a tela corretamente:

1. As entidades só guardam `requesterId`/`participantUserIds` (ids) — não havia nenhum jeito de resolver quem é quem para exibir na tela.
2. Quando uma solicitação está `COUNTER_PROPOSED`, o horário renegociado fica só na tabela `CounterProposal`; o cliente nunca conseguia ver esse horário.

## Decisão

### Novo endpoint `GET /api/v1/users?ids=a,b,c`
`GetUsersPublicInfoUseCase` (módulo `identity`) devolve só `{id, email}` para até 50 ids, nunca `passwordHash` ou qualquer outro campo. **Não existe ainda um sistema de Profile/displayName** (nome de exibição, foto) — o e-mail é usado como identificador visível temporário. Isso é uma lacuna conhecida, não uma decisão de produto: quando `Profile` existir, este use case passa a devolver `displayName`/avatar em vez de e-mail, sem mudar a forma do endpoint.

### Novo endpoint `GET /api/v1/meeting-requests/:id/counter-proposals`
`ListCounterProposalsUseCase` reaproveita `getAllParties` (mesma função de domínio usada por `assertCanRespond`) para checar que só quem participa da solicitação pode ver as contrapropostas — devolve 403 (`ForbiddenMeetingRequestActionError`) para qualquer outra pessoa, 404 se a solicitação não existe.

### A UI replica uma pequena parte da lógica de negociação — só para decidir o que mostrar
`apps/web/src/client/meeting-requests/negotiation.ts` tem `resolveProposingPartyId`/`resolveEffectiveTimeRange`, espelhando `domain/negotiation.ts` do backend. Isso é **duplicação deliberada**, não um atalho perigoso: o cliente não pode importar `@/modules/meeting-requests` porque a barrel daquele módulo carrega `infrastructure/container.ts`, que importa `@togu/database` (Prisma) — inaceitável no bundle do navegador. A autorização real continua sendo sempre validada no servidor (`assertCanRespond` em cada use case); a versão client-side só decide se os botões de ação aparecem, nunca decide permissão de fato.

### Botões de ação são condicionados a quem "está com a bola"
- Aceitar / Negar / Propor outro horário aparecem só quando a solicitação está aberta (`PENDING`/`COUNTER_PROPOSED`) **e** o usuário atual não foi quem fez a última proposta (`resolveProposingPartyId`). Isso evita expor "Aceitar sua própria proposta", que o backend rejeitaria com `NotAResponderError` de qualquer forma.
- Cancelar aparece só na caixa Enviadas, para solicitações abertas — reflete `CancelMeetingRequestUseCase`, que só permite ao `requesterId` original.

### Semáforo de disponibilidade antes de aceitar
Para cada solicitação acionável, a página chama `POST /api/v1/availability/check` com `participantIds: [userId atual]` e o horário efetivo (original ou contraproposto), e mostra um `StatusIndicator` com rótulo contextualizado ("Você já tem um compromisso nesse horário" em vez do rótulo genérico "Ocupado"). É só uma prévia — `AcceptMeetingRequestUseCase` sempre recalcula a disponibilidade real no servidor antes de confirmar (ADR-007), então um estado "Disponível" desatualizado no cliente nunca resulta em conflito silencioso.

### Diálogo de negar: um único botão
Textarea opcional + botão "Negar" — sem confirmação extra. Mensagem vazia é tratada como "negar sem mensagem" (o schema `declineMeetingRequestSchema.message` é opcional). Segue o mesmo padrão visual de `EventFormDialog`/`Dialog` (fecha pelo X, sem botão "Cancelar" redundante).

### Diálogo de contraproposta: mesmo padrão de data/hora do formulário de evento
Reaproveita o parsing de data/hora local (`toDateInputValue`/`combineDateAndTime`) já usado em `EventFormDialog` (ADR-015), para evitar o mesmo bug de fuso horário que já foi corrigido lá.

## Consequências
- E-mail como identidade visível é uma dívida técnica explícita — deve ser revisitada assim que `Profile` (nome, foto) existir no PRD (seção de Perfil/Identidade).
- A tela busca contrapropostas e disponibilidade com `Promise.all` por solicitação individual — aceitável na escala atual (dezenas de solicitações por caixa), mas não otimizado para centenas; um endpoint de "batch" viria depois se a paginação da lista virar necessidade.
- Nenhum teste de renderização de componente (mesma lacuna registrada nas ADR-013/014/015); os dois novos endpoints ganharam teste de segurança (401 sem autenticação), seguindo o padrão já estabelecido no restante da API.
