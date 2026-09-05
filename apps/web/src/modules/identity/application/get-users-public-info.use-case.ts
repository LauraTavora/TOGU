import type { UserRepository } from "../ports/user-repository";

export interface UserPublicInfo {
  id: string;
  email: string;
}

const MAX_IDS_PER_REQUEST = 50;

/**
 * Informação mínima e segura para exibir "quem é" alguém em telas que só
 * têm o id (ex.: cards de solicitação) — nunca expõe passwordHash ou
 * qualquer outro campo sensível. Sem Profile/displayName ainda (seção
 * 101 do PRD) — usa o e-mail como identificação temporária.
 */
export class GetUsersPublicInfoUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(ids: string[]): Promise<UserPublicInfo[]> {
    const uniqueIds = Array.from(new Set(ids)).slice(0, MAX_IDS_PER_REQUEST);
    const users = await this.userRepository.findManyByIds(uniqueIds);
    return users.map((user) => ({ id: user.id, email: user.email }));
  }
}
