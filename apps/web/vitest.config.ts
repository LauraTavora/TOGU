import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "app/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
    // bcrypt (12 rounds) fica pesado quando muitos arquivos de teste rodam
    // juntos — evita falso-negativo por timeout sob carga.
    testTimeout: 15000,
  },
});
