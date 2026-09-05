import { describe, expect, it } from "vitest";
import { assertValidEventTimeRange, InvalidEventTimeRangeError } from "./event-time";

describe("assertValidEventTimeRange", () => {
  it("aceita intervalo onde o fim é posterior ao início", () => {
    expect(() =>
      assertValidEventTimeRange(new Date("2026-01-10T20:00:00Z"), new Date("2026-01-10T22:00:00Z")),
    ).not.toThrow();
  });

  it("rejeita quando o fim é igual ao início", () => {
    const date = new Date("2026-01-10T20:00:00Z");
    expect(() => assertValidEventTimeRange(date, date)).toThrow(InvalidEventTimeRangeError);
  });

  it("rejeita quando o fim é anterior ao início", () => {
    expect(() =>
      assertValidEventTimeRange(new Date("2026-01-10T22:00:00Z"), new Date("2026-01-10T20:00:00Z")),
    ).toThrow(InvalidEventTimeRangeError);
  });
});
