import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// Resolve @grafiq/core to its TypeScript source so the playground can run
// without a separate build step during development. Vite/esbuild handles the
// `.ts` extension imports used throughout core.
export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@grafiq/core": fileURLToPath(
        new URL("../../packages/core/src/index.ts", import.meta.url)
      ),
    },
  },
});
