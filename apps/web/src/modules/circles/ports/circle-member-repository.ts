import type { CircleMember } from "../domain/circle";

export class MemberAlreadyInCircleError extends Error {
  constructor() {
    super("Este usuário já pertence ao círculo.");
  }
}

export class MemberUserNotFoundError extends Error {
  constructor() {
    super("Usuário não encontrado.");
  }
}

export interface CircleMemberRepository {
  add(circleId: string, userId: string): Promise<CircleMember>;
  remove(circleId: string, userId: string): Promise<void>;
  list(circleId: string): Promise<CircleMember[]>;
  isMember(circleId: string, userId: string): Promise<boolean>;
}
