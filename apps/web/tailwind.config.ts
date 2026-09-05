import type { Config } from "tailwindcss";
import { lightColors } from "@togu/design-system";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: lightColors.primary,
        secondary: lightColors.secondary,
        "warning-soft-hold": lightColors.warningSoftHold,
        "danger-conflict": lightColors.dangerConflict,
        background: lightColors.background,
        surface: lightColors.surface,
        "text-primary": lightColors.textPrimary,
        "text-secondary": lightColors.textSecondary,
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
