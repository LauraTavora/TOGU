import { describe, expect, it } from "vitest";
import { GET, PATCH, DELETE } from "./route";

function bareRequest(method: string): Request {
  return new Request("http://localhost/api/v1/events/some-id", { method });
}

describe("Rotas de evento por id — sem autenticação", () => {
  const params = { params: Promise.resolve({ id: "some-id" }) };

  it("GET rejeita sem login", async () => {
    const response = await GET(bareRequest("GET"), params);
    expect(response.status).toBe(401);
  });

  it("PATCH rejeita sem login", async () => {
    const response = await PATCH(bareRequest("PATCH"), params);
    expect(response.status).toBe(401);
  });

  it("DELETE rejeita sem login", async () => {
    const response = await DELETE(bareRequest("DELETE"), params);
    expect(response.status).toBe(401);
  });
});
