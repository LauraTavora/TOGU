import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/v1/discovery/events — sem autenticação", () => {
  it("rejeita sem login", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/v1/discovery/events?latitude=-23.55&longitude=-46.63&radiusKm=10&from=2026-01-01T00:00:00Z&to=2026-01-15T00:00:00Z",
      ),
    );
    expect(response.status).toBe(401);
  });
});
