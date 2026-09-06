import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __fecho_prisma__: PrismaClient | undefined;
}

export const prisma = globalThis.__fecho_prisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__fecho_prisma__ = prisma;
}

export * from "@prisma/client";
