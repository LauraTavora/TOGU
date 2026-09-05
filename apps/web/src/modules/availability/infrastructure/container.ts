import { CheckAvailabilityUseCase } from "../application/check-availability.use-case";
import { InMemoryAvailabilityRepository } from "../adapters/in-memory-availability-repository";

/**
 * Wiring do módulo. Quando o adapter Prisma existir, apenas esta função muda
 * — nenhum caso de uso ou rota precisa ser alterado.
 */
export function createCheckAvailabilityUseCase(): CheckAvailabilityUseCase {
  const repository = new InMemoryAvailabilityRepository();
  return new CheckAvailabilityUseCase(repository);
}
