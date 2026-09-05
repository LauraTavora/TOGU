import { beforeEach, describe, expect, it } from "vitest";
import { CreateCircleUseCase } from "./create-circle.use-case";
import { ListCirclesUseCase } from "./list-circles.use-case";
import { RenameCircleUseCase } from "./rename-circle.use-case";
import { DeleteCircleUseCase } from "./delete-circle.use-case";
import { AddCircleMemberUseCase } from "./add-circle-member.use-case";
import { RemoveCircleMemberUseCase } from "./remove-circle-member.use-case";
import { ListCircleMembersUseCase } from "./list-circle-members.use-case";
import { CircleNotFoundError, ForbiddenCircleAccessError, PersonalWorkspaceNotFoundError } from "./errors";
import { InvalidCircleNameError } from "../domain/circle";
import { MemberAlreadyInCircleError } from "../ports/circle-member-repository";
import { InMemoryCircleRepository } from "../adapters/in-memory-circle-repository";
import { InMemoryCircleMemberRepository } from "../adapters/in-memory-circle-member-repository";
import { InMemoryWorkspaceAccess } from "../adapters/in-memory-workspace-access";

function buildScenario() {
  const circleRepository = new InMemoryCircleRepository();
  const circleMemberRepository = new InMemoryCircleMemberRepository();
  const workspaceAccess = new InMemoryWorkspaceAccess();
  workspaceAccess.registerPersonalWorkspace("ana", "workspace-ana");
  workspaceAccess.registerPersonalWorkspace("joao", "workspace-joao");

  return {
    circleRepository,
    circleMemberRepository,
    workspaceAccess,
    createCircle: new CreateCircleUseCase(circleRepository, workspaceAccess),
    listCircles: new ListCirclesUseCase(circleRepository, workspaceAccess),
    renameCircle: new RenameCircleUseCase(circleRepository, workspaceAccess),
    deleteCircle: new DeleteCircleUseCase(circleRepository, workspaceAccess),
    addMember: new AddCircleMemberUseCase(circleRepository, circleMemberRepository, workspaceAccess),
    removeMember: new RemoveCircleMemberUseCase(circleRepository, circleMemberRepository, workspaceAccess),
    listMembers: new ListCircleMembersUseCase(circleRepository, circleMemberRepository, workspaceAccess),
  };
}

describe("CreateCircleUseCase", () => {
  it("cria um círculo no workspace pessoal do dono", async () => {
    const { createCircle } = buildScenario();
    const circle = await createCircle.execute("ana", "Família");
    expect(circle.workspaceId).toBe("workspace-ana");
    expect(circle.name).toBe("Família");
  });

  it("rejeita nome inválido", async () => {
    const { createCircle } = buildScenario();
    await expect(createCircle.execute("ana", "   ")).rejects.toThrow(InvalidCircleNameError);
  });

  it("rejeita usuário sem workspace pessoal", async () => {
    const { createCircle } = buildScenario();
    await expect(createCircle.execute("fantasma", "Família")).rejects.toThrow(
      PersonalWorkspaceNotFoundError,
    );
  });
});

describe("ListCirclesUseCase", () => {
  it("não vaza círculos de outro workspace", async () => {
    const { createCircle, listCircles } = buildScenario();
    await createCircle.execute("ana", "Família da Ana");
    await createCircle.execute("joao", "Família do João");

    const anaCircles = await listCircles.execute("ana");
    expect(anaCircles.map((c) => c.name)).toEqual(["Família da Ana"]);
  });
});

describe("RenameCircleUseCase / DeleteCircleUseCase — ownership", () => {
  it("permite que o dono do workspace renomeie e exclua", async () => {
    const { createCircle, renameCircle, deleteCircle, circleRepository } = buildScenario();
    const circle = await createCircle.execute("ana", "Amigos");

    const renamed = await renameCircle.execute(circle.id, "ana", "Amigos próximos");
    expect(renamed.name).toBe("Amigos próximos");

    await deleteCircle.execute(circle.id, "ana");
    expect(await circleRepository.findById(circle.id)).toBeNull();
  });

  it("bloqueia renomear/excluir por usuário de outro workspace", async () => {
    const { createCircle, renameCircle, deleteCircle } = buildScenario();
    const circle = await createCircle.execute("ana", "Amigos");

    await expect(renameCircle.execute(circle.id, "joao", "Hackeado")).rejects.toThrow(
      ForbiddenCircleAccessError,
    );
    await expect(deleteCircle.execute(circle.id, "joao")).rejects.toThrow(ForbiddenCircleAccessError);
  });

  it("retorna CircleNotFoundError para círculo inexistente", async () => {
    const { renameCircle } = buildScenario();
    await expect(renameCircle.execute("id-inexistente", "ana", "Novo nome")).rejects.toThrow(
      CircleNotFoundError,
    );
  });
});

describe("Membros do círculo", () => {
  let scenario: ReturnType<typeof buildScenario>;

  beforeEach(() => {
    scenario = buildScenario();
  });

  it("dono adiciona e remove membros", async () => {
    const { createCircle, addMember, removeMember, listMembers } = scenario;
    const circle = await createCircle.execute("ana", "Amigos");

    await addMember.execute(circle.id, "ana", "pedro");
    const members = await listMembers.execute(circle.id, "ana");
    expect(members.map((m) => m.userId)).toEqual(["pedro"]);

    await removeMember.execute(circle.id, "ana", "pedro");
    expect(await listMembers.execute(circle.id, "ana")).toHaveLength(0);
  });

  it("bloqueia adicionar membro por quem não gerencia o workspace", async () => {
    const { createCircle, addMember } = scenario;
    const circle = await createCircle.execute("ana", "Amigos");

    await expect(addMember.execute(circle.id, "joao", "pedro")).rejects.toThrow(ForbiddenCircleAccessError);
  });

  it("rejeita adicionar o mesmo membro duas vezes", async () => {
    const { createCircle, addMember } = scenario;
    const circle = await createCircle.execute("ana", "Amigos");

    await addMember.execute(circle.id, "ana", "pedro");
    await expect(addMember.execute(circle.id, "ana", "pedro")).rejects.toThrow(MemberAlreadyInCircleError);
  });

  it("permite que um membro veja a lista de membros, mesmo sem gerenciar o workspace", async () => {
    const { createCircle, addMember, listMembers } = scenario;
    const circle = await createCircle.execute("ana", "Amigos");
    await addMember.execute(circle.id, "ana", "pedro");

    const members = await listMembers.execute(circle.id, "pedro");
    expect(members).toHaveLength(1);
  });

  it("bloqueia visualização de membros por quem é estranho ao círculo", async () => {
    const { createCircle, listMembers } = scenario;
    const circle = await createCircle.execute("ana", "Amigos");

    await expect(listMembers.execute(circle.id, "estranho")).rejects.toThrow(ForbiddenCircleAccessError);
  });
});
