import type { AccountDataExport, AccountDataExporter } from "../ports/account-data-exporter";

export class ExportAccountDataUseCase {
  constructor(private readonly exporter: AccountDataExporter) {}

  async execute(userId: string): Promise<AccountDataExport> {
    return this.exporter.exportForUser(userId);
  }
}
