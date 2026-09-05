import { describe, expect, it } from "vitest";
import { AvailabilityEngine } from "./availability-engine";
import type { BusyBlock } from "./busy-block";

function range(startIso: string, endIso: string) {
  return { start: new Date(startIso), end: new Date(endIso) };
}

function blocksOf(...blocks: BusyBlock[]) {
  const map = new Map<string, BusyBlock[]>();
  for (const block of blocks) {
    const existing = map.get(block.participantId) ?? [];
    existing.push(block);
    map.set(block.participantId, existing);
  }
  return map;
}

describe("AvailabilityEngine", () => {
  const engine = new AvailabilityEngine();

  it("retorna AVAILABLE quando não há nenhum bloco", () => {
    const result = engine.check({
      participantIds: ["ana"],
      range: range("2026-01-10T20:00:00Z", "2026-01-10T22:00:00Z"),
      busyBlocksByParticipant: blocksOf(),
    });
    expect(result.status).toBe("AVAILABLE");
  });

  it("retorna HARD_CONFLICT quando há BUSY sobreposto", () => {
    const result = engine.check({
      participantIds: ["ana"],
      range: range("2026-01-10T20:00:00Z", "2026-01-10T22:00:00Z"),
      busyBlocksByParticipant: blocksOf({
        participantId: "ana",
        state: "BUSY",
        range: range("2026-01-10T21:00:00Z", "2026-01-10T23:00:00Z"),
      }),
    });
    expect(result.status).toBe("HARD_CONFLICT");
  });

  it("retorna HARD_CONFLICT quando há PRIVATE_BUSY sobreposto", () => {
    const result = engine.check({
      participantIds: ["ana"],
      range: range("2026-01-10T20:00:00Z", "2026-01-10T22:00:00Z"),
      busyBlocksByParticipant: blocksOf({
        participantId: "ana",
        state: "PRIVATE_BUSY",
        range: range("2026-01-10T20:30:00Z", "2026-01-10T21:00:00Z"),
      }),
    });
    expect(result.status).toBe("HARD_CONFLICT");
  });

  it("retorna SOFT_CONFLICT quando há apenas SOFT_HOLD sobreposto", () => {
    const result = engine.check({
      participantIds: ["ana"],
      range: range("2026-01-10T20:00:00Z", "2026-01-10T22:00:00Z"),
      busyBlocksByParticipant: blocksOf({
        participantId: "ana",
        state: "SOFT_HOLD",
        range: range("2026-01-10T21:00:00Z", "2026-01-10T23:00:00Z"),
      }),
    });
    expect(result.status).toBe("SOFT_CONFLICT");
  });

  it("agrega corretamente dois participantes (um livre, um com hard conflict)", () => {
    const result = engine.check({
      participantIds: ["ana", "joao"],
      range: range("2026-01-10T20:00:00Z", "2026-01-10T22:00:00Z"),
      busyBlocksByParticipant: blocksOf({
        participantId: "joao",
        state: "BUSY",
        range: range("2026-01-10T20:30:00Z", "2026-01-10T21:30:00Z"),
      }),
    });
    expect(result.status).toBe("HARD_CONFLICT");
    expect(result.participants).toEqual([
      { participantId: "ana", status: "AVAILABLE" },
      { participantId: "joao", status: "HARD_CONFLICT" },
    ]);
  });

  it("suporta dez participantes, retornando disponível quando todos estão livres", () => {
    const participantIds = Array.from({ length: 10 }, (_, i) => `user-${i}`);
    const result = engine.check({
      participantIds,
      range: range("2026-01-10T20:00:00Z", "2026-01-10T22:00:00Z"),
      busyBlocksByParticipant: blocksOf(),
    });
    expect(result.status).toBe("AVAILABLE");
    expect(result.participants).toHaveLength(10);
  });

  it("opera corretamente independente do timezone de origem, pois compara instantes UTC", () => {
    // 17h em São Paulo (UTC-3) equivale a 20h UTC — mesmo instante do compromisso.
    const localSaoPauloAsUtc = new Date("2026-01-10T20:00:00Z");
    const result = engine.check({
      participantIds: ["ana"],
      range: { start: localSaoPauloAsUtc, end: range("2026-01-10T22:00:00Z", "2026-01-10T22:00:00Z").end },
      busyBlocksByParticipant: blocksOf({
        participantId: "ana",
        state: "BUSY",
        range: range("2026-01-10T20:30:00Z", "2026-01-10T21:00:00Z"),
      }),
    });
    expect(result.status).toBe("HARD_CONFLICT");
  });

  it("considera bloco recorrente já expandido em ocorrências como blocos normais", () => {
    // Recorrência é resolvida antes de chegar ao engine (application layer expande em ocorrências).
    const sundayMass = {
      participantId: "joao",
      state: "BUSY" as const,
      range: range("2026-01-11T17:00:00Z", "2026-01-11T18:00:00Z"),
    };
    const result = engine.check({
      participantIds: ["joao"],
      range: range("2026-01-11T17:30:00Z", "2026-01-11T18:30:00Z"),
      busyBlocksByParticipant: blocksOf(sundayMass),
    });
    expect(result.status).toBe("HARD_CONFLICT");
  });

  it("aplica buffer antes/depois, gerando conflito em eventos adjacentes muito próximos", () => {
    const result = engine.check({
      participantIds: ["ana"],
      // novo evento termina exatamente 10min antes do próximo compromisso
      range: range("2026-01-10T19:00:00Z", "2026-01-10T19:50:00Z"),
      busyBlocksByParticipant: blocksOf({
        participantId: "ana",
        state: "BUSY",
        range: range("2026-01-10T20:00:00Z", "2026-01-10T21:00:00Z"),
      }),
      bufferMinutes: 15,
    });
    expect(result.status).toBe("HARD_CONFLICT");
  });

  it("não gera conflito quando eventos adjacentes respeitam o buffer configurado", () => {
    const result = engine.check({
      participantIds: ["ana"],
      range: range("2026-01-10T19:00:00Z", "2026-01-10T19:45:00Z"),
      busyBlocksByParticipant: blocksOf({
        participantId: "ana",
        state: "BUSY",
        range: range("2026-01-10T20:00:00Z", "2026-01-10T21:00:00Z"),
      }),
      bufferMinutes: 10,
    });
    expect(result.status).toBe("AVAILABLE");
  });

  it("reflete mudança de disponibilidade ocorrida durante a solicitação (revalidação)", () => {
    const rangeToCheck = range("2026-01-10T20:00:00Z", "2026-01-10T22:00:00Z");

    const firstCheck = engine.check({
      participantIds: ["ana"],
      range: rangeToCheck,
      busyBlocksByParticipant: blocksOf(),
    });
    expect(firstCheck.status).toBe("AVAILABLE");

    // Entre a exibição do card e a confirmação, ana aceitou outro compromisso (Soft Hold virou Busy).
    const secondCheck = engine.check({
      participantIds: ["ana"],
      range: rangeToCheck,
      busyBlocksByParticipant: blocksOf({
        participantId: "ana",
        state: "BUSY",
        range: rangeToCheck,
      }),
    });
    expect(secondCheck.status).toBe("HARD_CONFLICT");
  });
});
