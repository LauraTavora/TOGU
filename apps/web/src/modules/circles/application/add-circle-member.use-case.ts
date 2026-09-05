import type { CircleMember } from "../domain/circle";
import type { CircleRepository } from "../ports/circle-repository";
import type { CircleMemberRepository } from "../ports/circle-member-repository";
import type { WorkspaceAccess } from "../ports/workspace-access";
import { assertCanManageCircle } from "./assert-can-manage-circle";

export class AddCircleMemberUseCase {
  constructor(
    private readonly circleRepository: CircleRepository,
    private readonly circleMemberRepository: CircleMemberRepository,
    private readonly workspaceAccess: WorkspaceAccess,
  ) {}

  async execute(circleId: string, requesterUserId: string, memberUserId: string): Promise<CircleMember> {
    await assertCanManageCircle(this.circleRepository, this.workspaceAccess, circleId, requesterUserId);
    return this.circleMemberRepository.add(circleId, memberUserId);
  }
}
