/**
 * Port de leitura sobre o módulo `identity`/workspaces — evita acoplar
 * `circles` à implementação concreta de workspace/membership.
 */
export interface WorkspaceAccess {
  findPersonalWorkspaceIdForUser(userId: string): Promise<string | null>;
  canManageWorkspace(workspaceId: string, userId: string): Promise<boolean>;
}
