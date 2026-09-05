import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/v1/discovery/saved-events — sem autenticação", () => {
  it("rejeita sem login", async () => {
    const response = await GET(new Request("http://localhost/api/v1/discovery/saved-events"));
    expect(response.status).toBe(401);
  });
});
