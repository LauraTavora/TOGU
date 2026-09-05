import type { CircleRepository } from "../ports/circle-repository";
import type { WorkspaceAccess } from "../ports/workspace-access";
import { assertCanManageCircle } from "./assert-can-manage-circle";

export class DeleteCircleUseCase {
  constructor(
    private readonly circleRepository: CircleRepository,
    private readonly workspaceAccess: WorkspaceAccess,
  ) {}

  async execute(circleId: string, requesterUserId: string): Promise<void> {
    await assertCanManageCircle(this.circleRepository, this.workspaceAccess, circleId, requesterUserId);
    await this.circleRepository.delete(circleId);
  }
}
