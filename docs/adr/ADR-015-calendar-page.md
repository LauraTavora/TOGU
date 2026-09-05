# ADR-015 — Página de Calendário (visões Agenda e Semana)

## Status
Aceito.

## Contexto
docs/PRODUCT.md §13 pede visões de Dia, Semana, Mês, Agenda e Timeline, com criar/editar/excluir/duplicar, arrastar, redimensionar, recorrência, participantes, local, link online, notas, cores, categorias e lembretes. É a tela mais complexa do produto — construir tudo de uma vez arriscaria entregar algo raso em todas as frentes.

## Decisão — escopo desta entrega

### Duas visões: Agenda e Semana
- **Agenda**: lista os próximos 14 dias, eventos agrupados por dia, ordenados por horário. Implementação simples, baixo risco, alto valor imediato.
- **Semana**: grade de 7 dias × 24 horas (`client/scheduling/week-grid.tsx`), eventos posicionados por `top`/`height` calculados como fração do dia (`fractionOfDay`, domínio puro testável). Clicar numa célula vazia abre o formulário de criação já com a data/hora daquele slot preenchida; clicar num evento abre para edição.

Dia, Mês e Timeline **não foram implementados nesta entrega** — ficam para as próximas, reaproveitando a mesma infraestrutura (fetch por intervalo, `EventFormDialog`, mapeamento de status).

### Novo componente no Design System: `Dialog`
Criado agora porque o Calendário é o primeiro fluxo que realmente precisa de um modal (criar/editar evento sem navegar para outra página). Implementação própria, sem dependência externa: overlay + painel, fecha em `Esc` ou clique fora, `role="dialog"` + `aria-modal`. Em telas pequenas ocupa a largura toda por baixo (bottom-sheet-like), não um modal centralizado minúsculo — evita "modal maior que o viewport" (docs/PRODUCT.md §46). Também foi adicionado `Textarea` (mesmo padrão visual do `Input`) para o campo de notas.

### Formulário de evento — campos mínimos
Título, data, horário de início/fim e local/notas opcionais. Os demais campos que a seção 13 pede — recorrência, participantes, cores/categorias, lembretes, anexos, presencial/online/híbrido explícito — não estão no formulário ainda. O backend já aceita esses campos (`createEventRequestSchema`/`updateEventRequestSchema`); a UI é que ainda não os expõe. Ao criar sem especificar, o evento nasce com os padrões do backend (`BUSY`, `BUSY_ONLY`, `IN_PERSON`).

### Sem drag-and-drop nem redimensionamento
Mover ou redimensionar um evento arrastando exigiria lógica de detecção de arraste + `PATCH` otimista + tratamento de conflito — deixado para depois. Por ora, mudar horário de um evento é feito reabrindo o formulário (clique no evento → editar → salvar).

### Cores dos blocos na grade ≠ `StatusIndicator`
`StatusIndicator` (verde/âmbar/vermelho/roxo) é sobre disponibilidade vista por terceiros (docs/DESIGN-SYSTEM.md §Componentes de status). Dentro da própria grade do usuário, isso não faz sentido da mesma forma — um compromisso `BUSY` não é um "problema vermelho" na sua própria agenda. Os blocos da grade usam o roxo primário (cor de marca) para `BUSY`/`PRIVATE_BUSY`, âmbar para `SOFT_HOLD`, verde para `AVAILABLE` (raro na prática). A visão Agenda, por outro lado, usa o `StatusIndicator` de fato ao lado de cada item — mostrando explicitamente o estado (é uma leitura rápida em lista, não uma grade visual), consistente com o padrão já usado na Home.

## Consequências
- A tela cobre o caso de uso central (seção 114 do PRD): criar, ver e gerenciar compromissos próprios. Convidar participantes numa solicitação continua sendo feito via `meeting-requests` (que já tem lógica própria de negociação) — o formulário do Calendário serve para compromissos pessoais diretos, não para solicitar um encontro com outra pessoa.
- Nenhum teste de renderização (mesma lacuna já registrada na ADR-013); os utilitários de data puros (`date-utils.ts`) ganharam testes unitários completos, já que são a parte com lógica real e testável sem DOM.
