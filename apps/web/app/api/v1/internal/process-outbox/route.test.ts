import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/v1/internal/process-outbox", () => {
  it("rejeita sem o segredo interno", async () => {
    const response = await POST(new Request("http://localhost/api/v1/internal/process-outbox", { method: "POST" }));
    expect(response.status).toBe(401);
  });

  it("rejeita com segredo incorreto", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/internal/process-outbox", {
        method: "POST",
        headers: { "x-internal-secret": "segredo-errado" },
      }),
    );
    expect(response.status).toBe(401);
  });
});
