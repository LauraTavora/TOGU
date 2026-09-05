import { describe, expect, it } from "vitest";
import { DELETE, GET, POST } from "./route";

describe("/api/v1/account/deletion — sem autenticação", () => {
  it("GET rejeita sem login", async () => {
    const response = await GET(new Request("http://localhost/api/v1/account/deletion"));
    expect(response.status).toBe(401);
  });

  it("POST rejeita sem login", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/account/deletion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: "qualquer" }),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("DELETE rejeita sem login", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/v1/account/deletion", { method: "DELETE" }),
    );
    expect(response.status).toBe(401);
  });
});
