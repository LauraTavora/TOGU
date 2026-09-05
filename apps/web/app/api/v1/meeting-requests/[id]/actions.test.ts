import { describe, expect, it } from "vitest";
import { POST as accept } from "./accept/route";
import { POST as decline } from "./decline/route";
import { POST as counterProposal } from "./counter-proposal/route";
import { POST as cancel } from "./cancel/route";

const params = { params: Promise.resolve({ id: "some-id" }) };

function jsonRequest(path: string, body: unknown = {}): Request {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Ações de meeting-requests — sem autenticação", () => {
  it("accept rejeita sem login", async () => {
    const response = await accept(jsonRequest("/api/v1/meeting-requests/some-id/accept"), params);
    expect(response.status).toBe(401);
  });

  it("decline rejeita sem login", async () => {
    const response = await decline(jsonRequest("/api/v1/meeting-requests/some-id/decline"), params);
    expect(response.status).toBe(401);
  });

  it("counter-proposal rejeita sem login", async () => {
    const response = await counterProposal(
      jsonRequest("/api/v1/meeting-requests/some-id/counter-proposal", {
        startAt: "2026-01-10T20:00:00Z",
        endAt: "2026-01-10T22:00:00Z",
      }),
      params,
    );
    expect(response.status).toBe(401);
  });

  it("cancel rejeita sem login", async () => {
    const response = await cancel(jsonRequest("/api/v1/meeting-requests/some-id/cancel"), params);
    expect(response.status).toBe(401);
  });
});
