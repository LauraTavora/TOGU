# TOGU — Threat Model

Metodologia: STRIDE aplicado aos fluxos críticos do domínio.

## Ativos críticos
- Conteúdo de compromissos privados (nome, local, participantes, notas).
- Disponibilidade agregada de terceiros.
- Prioridades pessoais (privadas por definição — vazamento é falha crítica).
- Tokens OAuth de calendários externos.
- Sessões e credenciais.

## Fluxos de maior risco

### 1. Consulta de disponibilidade de terceiro
- **Ameaça:** IDOR/BOLA — usuário consulta disponibilidade de alguém sem permissão, ou consulta detalhes do evento (não apenas estado).
- **Mitigação:** toda consulta valida `CalendarPermission`/`Friendship`/`CircleMember`; resposta padrão retorna apenas `AVAILABLE | SOFT_HOLD | BUSY` — nunca título, local ou participantes, a menos que permissão explícita conceda mais.

### 2. Aceitar/negar MeetingRequest
- **Ameaça:** race condition levando à dupla reserva; ou usuário aceitando solicitação da qual não é destinatário.
- **Mitigação:** `AvailabilityEngine` revalidado dentro de transação atômica; verificação de `MeetingParticipant` antes de qualquer mutação.

### 3. Convite externo (link público)
- **Ameaça:** token previsível ou não expirável permite acesso indevido ou enumeration.
- **Mitigação:** tokens aleatórios de alta entropia, expiração obrigatória, revogação manual, nenhuma informação privada exposta antes da autenticação do convidado.

### 4. Integração com calendário externo (OAuth)
- **Ameaça:** vazamento de token concede acesso à agenda pessoal completa do usuário em outro provedor.
- **Mitigação:** tokens criptografados em repouso, escopo mínimo solicitado, revogação simples pelo usuário, nunca logar o token.

### 5. Explore / geolocalização
- **Ameaça:** coleta/retenção desnecessária de localização histórica.
- **Mitigação:** localização usada apenas mediante consentimento explícito e pontual; sem histórico persistido além do necessário para a sessão de busca.

### 6. Enumeration em login/cadastro
- **Ameaça:** atacante descobre e-mails cadastrados via mensagens de erro diferentes.
- **Mitigação:** respostas de erro genéricas + rate limiting por IP/usuário/endpoint.

### 7. Admin
- **Ameaça:** operador admin acessando conteúdo privado sem justificativa.
- **Mitigação:** todo acesso admin a dado privado é auditado com motivo obrigatório (`AuditLog`), nunca acesso silencioso.

## Classificação de severidade
Qualquer vazamento de conteúdo privado de compromisso, prioridade pessoal, ou token de terceiro é tratado como **P0** — bloqueia release.

## Revisão
Este documento deve ser revisado a cada novo módulo que manipule dados de terceiros ou credenciais externas (nova ADR obrigatória em `docs/adr/`).
