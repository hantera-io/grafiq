# markdown-it plugin

`@grafiq/markdown-it` turns fenced ` ```grafiq ` (and ` ```mockup `) code blocks
into interactive Grafiq mockups. Because Grafiq renders to `<canvas>`, the plugin
emits an SSR-safe **placeholder** at build time, and a small `hydrate()` helper
turns those placeholders into live, interactive canvases on the client.

This very site uses the plugin — every mockup you see is a ` ```grafiq ` fence.

## Install

```bash
yarn add @grafiq/markdown-it @grafiq/core markdown-it
```

`@grafiq/core` is a dependency (the renderer), and `markdown-it` is a peer
dependency.

## Rendering markdown

```ts
import MarkdownIt from "markdown-it";
import grafiq from "@grafiq/markdown-it";

const md = new MarkdownIt().use(grafiq);

const html = md.render("```grafiq\nbutton \"Save\" primary\n```");
// ->
// <div class="grafiq-mockup" data-grafiq-source="button &quot;Save&quot; primary">
//   <pre class="grafiq-mockup__source"><code>button "Save" primary</code></pre>
// </div>
```

This `<div>` is the SSR-safe **placeholder** — no canvas is rendered at build
time. On the client, [`hydrate()`](#hydrating-on-the-client) replaces it with a
live, interactive `<canvas>`. The inner `<pre>` is the no-JS fallback (kept
because `fallbackSource` defaults to `true`); it keeps the source visible when
JavaScript is disabled and is discarded during hydration. Set
`fallbackSource: false` to emit just the empty placeholder `<div>`.

### Plugin options

```ts
md.use(grafiq, {
  langs: ["grafiq", "mockup"], // fence info-strings to intercept
  className: "grafiq-mockup",   // wrapper class
  fallbackSource: true,          // render a <pre> fallback for no-JS
});
```

## Hydrating on the client

Import the stylesheet once, then call `hydrate()` after your content is in the
DOM:

```ts
import "@grafiq/markdown-it/styles.css";
import { hydrate } from "@grafiq/markdown-it/hydrate";

hydrate();
```

### Hydrate options

```ts
hydrate({
  root: document.querySelector("#content")!, // scope the search
  maxWidth: 720,     // width offered to the renderer
  lightbox: true,    // show the fullscreen ⤢ button (default)
  codeToggle: true,  // show the </> source toggle (default)
  editable: true,    // allow live editing in the code view (default; implies codeToggle)
  theme: {           // partial theme overrides
    accent: "#2f6fb0",
  },
});
```

`hydrate()` is safe to call multiple times — already-hydrated mockups are
skipped, which makes it ideal for SPA route changes.

## Toolbar: code toggle & inline editing

Each hydrated mockup gets a small toolbar (shown on hover) with up to three
buttons:

- **`</>`** — toggle between the rendered mockup and its DSL source.
- **`↺`** — reset an edited mockup back to its original source (appears only
  after you've made a change).
- **`⤢`** — open the mockup fullscreen (see below).

When `editable` is on (the default), the source view is a live editor: type in
it and the mockup re-renders as you go — a mini-playground embedded in every
code block. This is why the documentation doesn't duplicate a separate "code"
block next to each mockup: **the mockup _is_ the code**, one `</>` click away.

Set `editable: false` for a read-only source view, or `codeToggle: false` to
hide the source entirely.


## Fullscreen lightbox

Each hydrated mockup gets a **⤢** button (visible on hover). Clicking it opens
the same DSL in a larger lightbox overlay with its own interaction store. You
can also drive it programmatically:

```ts
import { openLightbox, closeLightbox } from "@grafiq/markdown-it/hydrate";

openLightbox('button "Hello" primary');
// … later
closeLightbox();
```

## Using it with VitePress

```ts
// .vitepress/config.ts
import { defineConfig } from "vitepress";
import grafiq from "@grafiq/markdown-it";

export default defineConfig({
  markdown: {
    config(md) {
      md.use(grafiq);
    },
  },
});
```

```ts
// .vitepress/theme/index.ts
import DefaultTheme from "vitepress/theme";
import { useRoute } from "vitepress";
import { nextTick, onMounted, watch } from "vue";
import "@grafiq/markdown-it/styles.css";

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute();
    const run = () =>
      nextTick(async () => {
        const { hydrate } = await import("@grafiq/markdown-it/hydrate");
        hydrate();
      });
    onMounted(run);
    watch(() => route.path, run);
  },
};
```
