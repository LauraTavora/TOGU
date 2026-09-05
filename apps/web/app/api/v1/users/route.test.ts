import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/v1/users — sem autenticação", () => {
  it("rejeita sem login (busca por ids)", async () => {
    const response = await GET(new Request("http://localhost/api/v1/users?ids=abc"));
    expect(response.status).toBe(401);
  });

  it("rejeita sem login (busca por e-mail)", async () => {
    const response = await GET(new Request("http://localhost/api/v1/users?email=ana@example.com"));
    expect(response.status).toBe(401);
  });
});
