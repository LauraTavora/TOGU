import { randomUUID } from "node:crypto";
import type { WorkspaceProvisioner } from "../ports/workspace-provisioner";

export class InMemoryWorkspaceProvisioner implements WorkspaceProvisioner {
  async provisionPersonalWorkspace(_userId: string): Promise<{ workspaceId: string }> {
    return { workspaceId: randomUUID() };
  }
}
