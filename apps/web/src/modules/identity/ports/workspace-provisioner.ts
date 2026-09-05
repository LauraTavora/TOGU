/**
 * Port usado pelo caso de uso de registro para criar o Personal Workspace
 * obrigatório de toda conta (ver docs/ARCHITECTURE.md §Multi-tenant).
 * Implementado por um adapter que delega ao módulo `workspaces`.
 */
export interface WorkspaceProvisioner {
  provisionPersonalWorkspace(userId: string): Promise<{ workspaceId: string }>;
}
