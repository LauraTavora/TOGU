import { describe, expect, it } from "vitest";
import {
  assertCanRespond,
  effectiveTimeRange,
  getProposingPartyId,
  NotAPartyError,
  NotAResponderError,
} from "./negotiation";
import type { MeetingRequest } from "./meeting-request";
import type { CounterProposal } from "./counter-proposal";

function baseRequest(overrides: Partial<MeetingRequest> = {}): MeetingRequest {
  return {
    id: "req-1",
    requesterId: "ana",
    title: "Jantar",
    message: null,
    startAt: new Date("2026-01-10T20:00:00Z"),
    endAt: new Date("2026-01-10T22:00:00Z"),
    meetingKind: "IN_PERSON",
    location: null,
    onlineLink: null,
    status: "PENDING",
    participantUserIds: ["joao"],
    resolvedEventId: null,
    declineMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function counterProposal(overrides: Partial<CounterProposal> = {}): CounterProposal {
  return {
    id: "cp-1",
    meetingRequestId: "req-1",
    proposedById: "joao",
    startAt: new Date("2026-01-11T20:00:00Z"),
    endAt: new Date("2026-01-11T22:00:00Z"),
    message: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("getProposingPartyId", () => {
  it("é o requester quando ainda não há contraproposta", () => {
    expect(getProposingPartyId(baseRequest(), [])).toBe("ana");
  });

  it("é o autor da contraproposta mais recente", () => {
    const proposals = [counterProposal({ proposedById: "joao" })];
    expect(getProposingPartyId(baseRequest(), proposals)).toBe("joao");
  });

  it("considera apenas a última contraproposta em uma cadeia", () => {
    const proposals = [
      counterProposal({ id: "cp-1", proposedById: "joao" }),
      counterProposal({ id: "cp-2", proposedById: "ana" }),
    ];
    expect(getProposingPartyId(baseRequest(), proposals)).toBe("ana");
  });
});

describe("assertCanRespond", () => {
  it("permite que o participante responda à proposta inicial do requester", () => {
    expect(() => assertCanRespond(baseRequest(), [], "joao")).not.toThrow();
  });

  it("bloqueia o próprio requester de responder à sua proposta inicial", () => {
    expect(() => assertCanRespond(baseRequest(), [], "ana")).toThrow(NotAResponderError);
  });

  it("depois de uma contraproposta do participante, apenas o requester pode responder", () => {
    const proposals = [counterProposal({ proposedById: "joao" })];
    expect(() => assertCanRespond(baseRequest(), proposals, "ana")).not.toThrow();
    expect(() => assertCanRespond(baseRequest(), proposals, "joao")).toThrow(NotAResponderError);
  });

  it("bloqueia quem não faz parte da solicitação", () => {
    expect(() => assertCanRespond(baseRequest(), [], "estranho")).toThrow(NotAPartyError);
  });
});

describe("effectiveTimeRange", () => {
  it("usa o horário original quando não há contraproposta", () => {
    const range = effectiveTimeRange(baseRequest(), []);
    expect(range.startAt.toISOString()).toBe("2026-01-10T20:00:00.000Z");
  });

  it("usa o horário da contraproposta mais recente", () => {
    const proposals = [counterProposal()];
    const range = effectiveTimeRange(baseRequest(), proposals);
    expect(range.startAt.toISOString()).toBe("2026-01-11T20:00:00.000Z");
  });
});
