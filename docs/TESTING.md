# TOGU — Testing

## Camadas

### Unitários
Foco em domínio puro, especialmente `AvailabilityEngine` e `PriorityEngine` (sem I/O, sem framework).

### Integration
Repositories e adapters contra banco real (Postgres local/testcontainer).

### E2E
Fluxos críticos ponta a ponta, exemplo mínimo:
```text
cadastrar → adicionar amigo → criar calendário → enviar solicitação → aceitar → ver evento
```

## Casos obrigatórios — AvailabilityEngine
```text
livre
hard conflict
soft hold
dois participantes
dez participantes
timezone diferente
evento recorrente
buffer
eventos adjacentes
mudança durante solicitação (race condition)
```

## Casos obrigatórios — Segurança
```text
rota sem login
token expirado
tenant diferente
usuário acessando evento de outro usuário
manipulação de ID (IDOR)
brute force
rate limit
injection (SQL/NoSQL)
XSS
CSRF
permissões (RBAC/ownership)
```

## CI/CD — pipeline mínimo
```text
lint
typecheck
unit tests
integration tests
build
security scan
migration check
E2E
```
Deploy somente após todas as etapas aprovadas.

## Diretrizes
- Nunca confiar em TypeScript como validação de dados externos — sempre schema runtime.
- Testes de domínio não devem importar Prisma/Next.js.
- Automação (agentes) pode gerar testes complementares, mas cobertura de `AvailabilityEngine`/`PriorityEngine` e segurança é revisada por humano antes de merge crítico.
