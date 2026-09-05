import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

describe("Rotas /api/v1/meeting-requests — sem autenticação", () => {
  it("GET rejeita sem login", async () => {
    const response = await GET(new Request("http://localhost/api/v1/meeting-requests?box=received"));
    expect(response.status).toBe(401);
  });

  it("POST rejeita sem login", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/meeting-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Jantar",
          startAt: "2026-01-10T20:00:00Z",
          endAt: "2026-01-10T22:00:00Z",
          participantUserIds: ["joao"],
        }),
      }),
    );
    expect(response.status).toBe(401);
  });
});
