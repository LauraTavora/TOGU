# Fechô — Commercial

## Personas

### 1. Ana — a conectora social
28 anos, organiza a vida social de vários grupos de amigos. Dor: perde tempo comparando disponibilidade em grupos de WhatsApp. Quer: marcar rolês rápido, ver quem está livre, descobrir eventos.

### 2. João — o pai ocupado
38 anos, casado, dois filhos, trabalha período integral. Dor: dificuldade em equilibrar família, trabalho e igreja sem deixar tudo escapar. Quer: prioridade clara para família, Focus Time protegido, poucos cliques para aceitar/negar.

### 3. Marcela — a profissional com agenda cheia
31 anos, trabalha em empresa com muitas reuniões, quer proteger tempo pessoal e social sem parecer indisponível. Quer: Private Busy, Soft Hold, buffers entre compromissos.

### 4. Pedro — o recém-chegado (convidado externo)
Não usa Fechô ainda. Recebe um convite por link. Dor: não quer criar conta só para responder um convite. Quer: aceitar/negar rápido, decidir depois se cria conta.

## Planos

| Plano | Público | Exemplos de features |
|---|---|---|
| FREE | Uso pessoal básico | Calendário próprio, Circles limitados, solicitações básicas |
| PLUS | Uso social intenso | Smart Slots, integrações de calendário externo, Priority Engine avançado |
| CIRCLE | Grupos/famílias | Circle Calendar compartilhado, polls, limites maiores de membros |
| BUSINESS | Times/organizações | Workspaces de time, SSO futuro, auditoria avançada, SLA |

Controle de acesso via `Entitlements`/`Features`/`Limits` (ver `ARCHITECTURE.md` §Sistema de Planos) — nunca `if (plan === 'pro')` espalhado no código.

## Posicionamento
"O calendário feito para acontecer." Fechô não compete diretamente com Google Calendar (infraestrutura de agenda) nem com Calendly (agendamento transacional) — compete pelo momento social de decidir e confirmar um encontro.

## Canais
- Boca a boca / convites virais via link externo seguro.
- Comunidades (igrejas, grupos universitários, times) como early adopters âncora — um Circle Workspace bem aproveitado traz múltiplos usuários de uma vez.
- Conteúdo educativo sobre organização de tempo social (não produtividade corporativa genérica).

## Modelos de monetização possíveis
- Assinatura por usuário (Plus).
- Assinatura por grupo/família (Circle).
- Licenciamento por organização (Business), cobrança por assentos.
- Futuro: parcerias com locais/eventos para descoberta patrocinada no Explore (transparente, nunca deslocando resultados relevantes).
