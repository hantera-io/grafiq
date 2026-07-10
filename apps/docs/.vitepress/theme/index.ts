// Custom VitePress theme: extends the default theme and hydrates Grafiq
// mockup placeholders (emitted by @grafiq/markdown-it) into interactive
// canvases after each route renders.

import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { useRoute } from "vitepress";
import { nextTick, onMounted, watch } from "vue";

import "@grafiq/markdown-it/styles.css";
import "./custom.css";

async function hydrateMockups() {
  if (typeof window === "undefined") return;
  // Ensure the Balsamiq font is ready so text metrics are correct.
  try {
    if (document.fonts?.load) {
      await document.fonts.load('16px "Balsamiq Sans"');
      await document.fonts.ready;
    }
  } catch {
    /* font loading is best-effort */
  }
  const { hydrate } = await import("@grafiq/markdown-it/hydrate");
  hydrate();
}

const theme: Theme = {
  extends: DefaultTheme,
  setup() {
    const route = useRoute();
    onMounted(() => {
      nextTick(hydrateMockups);
    });
    watch(
      () => route.path,
      () => {
        nextTick(hydrateMockups);
      }
    );
  },
};

export default theme;
