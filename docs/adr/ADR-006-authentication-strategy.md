# ADR-006 — Estratégia de autenticação

## Status
Aceito.

## Contexto
O TOGU precisa de cadastro, login, logout, recuperação de senha, validação de e-mail e revogação de sessão (seção 11), com nenhuma rota privada acessível sem autenticação, e preparado para OAuth futuro (Google/Apple/Microsoft).

## Decisão
- **Senhas:** hash via bcrypt (adapter `BcryptPasswordHasher`, port `PasswordHasher`), nunca algoritmo próprio.
- **Access token:** JWT de curta duração (15 min), assinado com HMAC-SHA256 via `jose` (adapter `JoseAccessTokenSigner`, port `AccessTokenSigner`), contendo apenas `sub` (userId) — sem dados sensíveis no payload.
- **Refresh token:** token opaco de alta entropia (256 bits, `crypto.randomBytes`), armazenado como hash SHA-256 no banco (`Session.refreshTokenHash`) — o valor bruto nunca é persistido. Entregue ao cliente via cookie `HttpOnly`, `Secure` (produção), `SameSite=Lax`, escopado a `/api/v1/auth`.
- **Rotação de refresh token:** a cada uso em `/refresh`, o token anterior é revogado e um novo é emitido — mitiga replay de token vazado.
- **Tokens de verificação de e-mail e redefinição de senha:** mesma estratégia de token opaco + hash, com TTL próprio (24h e 1h respectivamente) e uso único (`AuthToken.usedAt`).
- **Redefinição de senha revoga todas as sessões ativas** do usuário — mitiga sequestro de sessão após vazamento de senha.
- **Anti-enumeration:** login retorna erro genérico idêntico para e-mail inexistente ou senha incorreta; solicitação de redefinição de senha sempre responde com sucesso, independentemente de o e-mail existir.
- **Guard de rotas privadas:** helper `requireAuth` (shared, fora do módulo `identity`) extrai e verifica o Bearer access token antes de qualquer handler privado processar a requisição — nenhuma rota confia apenas na UI.

## Consequências
- `jose` funciona tanto em Node quanto em Edge Runtime, permitindo mover a verificação para middleware no futuro sem trocar de biblioteca.
- bcrypt (via `bcryptjs`, puro JS) evita problemas de binding nativo entre ambientes de desenvolvimento (Windows) e produção (Vercel).
- OAuth (Google/Apple/Microsoft) será adicionado como novos adapters implementando um port `OAuthProvider` futuro, sem alterar `LoginUseCase`/`RegisterUserUseCase` existentes.
- Rate limiting de `/login`, `/register`, `/password-reset` (seção 56) é responsabilidade de middleware de infraestrutura, não deste ADR — ver `docs/SECURITY.md`.
