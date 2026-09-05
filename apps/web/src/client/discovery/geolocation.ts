import type { GeoPointDto } from "./types";

/** São Paulo — mesma região dos dados de exemplo do catálogo local (MockEventDiscoveryProvider). */
export const FALLBACK_LOCATION: GeoPointDto = { latitude: -23.5505, longitude: -46.6333 };

/** Nunca rejeita — resolve `null` quando geolocalização não está disponível, é negada ou expira. */
export function getBrowserLocation(): Promise<GeoPointDto | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 },
    );
  });
}
