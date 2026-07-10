// Pen: a thin wrapper over canvas 2D + rough.js exposing the ~handful of
// sketchy primitives every component draws with. Centralizing here keeps the
// components tiny and the hand-drawn style consistent + deterministic.

import rough from "roughjs";
import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Theme } from "./theme.ts";

export type TextAlign = "left" | "center" | "right";

export class Pen {
  readonly ctx: CanvasRenderingContext2D;
  readonly rc: RoughCanvas;
  readonly theme: Theme;
  private seedCounter: number;

  constructor(canvas: HTMLCanvasElement, theme: Theme) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    this.ctx = ctx;
    this.rc = rough.canvas(canvas);
    this.theme = theme;
    this.seedCounter = theme.seed;
  }

  /** Deterministic per-shape seed so re-renders look identical. */
  private nextSeed(): number {
    // Simple LCG step; stable across runs for the same starting seed.
    this.seedCounter = (this.seedCounter * 1103515245 + 12345) & 0x7fffffff;
    return this.seedCounter;
  }

  /**
   * Reset the seed sequence to a fixed starting point. The renderer calls this
   * per node (keyed by the node's stable path) so each component's sketch
   * depends only on itself — not on how many shapes were drawn before it.
   * Without this, drawing one extra shape (e.g. a checkbox's tick) would shift
   * the seed sequence for every following shape, causing unrelated components
   * to re-sketch on every interaction.
   */
  reseed(value: number): void {
    this.seedCounter = value & 0x7fffffff;
  }

  /** Snapshot the current seed counter (to restore later). */
  seedState(): number {
    return this.seedCounter;
  }


  private opts(overrides: Record<string, unknown> = {}) {
    return {
      roughness: this.theme.roughness,
      bowing: this.theme.bowing,
      stroke: this.theme.ink,
      strokeWidth: 1.1,
      seed: this.nextSeed(),
      ...overrides,
    };
  }

  rect(x: number, y: number, w: number, h: number, o: Record<string, unknown> = {}) {
    this.rc.rectangle(x, y, Math.max(1, w), Math.max(1, h), this.opts(o));
  }

  /** Rounded-ish rectangle via rough path (used for buttons/cards). */
  roundRect(x: number, y: number, w: number, h: number, r = 6, o: Record<string, unknown> = {}) {
    w = Math.max(1, w);
    h = Math.max(1, h);
    r = Math.min(r, w / 2, h / 2);
    const p = `M${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r}` +
      ` L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h}` +
      ` L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r}` +
      ` L${x},${y + r} Q${x},${y} ${x + r},${y} Z`;
    this.rc.path(p, this.opts(o));
  }

  line(x1: number, y1: number, x2: number, y2: number, o: Record<string, unknown> = {}) {
    this.rc.line(x1, y1, x2, y2, this.opts(o));
  }

  ellipse(cx: number, cy: number, w: number, h: number, o: Record<string, unknown> = {}) {
    this.rc.ellipse(cx, cy, w, h, this.opts(o));
  }

  circle(cx: number, cy: number, d: number, o: Record<string, unknown> = {}) {
    this.rc.circle(cx, cy, d, this.opts(o));
  }

  /** A box crossed with an X — the classic "image placeholder". */
  imageBox(x: number, y: number, w: number, h: number) {
    this.rect(x, y, w, h);
    this.line(x, y, x + w, y + h);
    this.line(x + w, y, x, y + h);
  }

  /** A wavy scribble line — used to suggest a run of body text. */
  squiggle(x: number, y: number, w: number, o: Record<string, unknown> = {}) {
    const amp = 1.6;
    const step = 6;
    let d = `M${x},${y}`;
    let up = true;
    for (let px = x; px <= x + w; px += step) {
      d += ` Q${px + step / 2},${y + (up ? -amp : amp)} ${px + step},${y}`;
      up = !up;
    }
    this.rc.path(d, this.opts({ strokeWidth: 1, ...o }));
  }

  /** A tick/checkmark inside a box. */
  check(x: number, y: number, size: number) {
    this.line(x + size * 0.2, y + size * 0.55, x + size * 0.42, y + size * 0.78, { strokeWidth: 1.6 });
    this.line(x + size * 0.42, y + size * 0.78, x + size * 0.82, y + size * 0.22, { strokeWidth: 1.6 });
  }

  // --- Text -----------------------------------------------------------------

  setFont(size = this.theme.fontSize, bold = false) {
    this.ctx.font = `${bold ? "700" : "400"} ${size}px ${this.theme.font}`;
  }

  measureText(text: string, size = this.theme.fontSize, bold = false): number {
    this.setFont(size, bold);
    return this.ctx.measureText(text).width;
  }

  /** Greedy word-wrap into lines that each fit within maxWidth. */
  wrapText(text: string, maxWidth: number, size = this.theme.fontSize, bold = false): string[] {
    this.setFont(size, bold);
    const lines: string[] = [];
    // Preserve explicit newlines, then wrap each paragraph.
    for (const paragraph of text.split("\n")) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        lines.push("");
        continue;
      }
      let line = words[0];
      for (let i = 1; i < words.length; i++) {
        const candidate = line + " " + words[i];
        if (this.ctx.measureText(candidate).width <= maxWidth) {
          line = candidate;
        } else {
          lines.push(line);
          line = words[i];
        }
      }
      lines.push(line);
    }
    return lines;
  }

  // --- clipping / transform stack ------------------------------------------

  save() {
    this.ctx.save();
  }

  restore() {
    this.ctx.restore();
  }

  /** Clip subsequent drawing to a rectangle (until the next restore()). */
  clipRect(x: number, y: number, w: number, h: number) {
    this.ctx.beginPath();
    this.ctx.rect(x, y, w, h);
    this.ctx.clip();
  }


  text(
    text: string,
    x: number,
    y: number,
    o: { size?: number; bold?: boolean; color?: string; align?: TextAlign; baseline?: CanvasTextBaseline } = {}
  ) {
    const size = o.size ?? this.theme.fontSize;
    this.setFont(size, o.bold ?? false);
    this.ctx.fillStyle = o.color ?? this.theme.ink;
    this.ctx.textAlign = o.align ?? "left";
    this.ctx.textBaseline = o.baseline ?? "middle";
    this.ctx.fillText(text, x, y);
  }
}
