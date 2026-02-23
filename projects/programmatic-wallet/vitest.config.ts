import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  test: {
    include: ["src/**/__tests__/**/*.spec.ts"],
  },
});
