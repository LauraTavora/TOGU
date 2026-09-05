/**
 * Resolve quem compartilha algum círculo com o usuário — usado para
 * "N pessoas do seu círculo também querem ir" (docs/PRODUCT.md §35),
 * sem que `discovery` dependa dos casos de uso internos do módulo
 * `circles`.
 */
export interface CircleFellowsResolver {
  findFellowUserIds(userId: string): Promise<string[]>;
}
