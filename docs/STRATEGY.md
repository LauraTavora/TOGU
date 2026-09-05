# TOGU — Strategy

## Problema
Coordenar tempo com outras pessoas é lento, disperso entre apps de mensagem e calendário, e não respeita prioridades sociais nem privacidade granular.

## Público
Ver `PRODUCT.md` seção 3. Foco inicial: pessoas de 20–45 anos, vida social ativa, múltiplos círculos (família/amigos/igreja/trabalho), usuárias de smartphone como dispositivo primário.

## Proposta de valor
"Seu tempo. Suas pessoas. Juntos." — reduzir a fricção entre "precisamos marcar algo" e "está na agenda", preservando privacidade e refletindo prioridades reais de quem convida e de quem é convidado.

## Diferenciais
1. Priority Engine privado (ninguém sabe sua própria posição de prioridade).
2. Estados de disponibilidade intermediários (Soft Hold) com expiração automática.
3. Negociação nativa (CounterProposal) com histórico completo.
4. Explore + Planejar Rolê: descoberta de eventos cruzada com disponibilidade real de amigos.
5. Arquitetura multi-tenant com Circles cruzando tenants via cross-tenant permission.

## Oportunidades
- Nicho carente: nenhum concorrente combina agenda social + prioridade privada + descoberta de eventos (ver `COMPETITORS.md`).
- Monetização em camadas (Free/Plus/Circle/Business) com features claramente segmentadas via Entitlements.
- Expansão natural para comunidades e organizações (v2) reaproveitando o mesmo domínio (Workspaces).

## Riscos
- Efeito de rede: valor cresce com adoção do círculo social do usuário. Mitigação: convites externos com link seguro, sem fricção de cadastro para visualizar convite.
- Percepção de complexidade. Mitigação: onboarding progressivo, Home com Smart Suggestion, Product Tour opcional.
- Confiança em privacidade: qualquer vazamento de detalhe de compromisso é falha crítica de produto, não só bug — tratada como P0 em `THREAT-MODEL.md`.
- Dependência de provedores externos (calendários, eventos, mapas) mitigada por Ports and Adapters (`ARCHITECTURE.md`).

## Métricas

### North Star Metric
**Encontros confirmados através do TOGU por usuário ativo (mensal).**

### Métricas secundárias
- Solicitações enviadas por usuário ativo.
- Taxa de aceite de solicitações.
- Tempo médio entre criação da solicitação e confirmação.
- Eventos descobertos no Explore adicionados à agenda.
- Retenção D7 / D30.
- Usuários ativos mensais (MAU) e círculos ativos.

## Visão de produto (horizonte 2 anos)
De calendário social pessoal (v1) para plataforma de coordenação social e descoberta de experiências (v2), incluindo comunidades e organizações, mantendo privacidade e prioridade como pilares não negociáveis.
