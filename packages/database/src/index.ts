import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __togu_prisma__: PrismaClient | undefined;
}

export const prisma = globalThis.__togu_prisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__togu_prisma__ = prisma;
}

export * from "@prisma/client";
