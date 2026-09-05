import { ApiError } from "./api-error";

export interface ApiClientConfig {
  /** Vazio por padrão — assume mesma origem (apps/web serve API e páginas). */
  baseUrl?: string;
  /** Fornece o access token corrente (mantido em memória por quem usa o SDK). */
  getAccessToken?: () => string | null | undefined;
}

interface ErrorBody {
  error?: { code?: string; message?: string };
}

export function createHttpClient(config: ApiClientConfig = {}) {
  const baseUrl = config.baseUrl ?? "";

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }
    const token = config.getAccessToken?.();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const text = await response.text();
    const parsed: unknown = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errorBody = (parsed ?? {}) as ErrorBody;
      throw new ApiError(
        response.status,
        errorBody.error?.code ?? "unknown_error",
        errorBody.error?.message ?? "Ocorreu um erro inesperado.",
      );
    }

    return parsed as T;
  }

  /**
   * Baixa um arquivo autenticado (ex.: exportação de dados) sem expor o
   * access token para quem chama — mesma injeção de header do `request`.
   */
  async function download(path: string, filename: string): Promise<void> {
    const headers = new Headers();
    const token = config.getAccessToken?.();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${baseUrl}${path}`, { headers, credentials: "include" });
    if (!response.ok) {
      throw new ApiError(response.status, "download_failed", "Não foi possível baixar o arquivo.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return { request, download };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
