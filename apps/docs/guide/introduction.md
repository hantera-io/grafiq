# Introduction

**Grafiq** is a code-backed hand-drawn mockup DSL — think “Mermaid for
wireframes” or a text-driven Balsamiq. Write a few indented lines and get a
sketchy UI mockup rendered to canvas. It's designed to be **LLM-friendly**, so
it drops naturally into markdown specs.

```grafiq
card "Create your account" w=360
  input "Full name" placeholder="Ada Lovelace"
  input "Email" placeholder="ada@example.com"
  input "Password" type=password
  toggle "Email me product updates" on
  row gap=8
    button "Cancel"
    spacer
    button "Sign up" primary
```

## Why Grafiq?

- **Deterministic** — a seeded RNG means the same DSL always renders identically,
  which is great for spec diffs and screenshots.
- **Forgiving** — unknown attributes are ignored, aliases are accepted
  (`btn` → `button`), and parse errors render inline instead of throwing.
- **Extensible** — add a component by registering `{ measure, draw }` using a
  handful of sketchy primitives.
- **Lightly interactive** — dropdowns open, tabs switch, checkboxes/toggles flip,
  and screens scroll.

## How it works

```
DSL text
  → parser      line + indentation → AST (forgiving; errors become sticky notes)
  → components  registry: each component declares measure() + draw()
  → layout      flexbox-lite: row/col, gap, pad, fill/hug
  → render      canvas 2D + rough.js (seeded → deterministic), Balsamiq Sans
```

## Packages

Grafiq is split into focused packages:

| Package | What it is |
|---|---|
| [`@grafiq/core`](/guide/syntax) | The parser + canvas renderer + component registry. |
| [`@grafiq/markdown-it`](/guide/markdown-it) | A markdown-it plugin that turns ` ```grafiq ` fences into interactive mockups. |

There's also a **playground** app (live editor) and this **documentation** site,
both statically publishable.

## Next steps

- Learn the [syntax](/guide/syntax) (3 rules).
- Browse the [components](/components/).
- Embed mockups in your own markdown with the
  [markdown-it plugin](/guide/markdown-it).
- Grab the [full GRAMMAR.md cheatsheet](https://raw.githubusercontent.com/hantera-io/grafiq/refs/heads/main/GRAMMAR.md)
  to paste into an LLM system prompt.

## About

Grafiq is built and maintained by [Hantera](https://www.hantera.io/), and is
open source under the Apache 2.0 License. Contributions and issues are welcome
on [GitHub](https://github.com/hantera-io/grafiq).



