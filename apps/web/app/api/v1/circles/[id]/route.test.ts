import { describe, expect, it } from "vitest";
import { PATCH, DELETE } from "./route";

describe("Rotas /api/v1/circles/:id — sem autenticação", () => {
  const params = { params: { id: "some-id" } };

  it("PATCH rejeita sem login", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/v1/circles/some-id", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Novo nome" }),
      }),
      params,
    );
    expect(response.status).toBe(401);
  });

  it("DELETE rejeita sem login", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/v1/circles/some-id", { method: "DELETE" }),
      params,
    );
    expect(response.status).toBe(401);
  });
});
