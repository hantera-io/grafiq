// Extended components: feedback/status, navigation, richer interactive
// widgets, and data/media. Kept separate from controls/containers so those
// files stay focused.


import type { Box, Node } from "../types.ts";
import { SPACING, variant } from "../render/theme.ts";
import { arrangeFlex, measureFlex } from "../layout/flex.ts";
import {
  type Component,
  childPath,
  explicitH,
  explicitW,
  num,
  register,
  str,
} from "./registry.ts";

function textOf(node: Node, dflt = ""): string {
  return node.text ?? dflt;
}

// --- badge --------------------------------------------------------------------

const badge: Component = {
  measure(node, ctx) {
    const w = ctx.pen.measureText(textOf(node, "Badge"), 12, true) + 20;
    return { w: explicitW(node) ?? w, h: explicitH(node) ?? 22 };
  },
  draw(node, box, ctx) {
    const v = variant(str(node, "variant", "default"));
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, box.h / 2, { stroke: v.stroke, fill: v.fill, fillStyle: "solid" });
    ctx.pen.text(textOf(node, "Badge"), box.x + box.w / 2, box.y + box.h / 2, { align: "center", size: 12, bold: true, color: v.stroke });
  },
};

// --- tag / chip (badge with an optional × ) -----------------------------------

const tag: Component = {
  measure(node, ctx) {
    const w = ctx.pen.measureText(textOf(node, "Tag"), 13) + 22 + 12;
    return { w: explicitW(node) ?? w, h: explicitH(node) ?? 24 };
  },
  draw(node, box, ctx) {
    const v = variant(str(node, "variant", "default"));
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, box.h / 2, { stroke: v.stroke, fill: v.fill, fillStyle: "solid" });
    ctx.pen.text(textOf(node, "Tag"), box.x + 10, box.y + box.h / 2, { size: 13, color: v.stroke });
    // little × on the right
    const cx = box.x + box.w - 12;
    const cy = box.y + box.h / 2;
    ctx.pen.line(cx - 3, cy - 3, cx + 3, cy + 3, { stroke: v.stroke });
    ctx.pen.line(cx + 3, cy - 3, cx - 3, cy + 3, { stroke: v.stroke });
  },
};

// --- kbd (keycap) -------------------------------------------------------------

const kbd: Component = {
  measure(node, ctx) {
    const w = ctx.pen.measureText(textOf(node, "Ctrl"), 12, true) + 16;
    return { w: explicitW(node) ?? Math.max(24, w), h: explicitH(node) ?? 24 };
  },
  draw(node, box, ctx) {
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, 4, { fill: "#f4f4f4", fillStyle: "solid" });
    ctx.pen.text(textOf(node, "Ctrl"), box.x + box.w / 2, box.y + box.h / 2, { align: "center", size: 12, bold: true });
  },
};

// --- alert --------------------------------------------------------------------

const alert: Component = {
  measure(node, ctx, availW) {
    const w = explicitW(node) ?? Math.min(availW > 0 ? availW : 420, 420);
    const pad = 12;
    const title = str(node, "title");
    const body = textOf(node);
    const lines = ctx.pen.wrapText(body, w - pad * 2 - 24);
    const h = pad * 2 + (title ? 20 : 0) + lines.length * ctx.pen.theme.fontSize * 1.4;
    return { w, h: explicitH(node) ?? Math.max(48, h) };
  },
  draw(node, box, ctx) {
    const v = variant(str(node, "variant", "info"));
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, 6, { stroke: v.stroke, fill: v.fill, fillStyle: "solid" });
    // accent stripe on the left
    ctx.pen.rect(box.x, box.y, 4, box.h, { fill: v.stroke, fillStyle: "solid", stroke: v.stroke });
    const pad = 14;
    let y = box.y + pad;
    const title = str(node, "title");
    if (title) {
      ctx.pen.text(title, box.x + pad, y + 6, { bold: true, color: v.stroke });
      y += 20;
    }
    const lineH = ctx.pen.theme.fontSize * 1.4;
    ctx.pen.wrapText(textOf(node), box.w - pad * 2).forEach((ln, i) => {
      ctx.pen.text(ln, box.x + pad, y + lineH * (i + 0.5), { color: ctx.pen.theme.ink });
    });
  },
};

// --- skeleton -----------------------------------------------------------------

const skeleton: Component = {
  measure(node) {
    const lines = num(node, "lines", 3);
    return { w: explicitW(node) ?? 240, h: explicitH(node) ?? lines * 18 + (lines - 1) * 8 };
  },
  draw(node, box, ctx) {
    const lines = num(node, "lines", 3);
    const lh = 18;
    const gap = 8;
    for (let i = 0; i < lines; i++) {
      const w = i === lines - 1 ? box.w * 0.6 : box.w;
      ctx.pen.roundRect(box.x, box.y + i * (lh + gap), w, lh, 4, { fill: "#ececec", fillStyle: "solid", stroke: "#e0e0e0" });
    }
  },
};

// --- note (always-visible annotation callout) ---------------------------------

const note: Component = {
  measure(node, ctx, availW) {
    const w = explicitW(node) ?? Math.min(availW > 0 ? availW : 220, 220);
    const lines = ctx.pen.wrapText(textOf(node, "Note"), w - 20);
    return { w, h: explicitH(node) ?? Math.max(32, lines.length * ctx.pen.theme.fontSize * 1.4 + 16) };
  },
  draw(node, box, ctx) {
    ctx.pen.rect(box.x, box.y, box.w, box.h, { fill: "#fff3bf", fillStyle: "solid", stroke: "#e0b000" });
    const lineH = ctx.pen.theme.fontSize * 1.4;
    ctx.pen.wrapText(textOf(node, "Note"), box.w - 20).forEach((ln, i) => {
      ctx.pen.text(ln, box.x + 10, box.y + 8 + lineH * (i + 0.5), { size: 13, color: "#8a6d00" });
    });
  },
};

// --- breadcrumb ---------------------------------------------------------------

const breadcrumb: Component = {
  measure(node, ctx) {
    const parts = crumbs(node);
    const w = parts.reduce((s, p) => s + ctx.pen.measureText(p) + 22, 0);
    return { w: explicitW(node) ?? w, h: explicitH(node) ?? 24 };
  },
  draw(node, box, ctx) {
    const parts = crumbs(node);
    let x = box.x;
    const cy = box.y + box.h / 2;
    parts.forEach((p, i) => {
      const last = i === parts.length - 1;
      ctx.pen.text(p, x, cy, { color: last ? ctx.pen.theme.ink : ctx.pen.theme.inkLight, bold: last });
      x += ctx.pen.measureText(p) + 8;
      if (!last) {
        // chevron separator
        ctx.pen.line(x, cy - 4, x + 4, cy, { stroke: ctx.pen.theme.inkLight });
        ctx.pen.line(x + 4, cy, x, cy + 4, { stroke: ctx.pen.theme.inkLight });
        x += 14;
      }
    });
  },
};

function crumbs(node: Node): string[] {
  return (node.text ?? "Home / Page").split("/").map((s) => s.trim()).filter(Boolean);
}

// --- pagination (interactive) -------------------------------------------------

const pagination: Component = {
  measure(node) {
    const pages = num(node, "pages", 5);
    return { w: explicitW(node) ?? (pages + 2) * 34, h: explicitH(node) ?? 32 };
  },
  draw(node, box, ctx) {
    const pages = num(node, "pages", 5);
    const st = ctx.store.peek(ctx.path);
    const active = st?.active ?? num(node, "active", 1);
    const path = ctx.path;
    const cell = 30;
    const gap = 4;
    let x = box.x;
    const drawCell = (label: string, page: number | null, isActive: boolean) => {
      if (isActive) ctx.pen.roundRect(x, box.y, cell, box.h, 5, { fill: ctx.pen.theme.accentFill, fillStyle: "solid" });
      else ctx.pen.roundRect(x, box.y, cell, box.h, 5, { stroke: ctx.pen.theme.inkLight });
      ctx.pen.text(label, x + cell / 2, box.y + box.h / 2, { align: "center", bold: isActive });
      if (page !== null) {
        const p = page;
        ctx.frame.addHit({ box: { x, y: box.y, w: cell, h: box.h }, z: 1, onClick: () => ctx.store.set(path, { active: p }) });
      }
      x += cell + gap;
    };
    drawCell("‹", active > 1 ? active - 1 : null, false);
    for (let p = 1; p <= pages; p++) drawCell(String(p), p, p === active);
    drawCell("›", active < pages ? active + 1 : null, false);
  },
};

// --- stepper ------------------------------------------------------------------

function stepLabels(node: Node): string[] {
  return (node.text ?? "Step 1 | Step 2 | Step 3").split("|").map((s) => s.trim());
}

const stepper: Component = {
  measure(node, ctx) {
    const steps = stepLabels(node);
    // Each step gets an equal segment wide enough for its label (min 72px).
    const segW = Math.max(72, ...steps.map((s) => ctx.pen.measureText(s, 12) + 24));
    return { w: explicitW(node) ?? segW * steps.length, h: explicitH(node) ?? 48 };
  },
  draw(node, box, ctx) {
    const steps = stepLabels(node);
    const active = num(node, "active", 0);
    const n = steps.length;
    const segW = box.w / n;
    const cy = box.y + 14;
    steps.forEach((label, i) => {
      const cx = box.x + segW * i + segW / 2;
      const done = i <= active;
      // connector to previous
      if (i > 0) {
        const px = box.x + segW * (i - 1) + segW / 2;
        ctx.pen.line(px + 12, cy, cx - 12, cy, { stroke: i <= active ? ctx.pen.theme.accent : ctx.pen.theme.inkLight });
      }
      ctx.pen.circle(cx, cy, 24, { fill: done ? ctx.pen.theme.accentFill : ctx.pen.theme.paper, fillStyle: "solid", stroke: done ? ctx.pen.theme.accent : ctx.pen.theme.inkLight });
      ctx.pen.text(String(i + 1), cx, cy, { align: "center", bold: true, color: done ? ctx.pen.theme.accent : ctx.pen.theme.inkLight });
      ctx.pen.text(label, cx, box.y + 38, { align: "center", size: 12, color: i === active ? ctx.pen.theme.ink : ctx.pen.theme.inkLight, bold: i === active });
    });
  },
};

// --- menubar ------------------------------------------------------------------

function menubarItems(node: Node): string[] {
  return (node.text ?? "File | Edit | View").split("|").map((s) => s.trim());
}

const menubar: Component = {
  measure(node, ctx) {
    const items = menubarItems(node);
    const w = 12 + items.reduce((sum, it) => sum + ctx.pen.measureText(it) + 20, 0);
    return { w: explicitW(node) ?? w, h: explicitH(node) ?? 32 };
  },
  draw(node, box, ctx) {
    const items = menubarItems(node);
    ctx.pen.rect(box.x, box.y, box.w, box.h, { fill: "#f4f4f4", fillStyle: "solid" });
    let x = box.x + 6;
    items.forEach((it) => {
      const w = ctx.pen.measureText(it) + 20;
      ctx.pen.text(it, x + w / 2, box.y + box.h / 2, { align: "center" });
      x += w;
    });
  },
};

// --- rating -------------------------------------------------------------------

const rating: Component = {
  measure(node) {
    const max = num(node, "max", 5);
    return { w: explicitW(node) ?? max * 24, h: explicitH(node) ?? 24 };
  },
  draw(node, box, ctx) {
    const max = num(node, "max", 5);
    const value = num(node, "value", 3);
    const size = 20;
    const cy = box.y + box.h / 2;
    for (let i = 0; i < max; i++) {
      const cx = box.x + i * 24 + size / 2;
      star(ctx.pen, cx, cy, size / 2, i < value);
    }
  },
};

function star(pen: import("../render/pen.ts").Pen, cx: number, cy: number, r: number, filled: boolean) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${cx + Math.cos(ang) * rad},${cy + Math.sin(ang) * rad}`);
  }
  const d = "M" + pts.join(" L") + " Z";
  pen.rc.path(d, {
    stroke: filled ? "#b5820e" : pen.theme.inkLight,
    fill: filled ? "#fdd94e" : undefined,
    fillStyle: "solid",
    roughness: pen.theme.roughness,
    seed: pen.theme.seed,
  });
}

// --- stat (metric) ------------------------------------------------------------

const stat: Component = {
  measure(node) {
    return { w: explicitW(node) ?? 160, h: explicitH(node) ?? 84 };
  },
  draw(node, box, ctx) {
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, 8);
    const pad = 14;
    ctx.pen.text(textOf(node, "Metric"), box.x + pad, box.y + pad + 4, { size: 13, color: ctx.pen.theme.inkLight });
    ctx.pen.text(str(node, "value", "0"), box.x + pad, box.y + pad + 30, { size: 26, bold: true });
    const delta = str(node, "delta");
    if (delta) {
      const up = !delta.startsWith("-");
      ctx.pen.text(delta, box.x + pad, box.y + box.h - pad, { size: 13, color: up ? "#2e7d46" : "#c0392b" });
    }
  },
};

// --- calendar -----------------------------------------------------------------

const calendar: Component = {
  measure(node) {
    return { w: explicitW(node) ?? 220, h: explicitH(node) ?? 210 };
  },
  draw(node, box, ctx) {
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, 8);
    const pad = 10;
    const title = str(node, "month", "March 2025");
    ctx.pen.text(title, box.x + box.w / 2, box.y + pad + 8, { align: "center", bold: true, size: 14 });
    const gridY = box.y + pad + 26;
    const cols = 7;
    const cellW = (box.w - pad * 2) / cols;
    const dow = ["S", "M", "T", "W", "T", "F", "S"];
    dow.forEach((d, i) => {
      ctx.pen.text(d, box.x + pad + cellW * i + cellW / 2, gridY, { align: "center", size: 11, color: ctx.pen.theme.inkLight });
    });
    const selected = num(node, "day", -1);
    const rowsY = gridY + 14;
    const cellH = (box.y + box.h - pad - rowsY) / 5;
    let day = 1;
    const startCol = num(node, "start", 5); // day-of-week the 1st falls on
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 7; col++) {
        if (row === 0 && col < startCol) continue;
        if (day > 31) break;
        const cx = box.x + pad + cellW * col + cellW / 2;
        const cyc = rowsY + cellH * row + cellH / 2;
        if (day === selected) ctx.pen.circle(cx, cyc, Math.min(cellW, cellH) * 0.8, { fill: ctx.pen.theme.accentFill, fillStyle: "solid" });
        ctx.pen.text(String(day), cx, cyc, { align: "center", size: 12, bold: day === selected });
        day++;
      }
    }
  },
};

// --- accordion (interactive, expand/collapse per item) ------------------------

const accordion: Component = {
  container: true,
  measure(node, ctx, availW) {
    const w = explicitW(node) ?? (availW > 0 ? availW : 360);
    let h = 0;
    node.children.forEach((child, i) => {
      h += 40; // header
      const itemPath = childPath(ctx.path, i);
      const open = ctx.store.peek(itemPath)?.open ?? false;
      if (open && child.children.length) {
        // Body children are keyed under the item's path (see draw), so
        // measure them under the same path for consistent state resolution.
        const prev = ctx.path;
        ctx.path = itemPath;
        const inner = measureFlex(child.children, "col", SPACING.gap, ctx, w - 24);
        ctx.path = prev;
        h += inner.h + 20;
      }
    });
    return { w, h };
  },
  draw(node, box, ctx) {
    let y = box.y;
    const parentPath = ctx.path;
    node.children.forEach((child, i) => {
      const itemPath = childPath(parentPath, i);
      const open = ctx.store.peek(itemPath)?.open ?? false;
      const headerH = 40;
      ctx.pen.rect(box.x, y, box.w, headerH, { fill: "#fafafa", fillStyle: "solid" });
      ctx.pen.text(child.text ?? `Section ${i + 1}`, box.x + 12, y + headerH / 2, { bold: true });
      // chevron
      const cx = box.x + box.w - 18;
      const cyc = y + headerH / 2;
      if (open) {
        ctx.pen.line(cx - 5, cyc + 3, cx, cyc - 3, { strokeWidth: 1.4 });
        ctx.pen.line(cx, cyc - 3, cx + 5, cyc + 3, { strokeWidth: 1.4 });
      } else {
        ctx.pen.line(cx - 5, cyc - 3, cx, cyc + 3, { strokeWidth: 1.4 });
        ctx.pen.line(cx, cyc + 3, cx + 5, cyc - 3, { strokeWidth: 1.4 });
      }
      ctx.frame.addHit({ box: { x: box.x, y, w: box.w, h: headerH }, z: 1, onClick: () => ctx.store.set(itemPath, { open: !open }) });
      y += headerH;

      if (open && child.children.length) {
        // The accordion item is the parent of its body children for path keying.
        const prev = ctx.path;
        ctx.path = itemPath;
        const inner = measureFlex(child.children, "col", SPACING.gap, ctx, box.w - 24);
        const bodyH = inner.h + 20;
        const content: Box = { x: box.x + 12, y: y + 10, w: box.w - 24, h: inner.h };
        arrangeFlex(child.children, "col", SPACING.gap, content, "stretch", ctx);
        ctx.path = prev;
        y += bodyH;
      }
    });
  },
};

export function registerWidgets(): void {
  register("badge", badge);
  register("tag", tag);
  register(["chip"], tag);
  register("kbd", kbd);
  register("alert", alert);
  register("skeleton", skeleton);
  register("note", note);
  register("breadcrumb", breadcrumb);
  register("pagination", pagination);
  register("stepper", stepper);
  register("menubar", menubar);
  register("rating", rating);
  register("stat", stat);
  register("calendar", calendar);
  register("accordion", accordion);
}
