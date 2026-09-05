import { describe, expect, it } from "vitest";
import { POST, DELETE } from "./route";

describe("Rotas /api/v1/discovery/events/:id/save — sem autenticação", () => {
  const params = { params: { id: "some-id" } };

  it("POST rejeita sem login", async () => {
    const response = await POST(new Request("http://localhost/api/v1/discovery/events/some-id/save", { method: "POST" }), params);
    expect(response.status).toBe(401);
  });

  it("DELETE rejeita sem login", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/v1/discovery/events/some-id/save", { method: "DELETE" }),
      params,
    );
    expect(response.status).toBe(401);
  });
});
