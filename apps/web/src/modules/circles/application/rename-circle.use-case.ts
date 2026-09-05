import { assertValidCircleName } from "../domain/circle";
import type { Circle } from "../domain/circle";
import type { CircleRepository } from "../ports/circle-repository";
import type { WorkspaceAccess } from "../ports/workspace-access";
import { assertCanManageCircle } from "./assert-can-manage-circle";

export class RenameCircleUseCase {
  constructor(
    private readonly circleRepository: CircleRepository,
    private readonly workspaceAccess: WorkspaceAccess,
  ) {}

  async execute(circleId: string, requesterUserId: string, name: string): Promise<Circle> {
    assertValidCircleName(name);
    await assertCanManageCircle(this.circleRepository, this.workspaceAccess, circleId, requesterUserId);
    return this.circleRepository.rename(circleId, name);
  }
}
