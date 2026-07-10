# @grafiq/markdown-it

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin that renders
**Grafiq** mockups from fenced code blocks — with client-side hydration and a
built-in fullscreen lightbox.

Because Grafiq renders to `<canvas>`, the plugin emits an SSR-safe **placeholder**
at build time. On the client, `hydrate()` turns those placeholders into live,
interactive canvases.

## Install

```bash
yarn add @grafiq/markdown-it @grafiq/core markdown-it
```

## Plugin

```ts
import MarkdownIt from "markdown-it";
import grafiq from "@grafiq/markdown-it";

const md = new MarkdownIt().use(grafiq);
md.render("```grafiq\nbutton \"Save\" primary\n```");
// -> <div class="grafiq-mockup" data-grafiq-source="…">…</div>
```

Options:

```ts
md.use(grafiq, {
  langs: ["grafiq", "mockup"], // fence info-strings to intercept
  className: "grafiq-mockup",   // wrapper class
  fallbackSource: true,          // render a <pre> fallback for no-JS
});
```

## Hydration

```ts
import "@grafiq/markdown-it/styles.css";
import { hydrate } from "@grafiq/markdown-it/hydrate";

hydrate({
  maxWidth: 720,     // width offered to the renderer
  lightbox: true,    // show the fullscreen ⤢ button (default)
  codeToggle: true,  // show the </> source toggle (default)
  editable: true,    // live-editable source view (default; implies codeToggle)
});
```

`hydrate()` is idempotent — already-hydrated mockups are skipped, so it's safe
to call on every SPA route change.

## Toolbar: code toggle & inline editing

Each hydrated mockup gets a hover toolbar:

- **`</>`** — toggle between the mockup and its DSL source.
- **`↺`** — reset an edited mockup to its original (appears after editing).
- **`⤢`** — open fullscreen.

With `editable` on (default), the source view re-renders live as you type — a
mini-playground in every code block. Use `editable: false` for a read-only
view, or `codeToggle: false` to hide the source.

## Lightbox


Each hydrated mockup gets a **⤢** button (visible on hover) that opens the same
DSL fullscreen. Drive it programmatically:

```ts
import { openLightbox, closeLightbox } from "@grafiq/markdown-it/hydrate";
openLightbox('button "Hello" primary');
```

See the [documentation](https://github.com/hantera-io/grafiq) for a VitePress
integration example.
