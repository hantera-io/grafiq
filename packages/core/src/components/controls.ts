// Leaf components: text, inputs, and small widgets. Each is tiny — a measure()
// returning its intrinsic size and a draw() using Pen primitives.

import type { Box, Node } from "../types.ts";
import { SPACING } from "../render/theme.ts";
import {
  type Component,
  type CompContext,
  explicitH,
  explicitW,
  flag,
  num,
  register,
  str,
} from "./registry.ts";

const CH = SPACING.controlHeight;

function textOf(node: Node, dflt = ""): string {
  return node.text ?? dflt;
}

// --- text ---------------------------------------------------------------------

const heading: Component = {
  measure(node, ctx) {
    const size = num(node, "size", ctx.pen.theme.headingSize);
    const w = ctx.pen.measureText(textOf(node, "Heading"), size, true);
    return { w: explicitW(node) ?? w, h: explicitH(node) ?? size * 1.4 };
  },
  draw(node, box, ctx) {
    const size = num(node, "size", ctx.pen.theme.headingSize);
    ctx.pen.text(textOf(node, "Heading"), box.x, box.y + box.h / 2, { size, bold: true });
  },
};

const LINE_H = 1.45;

const text: Component = {
  measure(node, ctx, availW) {
    const t = textOf(node, "Text");
    const single = ctx.pen.measureText(t);
    const ex = explicitW(node);
    // If an explicit width is set, or the text is wider than what the parent
    // can offer, wrap it and grow vertically to fit.
    const wrapWidth = ex ?? (single > availW && availW > 0 ? availW : single);
    const lines = ctx.pen.wrapText(t, wrapWidth);
    const w = ex ?? Math.min(single, wrapWidth);
    const h = explicitH(node) ?? lines.length * ctx.pen.theme.fontSize * LINE_H;
    return { w, h };
  },
  draw(node, box, ctx) {
    const color = flag(node, "muted") ? ctx.pen.theme.inkLight : ctx.pen.theme.ink;
    const lineH = ctx.pen.theme.fontSize * LINE_H;
    const lines = ctx.pen.wrapText(textOf(node, "Text"), box.w);
    lines.forEach((ln, i) => {
      ctx.pen.text(ln, box.x, box.y + lineH * (i + 0.5), { color });
    });
  },
};


const link: Component = {
  measure(node, ctx) {
    const t = textOf(node, "link");
    return { w: explicitW(node) ?? ctx.pen.measureText(t), h: explicitH(node) ?? ctx.pen.theme.fontSize * 1.5 };
  },
  draw(node, box, ctx) {
    const t = textOf(node, "link");
    const w = ctx.pen.measureText(t);
    ctx.pen.text(t, box.x, box.y + box.h / 2, { color: ctx.pen.theme.accent });
    ctx.pen.line(box.x, box.y + box.h / 2 + 8, box.x + w, box.y + box.h / 2 + 8, {
      stroke: ctx.pen.theme.accent,
    });
  },
};

// --- button -------------------------------------------------------------------

const button: Component = {
  measure(node, ctx) {
    const label = textOf(node, "Button");
    const w = ctx.pen.measureText(label, ctx.pen.theme.fontSize, true) + 34;
    return { w: explicitW(node) ?? Math.max(72, w), h: explicitH(node) ?? CH };
  },
  draw(node, box, ctx) {
    const primary = flag(node, "primary");
    const disabled = flag(node, "disabled");
    const stroke = disabled ? ctx.pen.theme.inkLight : ctx.pen.theme.ink;
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, 7, {
      stroke,
      fill: primary ? ctx.pen.theme.accentFill : undefined,
      fillStyle: "solid",
    });
    ctx.pen.text(textOf(node, "Button"), box.x + box.w / 2, box.y + box.h / 2, {
      align: "center",
      bold: primary,
      color: disabled ? ctx.pen.theme.inkLight : ctx.pen.theme.ink,
    });
  },
};

// --- input / textarea / search ------------------------------------------------

function drawFieldLabel(node: Node, box: Box, ctx: CompContext): number {
  const label = str(node, "label");
  if (!label) return box.y;
  ctx.pen.text(label, box.x, box.y + ctx.pen.theme.fontSize * 0.7, { size: 13, color: ctx.pen.theme.inkLight });
  return box.y + ctx.pen.theme.fontSize + 4;
}

const input: Component = {
  measure(node, ctx) {
    const hasLabel = !!str(node, "label");
    const w = explicitW(node) ?? 200;
    const h = (explicitH(node) ?? CH) + (hasLabel ? ctx.pen.theme.fontSize + 4 : 0);
    return { w, h };
  },
  draw(node, box, ctx) {
    const top = drawFieldLabel(node, box, ctx);
    const fieldH = box.y + box.h - top;
    ctx.pen.rect(box.x, top, box.w, fieldH);
    const ph = node.text ?? str(node, "placeholder");
    const isPassword = str(node, "type") === "password";
    if (isPassword && node.text) {
      ctx.pen.text("••••••••", box.x + 8, top + fieldH / 2);
    } else if (ph) {
      const muted = !node.text;
      ctx.pen.text(ph, box.x + 8, top + fieldH / 2, { color: muted ? ctx.pen.theme.inkLight : ctx.pen.theme.ink });
    }
  },
};

const textarea: Component = {
  measure(node) {
    return { w: explicitW(node) ?? 240, h: explicitH(node) ?? CH * 2.4 };
  },
  draw(node, box, ctx) {
    const top = drawFieldLabel(node, box, ctx);
    ctx.pen.rect(box.x, top, box.w, box.y + box.h - top);
    const ph = node.text ?? str(node, "placeholder");
    if (ph) ctx.pen.text(ph, box.x + 8, top + 16, { color: node.text ? ctx.pen.theme.ink : ctx.pen.theme.inkLight });
  },
};

const search: Component = {
  measure(node) {
    return { w: explicitW(node) ?? 220, h: explicitH(node) ?? CH };
  },
  draw(node, box, ctx) {
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, box.h / 2);
    const r = box.h * 0.28;
    const cx = box.x + 16;
    const cy = box.y + box.h / 2;
    ctx.pen.circle(cx, cy, r * 2, { strokeWidth: 1.2 });
    ctx.pen.line(cx + r * 0.8, cy + r * 0.8, cx + r * 1.6, cy + r * 1.6, { strokeWidth: 1.2 });
    const ph = node.text ?? str(node, "placeholder", "Search");
    ctx.pen.text(ph, box.x + 30, cy, { color: node.text ? ctx.pen.theme.ink : ctx.pen.theme.inkLight });
  },
};

// --- checkbox / radio / toggle ------------------------------------------------

/** Resolve a boolean that can be toggled: interaction state overrides the DSL. */
function boolState(node: Node, ctx: CompContext, ...attrKeys: string[]): boolean {
  const s = ctx.store.peek(ctx.path);
  if (s && s.checked !== undefined) return s.checked;
  return attrKeys.some((k) => flag(node, k));
}

const checkbox: Component = {
  measure(node, ctx) {
    const label = textOf(node);
    return { w: explicitW(node) ?? 18 + (label ? ctx.pen.measureText(label) + 8 : 0), h: 22 };
  },
  draw(node, box, ctx) {
    const s = 16;
    const cy = box.y + box.h / 2;
    const on = boolState(node, ctx, "checked");
    ctx.pen.rect(box.x, cy - s / 2, s, s);
    if (on) ctx.pen.check(box.x, cy - s / 2, s);
    const label = textOf(node);
    if (label) ctx.pen.text(label, box.x + s + 8, cy);
    const path = ctx.path;
    ctx.frame.addHit({
      box,
      z: 0,
      onClick: () => ctx.store.set(path, { checked: !on }),
    });
  },
};

const radio: Component = {
  measure(node, ctx) {
    const label = textOf(node);
    return { w: explicitW(node) ?? 18 + (label ? ctx.pen.measureText(label) + 8 : 0), h: 22 };
  },
  draw(node, box, ctx) {
    const s = 16;
    const cy = box.y + box.h / 2;
    const on = boolState(node, ctx, "checked", "selected");
    ctx.pen.circle(box.x + s / 2, cy, s);
    if (on) ctx.pen.circle(box.x + s / 2, cy, s * 0.45, { fill: ctx.pen.theme.ink, fillStyle: "solid" });
    const label = textOf(node);
    if (label) ctx.pen.text(label, box.x + s + 8, cy);
    const path = ctx.path;
    ctx.frame.addHit({ box, z: 0, onClick: () => ctx.store.set(path, { checked: !on }) });
  },
};

const toggle: Component = {
  measure(node, ctx) {
    const label = textOf(node);
    return { w: explicitW(node) ?? 44 + (label ? ctx.pen.measureText(label) + 8 : 0), h: 24 };
  },
  draw(node, box, ctx) {
    const w = 40;
    const h = 20;
    const cy = box.y + box.h / 2;
    const on = boolState(node, ctx, "on", "checked");
    ctx.pen.roundRect(box.x, cy - h / 2, w, h, h / 2, {
      fill: on ? ctx.pen.theme.accentFill : undefined,
      fillStyle: "solid",
    });
    const knobX = on ? box.x + w - h / 2 : box.x + h / 2;
    ctx.pen.circle(knobX, cy, h - 4, { fill: ctx.pen.theme.fill, fillStyle: "solid" });
    const label = textOf(node);
    if (label) ctx.pen.text(label, box.x + w + 8, cy);
    const path = ctx.path;
    ctx.frame.addHit({ box, z: 0, onClick: () => ctx.store.set(path, { checked: !on }) });
  },
};

// --- select / slider ----------------------------------------------------------

/** Options for a select: from `options="a, b, c"` or a sensible fallback. */
function selectOptions(node: Node): string[] {
  const raw = str(node, "options");
  if (raw) return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return ["Option 1", "Option 2", "Option 3"];
}

const select: Component = {
  measure(node, ctx) {
    const opts = selectOptions(node);
    const widest = Math.max(
      ctx.pen.measureText(textOf(node, "Select…")),
      ...opts.map((o) => ctx.pen.measureText(o))
    );
    return { w: explicitW(node) ?? Math.max(120, widest + 44), h: explicitH(node) ?? CH };
  },
  draw(node, box, ctx) {
    const path = ctx.path;
    const st = ctx.store.peek(path);
    const open = st?.open ?? false;
    const opts = selectOptions(node);
    // Chosen label: stored active index > node.text > placeholder.
    const active = st?.active;
    const chosen = active !== undefined ? opts[active] : node.text;

    ctx.pen.rect(box.x, box.y, box.w, box.h);
    ctx.pen.text(chosen ?? "Select…", box.x + 8, box.y + box.h / 2, {
      color: chosen ? ctx.pen.theme.ink : ctx.pen.theme.inkLight,
    });
    // chevron (flips when open)
    const cx = box.x + box.w - 16;
    const cy = box.y + box.h / 2;
    if (open) {
      ctx.pen.line(cx - 5, cy + 3, cx, cy - 3, { strokeWidth: 1.4 });
      ctx.pen.line(cx, cy - 3, cx + 5, cy + 3, { strokeWidth: 1.4 });
    } else {
      ctx.pen.line(cx - 5, cy - 3, cx, cy + 3, { strokeWidth: 1.4 });
      ctx.pen.line(cx, cy + 3, cx + 5, cy - 3, { strokeWidth: 1.4 });
    }

    // Clicking the field toggles the dropdown open/closed.
    ctx.frame.addHit({
      box,
      z: 1,
      onClick: () => ctx.store.set(path, { open: !open }),
    });

    // When open, register an overlay that paints the options above other content.
    if (open) {
      const rowH = CH;
      const listBox: Box = { x: box.x, y: box.y + box.h, w: box.w, h: rowH * opts.length };
      const pen = ctx.pen;
      const regions = opts.map((_, i) => ({
        box: { x: listBox.x, y: listBox.y + i * rowH, w: listBox.w, h: rowH } as Box,
        z: 10,
        onClick: () => ctx.store.set(path, { active: i, open: false }),
      }));
      ctx.frame.addOverlay({
        z: 10,
        regions,
        draw: () => {
          pen.rect(listBox.x, listBox.y, listBox.w, listBox.h, { fill: pen.theme.paper, fillStyle: "solid" });
          opts.forEach((o, i) => {
            const ry = listBox.y + i * rowH;
            if (i === active) pen.rect(listBox.x, ry, listBox.w, rowH, { fill: pen.theme.accentFill, fillStyle: "solid", stroke: "transparent" });
            pen.text(o, listBox.x + 8, ry + rowH / 2, { bold: i === active });
            if (i < opts.length - 1) pen.line(listBox.x, ry + rowH, listBox.x + listBox.w, ry + rowH, { stroke: "#eee" });
          });
        },
      });
    }
  },
};


const slider: Component = {
  measure(node) {
    return { w: explicitW(node) ?? 180, h: 24 };
  },
  draw(node, box, ctx) {
    const cy = box.y + box.h / 2;
    ctx.pen.line(box.x, cy, box.x + box.w, cy);
    const pct = Math.min(100, Math.max(0, num(node, "value", 50))) / 100;
    ctx.pen.circle(box.x + box.w * pct, cy, 16, { fill: ctx.pen.theme.accentFill, fillStyle: "solid" });
  },
};

// --- divider / spacer ---------------------------------------------------------

const divider: Component = {
  measure(node, ctx) {
    if (node.text) return { w: 0, h: ctx.pen.theme.fontSize * 1.6 };
    return { w: 0, h: num(node, "h", 12) };
  },
  draw(node, box, ctx) {
    const cy = box.y + box.h / 2;
    if (node.text) {
      const tw = ctx.pen.measureText(node.text);
      const mid = box.x + box.w / 2;
      ctx.pen.line(box.x, cy, mid - tw / 2 - 8, cy, { stroke: ctx.pen.theme.inkLight });
      ctx.pen.text(node.text, mid, cy, { align: "center", color: ctx.pen.theme.inkLight });
      ctx.pen.line(mid + tw / 2 + 8, cy, box.x + box.w, cy, { stroke: ctx.pen.theme.inkLight });
    } else {
      ctx.pen.line(box.x, cy, box.x + box.w, cy, { stroke: ctx.pen.theme.inkLight });
    }
  },
};

const spacer: Component = {
  measure(node) {
    return { w: num(node, "w", 0), h: num(node, "h", 0) };
  },
  draw() {
    /* invisible; exists to push siblings apart (fill by default) */
  },
  defaultFill: true,
};

// --- image / avatar / icon ----------------------------------------------------

const image: Component = {
  measure(node) {
    return { w: explicitW(node) ?? 120, h: explicitH(node) ?? 90 };
  },
  draw(node, box, ctx) {
    ctx.pen.imageBox(box.x, box.y, box.w, box.h);
    if (node.text) ctx.pen.text(node.text, box.x + box.w / 2, box.y + box.h + 12, { align: "center", size: 12, color: ctx.pen.theme.inkLight });
  },
};

const avatar: Component = {
  measure(node) {
    const d = explicitW(node) ?? num(node, "size", 40);
    return { w: d, h: d };
  },
  draw(node, box, ctx) {
    const d = Math.min(box.w, box.h);
    const cx = box.x + d / 2;
    const cy = box.y + d / 2;
    ctx.pen.circle(cx, cy, d);
    // simple head + shoulders
    ctx.pen.circle(cx, cy - d * 0.12, d * 0.34);
    ctx.pen.rc.path(`M${cx - d * 0.28},${cy + d * 0.42} Q${cx},${cy + d * 0.05} ${cx + d * 0.28},${cy + d * 0.42}`, {
      stroke: ctx.pen.theme.ink,
      roughness: ctx.pen.theme.roughness,
      seed: ctx.pen.theme.seed,
    });
  },
};

const icon: Component = {
  measure(node) {
    const d = explicitW(node) ?? num(node, "size", 24);
    return { w: d, h: d };
  },
  draw(node, box, ctx) {
    const d = Math.min(box.w, box.h);
    const x = box.x;
    const y = box.y;
    const name = str(node, "name", node.text ?? "star");
    ctx.pen.rect(x, y, d, d, { stroke: ctx.pen.theme.inkLight });
    ctx.pen.text(name.slice(0, 3), x + d / 2, y + d / 2, { align: "center", size: 10, color: ctx.pen.theme.inkLight });
  },
};

// --- progress -----------------------------------------------------------------

const progress: Component = {
  measure(node) {
    return { w: explicitW(node) ?? 180, h: 16 };
  },
  draw(node, box, ctx) {
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, box.h / 2);
    const pct = Math.min(100, Math.max(0, num(node, "value", 40))) / 100;
    if (pct > 0) ctx.pen.roundRect(box.x, box.y, box.w * pct, box.h, box.h / 2, { fill: ctx.pen.theme.accentFill, fillStyle: "solid" });
  },
};

export function registerControls(): void {
  register("heading", heading);
  register("text", text);
  register("link", link);
  register("button", button);
  register("input", input);
  register("textarea", textarea);
  register("search", search);
  register("checkbox", checkbox);
  register("radio", radio);
  register("toggle", toggle);
  register("select", select);
  register("slider", slider);
  register("divider", divider);
  register("spacer", spacer);
  register("image", image);
  register("avatar", avatar);
  register("icon", icon);
  register("progress", progress);
}
