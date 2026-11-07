import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "server-only": fileURLToPath(new URL("./lib/__mocks__/server-only.ts", import.meta.url)),
    },
  },
  test: { include: ["lib/**/*.test.ts"], testTimeout: 60000, env: { PGLITE_DIR: "memory" } },
});
