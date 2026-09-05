export const lightColors = {
  primary: "#665CF6",
  secondary: "#23BFA7",
  warningSoftHold: "#F2B84B",
  dangerConflict: "#EF6461",
  background: "#F7F8FB",
  surface: "#FFFFFF",
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
  textPrimary: "#F7F8FB",
  textSecondary: "#A1A1AA",
} as const;

export type ColorToken = keyof typeof lightColors;
