# ADR-019 — Página de Configurações

## Status
Aceito.

## Contexto
Três módulos já tinham API completa e testada sem nenhuma UI: preferências de notificação (`notifications`), regras de prioridade (`priority`) e, indiretamente, a sessão do próprio usuário (`identity`). `docs/PRIVACY-LGPD.md` promete exportação de dados e exclusão de conta, mas **nenhum dos dois tem qualquer implementação de backend ainda** — nem use case, nem endpoint, nem o fluxo de confirmação/reautenticação/grace period que o próprio documento descreve como necessário.

## Decisão

### Escopo desta entrega: Perfil, Notificações, Prioridades
A página tem quatro seções: Perfil (e-mail + sair + link para trocar senha), Notificações (4 toggles: no app, e-mail, push, push no navegador — refletem exatamente `NotificationPreference`), Prioridades (listar/criar/remover regras) e Privacidade (só um aviso honesto de que exportar dados/apagar conta ainda não estão disponíveis).

### `GET /api/v1/auth/me` só devolve `userId` — resolvido com o endpoint que já existe
Em vez de estender `/api/v1/auth/me` para incluir o e-mail (o que misturaria a responsabilidade de "sessão" com "perfil"), a página resolve o e-mail do próprio usuário reaproveitando `GET /api/v1/users?ids=<userId>` (ADR-016) — o mesmo endpoint usado para resolver e-mail de terceiros. Nenhuma rota nova precisou ser criada.

### Criar regra de prioridade por e-mail (PERSON) ou por círculo já existente (CIRCLE)
Segue exatamente o padrão de resolução de identidade estabelecido nas páginas anteriores: para `PERSON`, a UI resolve o e-mail digitado via `GET /api/v1/users?email=...` (ADR-017) antes de enviar o `targetId` real; para `CIRCLE`, a lista de círculos do próprio usuário já vem de `GET /api/v1/circles`, então a escolha é por nome, nunca por id digitado à mão. `PLACE` e `EVENT_TYPE` continuam sendo texto livre, como o backend sempre esperou (não existe uma lista fechada de lugares ou tipos de evento no domínio).

### Nenhum novo componente "switch" no design system
Os toggles de notificação reaproveitam o mesmo padrão de "pill button com dois estados" já usado em `onlyFree` (Explorar, ADR-018) e nos seletores de aba/ordenação das páginas anteriores — consistente com o restante do app e evita introduzir um componente novo para um caso de uso que os botões existentes já cobrem.

### Fora de escopo, explicitamente
- **Exportação de dados** e **exclusão de conta** (LGPD): não têm nenhuma peça de backend ainda. Construir isso exige decisões que vão além desta página — formato de exportação, período de carência antes da exclusão definitiva, o que precisa ser anonimizado vs. removido, reautenticação antes de confirmar. Fica registrado aqui como o próximo gap conhecido mais importante de fechar, não escondido atrás de um botão que não funciona.
- **Trocar senha estando logado**: não existe endpoint dedicado (só o fluxo de reset por e-mail, que funciona autenticado ou não). O link "Trocar senha" leva a `/esqueci-a-senha`, reaproveitando esse fluxo em vez de duplicar lógica de troca de senha.
- **Preferências de calendário externo, aparência, geolocalização granular**: nenhum desses módulos existe ainda (integrações de calendário externo não foram construídas nesta fase do projeto).

## Consequências
- A seção Privacidade é, por enquanto, só um aviso — não uma funcionalidade. Isso é intencional: melhor um aviso honesto do que um botão que parece funcionar e não faz nada.
- Nenhum teste automatizado novo (nenhuma rota de API nova nesta entrega — só consumo do que já existia). Mesma lacuna de testes de renderização de componente das entregas de UI anteriores; `next dev` + `curl` confirma `200`/`401` sem navegador real disponível neste ambiente (mesma limitação desde a ADR-013).
