# TOGU — Product Brief

## 1. O que é o TOGU

TOGU é uma plataforma social de organização de tempo, encontros, compromissos e experiências. Não é "mais um calendário digital": é o ponto de encontro entre **tempo**, **pessoas** e **prioridade**.

> "Não apenas encontrar tempo livre. Encontrar tempo para estar com as pessoas e viver as coisas que realmente importam."

## 2. Problema resolvido

Hoje, marcar algo com outra pessoa exige um vaivém manual: perguntar disponibilidade, trocar mensagens, comparar agendas, escolher local, confirmar, e frequentemente recomeçar do zero quando algo muda. Ferramentas de calendário (Google Calendar, Outlook) resolvem *minha* agenda; ferramentas de agendamento (Calendly, Doodle) resolvem *encontrar horário*, mas são frias, transacionais e não pensam em prioridade social nem em descoberta de experiências. Nenhuma resolve o ciclo completo: **descobrir → propor → negociar → confirmar → viver**.

## 3. Público-alvo

- Pessoas com vida social ativa e agenda fragmentada entre família, amigos, igreja, trabalho e faculdade.
- Grupos que organizam encontros recorrentes (família, células de igreja, grupos de amigos, times esportivos).
- Profissionais que também quer proteger tempo pessoal (Focus Time, Dead Time) sem abrir mão da vida social.
- Futuro: comunidades, empresas e organizadores de eventos (v2).

## 4. Proposta de valor

- Disponibilidade compartilhada sem expor a agenda inteira (privacidade por padrão).
- Negociação de horário nativa (Soft Hold, contrapropostas, votação).
- Prioridade pessoal e privada guiando ordenação de solicitações e sugestões (Priority Engine).
- Descoberta de eventos cruzada com disponibilidade real dos amigos (Explore + Planejar Rolê).
- Web e mobile com uma base de domínio única, extensível para integrações futuras (Google, Outlook, mapas, provedores de eventos).

## 5. Principais funcionalidades (visão macro)

1. Calendário próprio (dia/semana/mês/agenda/timeline) com estados de disponibilidade (Available, Soft Hold, Busy, Private Busy).
2. Círculos (Circles) — agrupamento social de contatos (família, amigos, igreja, trabalho...).
3. Priority Engine — prioridade privada por pessoa/círculo/local/tipo de evento.
4. Central de Solicitações — enviar, receber, aceitar, negar, contrapropor, cancelar.
5. Availability Engine — checagem de conflito em tempo real, multi-participante.
6. Smart Slots — sugestão automática de melhores horários.
7. Explore — descoberta de eventos próximos por geolocalização e categoria.
8. Planejar Rolê — cruzamento de eventos + disponibilidade de um grupo.
9. Convites externos (link seguro) para quem ainda não usa o TOGU.
10. Notificações multi-canal (in-app, push, e-mail; WhatsApp futuro).
11. Assistente de agenda (consulta em linguagem natural, nunca decide sozinho).

## 6. Diferenciais frente ao mercado

- Privacidade granular: disponibilidade ≠ conteúdo do compromisso.
- Prioridade social como motor de ranking, não apenas ordem cronológica.
- Fluxo de negociação nativo (contraproposta com histórico), não apenas aceitar/recusar.
- Descoberta de eventos integrada à disponibilidade social, não isolada.

## 7. Riscos de produto

- Complexidade percebida: mitigar com onboarding progressivo e Home enxuta.
- Efeito de rede: TOGU só cria valor quando as pessoas ao redor também usam — mitigar com convites externos frictionless.
- Privacidade mal calibrada pode gerar desconfiança — regras de visibilidade precisam ser conservadoras por padrão.

## 8. Métricas

Ver `STRATEGY.md` (North Star Metric e métricas secundárias).

## 9. Personas

Ver `COMMERCIAL.md` §Personas (Ana, João, Marcela, Pedro).

## 10. User Journeys

### Journey A — Marcar um encontro com um amigo
1. Ana abre o TOGU e toca em "Marcar algo com João" no perfil dele.
2. TOGU consulta `AvailabilityEngine` e mostra horários em comum (🟢/🟡/🔴).
3. Ana escolhe sexta 20h, adiciona local, envia solicitação.
4. João recebe notificação, vê seu próprio status (🟢 Livre) e aceita.
5. Evento passa a existir nas agendas de ambos automaticamente.

### Journey B — Negociar novo horário
1. João recebe solicitação para sábado 18h, mas já tem um Soft Hold no horário.
2. Nega explicando: "Talvez eu já tenha outro compromisso, mas posso sábado 21h."
3. TOGU gera `CounterProposal`, preservando histórico da negociação.
4. Ana aceita a contraproposta; evento confirmado no novo horário.

### Journey C — Descobrir e convidar para um evento (Planejar Rolê)
1. Ana seleciona amigos, período (sábado à noite), distância e orçamento no fluxo "Criar Rolê".
2. TOGU cruza eventos do Explore com disponibilidade real do grupo.
3. Resultado: "Festival X, sábado 20h, todos disponíveis."
4. Ana convida o grupo; cada convidado vê seu próprio status de disponibilidade e aceita individualmente.

### Journey D — Convite externo
1. Pedro (sem conta) recebe link `togu.app/invite/...`.
2. Visualiza o convite sem precisar criar conta.
3. Aceita e, opcionalmente, cria conta para continuar usando o TOGU.

## 11. Sitemap (alto nível)

```text
/                      → Home
/calendario            → Calendário (dia/semana/mês/agenda/timeline)
/solicitacoes          → Central de Solicitações
/pessoas               → Pessoas / perfis / atalhos de relacionamento
/circulos              → Circles
/explorar              → Explore (eventos próximos)
/notificacoes          → Notification Center
/configuracoes         → Perfil, Conta, Calendário, Disponibilidade, Privacidade,
                          Prioridades, Círculos, Notificações, Integrações,
                          Segurança, Plano, Aparência, Dados, Sobre
/invite/:token         → Convite externo (não autenticado)
/onboarding            → Fluxo de primeiro acesso + Product Tour
```

## 12. Wireframes principais (descrição funcional)

Wireframes de alta fidelidade ficam no pacote `packages/design-system` conforme forem produzidos pela UX Squad. Telas prioritárias para o MVP, na ordem de construção:

1. Home (Hoje + Solicitações pendentes + Smart Suggestion).
2. Calendário — view Semana (padrão) com estados de cor (Available/Soft Hold/Busy/Private Busy).
3. Card de Solicitação (recebida) com status de disponibilidade próprio.
4. Fluxo de criação de evento (bottom sheet no mobile, modal no desktop).
5. Busca de horário em grupo (lista de horários com indicador 🟢/🟡/🔴).
6. Circles (lista + detalhe de membros).
7. Explore (lista/mapa de eventos próximos com filtros).
