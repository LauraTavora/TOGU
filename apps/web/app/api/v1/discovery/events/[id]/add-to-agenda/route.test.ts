import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/v1/discovery/events/:id/add-to-agenda — sem autenticação", () => {
  it("rejeita sem login", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/discovery/events/some-id/add-to-agenda", { method: "POST" }),
      { params: { id: "some-id" } },
    );
    expect(response.status).toBe(401);
  });
});
