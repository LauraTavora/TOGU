import type { Circle } from "../domain/circle";
import type { CircleRepository } from "../ports/circle-repository";
import type { WorkspaceAccess } from "../ports/workspace-access";
import { CircleNotFoundError, ForbiddenCircleAccessError } from "./errors";

export async function assertCanManageCircle(
  circleRepository: CircleRepository,
  workspaceAccess: WorkspaceAccess,
  circleId: string,
  requesterUserId: string,
): Promise<Circle> {
  const circle = await circleRepository.findById(circleId);
  if (!circle) {
    throw new CircleNotFoundError();
  }

  const canManage = await workspaceAccess.canManageWorkspace(circle.workspaceId, requesterUserId);
  if (!canManage) {
    throw new ForbiddenCircleAccessError();
  }

  return circle;
}
