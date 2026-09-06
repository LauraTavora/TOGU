import { prisma } from "@fecho/database";
import { ExportAccountDataUseCase } from "../application/export-account-data.use-case";
import { PrismaAccountDataExporter } from "../adapters/prisma-account-data-exporter";

const accountDataExporter = new PrismaAccountDataExporter(prisma);

export function createExportAccountDataUseCase(): ExportAccountDataUseCase {
  return new ExportAccountDataUseCase(accountDataExporter);
}
