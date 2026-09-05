# TOGU — Onboarding

## Fluxo de primeiro acesso

Perguntas apresentadas de forma progressiva (não um formulário longo único):

1. Como gostaria de usar o TOGU?
2. Quais dias normalmente estão disponíveis?
3. Horário normal de início e fim do dia.
4. Qual timezone?
5. Deseja conectar algum calendário?
6. Deseja criar seus primeiros círculos?
7. Família?
8. Amigos?
9. Igreja?
10. Trabalho?
11. Faculdade?
12. Outros?

Ao final, iniciar **Product Tour** interativo (opcional, pode ser pulado e revisto depois).

## Product Tour — passos
```text
1. calendário
2. criar compromisso
3. adicionar amigos
4. criar círculos
5. enviar solicitação
6. prioridades
7. explorar eventos
```
Sempre com opção **Pular** e **Ver novamente** (acessível em Configurações).

## Princípios de UX aplicados ao onboarding
1. O usuário entende o que fazer em menos de 5 segundos em cada tela?
2. Existe informação desnecessária?
3. Funciona com uma mão no smartphone?
4. Estados estão claros?
5. Conflitos estão evidentes?
6. Privacidade está preservada (nenhuma pergunta expõe dado de terceiro)?
7. A ação principal de cada tela está clara?

## Dados coletados no onboarding e seu destino
- Dias/horário disponível → `AvailabilityEngine` (disponibilidade padrão inicial).
- Timezone → `Profile.timezone`.
- Círculos selecionados → criação inicial de `Circle` no Personal Workspace.
- Conexão de calendário → fluxo delegado ao módulo `integrations` (opcional, pode ser adiado).
