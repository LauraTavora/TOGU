import { prisma } from "@togu/database";
import { CheckAvailabilityUseCase } from "../application/check-availability.use-case";
import { PrismaAvailabilityRepository } from "../adapters/prisma-availability-repository";

const availabilityRepository = new PrismaAvailabilityRepository(prisma);

export function createCheckAvailabilityUseCase(): CheckAvailabilityUseCase {
  return new CheckAvailabilityUseCase(availabilityRepository);
}
