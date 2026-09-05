import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/v1/meeting-requests/:id/counter-proposals — sem autenticação", () => {
  it("rejeita sem login", async () => {
    const response = await GET(
      new Request("http://localhost/api/v1/meeting-requests/some-id/counter-proposals"),
      { params: Promise.resolve({ id: "some-id" }) },
    );
    expect(response.status).toBe(401);
  });
});
