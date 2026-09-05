import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

describe("Rotas /api/v1/circles/:id/members — sem autenticação", () => {
  const params = { params: Promise.resolve({ id: "some-id" }) };

  it("GET rejeita sem login", async () => {
    const response = await GET(new Request("http://localhost/api/v1/circles/some-id/members"), params);
    expect(response.status).toBe(401);
  });

  it("POST rejeita sem login", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/circles/some-id/members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: "pedro" }),
      }),
      params,
    );
    expect(response.status).toBe(401);
  });
});
