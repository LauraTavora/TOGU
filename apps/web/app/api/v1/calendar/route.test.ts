import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/v1/calendar", () => {
  it("rejeita requisição sem autenticação", async () => {
    const response = await GET(
      new Request("http://localhost/api/v1/calendar?start=2026-01-10T00:00:00Z&end=2026-01-11T00:00:00Z"),
    );
    expect(response.status).toBe(401);
  });
});
