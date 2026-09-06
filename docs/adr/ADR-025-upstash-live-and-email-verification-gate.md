# ADR-025 — Upstash configurado em produção e login passa a exigir e-mail verificado

## Status
Aceito.

## Contexto
Duas coisas pendentes depois do primeiro deploy (ADR-024): configurar Upstash/Resend em produção (rate limiting e e-mail continuavam nos fallbacks de desenvolvimento — ADR-023), e corrigir o gap encontrado ali mesmo: `LoginUseCase` nunca verificava `emailVerifiedAt`, então qualquer conta conseguia logar e usar o produto inteiro sem nunca confirmar o e-mail.

## Decisão

### Upstash configurado; Resend fica pendente — não é uma escolha técnica, é falta de domínio
`vercel integration add upstash/upstash-kv --plan free` provisionou Redis de verdade e conectou ao projeto. Duas notas práticas do processo:
- O slug do produto não é intuitivo: `upstash-redis` não existe — o produto "Upstash for Redis" é exposto como `upstash-kv` (nome herdado do antigo Vercel KV, que era Upstash por baixo).
- A integração usa as variáveis `KV_REST_API_URL`/`KV_REST_API_TOKEN` (convenção do Vercel KV), não `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (convenção do SDK `@upstash/redis` usada em `UpstashRateLimiter`, ADR-023). Resolvido copiando os valores para as chaves que o código já espera — mesma técnica já usada para `DIRECT_URL` na ADR-024, em vez de reescrever o adapter para uma convenção de nome específica de uma integração.
- **Resend não foi configurado**: a instalação via marketplace do Vercel exige um domínio verificado (`domain` é parâmetro obrigatório, "you must own a domain to be able to send") — não existe opção de sandbox sem domínio próprio nesse fluxo. O produto ainda não tem domínio. E-mail transacional continua no fallback de log (`ConsoleEmailProvider`) em produção até isso ser decidido.

### Verificado com tráfego real, não só inspeção de configuração
11 tentativas de login contra a URL de produção real confirmaram que a 11ª (acima do limite de 10 em 15 minutos) voltou `429` com `Retry-After` — prova de que o contador está de fato compartilhado via Redis entre requisições reais no ambiente serverless, não uma suposição sobre a configuração.

### Login agora bloqueia contas não verificadas — com saída, não só uma trava
`LoginUseCase` passou a checar `user.emailVerifiedAt` depois da senha (nunca antes — checar depois da senha já pressupõe que ela está certa, então não ajuda enumeração) e lança `EmailNotVerifiedError` (mapeado para `403 email_not_verified`). Simplesmente bloquear não seria suficiente: o token de verificação expira em 24h (`EMAIL_VERIFICATION_TOKEN_TTL_MS`), e não existia nenhum jeito de pedir um novo — uma conta que perdesse o e-mail original ficaria travada para sempre, já que `register` rejeita e-mail já cadastrado. Por isso, junto com o bloqueio, foi criado `ResendVerificationEmailUseCase` (mesmo padrão anti-enumeration de `RequestPasswordResetUseCase`: resolve silenciosamente para e-mail inexistente ou já verificado) e o endpoint `POST /api/v1/auth/resend-verification`, com rate limiting por IP. A tela de login detecta o código `email_not_verified` e oferece "Reenviar e-mail de verificação" na hora.

### Verificado o fluxo inteiro contra o Neon de produção, não só localmente com fake
Registro → tentativa de login bloqueada (`403`) → reenvio → verificação com o token novo → login bem-sucedido, tudo contra o banco de produção real. Conta de teste removida depois.

## Consequências
- `EMAIL_PROVIDER_API_KEY`/`EMAIL_FROM` continuam sem valor em produção — quando um domínio existir, a integração Resend do Vercel (`vercel integration add resend -m domain=<dominio> -m region=<regiao>`) resolve isso da mesma forma que Neon/Upstash foram resolvidos aqui.
- Contas criadas antes desta mudança que nunca verificaram o e-mail ficam bloqueadas de login a partir de agora — comportamento correto (é exatamente o que devia ter acontecido desde o cadastro), mas vale saber que não é retroativamente transparente para quem já tinha uma sessão ativa antes (sessões existentes continuam válidas até expirar/serem revogadas; só um novo login é que passa a exigir verificação).
