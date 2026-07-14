// Custom VitePress theme: extends the default theme and hydrates Grafiq
// mockup placeholders (emitted by @grafiq/markdown-it) into interactive
// canvases after each route renders.

import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { useRoute } from "vitepress";
import { nextTick, onMounted, watch } from "vue";

import "@grafiq/markdown-it/styles.css";
import "./custom.css";

// Track SPA route changes. The initial page view is tracked by the
// inline snippet injected via `head` in config.ts; this handles subsequent
// client-side navigations.
function trackPageView() {
  if (typeof window === "undefined") return;
  const _paq = ((window as any)._paq = (window as any)._paq || []);
  _paq.push(["setCustomUrl", window.location.href]);
  _paq.push(["setDocumentTitle", document.title]);
  _paq.push(["setReferrerUrl", document.referrer]);
  _paq.push(["trackPageView"]);
}

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
        nextTick(() => {
          trackPageView();
          hydrateMockups();
        });
      }
    );
  },
};

export default theme;
