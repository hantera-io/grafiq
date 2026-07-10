// The renderer: DSL text -> canvas. Orchestrates parse -> measure -> arrange
// -> draw, and renders parse errors as sticky notes so nothing ever "blanks".
//
// It also builds an interaction Frame (hit regions + overlays) during draw so
// the playground can make components clickable and screens scrollable.

import { parse } from "../parser/parse.ts";
import type { Box, Node, ParseError } from "../types.ts";
import { DEFAULT_THEME, SPACING, type Theme } from "./theme.ts";
import { Pen } from "./pen.ts";
import { Frame, InteractionStore, type NodeState } from "./interaction.ts";
import {
  childPath,
  getComponent,
  hasComponent,
  type CompContext,
} from "../components/registry.ts";
import { registerControls } from "../components/controls.ts";
import { registerContainers } from "../components/containers.ts";
import { registerWidgets } from "../components/widgets.ts";

let registered = false;
function ensureRegistered() {
  if (registered) return;
  registerControls();
  registerContainers();
  registerWidgets();
  registered = true;
}

export interface RenderOptions {
  theme?: Partial<Theme>;
  dpr?: number;
  maxWidth?: number;
  /** Interaction store (persists widget/scroll state across renders). */
  store?: InteractionStore;
  /** Current cursor position (CSS px) for hover tooltips; undefined = no hover. */
  hover?: { x: number; y: number };
}


export interface RenderResult {
  width: number;
  height: number;
  errors: ParseError[];
  /** Frame with hit regions + overlays, for the playground event layer. */
  frame: Frame;
}

/**
 * Derive a stable per-node seed from its tree path (e.g. "0/2/1") and the
 * theme seed. Uses an FNV-1a-style string hash so the value is deterministic
 * and well-distributed. This makes each node's sketch independent of draw
 * order, so interactions elsewhere don't perturb it.
 */
function pathSeed(path: string, base: number): number {
  let h = (base ^ 0x811c9dc5) >>> 0;
  for (let i = 0; i < path.length; i++) {
    h ^= path.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h & 0x7fffffff;
}

/** Fallback for unknown types: a red box with the type name. */
function drawUnknown(node: Node, box: Box, ctx: CompContext) {

  ctx.pen.rect(box.x, box.y, box.w, box.h, { stroke: "#c0392b" });
  ctx.pen.text(`?${node.type}`, box.x + 6, box.y + box.h / 2, { color: "#c0392b", size: 12 });
}

/** Collected tooltip triggers (node box + text) for the hover pass. */
interface TooltipRegion {
  box: Box;
  text: string;
}

function makeContext(
  pen: Pen,
  frame: Frame,
  store: InteractionStore,
  tooltips: TooltipRegion[]
): CompContext {
  const ctx: CompContext = {
    pen,
    frame,
    store,
    path: "",
    state(path: string): NodeState {
      return store.get(path);
    },
    measure(node, availW) {
      const comp = getComponent(node.type);
      if (!comp) return { w: 90, h: 28 };
      return comp.measure(node, ctx, availW);
    },
    drawNode(node, box, path) {
      const comp = getComponent(node.type);
      const prevPath = ctx.path;
      ctx.path = path; // children derive their paths from this
      // Reseed the sketch RNG from this node's stable path so its shapes look
      // the same regardless of how many shapes were drawn before it. This keeps
      // unrelated components from re-sketching when an interaction (e.g. a
      // checkbox tick) changes the number of shapes drawn earlier in the frame.
      // Children reseed from their own paths, so nesting is unaffected.
      const prevSeed = pen.seedState();
      pen.reseed(pathSeed(path, pen.theme.seed));
      if (!comp) drawUnknown(node, box, ctx);
      else comp.draw(node, box, ctx);
      pen.reseed(prevSeed);
      // Universal `tooltip=` attribute: any element can carry one.
      const tip = node.attrs.tooltip;
      if (typeof tip === "string" && tip) tooltips.push({ box, text: tip });
      ctx.path = prevPath;
    },

  };
  return ctx;
}

/** Draw a small pointer-bubble tooltip near (below) a trigger box. */
function drawTooltip(pen: Pen, region: TooltipRegion, viewW: number) {
  const padX = 8;
  const tw = pen.measureText(region.text, 12) + padX * 2;
  const th = 24;
  let x = region.box.x + region.box.w / 2 - tw / 2;
  x = Math.max(4, Math.min(x, viewW - tw - 4));
  const y = region.box.y + region.box.h + 8;
  // pointer triangle
  const px = region.box.x + region.box.w / 2;
  pen.rc.polygon(
    [
      [px - 5, y],
      [px + 5, y],
      [px, y - 6],
    ],
    { fill: "#2a2a2a", fillStyle: "solid", stroke: "#2a2a2a", roughness: 0.6, seed: pen.theme.seed }
  );
  pen.roundRect(x, y, tw, th, 5, { fill: "#2a2a2a", fillStyle: "solid", stroke: "#2a2a2a" });
  pen.text(region.text, x + tw / 2, y + th / 2, { align: "center", size: 12, color: "#ffffff" });
}


function stickyNote(pen: Pen, errors: ParseError[], x: number, y: number, w: number): number {
  if (errors.length === 0) return 0;
  const lineH = 18;
  const h = 16 + errors.length * lineH;
  pen.rect(x, y, w, h, { fill: "#fff3bf", fillStyle: "solid", stroke: "#e0b000" });
  pen.text("⚠ Parse issues", x + 10, y + 14, { bold: true, size: 13, color: "#8a6d00" });
  errors.forEach((e, i) => {
    pen.text(`line ${e.line}: ${e.message}`, x + 10, y + 30 + i * lineH, { size: 12, color: "#8a6d00" });
  });
  return h;
}

/**
 * Render DSL into a canvas. Auto-sizes the canvas to the content. Returns the
 * computed content size, parse errors, and the interaction Frame.
 */
export function render(
  canvas: HTMLCanvasElement,
  source: string,
  opts: RenderOptions = {}
): RenderResult {
  ensureRegistered();

  const theme: Theme = { ...DEFAULT_THEME, ...opts.theme };
  const dpr = opts.dpr ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  const maxWidth = opts.maxWidth ?? 1000;
  const store = opts.store ?? new InteractionStore();

  const { root, errors } = parse(source);

  // Measure pass (needs a canvas ctx for text metrics).
  const measureFrame = new Frame();
  const measurePen = new Pen(canvas, theme);
  const measureCtx = makeContext(measurePen, measureFrame, store, []);


  const pad = SPACING.screenPad;
  const gap = SPACING.gap;
  const nodes = root.children;

  let contentW = 0;
  let contentH = 0;
  const measured = nodes.map((n) => {
    const m = measureCtx.measure(n, maxWidth - pad * 2);
    contentW = Math.max(contentW, m.w);
    contentH += m.h;
    return m;
  });
  contentH += gap * Math.max(0, nodes.length - 1);

  const errH = errors.length ? 16 + errors.length * 18 + gap : 0;
  const totalW = Math.max(contentW + pad * 2, 240);
  const totalH = contentH + pad * 2 + errH;

  // Size the canvas (with DPR for crisp lines).
  canvas.width = Math.ceil(totalW * dpr);
  canvas.height = Math.ceil(totalH * dpr);
  canvas.style.width = `${totalW}px`;
  canvas.style.height = `${totalH}px`;

  // Draw pass — fresh pen so the deterministic seed sequence restarts.
  const frame = new Frame();
  const tooltips: TooltipRegion[] = [];
  const pen = new Pen(canvas, theme);
  const ctx = makeContext(pen, frame, store, tooltips);
  pen.ctx.scale(dpr, dpr);
  pen.ctx.fillStyle = theme.paper;
  pen.ctx.fillRect(0, 0, totalW, totalH);


  let y = pad;
  if (errors.length) {
    y += stickyNote(pen, errors, pad, y, totalW - pad * 2) + gap;
  }

  nodes.forEach((n, i) => {
    const m = measured[i];
    const w = hasComponent(n.type) && n.attrs.fill ? totalW - pad * 2 : m.w;
    const box: Box = { x: pad, y, w: Math.max(w, m.w), h: m.h };
    ctx.drawNode(n, box, childPath("", i));
    y += m.h + gap;
  });

  // Overlays (open dropdowns, etc.) draw on top, in z-order.
  frame.overlays.sort((a, b) => a.z - b.z).forEach((o) => o.draw());

  // Hover tooltip: topmost trigger under the cursor wins (drawn last of all).
  if (opts.hover) {
    const { x, y: hy } = opts.hover;
    for (let i = tooltips.length - 1; i >= 0; i--) {
      const t = tooltips[i];
      if (x >= t.box.x && x <= t.box.x + t.box.w && hy >= t.box.y && hy <= t.box.y + t.box.h) {
        drawTooltip(pen, t, totalW);
        break;
      }
    }
  }

  return { width: totalW, height: totalH, errors, frame };

}
