# TOGU — Privacidade e LGPD

## Princípio central
**Ter acesso à disponibilidade de alguém não significa ter acesso aos compromissos dessa pessoa.** Por padrão, terceiros veem apenas `Available | Soft Hold | Busy` — nunca título, local, participantes ou descrição, salvo permissão explícita concedida individualmente ou por Circle.

## Direitos do titular garantidos pelo produto
- Solicitar seus dados (exportação estruturada).
- Exportar dados.
- Apagar a conta (ver fluxo em `PRODUCT.md`/seção de deleção — confirmação, reautenticação, grace period, anonimização/remoção conforme obrigação legal).
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
- Ao apagar conta: dados pessoais removidos ou anonimizados; registros que precisam ser preservados por obrigação legal (ex.: auditoria de segurança) são anonimizados quanto à identidade do titular quando possível.

## Papéis
- Controlador: TOGU (operador da plataforma).
- Encarregado (DPO): a definir antes do lançamento comercial.

Ver fluxos técnicos de suporte em `SECURITY.md` e `THREAT-MODEL.md`.
