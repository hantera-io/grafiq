# @grafiq/core

The core of **Grafiq** — a code-backed hand-drawn mockup DSL. This package
contains the parser and the canvas renderer, plus the component registry that
serves as the extension point.

## Install

```bash
yarn add @grafiq/core
```

## Usage

```ts
import { render } from "@grafiq/core";

const canvas = document.querySelector("canvas")!;
const result = render(canvas, `
screen "Login" size=380x520
  navbar "MyApp"
  col pad=24 gap=16
    heading "Welcome back"
    input "Email" placeholder="you@example.com"
    button "Sign In" primary fill
`);

// result.errors — any parse issues (also drawn as a sticky note)
// result.frame  — interaction hit regions + overlays for wiring events
```

### Parse only

```ts
import { parse } from "@grafiq/core";
const { root, errors } = parse('button "Save" primary');
```

## Extending

Register a custom component with `{ measure, draw }`:

```ts
import { register, type Component } from "@grafiq/core";

const stamp: Component = {
  measure: () => ({ w: 80, h: 32 }),
  draw(node, box, ctx) {
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, 6);
    ctx.pen.text(node.text ?? "Stamp", box.x + box.w / 2, box.y + box.h / 2, {
      align: "center",
    });
  },
};

register("stamp", stamp);
```

See the [documentation](https://github.com/hantera-io/grafiq) for the full
grammar and component reference.
