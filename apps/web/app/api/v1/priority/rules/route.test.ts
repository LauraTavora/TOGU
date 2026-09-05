import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

describe("Rotas /api/v1/priority/rules — sem autenticação", () => {
  it("GET rejeita sem login", async () => {
    const response = await GET(new Request("http://localhost/api/v1/priority/rules"));
    expect(response.status).toBe(401);
  });

  it("POST rejeita sem login", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/priority/rules", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetType: "PERSON", targetId: "joao", level: "HIGH" }),
      }),
    );
    expect(response.status).toBe(401);
  });
});
