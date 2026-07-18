// Container & chrome components: row, col, card, navbar, tabs, sidebar, list,
// table, chart, modal, screen. These recurse into children via the layout
// engine (measureFlex / arrangeFlex).

import type { Box, Node } from "../types.ts";
import { SPACING } from "../render/theme.ts";
import { arrangeFlex, measureFlex, type Axis } from "../layout/flex.ts";
import {
  type Component,
  type CompContext,
  childPath,
  explicitH,
  explicitW,
  flag,
  num,
  register,
  str,
} from "./registry.ts";


function alignOf(node: Node, dflt: "start" | "center" | "end" | "stretch"): "start" | "center" | "end" | "stretch" {
  const a = str(node, "align", dflt);
  if (a === "start" || a === "center" || a === "end" || a === "stretch") return a;
  return dflt;
}

/** Build a row/col component for the given axis. */
function stack(axis: Axis, defaultAlign: "start" | "center" | "end" | "stretch"): Component {
  return {
    container: true,
    measure(node, ctx, availW) {
      const gap = num(node, "gap", SPACING.gap);
      const pad = num(node, "pad", 0);
      const inner = measureFlex(node.children, axis, gap, ctx, availW - pad * 2);
      return {
        w: explicitW(node) ?? inner.w + pad * 2,
        h: explicitH(node) ?? inner.h + pad * 2,
      };
    },
    draw(node, box, ctx) {
      const gap = num(node, "gap", SPACING.gap);
      const pad = num(node, "pad", 0);
      const content: Box = { x: box.x + pad, y: box.y + pad, w: box.w - pad * 2, h: box.h - pad * 2 };
      arrangeFlex(node.children, axis, gap, content, alignOf(node, defaultAlign), ctx);
    },
  };
}

const row = stack("row", "center");
const col = stack("col", "stretch");

// --- card ---------------------------------------------------------------------

const card: Component = {
  container: true,
  measure(node, ctx, availW) {
    const pad = num(node, "pad", SPACING.pad);
    const gap = num(node, "gap", SPACING.gap);
    const titleH = node.text ? ctx.pen.theme.fontSize * 1.8 : 0;
    const inner = measureFlex(node.children, "col", gap, ctx, availW - pad * 2);
    return {
      w: explicitW(node) ?? Math.max(inner.w + pad * 2, node.text ? ctx.pen.measureText(node.text, ctx.pen.theme.fontSize, true) + pad * 2 : 0, 80),
      h: explicitH(node) ?? inner.h + pad * 2 + titleH,
    };
  },
  draw(node, box, ctx) {
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, 8);
    const pad = num(node, "pad", SPACING.pad);
    let top = box.y + pad;
    if (node.text) {
      ctx.pen.text(node.text, box.x + pad, top + ctx.pen.theme.fontSize * 0.6, { bold: true });
      top += ctx.pen.theme.fontSize * 1.8;
    }
    const gap = num(node, "gap", SPACING.gap);
    const content: Box = { x: box.x + pad, y: top, w: box.w - pad * 2, h: box.y + box.h - pad - top };
    arrangeFlex(node.children, "col", gap, content, alignOf(node, "stretch"), ctx);
  },
};

// --- navbar -------------------------------------------------------------------

const navbar: Component = {
  container: true,
  measure(node) {
    return { w: explicitW(node) ?? 0, h: explicitH(node) ?? 48 };
  },
  draw(node, box, ctx) {
    ctx.pen.rect(box.x, box.y, box.w, box.h, { fill: "#f4f4f4", fillStyle: "solid" });
    const pad = 14;
    let x = box.x + pad;
    if (node.text) {
      ctx.pen.text(node.text, x, box.y + box.h / 2, { bold: true, size: 17 });
      x += ctx.pen.measureText(node.text, 17, true) + 24;
    }
    // Children arranged horizontally in the remaining space (right-aligned group).
    if (node.children.length) {
      const content: Box = { x, y: box.y, w: box.x + box.w - pad - x, h: box.h };
      arrangeFlex(node.children, "row", num(node, "gap", 16), content, "center", ctx);
    }
  },
};

// --- tabs ---------------------------------------------------------------------

function tabLabels(node: Node): string[] {
  return (node.text ?? "Tab 1 | Tab 2 | Tab 3").split("|").map((s) => s.trim());
}

const tabs: Component = {
  measure(node, ctx) {
    const labels = tabLabels(node);
    const active = num(node, "active", 0);
    const w =
      labels.reduce(
        (sum, label, i) => sum + ctx.pen.measureText(label, ctx.pen.theme.fontSize, i === active) + 28,
        0
      ) + 6 * Math.max(0, labels.length - 1);
    return { w: explicitW(node) ?? w, h: explicitH(node) ?? 38 };
  },
  draw(node, box, ctx) {
    const labels = tabLabels(node);
    const st = ctx.store.peek(ctx.path);
    const active = st?.active ?? num(node, "active", 0);
    const path = ctx.path;
    let x = box.x;
    const baseY = box.y + box.h;
    ctx.pen.line(box.x, baseY, box.x + box.w, baseY, { stroke: ctx.pen.theme.inkLight });
    labels.forEach((label, i) => {
      const w = ctx.pen.measureText(label, ctx.pen.theme.fontSize, i === active) + 28;
      if (i === active) {
        ctx.pen.roundRect(x, box.y, w, box.h, 6, { fill: ctx.pen.theme.paper, fillStyle: "solid" });
      }
      ctx.pen.text(label, x + w / 2, box.y + box.h / 2, {
        align: "center",
        bold: i === active,
        color: i === active ? ctx.pen.theme.ink : ctx.pen.theme.inkLight,
      });
      const tabBox = { x, y: box.y, w, h: box.h };
      ctx.frame.addHit({ box: tabBox, z: 1, onClick: () => ctx.store.set(path, { active: i }) });
      x += w + 6;
    });
  },
};


// --- sidebar ------------------------------------------------------------------

const sidebar: Component = {
  container: true,
  measure(node, ctx, availW) {
    const w = explicitW(node) ?? 180;
    const inner = measureFlex(node.children, "col", num(node, "gap", SPACING.gap), ctx, w - 24);
    return { w, h: explicitH(node) ?? inner.h + 24 };
  },
  draw(node, box, ctx) {
    ctx.pen.rect(box.x, box.y, box.w, box.h, { fill: "#f7f7f7", fillStyle: "solid" });
    const pad = 12;
    const content: Box = { x: box.x + pad, y: box.y + pad, w: box.w - pad * 2, h: box.h - pad * 2 };
    arrangeFlex(node.children, "col", num(node, "gap", SPACING.gap), content, "stretch", ctx);
  },
};

// --- list ---------------------------------------------------------------------

const list: Component = {
  measure(node, ctx) {
    const items = itemsOf(node);
    const w = explicitW(node) ?? Math.max(120, ...items.map((it) => ctx.pen.measureText(it) + 24));
    return { w, h: explicitH(node) ?? items.length * 30 };
  },
  draw(node, box, ctx) {
    const items = itemsOf(node);
    const active = num(node, "active", -1);
    const rowH = box.h / Math.max(1, items.length);
    items.forEach((it, i) => {
      const y = box.y + i * rowH;
      if (i === active) ctx.pen.rect(box.x, y, box.w, rowH, { fill: ctx.pen.theme.accentFill, fillStyle: "solid", stroke: "transparent" });
      ctx.pen.text(it, box.x + 10, y + rowH / 2, { bold: i === active });
      if (i < items.length - 1) ctx.pen.line(box.x, y + rowH, box.x + box.w, y + rowH, { stroke: "#eee" });
    });
  },
};

function itemsOf(node: Node): string[] {
  if (node.children.length) return node.children.map((c) => c.text ?? c.type);
  const raw = node.text ?? "Item 1, Item 2, Item 3";
  return raw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
}

// --- table --------------------------------------------------------------------

const ROW_H = 30;

const table: Component = {
  // Not a flex container: the table consumes its own `row` children and draws
  // them itself, so we don't recurse via arrangeFlex.
  measure(node) {
    const { rows } = tableModel(node);
    return { w: explicitW(node) ?? 320, h: explicitH(node) ?? rows.length * ROW_H + 4 };
  },
  draw(node, box, ctx) {
    const { rows, selected } = tableModel(node);
    if (rows.length === 0) return;
    const cols = rows[0].length;
    // Rows keep their natural height when the table is given extra space
    // (e.g. via `fill`); the frame and column gridlines extend to fill the box.
    // When the box is smaller than natural, rows squeeze to fit.
    const rowH = Math.min(ROW_H, box.h / rows.length);

    // Column widths: relative weights from `widths="2,1,1"`, else equal.
    const colX = columnEdges(node, box, cols);
    const aligns = columnAligns(node, cols);
    const sort = sortSpec(node);
    const zebra = flag(node, "zebra");

    ctx.pen.rect(box.x, box.y, box.w, box.h);
    rows.forEach((cells, r) => {
      const y = box.y + r * rowH;
      if (r === 0) {
        ctx.pen.rect(box.x, y, box.w, rowH, { fill: "#f2f2f2", fillStyle: "solid" });
      } else {
        // Zebra striping (skip header). Even data rows get a subtle fill.
        if (zebra && (r - 1) % 2 === 1) ctx.pen.rect(box.x, y, box.w, rowH, { fill: "#fafafa", fillStyle: "solid", stroke: "transparent" });
        // Highlight the selected data row.
        if (r === selected) ctx.pen.rect(box.x, y, box.w, rowH, { fill: ctx.pen.theme.accentFill, fillStyle: "solid", stroke: "transparent" });
        ctx.pen.line(box.x, y, box.x + box.w, y, { stroke: "#e5e5e5" });
      }
      cells.forEach((raw, c) => {
        if (c >= cols) return;
        if (r === 0 && c > 0) ctx.pen.line(colX[c], box.y, colX[c], box.y + box.h, { stroke: "#e5e5e5" });
        drawCell(ctx, raw, colX[c], colX[c + 1], y, rowH, {
          bold: r === 0 || r === selected,
          align: aligns[c],
          sortDir: r === 0 && sort && sort.col === c ? sort.dir : undefined,
        });
      });
    });
  },
};

interface CellOpts {
  bold: boolean;
  align: "left" | "right" | "center";
  sortDir?: "asc" | "desc";
}

/** Draw one table cell, expanding `[x]`/`[ ]` tokens into sketchy checkboxes. */
function drawCell(ctx: CompContext, raw: string, x0: number, x1: number, y: number, rowH: number, o: CellOpts) {
  const pad = 8;
  const cy = y + rowH / 2;
  let text = raw;
  let checkbox: boolean | null = null;

  const m = /^\[( |x|X)\]\s*(.*)$/.exec(raw);
  if (m) {
    checkbox = m[1].toLowerCase() === "x";
    text = m[2];
  }

  let tx = x0 + pad;
  if (checkbox !== null) {
    const size = 14;
    const bx = x0 + pad;
    const by = cy - size / 2;
    ctx.pen.roundRect(bx, by, size, size, 3);
    if (checkbox) ctx.pen.check(bx, by, size);
    tx = bx + size + 6;
  }

  const size = 13;
  if (!text && checkbox !== null) return; // checkbox-only cell
  const align = o.align;
  if (align === "right") {
    ctx.pen.text(text, x1 - pad, cy, { align: "right", bold: o.bold, size });
  } else if (align === "center") {
    ctx.pen.text(text, (x0 + x1) / 2, cy, { align: "center", bold: o.bold, size });
    tx = (x0 + x1) / 2 + ctx.pen.measureText(text, size, o.bold) / 2;
  } else {
    ctx.pen.text(text, tx, cy, { align: "left", bold: o.bold, size });
    tx += ctx.pen.measureText(text, size, o.bold);
  }

  // Sort indicator arrow in the header cell.
  if (o.sortDir) {
    const ax = Math.min(tx + 8, x1 - pad);
    if (o.sortDir === "asc") {
      ctx.pen.line(ax - 4, cy + 2, ax, cy - 4, { strokeWidth: 1.3 });
      ctx.pen.line(ax, cy - 4, ax + 4, cy + 2, { strokeWidth: 1.3 });
    } else {
      ctx.pen.line(ax - 4, cy - 2, ax, cy + 4, { strokeWidth: 1.3 });
      ctx.pen.line(ax, cy + 4, ax + 4, cy - 2, { strokeWidth: 1.3 });
    }
  }
}

interface TableModel {
  rows: string[][];
  selected: number; // index of the highlighted data row, or -1
}

/**
 * Build the table's cell grid + selection. Rows come from nested `row`/`item`
 * children when present (each child's text is one row of `|`-separated cells),
 * otherwise from the inline `"H|H; a|b"` text form. The header is the node's
 * primary text (when children are used) or the first inline row.
 */
function tableModel(node: Node): TableModel {
  const rows: string[][] = [];
  let selected = -1;

  const splitCells = (raw: string) => raw.split("|").map((c) => c.trim());

  if (node.children.length) {
    // Header from primary text (fall back to a generic header).
    const header = node.text ?? "Column 1 | Column 2";
    rows.push(splitCells(header));
    node.children.forEach((child) => {
      const raw = child.text ?? "";
      rows.push(splitCells(raw));
      if (flag(child, "selected")) selected = rows.length - 1;
    });
  } else {
    const raw = node.text ?? "Name | Role; Ada | Eng; Grace | PM";
    raw
      .split(/[;\n]/)
      .map((r) => r.trim())
      .filter(Boolean)
      .forEach((r) => rows.push(r.split(/[|,]/).map((c) => c.trim())));
  }

  // `selected=N` on the table selects the Nth data row (1-based).
  const sel = num(node, "selected", 0);
  if (sel > 0 && sel < rows.length) selected = sel;

  return { rows, selected };
}

/** Left edges (plus trailing right edge) for each column, honoring `widths=`. */
function columnEdges(node: Node, box: Box, cols: number): number[] {
  const spec = str(node, "widths");
  let weights: number[] = [];
  if (spec) {
    weights = spec.split(/[,\s]+/).map((s) => Number(s)).filter((n) => !Number.isNaN(n) && n > 0);
  }
  if (weights.length !== cols) weights = new Array(cols).fill(1);
  const total = weights.reduce((s, w) => s + w, 0);
  const edges: number[] = [box.x];
  let acc = 0;
  for (let c = 0; c < cols; c++) {
    acc += weights[c];
    edges.push(box.x + (box.w * acc) / total);
  }
  return edges;
}

/** Per-column alignment from `align="left,right,center"`. */
function columnAligns(node: Node, cols: number): ("left" | "right" | "center")[] {
  const spec = str(node, "align");
  const out: ("left" | "right" | "center")[] = new Array(cols).fill("left");
  if (!spec) return out;
  spec.split(/[,\s]+/).forEach((a, i) => {
    if (i >= cols) return;
    const v = a.trim().toLowerCase();
    if (v === "right" || v === "r") out[i] = "right";
    else if (v === "center" || v === "c") out[i] = "center";
    else out[i] = "left";
  });
  return out;
}

/** Parse `sort="0:desc"` / `sort=1` into a column index + direction. */
function sortSpec(node: Node): { col: number; dir: "asc" | "desc" } | null {
  const spec = str(node, "sort");
  if (!spec) return null;
  const [colRaw, dirRaw] = spec.split(":");
  const col = Number(colRaw);
  if (Number.isNaN(col)) return null;
  const dir = (dirRaw ?? "asc").trim().toLowerCase() === "desc" ? "desc" : "asc";
  return { col, dir };
}

// --- tree ---------------------------------------------------------------------

const TREE_ROW_H = 26;
const TREE_INDENT = 18;

/** Recursively lay out visible tree rows (collapsed branches hide children). */
function treeRows(
  children: Node[],
  parentPath: string,
  depth: number,
  ctx: CompContext,
  out: { node: Node; depth: number; path: string; open: boolean; branch: boolean }[]
): void {
  children.forEach((child, i) => {
    const path = childPath(parentPath, i);
    const branch = child.children.length > 0;
    // Branches remember their open state; the `open` flag sets the initial value.
    const stored = ctx.store.peek(path)?.open;
    const open = stored ?? flag(child, "open");
    out.push({ node: child, depth, path, open, branch });
    if (branch && open) treeRows(child.children, path, depth + 1, ctx, out);
  });
}

const tree: Component = {
  // Consumes its own nested `item` children — not a flex container.
  measure(node, ctx) {
    const rows: { node: Node; depth: number; path: string; open: boolean; branch: boolean }[] = [];
    treeRows(node.children, ctx.path, 0, ctx, rows);
    const w = explicitW(node) ?? Math.max(
      160,
      ...rows.map((r) => (r.depth + 1) * TREE_INDENT + ctx.pen.measureText(r.node.text ?? r.node.type) + 40)
    );
    return { w, h: explicitH(node) ?? Math.max(TREE_ROW_H, rows.length * TREE_ROW_H) };
  },
  draw(node, box, ctx) {
    const rows: { node: Node; depth: number; path: string; open: boolean; branch: boolean }[] = [];
    treeRows(node.children, ctx.path, 0, ctx, rows);

    rows.forEach((r, i) => {
      const y = box.y + i * TREE_ROW_H;
      const cy = y + TREE_ROW_H / 2;
      const indent = box.x + 8 + r.depth * TREE_INDENT;
      const selected = flag(r.node, "selected");

      if (selected) {
        ctx.pen.rect(box.x, y, box.w, TREE_ROW_H, { fill: ctx.pen.theme.accentFill, fillStyle: "solid", stroke: "transparent" });
      }

      let tx = indent;
      if (r.branch) {
        // Chevron: ▾ when open, ▸ when collapsed.
        const chx = indent;
        if (r.open) {
          ctx.pen.line(chx, cy - 3, chx + 8, cy - 3, { strokeWidth: 1.3 });
          ctx.pen.line(chx + 8, cy - 3, chx + 4, cy + 3, { strokeWidth: 1.3 });
          ctx.pen.line(chx, cy - 3, chx + 4, cy + 3, { strokeWidth: 1.3 });
        } else {
          ctx.pen.line(chx + 1, cy - 4, chx + 1, cy + 4, { strokeWidth: 1.3 });
          ctx.pen.line(chx + 1, cy - 4, chx + 7, cy, { strokeWidth: 1.3 });
          ctx.pen.line(chx + 1, cy + 4, chx + 7, cy, { strokeWidth: 1.3 });
        }
        tx = indent + 16;
        // Clicking the row toggles the branch.
        const path = r.path;
        const open = r.open;
        ctx.frame.addHit({ box: { x: box.x, y, w: box.w, h: TREE_ROW_H }, z: 1, onClick: () => ctx.store.set(path, { open: !open }) });
      } else {
        tx = indent + 16;
      }

      ctx.pen.text(r.node.text ?? r.node.type, tx, cy, { bold: selected || r.branch, size: 14 });
    });
  },
};

// --- chart --------------------------------------------------------------------

const chart: Component = {
  measure(node) {
    return { w: explicitW(node) ?? 240, h: explicitH(node) ?? 140 };
  },
  draw(node, box, ctx) {
    const kind = str(node, "type", "bar");
    ctx.pen.rect(box.x, box.y, box.w, box.h);
    const pad = 14;
    const x0 = box.x + pad;
    const y0 = box.y + box.h - pad;
    const w = box.w - pad * 2;
    const h = box.h - pad * 2;
    if (kind === "line") {
      const pts = [0.2, 0.5, 0.35, 0.7, 0.55, 0.9];
      let d = "";
      pts.forEach((p, i) => {
        const px = x0 + (w * i) / (pts.length - 1);
        const py = y0 - h * p;
        d += (i === 0 ? "M" : " L") + px + "," + py;
      });
      ctx.pen.rc.path(d, { stroke: ctx.pen.theme.accent, roughness: ctx.pen.theme.roughness, seed: ctx.pen.theme.seed });
    } else if (kind === "pie") {
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      const d = Math.min(w, h);
      ctx.pen.circle(cx, cy, d);
      ctx.pen.line(cx, cy, cx + d / 2, cy);
      ctx.pen.line(cx, cy, cx, cy - d / 2);
      ctx.pen.line(cx, cy, cx - d / 2 * 0.7, cy + d / 2 * 0.7);
    } else {
      const bars = [0.5, 0.8, 0.35, 0.65, 0.9];
      const bw = w / (bars.length * 1.6);
      bars.forEach((p, i) => {
        const bx = x0 + i * bw * 1.6;
        ctx.pen.rect(bx, y0 - h * p, bw, h * p, { fill: ctx.pen.theme.accentFill, fillStyle: "solid" });
      });
    }
  },
};

// --- modal --------------------------------------------------------------------

const modal: Component = {
  container: true,
  measure(node, ctx, availW) {
    const pad = 18;
    const inner = measureFlex(node.children, "col", num(node, "gap", SPACING.gap), ctx, (explicitW(node) ?? 360) - pad * 2);
    return { w: explicitW(node) ?? 360, h: explicitH(node) ?? inner.h + pad * 2 + (node.text ? 34 : 0) };
  },
  draw(node, box, ctx) {
    // Simulated dim backdrop via a light fill behind.
    ctx.pen.rect(box.x, box.y, box.w, box.h, { fill: ctx.pen.theme.paper, fillStyle: "solid" });
    ctx.pen.roundRect(box.x, box.y, box.w, box.h, 8, { strokeWidth: 1.6 });
    const pad = 18;
    let top = box.y + pad;
    if (node.text) {
      ctx.pen.text(node.text, box.x + pad, top + ctx.pen.theme.fontSize * 0.6, { bold: true, size: 18 });
      // close X
      const cx = box.x + box.w - pad - 6;
      const cy = top + 4;
      ctx.pen.line(cx - 6, cy - 6, cx + 6, cy + 6);
      ctx.pen.line(cx + 6, cy - 6, cx - 6, cy + 6);
      top += 34;
    }
    const content: Box = { x: box.x + pad, y: top, w: box.w - pad * 2, h: box.y + box.h - pad - top };
    arrangeFlex(node.children, "col", num(node, "gap", SPACING.gap), content, "stretch", ctx);
  },
};

// --- screen (frame) -----------------------------------------------------------

const CHROME_H = 30;
const SCROLLBAR_W = 8;

const screen: Component = {
  container: true,
  measure(node, ctx, availW) {
    // The screen's *frame* size. When an explicit size is given, that's the
    // fixed viewport — content taller than it scrolls rather than growing the
    // frame. Without an explicit size, hug the content (no scrolling needed).
    const pad = num(node, "pad", SPACING.screenPad);
    const gap = num(node, "gap", SPACING.gap);
    const inner = measureFlex(node.children, "col", gap, ctx, (explicitW(node) ?? availW) - pad * 2);
    return {
      w: explicitW(node) ?? Math.max(inner.w + pad * 2, 320),
      h: explicitH(node) ?? inner.h + pad * 2 + CHROME_H,
    };
  },
  draw(node, box, ctx) {
    // Window chrome bar
    ctx.pen.rect(box.x, box.y, box.w, box.h, { fill: ctx.pen.theme.paper, fillStyle: "solid" });
    ctx.pen.rect(box.x, box.y, box.w, CHROME_H, { fill: "#efefef", fillStyle: "solid" });
    for (let i = 0; i < 3; i++) ctx.pen.circle(box.x + 16 + i * 16, box.y + CHROME_H / 2, 8, { stroke: ctx.pen.theme.inkLight });
    if (node.text) ctx.pen.text(node.text, box.x + box.w / 2, box.y + CHROME_H / 2, { align: "center", size: 13, color: ctx.pen.theme.inkLight });

    const pad = num(node, "pad", SPACING.screenPad);
    const gap = num(node, "gap", SPACING.gap);

    // scroll mode: vertical (default) | none | both
    const mode = str(node, "scroll", "vertical");
    const allowY = mode === "vertical" || mode === "both";
    const allowX = mode === "both";

    // The viewport (visible content area) inside the frame.
    const viewport: Box = {
      x: box.x + pad,
      y: box.y + CHROME_H + pad,
      w: box.w - pad * 2,
      h: box.h - CHROME_H - pad * 2,
    };

    // Natural content size (may exceed the viewport → scroll).
    const natural = measureFlex(node.children, "col", gap, ctx, viewport.w);
    const contentH = natural.h;
    const contentW = Math.max(natural.w, viewport.w);

    const maxScrollY = allowY ? Math.max(0, contentH - viewport.h) : 0;
    const maxScrollX = allowX ? Math.max(0, contentW - viewport.w) : 0;

    const path = ctx.path;
    const st = ctx.store.peek(path);
    const scrollY = Math.min(maxScrollY, Math.max(0, st?.scrollY ?? 0));
    const scrollX = Math.min(maxScrollX, Math.max(0, st?.scrollX ?? 0));

    // Clip to viewport, then arrange children at an offset content box that is
    // tall/wide enough to hold everything (so nothing gets squeezed).
    ctx.pen.save();
    ctx.pen.clipRect(viewport.x, viewport.y, viewport.w, viewport.h);
    const content: Box = {
      x: viewport.x - scrollX,
      y: viewport.y - scrollY,
      w: allowX ? contentW : viewport.w,
      h: Math.max(viewport.h, contentH),
    };
    arrangeFlex(node.children, "col", gap, content, alignOf(node, "stretch"), ctx);
    ctx.pen.restore();

    // Vertical scrollbar
    if (maxScrollY > 0) {
      const trackX = box.x + box.w - SCROLLBAR_W - 3;
      const thumbH = Math.max(24, (viewport.h / contentH) * viewport.h);
      const thumbY = viewport.y + (scrollY / maxScrollY) * (viewport.h - thumbH);
      ctx.pen.roundRect(trackX, viewport.y, SCROLLBAR_W, viewport.h, SCROLLBAR_W / 2, { stroke: "#e5e5e5" });
      ctx.pen.roundRect(trackX, thumbY, SCROLLBAR_W, thumbH, SCROLLBAR_W / 2, { fill: ctx.pen.theme.inkLight, fillStyle: "solid", stroke: "transparent" });
    }
    // Horizontal scrollbar
    if (maxScrollX > 0) {
      const trackY = box.y + box.h - SCROLLBAR_W - 3;
      const thumbW = Math.max(24, (viewport.w / contentW) * viewport.w);
      const thumbX = viewport.x + (scrollX / maxScrollX) * (viewport.w - thumbW);
      ctx.pen.roundRect(viewport.x, trackY, viewport.w, SCROLLBAR_W, SCROLLBAR_W / 2, { stroke: "#e5e5e5" });
      ctx.pen.roundRect(thumbX, trackY, thumbW, SCROLLBAR_W, SCROLLBAR_W / 2, { fill: ctx.pen.theme.inkLight, fillStyle: "solid", stroke: "transparent" });
    }

    // Wheel handling over the viewport (registered low-z so widgets win clicks).
    if (maxScrollY > 0 || maxScrollX > 0) {
      ctx.frame.addHit({
        box: viewport,
        z: -1,
        cursor: "default",
        onWheel: (dx, dy) => {
          const cur = ctx.store.get(path);
          ctx.store.set(path, {
            scrollY: Math.min(maxScrollY, Math.max(0, (cur.scrollY ?? 0) + dy)),
            scrollX: Math.min(maxScrollX, Math.max(0, (cur.scrollX ?? 0) + dx)),
          });
        },
      });
    }
  },
};


export function registerContainers(): void {
  register("row", row);
  register("col", col);
  register("card", card);
  register("navbar", navbar);
  register("tabs", tabs);
  register("sidebar", sidebar);
  register("list", list);
  register("table", table);
  register("tree", tree);
  register("chart", chart);
  register("modal", modal);
  register("screen", screen);
}
