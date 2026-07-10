import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      name: "Grafiq",
      fileName: "grafiq-core",
      formats: ["es"],
    },
    rollupOptions: {
      // roughjs is bundled; keep it external for the library build so
      // consumers dedupe it. Comment out to produce a self-contained bundle.
      external: ["roughjs"],
      output: {
        globals: { roughjs: "rough" },
      },
    },
  },
});
