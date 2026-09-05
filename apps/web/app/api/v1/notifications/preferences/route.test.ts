import { describe, expect, it } from "vitest";
import { GET, PATCH } from "./route";

describe("Rotas /api/v1/notifications/preferences — sem autenticação", () => {
  it("GET rejeita sem login", async () => {
    const response = await GET(new Request("http://localhost/api/v1/notifications/preferences"));
    expect(response.status).toBe(401);
  });

  it("PATCH rejeita sem login", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/v1/notifications/preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: false }),
      }),
    );
    expect(response.status).toBe(401);
  });
});
