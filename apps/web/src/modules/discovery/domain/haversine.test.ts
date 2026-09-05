import { describe, expect, it } from "vitest";
import { distanceKm } from "./haversine";

describe("distanceKm", () => {
  it("retorna 0 para o mesmo ponto", () => {
    const point = { latitude: -23.5505, longitude: -46.6333 };
    expect(distanceKm(point, point)).toBeCloseTo(0, 5);
  });

  it("calcula a distância aproximada entre São Paulo e Rio de Janeiro (~360km)", () => {
    const saoPaulo = { latitude: -23.5505, longitude: -46.6333 };
    const rioDeJaneiro = { latitude: -22.9068, longitude: -43.1729 };
    const distance = distanceKm(saoPaulo, rioDeJaneiro);
    expect(distance).toBeGreaterThan(350);
    expect(distance).toBeLessThan(370);
  });

  it("é simétrica", () => {
    const a = { latitude: -23.5505, longitude: -46.6333 };
    const b = { latitude: -22.9068, longitude: -43.1729 };
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 10);
  });
});
