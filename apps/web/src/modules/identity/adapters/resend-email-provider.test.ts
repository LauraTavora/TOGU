import { afterEach, describe, expect, it, vi } from "vitest";
import { ResendEmailProvider } from "./resend-email-provider";

describe("ResendEmailProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envia o e-mail de verificação com um link para /verificar-email", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const provider = new ResendEmailProvider("api-key", "no-reply@fecho.app", "https://fecho.app");
    await provider.sendVerificationEmail("ana@example.com", "tok123");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0]!;
    const [url, options] = call;
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.headers.Authorization).toBe("Bearer api-key");

    const body = JSON.parse(options.body);
    expect(body.from).toBe("no-reply@fecho.app");
    expect(body.to).toBe("ana@example.com");
    expect(body.html).toContain("https://fecho.app/verificar-email?token=tok123");
  });

  it("envia o e-mail de redefinição de senha com um link para /redefinir-senha", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const provider = new ResendEmailProvider("api-key", "no-reply@fecho.app", "https://fecho.app");
    await provider.sendPasswordResetEmail("ana@example.com", "tok456");

    const call = fetchMock.mock.calls[0]!;
    const [, options] = call;
    const body = JSON.parse(options.body);
    expect(body.html).toContain("https://fecho.app/redefinir-senha?token=tok456");
  });

  it("lança erro quando a API do Resend responde com falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("chave inválida", { status: 401 })),
    );

    const provider = new ResendEmailProvider("api-key-invalida", "no-reply@fecho.app", "https://fecho.app");
    await expect(provider.sendVerificationEmail("ana@example.com", "tok123")).rejects.toThrow(/401/);
  });
});
