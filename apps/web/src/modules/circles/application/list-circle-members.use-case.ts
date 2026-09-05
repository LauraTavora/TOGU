import type { CircleMember } from "../domain/circle";
import type { CircleRepository } from "../ports/circle-repository";
import type { CircleMemberRepository } from "../ports/circle-member-repository";
import type { WorkspaceAccess } from "../ports/workspace-access";
import { CircleNotFoundError, ForbiddenCircleAccessError } from "./errors";

export class ListCircleMembersUseCase {
  constructor(
    private readonly circleRepository: CircleRepository,
    private readonly circleMemberRepository: CircleMemberRepository,
    private readonly workspaceAccess: WorkspaceAccess,
  ) {}

  async execute(circleId: string, requesterUserId: string): Promise<CircleMember[]> {
    const circle = await this.circleRepository.findById(circleId);
    if (!circle) {
      throw new CircleNotFoundError();
    }

    const canManage = await this.workspaceAccess.canManageWorkspace(circle.workspaceId, requesterUserId);
    const isMember = await this.circleMemberRepository.isMember(circleId, requesterUserId);
    if (!canManage && !isMember) {
      throw new ForbiddenCircleAccessError();
    }

    return this.circleMemberRepository.list(circleId);
  }
}
