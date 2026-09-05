import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/v1/discovery/events/:id/circle-interest — sem autenticação", () => {
  it("rejeita sem login", async () => {
    const response = await GET(
      new Request("http://localhost/api/v1/discovery/events/some-id/circle-interest"),
      { params: { id: "some-id" } },
    );
    expect(response.status).toBe(401);
  });
});
