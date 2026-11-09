import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    pool: "forks",
    testTimeout: 30_000,
    include: ["src/test/**/*.test.ts"],
  },
});
