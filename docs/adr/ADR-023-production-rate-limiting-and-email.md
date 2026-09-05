# ADR-023 — Rate limiting compartilhado (Upstash) e e-mail de verdade (Resend)

## Status
Aceito.

## Contexto
Dois gaps documentados desde cedo no projeto bloqueavam qualquer deploy real no Vercel:

1. **Rate limiting não funciona em serverless.** `InMemoryRateLimiter` (ADR-011) guarda o contador na memória do processo. Funções serverless do Vercel não são um processo único de longa duração — cada requisição pode cair numa instância "fria" diferente, cada uma com seu próprio contador zerado. Na prática, o limitador não limita nada de verdade nesse modelo.
2. **Ninguém recebe e-mail.** `ConsoleEmailProvider` só registra o token de verificação/reset no log do servidor (proposital, para desenvolver sem precisar de conta de e-mail configurada). Em produção, isso significa que nenhum usuário real consegue confirmar a conta ou redefinir a senha.

## Decisão

### Rate limiting: Upstash Redis via REST, não um cliente Redis tradicional
`UpstashRateLimiter` implementa o mesmo port `RateLimiter` já existente, trocando o `Map` em memória por três comandos Redis (`INCR`/`PEXPIRE`/`PTTL`) via `@upstash/redis`. A escolha de Upstash especificamente (em vez de, por exemplo, `ioredis` contra um Redis genérico) é deliberada: o cliente do Upstash fala com o Redis por **REST HTTP**, sem manter uma conexão TCP persistente — o único jeito que funciona de forma confiável em ambiente serverless/edge, onde cada invocação pode ser um processo novo. Um cliente Redis tradicional (que espera uma conexão TCP de longa duração) sofreria do mesmo problema estrutural do limitador em memória.

`instance.ts` escolhe automaticamente: usa `UpstashRateLimiter` quando `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` estão configurados; cai para `InMemoryRateLimiter` caso contrário (continua servindo bem para desenvolvimento local, onde só existe uma instância). Em produção sem Upstash configurado, um aviso único no log torna esse estado visível — melhor um aviso do que uma falsa sensação de proteção.

**Limitação assumida conscientemente**: `INCR` e `PEXPIRE` não são atômicos entre si. Uma falha exatamente entre as duas chamadas deixaria a chave contando para sempre, sem expiração. Resolver isso de verdade exigiria um script Lua atômico (`EVAL`) — deixado para depois; o risco é baixo (uma janela de milissegundos, num caminho que já lida com erros de rede via HTTP) e não compromete a funcionalidade central.

**Testável sem Upstash real**: o adapter recebe um `RedisLike` (interface só com os três métodos usados), não o tipo completo do cliente Upstash — permite testar o algoritmo com um fake em memória simples, sem esconder que o adapter nunca rodou contra o serviço de verdade (mesma disciplina de honestidade sobre testes já usada em todo o projeto).

### E-mail: Resend via `fetch` puro, sem SDK
`ResendEmailProvider` implementa `EmailProvider` chamando a API REST do Resend diretamente com `fetch` — sem adicionar o pacote `resend` como dependência, já que a integração inteira é uma única chamada HTTP documentada. `identity/infrastructure/container.ts` escolhe Resend quando `EMAIL_PROVIDER_API_KEY` está configurado (reaproveitando o nome de variável já documentado em `.env.example` desde a primeira entrega), com o mesmo padrão de fallback + aviso do rate limiter.

### Duas páginas que faltavam e ninguém tinha notado: `/verificar-email` e `/redefinir-senha`
Construir o provedor de e-mail de verdade expôs um gap que passava despercebido enquanto os links só apareciam no log: **não existia nenhuma página no app que consumisse o token de verificação ou de reset de senha**. O backend sempre teve os endpoints (`POST /api/v1/auth/verify-email`, `POST /api/v1/auth/password-reset/confirm`) e a tela de cadastro já dizia "enviamos um e-mail de confirmação" — mas clicar nesse link (uma vez que ele realmente existisse) cairia num 404. Criadas agora: `/verificar-email?token=...` (chama o SDK, mostra sucesso/erro) e `/redefinir-senha?token=...` (formulário de nova senha). O SDK ganhou o método `verifyEmail` que faltava — só `confirmPasswordReset` já existia.

## Consequências
- Nenhuma das duas integrações foi testada contra o serviço real (sem conta Upstash nem Resend disponível neste ambiente) — verificado via `tsc`, testes unitários com fakes, e `next build`/`next dev` confirmando que o app sobe e cai corretamente para os fallbacks de desenvolvimento quando as variáveis não estão configuradas.
- `EMAIL_FROM` precisa ser um domínio verificado no Resend antes de funcionar em produção — não é só colocar a chave de API.
- Ambas as integrações são condicionadas por variável de ambiente, nunca por `NODE_ENV` sozinho — um preview do Vercel pode ou não ter Upstash/Resend configurados, e o código se comporta corretamente nos dois casos.
