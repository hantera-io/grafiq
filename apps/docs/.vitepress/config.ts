import { defineConfig } from "vitepress";
import { fileURLToPath } from "node:url";
// Import the plugin from source so docs work without a prior package build.
import grafiq from "../../../packages/markdown-it/src/index.ts";


export default defineConfig({
  title: "Grafiq",
  description:
    "A code-backed hand-drawn mockup DSL — Mermaid for wireframes, LLM-friendly.",
  lang: "en-US",

  // Dogfood the markdown-it plugin: ```grafiq fences become interactive mockups.
  markdown: {
    config(md) {
      md.use(grafiq);
    },
  },

  vite: {
    resolve: {
      alias: {
        "@grafiq/core": fileURLToPath(
          new URL("../../../packages/core/src/index.ts", import.meta.url)
        ),
        "@grafiq/markdown-it/hydrate": fileURLToPath(
          new URL("../../../packages/markdown-it/src/hydrate.ts", import.meta.url)
        ),
      },
    },
  },

  head: [
    ["link", { rel: "icon", type: "image/png", href: "/favicon.png" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
    ],

    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Balsamiq+Sans:wght@400;700&display=swap",
      },
    ],
  ],

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "Syntax", link: "/guide/syntax" },
      { text: "Components", link: "/components/" },
      { text: "Playground", link: "https://playground.grafiq.dev" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Introduction", link: "/guide/introduction" },
            { text: "Syntax", link: "/guide/syntax" },
            { text: "Interactivity", link: "/guide/interactivity" },
            { text: "markdown-it plugin", link: "/guide/markdown-it" },
          ],
        },
      ],
      "/components/": [
        {
          text: "Components",
          items: [
            { text: "Overview", link: "/components/" },
            { text: "Text", link: "/components/text" },
            { text: "Inputs", link: "/components/inputs" },
            { text: "Layout & chrome", link: "/components/layout" },
            { text: "Feedback & status", link: "/components/feedback" },
            { text: "Navigation", link: "/components/navigation" },
            { text: "Data & media", link: "/components/data" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/hantera-io/grafiq" },
    ],
    footer: {
      message: "Released under the Apache 2.0 License.",

      copyright:
        'A project by <a href="https://www.hantera.io/" target="_blank" rel="noopener">Hantera</a>.',
    },
  },
});


