# ADR-018 — Página Explorar (descoberta de eventos)

## Status
Aceito.

## Contexto
O módulo `discovery` já tinha busca por raio/data/categoria/gratuidade, "Quero ir"/"Não quero mais", "Adicionar à agenda" e contagem de interesse do círculo, todos implementados e testados (ADR-010), mas nenhuma UI. Diferente das páginas anteriores, esta não tinha lacuna de backend a fechar — o desafio aqui era só de UI, mais a origem geográfica que a busca exige (`latitude`/`longitude`).

## Decisão

### Geolocalização do navegador, com fallback documentado
A página chama `navigator.geolocation.getCurrentPosition`; se a API não existir, o usuário negar a permissão, ou o pedido expirar (timeout de 5s), cai para uma coordenada fixa de São Paulo (`FALLBACK_LOCATION`) — a mesma região dos três eventos de exemplo do `MockEventDiscoveryProvider` (ADR-010), então a busca continua útil em ambiente de desenvolvimento mesmo sem geolocalização real. Um aviso visível informa quando o fallback está em uso, em vez de fingir que é a localização real do usuário.

### Janela de busca fixa em 30 dias, sem seletor de período
Reduz a superfície da primeira entrega — igual à decisão já tomada na página de Calendário (ADR-015) de deixar visões futuras (Dia/Mês/Timeline) para depois. Se um período diferente virar necessidade real, é um filtro a mais na mesma query string.

### Filtros aplicam busca automaticamente, exceto o raio
Categoria e "somente gratuito" são pills clicáveis que disparam nova busca na hora (mesmo padrão da Central de Solicitações — ADR-016). O raio é um campo numérico: mudar de ideia dígito a dígito não deveria disparar uma requisição por tecla, então o valor só é aplicado ao perder o foco do campo ou pressionar Enter.

### Interesse do círculo buscado em lote, após a busca principal
Para cada evento retornado pela busca, a página chama `GET /api/v1/discovery/events/:id/circle-interest` em paralelo (`Promise.all`) — mesmo padrão de resolução em lote já usado nas páginas de Solicitações e Círculos. Só mostra o texto quando a contagem é maior que zero, evitando poluir cada card com "0 pessoas do seu círculo".

### "Adicionar à agenda" não é idempotente — a UI trata isso com estado local
`AddNearbyEventToAgendaUseCase` cria um evento novo a cada chamada, sem checar se já existe um (não há esse conceito no backend). Para evitar cliques duplos criando compromissos repetidos, o botão vira "Na agenda" e fica desabilitado após o primeiro sucesso — mas é um estado só do card em memória: recarregar a página não sabe que aquele evento já foi adicionado antes. Documentado aqui como limitação conhecida, não escondido.

### Fora de escopo nesta entrega
- **Convidar alguém para o evento**: como já registrado na ADR-010, isso é coberto pelo fluxo genérico de `POST /api/v1/meeting-requests`, não por um botão dedicado nesta tela.
- **Planejar um Rolê** (cruzar eventos com disponibilidade de um grupo): feature de diferenciação futura, fora de escopo.
- Popular o catálogo (`NearbyEvent`) continua sendo responsabilidade de `POST /api/v1/internal/sync-nearby-events` (protegida por segredo, chamada por um worker/cron) — esta página só lê o catálogo já sincronizado, nunca aciona sincronização.

## Consequências
- Sem navegador real disponível neste ambiente de desenvolvimento (mesma lacuna registrada desde a ADR-013), a interação client-side (geolocalização, filtros, salvar/adicionar) não pôde ser exercitada ponta a ponta aqui — verificação limitada a `next build` limpo e `next dev` respondendo `200`/`401` corretamente via `curl`. Também não há `.env`/banco real neste ambiente, então o catálogo local está sempre vazio nos testes manuais possíveis.
- Nenhum teste automatizado novo nesta entrega (nenhuma rota de API nova foi criada — só consumo do que já existia); mantém a mesma lacuna de testes de renderização de componente das entregas de UI anteriores.
