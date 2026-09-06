# Fechô — Privacidade e LGPD

## Princípio central
**Ter acesso à disponibilidade de alguém não significa ter acesso aos compromissos dessa pessoa.** Por padrão, terceiros veem apenas `Available | Soft Hold | Busy` — nunca título, local, participantes ou descrição, salvo permissão explícita concedida individualmente ou por Circle.

## Direitos do titular garantidos pelo produto
- **Exportar dados**: `GET /api/v1/account/export` — implementado (ADR-022). Baixa um JSON com conta, workspaces, calendários/eventos próprios, solicitações enviadas/recebidas, círculos, regras de prioridade, eventos salvos, contatos, preferências de notificação e histórico de auditoria.
- **Apagar a conta**: `POST/DELETE /api/v1/account/deletion` — implementado (ADR-022): reautenticação por senha, carência de 14 dias (cancelável a qualquer momento), depois anonimização (e-mail/senha) via job protegido por segredo. **Escopo real, não hipotético**: a anonimização cobre a conta em si; dados pessoais em outros módulos (prioridades, eventos salvos, círculos, contatos, preferências) ainda não são purgados automaticamente — ver ADR-022 para o que falta.
- Revogar consentimento (geolocalização, integrações externas).
- Controlar geolocalização (uso pontual e explícito, sem histórico persistido desnecessário).
- Controlar integrações (conectar/desconectar calendários externos a qualquer momento).
- Controlar compartilhamento (permissões de calendário por pessoa/círculo, granularidade de `privacyLevel` por evento).

## Base legal por tratamento
- Autenticação/conta: execução de contrato.
- Disponibilidade compartilhada com terceiros: consentimento explícito do titular via configuração de permissão.
- Geolocalização (Explore): consentimento explícito, revogável a qualquer momento.
- Auditoria de segurança: legítimo interesse (proteção da plataforma), com retenção mínima necessária.

## Minimização de dados
- Nenhuma coleta de conteúdo privado para analytics (ver `PRODUCT.md`/Analytics — métricas de uso agregadas apenas: criação de conta, criação de evento, solicitação enviada/aceita, feature usada).
- Localização não é armazenada como histórico; usada apenas durante a sessão de descoberta de eventos.

## Retenção
- Logs de auditoria retidos pelo prazo mínimo necessário para segurança/obrigação legal, sem dados sensíveis (senhas, tokens) nunca registrados.
- Ao apagar conta: e-mail e senha são anonimizados (a linha de `User` continua existindo — necessário para não quebrar calendários/solicitações/convites que outras pessoas ainda enxergam, ver ADR-022); dados pessoais em outros módulos (prioridades, eventos salvos, contatos, círculos, preferências) ainda não têm purga automática — gap conhecido e documentado, não uma anonimização completa hoje.

## Papéis
- Controlador: Fechô (operador da plataforma).
- Encarregado (DPO): a definir antes do lançamento comercial.

Ver fluxos técnicos de suporte em `SECURITY.md` e `THREAT-MODEL.md`.
