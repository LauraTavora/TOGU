import { prisma } from "@fecho/database";
import { CreateCircleUseCase } from "../application/create-circle.use-case";
import { ListCirclesUseCase } from "../application/list-circles.use-case";
import { RenameCircleUseCase } from "../application/rename-circle.use-case";
import { DeleteCircleUseCase } from "../application/delete-circle.use-case";
import { AddCircleMemberUseCase } from "../application/add-circle-member.use-case";
import { RemoveCircleMemberUseCase } from "../application/remove-circle-member.use-case";
import { ListCircleMembersUseCase } from "../application/list-circle-members.use-case";
import { PrismaCircleRepository } from "../adapters/prisma-circle-repository";
import { PrismaCircleMemberRepository } from "../adapters/prisma-circle-member-repository";
import { PrismaWorkspaceAccess } from "../adapters/prisma-workspace-access";

const circleRepository = new PrismaCircleRepository(prisma);
const circleMemberRepository = new PrismaCircleMemberRepository(prisma);
const workspaceAccess = new PrismaWorkspaceAccess(prisma);

export function createCreateCircleUseCase(): CreateCircleUseCase {
  return new CreateCircleUseCase(circleRepository, workspaceAccess);
}

export function createListCirclesUseCase(): ListCirclesUseCase {
  return new ListCirclesUseCase(circleRepository, workspaceAccess);
}

export function createRenameCircleUseCase(): RenameCircleUseCase {
  return new RenameCircleUseCase(circleRepository, workspaceAccess);
}

export function createDeleteCircleUseCase(): DeleteCircleUseCase {
  return new DeleteCircleUseCase(circleRepository, workspaceAccess);
}

export function createAddCircleMemberUseCase(): AddCircleMemberUseCase {
  return new AddCircleMemberUseCase(circleRepository, circleMemberRepository, workspaceAccess);
}

export function createRemoveCircleMemberUseCase(): RemoveCircleMemberUseCase {
  return new RemoveCircleMemberUseCase(circleRepository, circleMemberRepository, workspaceAccess);
}

export function createListCircleMembersUseCase(): ListCircleMembersUseCase {
  return new ListCircleMembersUseCase(circleRepository, circleMemberRepository, workspaceAccess);
}
