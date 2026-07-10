# ✎ Grafiq

A code-backed **hand-drawn mockup DSL** — think "Mermaid for wireframes" or a
text-driven Balsamiq. Write a few indented lines, get a sketchy UI mockup
rendered to canvas. Designed to be **LLM-friendly** so it drops naturally into
markdown specs.


```
screen "Login" size=380x520
  navbar "MyApp"
    avatar
  col pad=24 gap=16
    heading "Welcome back"
    input "Email" placeholder="you@example.com"
    input "Password" type=password
    row gap=8
      checkbox "Remember me" checked
      spacer
      link "Forgot password?"
    button "Sign In" primary fill
```

## Monorepo layout

Grafiq is a yarn-workspaces monorepo split into four parts:

```
packages/
  core/          @grafiq/core         — the parser + canvas renderer + registry
  markdown-it/   @grafiq/markdown-it  — markdown-it plugin + hydrate() + lightbox
apps/
  playground/    @grafiq/playground   — live DSL editor (statically publishable)
  docs/          @grafiq/docs         — VitePress documentation (statically publishable)
```

## Quick start

```bash
yarn install
yarn dev            # opens the interactive playground
```

Other useful scripts (run from the repo root):

```bash
yarn build          # build @grafiq/core and @grafiq/markdown-it
yarn playground:build   # static build of the playground
yarn docs:dev           # run the documentation site locally
yarn docs:build         # static build of the docs
```

The playground has a live editor on the left, a canvas preview on the right,
example presets, and PNG export.

## Packages

### `@grafiq/core`

The parser and renderer. Programmatic use:

```ts
import { render } from "@grafiq/core";
render(canvas, 'button "Save" primary');
```

### `@grafiq/markdown-it`

A markdown-it plugin that turns ` ```grafiq ` fences into interactive mockups.
It emits an SSR-safe placeholder at build time; a client-side `hydrate()` helper
renders them into interactive canvases and adds a built-in fullscreen lightbox.

```ts
import MarkdownIt from "markdown-it";
import grafiq from "@grafiq/markdown-it";
const md = new MarkdownIt().use(grafiq);
```

```ts
import "@grafiq/markdown-it/styles.css";
import { hydrate } from "@grafiq/markdown-it/hydrate";
hydrate();
```

## How it works


```
DSL text
  → parser/     line + indentation → AST (forgiving; errors become sticky notes)
  → components/ registry: each component declares measure() + draw()
  → layout/     flexbox-lite: row/col, gap, pad, fill/hug
  → render/     canvas 2D + rough.js (seeded → deterministic), Balsamiq Sans
```

- **Deterministic**: a seeded RNG means the same DSL always renders identically —
  good for spec diffs and screenshots.
- **Forgiving**: unknown attributes are ignored, aliases are accepted
  (`btn`→`button`), and parse errors render inline instead of throwing.
- **Extensible**: add a component by registering `{ measure, draw }` using a
  handful of sketchy primitives (`rect`, `line`, `ellipse`, `text`, `imageBox`,
  `squiggle`).
- **Lightly interactive**: dropdowns open, tabs switch, checkboxes/toggles flip,
  and screens scroll (wheel) — clickable regions + overlays are collected during
  draw and hit-tested by the playground. Screens clip content to the frame and
  auto-wrap long text.


## The DSL

See **[GRAMMAR.md](./GRAMMAR.md)** for the full cheatsheet — it's written to be
pasted directly into an LLM system prompt.

Three rules:
1. One component per line; first word is the component name.
2. A quoted string after the name is its primary text.
3. `key=value` sets an attribute; a bare word is a boolean flag.

Indentation nests children. Optional inline `{ a; b }` for compact groups.



