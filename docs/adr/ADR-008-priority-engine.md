# ADR-008 — Priority Engine

## Status
Aceito.

## Contexto
O TOGU precisa ordenar a Central de Solicitações por prioridade privada do destinatário (pessoa, círculo, local, tipo de evento — docs/PRODUCT.md §17-18), sem nunca revelar a ninguém — nem ao próprio solicitante — qual prioridade foi atribuída a ele.

## Decisão

### Modelo de dados
Reaproveita `PriorityProfile`/`PriorityRule` já previstos no schema desde a primeira entrega (um perfil por usuário, uma regra por combinação `targetType`+`targetId`, upsert idempotente).

### PriorityEngine (domínio puro)
`resolveLevel(rules, context)` retorna o maior nível (`LOW < NORMAL < HIGH < MAXIMUM`) entre as regras que combinam com o contexto (pessoa, círculos em comum, local, tipo de evento) — na ausência de qualquer regra, o padrão é `NORMAL`.

`computeScore(rules, context, now)` combina o nível (parte inteira do score) com um componente de urgência fracionário e saturante — `1 - 1/(1 + horasDesdeCriação/24)` — que nunca ultrapassa `1`, portanto nunca faz uma solicitação de nível menor superar uma de nível maior. Dentro do mesmo nível, quanto mais tempo esperando, maior o score — implementando "prioridade, depois data de chegada, mais antiga primeiro" (seção 20) como um único score ordenável, em vez de dois critérios de sort separados.

### Privacidade
Toda leitura de regras (`ListPriorityRulesUseCase`) é sempre escopada ao próprio `userId` autenticado — não existe endpoint para consultar a prioridade atribuída por outra pessoa. O score computado para ordenar solicitações nunca é exposto na resposta da API — apenas usado internamente para ordenar a lista.

### Integração com `meeting-requests`
Definido o port `PriorityRanker` em `meeting-requests`, implementado pelo adapter `PriorityModuleRanker`: resolve os círculos em comum entre destinatário e solicitante (consulta direta a `CircleMember`, sem depender dos casos de uso do módulo `circles`) e delega o cálculo ao `ComputePriorityScoreUseCase` do módulo `priority`. `GET /api/v1/meeting-requests?box=received` ordena por prioridade por padrão; `sort=recent` ignora o Priority Engine e usa `createdAt desc`.

## Consequências
- Nenhuma regra de prioridade por local (`PLACE`) ou tipo de evento (`EVENT_TYPE`) está integrada à ordenação de `meeting-requests` ainda — o `PriorityEngine` já suporta esses alvos, mas o adapter atual só popula `personId`/`circleIds` no contexto. Extensão futura: passar `location`/`meetingKind` da solicitação como `place`/`eventType`.
- O cálculo de círculos em comum roda duas queries por solicitação ao ordenar uma lista — aceitável para o volume esperado do MVP; otimização futura em lote se necessário (docs/PRODUCT.md §92 — Performance).
