import { NextResponse } from "next/server";
import { createExportAccountDataUseCase } from "@/modules/data-export";
import { requireAuth } from "@/shared/auth/require-auth";
import { apiError } from "@/shared/http/api-error";

/**
 * Exportação de dados (LGPD — docs/PRIVACY-LGPD.md, ADR-022). Devolve o
 * JSON diretamente com Content-Disposition de anexo, para que o navegador
 * baixe como arquivo em vez de só exibir.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) {
    return apiError(401, "unauthorized", "Autenticação necessária.");
  }

  const useCase = createExportAccountDataUseCase();
  const data = await useCase.execute(auth.userId);

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="fecho-dados-${auth.userId}.json"`,
    },
  });
}
