import type { PrismaClient } from "@togu/database";
import type { WorkspaceAccess } from "../ports/workspace-access";

export class PrismaWorkspaceAccess implements WorkspaceAccess {
  constructor(private readonly prisma: PrismaClient) {}

  async findPersonalWorkspaceIdForUser(userId: string): Promise<string | null> {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, workspace: { type: "PERSONAL" } },
      select: { workspaceId: true },
    });
    return membership?.workspaceId ?? null;
  }

  async canManageWorkspace(workspaceId: string, userId: string): Promise<boolean> {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    return membership !== null && (membership.role === "OWNER" || membership.role === "ADMIN");
  }
}
