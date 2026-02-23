import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  test: {
    include: ["src/**/__tests__/**/*.spec.ts"],
  },
});
