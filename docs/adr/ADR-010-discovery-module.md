# ADR-010 — Módulo Discovery (Explore)

## Status
Aceito.

## Contexto
O TOGU precisa descobrir eventos próximos (docs/PRODUCT.md §32) sem se acoplar a um único provedor externo (§33), permitir "Adicionar à agenda" (§34), "Quero ir" (§35) e mostrar interesse do círculo social — sem nunca fazer scraping.

## Decisão

### Desacoplamento de provedor
`EventDiscoveryProvider` é um port que retorna eventos brutos de uma busca por período; hoje implementado por `MockEventDiscoveryProvider` (dados fixos, documentado como placeholder). `SyncNearbyEventsUseCase` consulta o provedor e faz upsert (por `providerRef`) na tabela local `NearbyEvent`, que funciona como cache/catálogo local. A busca do usuário (`SearchNearbyEventsUseCase`) sempre lê do catálogo local, nunca do provedor diretamente — trocar de provedor no futuro (Eventbrite, Sympla, etc.) significa escrever um novo adapter, sem tocar em nenhum caso de uso.

### Filtro por raio: domínio puro + banco fazendo o filtro grosso
Calcular distância geográfica exata (Haversine) diretamente em SQL exigiria uma extensão como PostGIS, não disponível no schema atual. Em vez disso, o repositório filtra pela faixa de data/categoria/gratuidade (barato para o banco fazer), e a camada de aplicação aplica `distanceKm` (função pura testável em `domain/haversine.ts`) para filtrar por raio e ordenar por proximidade. Aceitável para o volume esperado do MVP; se o catálogo crescer muito, a otimização futura é indexar por geohash ou adotar PostGIS.

### "N pessoas do seu círculo também querem ir"
Implementado como contagem, não como lista de nomes — `CountCircleInterestUseCase` resolve todos os "colegas de círculo" do usuário (qualquer pessoa que compartilhe algum círculo, via `CircleFellowsResolver`, adapter que consulta `CircleMember` diretamente, no mesmo padrão já usado em `priority`/`meeting-requests`) e conta quantos deles também salvaram aquele evento. Retornar apenas o número, não os nomes, é uma escolha conservadora de privacidade para esta primeira versão — mostrar "quem" exigiria decidir explicitamente se isso respeita as mesmas regras de visibilidade de `docs/PRIVACY-LGPD.md`.

### Adicionar à agenda
`AddNearbyEventToAgendaUseCase` delega ao módulo `scheduling` via o port `AgendaEventCreator` (mesmo padrão do `EventCreator` de `meeting-requests`). Quando o provedor não informa horário de término, assume-se duração padrão de 2 horas — documentado no código, não escondido.

### Fora de escopo nesta entrega
- **"Convidar alguém" para um evento descoberto** (§34) não ganhou um endpoint dedicado: o fluxo já é coberto pela API genérica `POST /api/v1/meeting-requests` (o cliente monta a solicitação com título/local/horário do evento). Construir uma orquestração específica "convide para este NearbyEvent" ficaria redundante com o que já existe.
- **Planejar um Rolê** (§36 — cruzar eventos descobertos com disponibilidade de um grupo) é uma feature de diferenciação futura explicitamente sinalizada como tal no PRD, e depende de combinar `discovery` + `availability` + `priority` de forma nova; não implementada nesta entrega.
- Sincronização real com um provedor de eventos autorizado (a API mock precisa ser substituída antes de produção).

## Consequências
- `POST /api/v1/internal/sync-nearby-events`, protegida por segredo compartilhado, é o ponto de entrada para um worker/cron popular o catálogo periodicamente em produção — hoje precisa ser chamada manualmente ou por um job externo, não há agendamento automático configurado.
