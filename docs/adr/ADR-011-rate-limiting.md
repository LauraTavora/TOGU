# ADR-011 — Rate limiting

## Status
Aceito.

## Contexto
docs/SECURITY.md §Rate limiting exige limitação especialmente em `/login`, `/register`, `/password-reset`, `/invite`, `/search`, `/events`, `/availability`, considerando IP, usuário, tenant e endpoint.

## Decisão

### Port + adapter em memória
`shared/rate-limit` define o port `RateLimiter` (janela fixa por chave: `consume(key, limit, windowMs)`) e um adapter `InMemoryRateLimiter` (`Map` em memória do processo). Um helper `enforceRateLimit(identifier, { bucket, limit, windowMs })` compõe a chave como `${bucket}:${identifier}` e retorna uma resposta `429` pronta (com `Retry-After`) ou `null` quando a requisição pode seguir.

### Chave de identificação por tipo de rota
- Rotas públicas (antes de autenticação): identificador é o IP do cliente (`getClientIp`, lendo `x-forwarded-for`/`x-real-ip`).
- Rotas autenticadas: identificador é o `userId` (do `requireAuth`), não o IP — evita que várias pessoas atrás do mesmo NAT/proxy corporativo se bloqueiem mutuamente, e é mais preciso contra abuso por conta.

### Onde foi aplicado nesta entrega
| Rota | Chave | Limite |
|---|---|---|
| `POST /api/v1/auth/register` | IP | 5 / 15 min |
| `POST /api/v1/auth/login` | IP | 10 / 15 min |
| `POST /api/v1/auth/password-reset/request` | IP | 5 / hora |
| `POST /api/v1/auth/password-reset/confirm` | IP | 10 / hora |
| `POST /api/v1/availability/check` | userId | 60 / min |
| `GET /api/v1/discovery/events` (busca) | userId | 60 / min |
| `POST /api/v1/events` (criação) | userId | 30 / min |

O rate limit é sempre a primeira verificação da rota, antes de qualquer parsing de corpo ou acesso a banco — uma requisição bloqueada nunca chega a tocar o banco de dados.

### `/invite` e `/search` genérico
`/invite` ainda não existe como funcionalidade (módulo de convites externos, seção 38 do PRD, não implementado) — quando for construído, deve nascer com rate limiting por IP desde o primeiro commit, não como retrofit. Não existe uma rota `/search` genérica; `GET /api/v1/discovery/events` cumpre esse papel para descoberta de eventos.

## Limitação conhecida
`InMemoryRateLimiter` guarda contadores na memória do processo Node. Em produção na Vercel (serverless, múltiplas instâncias/regiões, cada invocação podendo rodar em uma instância fria diferente), cada instância tem seu próprio contador — o limite efetivo multiplica pelo número de instâncias ativas, não é um limite global confiável. Isso é aceitável para desenvolvimento e para o volume inicial do MVP, mas **antes de exposição pública em produção**, o adapter deve ser substituído por um armazenamento compartilhado e durável (Redis via Upstash é a opção mais comum no ecossistema Vercel) — nenhum caso de uso ou rota precisa mudar, apenas a implementação de `RateLimiter` injetada em `shared/rate-limit/instance.ts`.

## Consequências
- Proteção efetiva contra abuso básico (scripts sem distribuição de IP) desde já; não é proteção contra um ataque distribuído (DDoS) — isso continua sendo responsabilidade da camada de infraestrutura (WAF/CDN), conforme já registrado em docs/SECURITY.md §Proteção de infraestrutura.
