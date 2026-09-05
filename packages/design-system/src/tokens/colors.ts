export const lightColors = {
  primary: "#665CF6",
  secondary: "#23BFA7",
  warningSoftHold: "#F2B84B",
  dangerConflict: "#EF6461",
  background: "#F7F8FB",
  surface: "#FFFFFF",
  surfaceHover: "#F1F2F6",
  border: "#E5E7EB",
  textPrimary: "#17181C",
  textSecondary: "#71717A",
} as const;

export const darkColors = {
  primary: "#8B82FF",
  secondary: "#3FDFC4",
  warningSoftHold: "#F5C56B",
  dangerConflict: "#F2837D",
  background: "#111214",
  surface: "#1B1C20",
  surfaceHover: "#232429",
  border: "#2E2F36",
  textPrimary: "#F7F8FB",
  textSecondary: "#A1A1AA",
} as const;

export type ColorToken = keyof typeof lightColors;

/** Tripla "R G B" (sem vírgulas) — formato exigido por `rgb(var(--x) / <alpha-value>)` no Tailwind. */
function hexToRgbTriplet(hex: string): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function toRgbTriplets(colors: typeof lightColors): Record<ColorToken, string> {
  return Object.fromEntries(
    Object.entries(colors).map(([key, hex]) => [key, hexToRgbTriplet(hex)]),
  ) as Record<ColorToken, string>;
}
