import type { WorkspaceAccess } from "../ports/workspace-access";

export class InMemoryWorkspaceAccess implements WorkspaceAccess {
  private readonly personalWorkspaceByUser = new Map<string, string>();
  private readonly managersByWorkspace = new Map<string, Set<string>>();

  registerPersonalWorkspace(userId: string, workspaceId: string): void {
    this.personalWorkspaceByUser.set(userId, workspaceId);
    const managers = this.managersByWorkspace.get(workspaceId) ?? new Set();
    managers.add(userId);
    this.managersByWorkspace.set(workspaceId, managers);
  }

  async findPersonalWorkspaceIdForUser(userId: string): Promise<string | null> {
    return this.personalWorkspaceByUser.get(userId) ?? null;
  }

  async canManageWorkspace(workspaceId: string, userId: string): Promise<boolean> {
    return this.managersByWorkspace.get(workspaceId)?.has(userId) ?? false;
  }
}
