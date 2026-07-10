import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
        hydrate: fileURLToPath(new URL("./src/hydrate.ts", import.meta.url)),
      },
      formats: ["es"],
    },
    rollupOptions: {
      // Keep peer/runtime deps external so they're deduped by the consumer.
      external: ["markdown-it", "@grafiq/core", "roughjs"],
      output: {
        entryFileNames: "grafiq-[name].js",
      },
    },
  },
});
