# ADR-002 — Multi-tenancy desde o primeiro dia

## Status
Aceito.

## Contexto
O TOGU precisa suportar Personal Workspace desde o cadastro, com expansão futura para Family/Friends/Team/Company/Community Workspaces, e ao mesmo tempo permitir relações entre pessoas de tenants diferentes (amizades, Circles, convites, disponibilidade).

## Decisão
Toda tabela relevante carrega `workspace_id` com isolamento reforçado na camada de repository/adapter. Relações entre tenants são modeladas como **cross-tenant permission** explícita (grants pontuais), nunca como desligamento geral do isolamento.

## Consequências
- Queries sempre filtram por tenant explicitamente — nenhuma query "global" por padrão.
- Cross-tenant permission adiciona uma camada extra de modelagem (grants), mas evita vazamento de dados entre tenants.
- Prepara o produto para v2 (comunidades/organizações) sem migração estrutural.
