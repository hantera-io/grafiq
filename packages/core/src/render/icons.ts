// Hand-drawn icon glyphs. Each glyph sketches a pictogram with Pen primitives
// inside a normalized size×size box, so icons automatically inherit the rough
// hand-drawn style (roughness, bowing, deterministic seeding) of the theme.
//
// Add a new icon with `registerIcon("name", (pen, x, y, s, color) => { … })`
// using coordinates in the 0..1 range scaled by `s`.

import type { Pen } from "./pen.ts";

/** Draw a pictogram at (x, y) within a size×size box using `color` strokes. */
export type IconGlyph = (pen: Pen, x: number, y: number, s: number, color: string) => void;

const ICONS = new Map<string, IconGlyph>();

export function registerIcon(names: string | string[], glyph: IconGlyph): void {
  for (const n of Array.isArray(names) ? names : [names]) ICONS.set(n, glyph);
}

export function getIcon(name: string): IconGlyph | undefined {
  return ICONS.get(name);
}

export function hasIcon(name: string): boolean {
  return ICONS.has(name);
}

/** All registered icon names (including aliases), sorted. */
export function iconNames(): string[] {
  return [...ICONS.keys()].sort();
}

// --- drawing helpers -----------------------------------------------------------

/** Stroke width that scales gently with icon size. */
function sw(s: number): number {
  return Math.max(1.1, s / 20);
}

/** Draw connected line segments through normalized points. */
function polyline(pen: Pen, x: number, y: number, s: number, pts: [number, number][], o: Record<string, unknown>) {
  for (let i = 0; i < pts.length - 1; i++) {
    pen.line(x + pts[i][0] * s, y + pts[i][1] * s, x + pts[i + 1][0] * s, y + pts[i + 1][1] * s, o);
  }
}

/** Closed polygon from normalized points. */
function poly(pen: Pen, x: number, y: number, s: number, pts: [number, number][], o: Record<string, unknown>) {
  pen.polygon(pts.map(([nx, ny]) => [x + nx * s, y + ny * s] as [number, number]), o);
}

// --- glyphs ----------------------------------------------------------------------

registerIcon("star", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 0.48 : 0.2;
    pts.push([x + s / 2 + Math.cos(ang) * r * s, y + s / 2 + Math.sin(ang) * r * s]);
  }
  pen.polygon(pts, o);
});

registerIcon("heart", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  const X = (n: number) => x + n * s;
  const Y = (n: number) => y + n * s;
  pen.path(
    `M${X(0.5)},${Y(0.88)} C${X(0.05)},${Y(0.52)} ${X(0.16)},${Y(0.12)} ${X(0.5)},${Y(0.32)}` +
      ` C${X(0.84)},${Y(0.12)} ${X(0.95)},${Y(0.52)} ${X(0.5)},${Y(0.88)} Z`,
    o
  );
});

registerIcon("home", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  polyline(pen, x, y, s, [[0.08, 0.5], [0.5, 0.1], [0.92, 0.5]], o);
  polyline(pen, x, y, s, [[0.18, 0.48], [0.18, 0.9], [0.82, 0.9], [0.82, 0.48]], o);
  polyline(pen, x, y, s, [[0.42, 0.9], [0.42, 0.64], [0.58, 0.64], [0.58, 0.9]], o);
});

registerIcon(["gear", "settings"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  const cx = x + s / 2;
  const cy = y + s / 2;
  pen.circle(cx, cy, s * 0.56, o);
  pen.circle(cx, cy, s * 0.22, o);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    pen.line(cx + Math.cos(a) * s * 0.28, cy + Math.sin(a) * s * 0.28, cx + Math.cos(a) * s * 0.44, cy + Math.sin(a) * s * 0.44, o);
  }
});

registerIcon("search", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.circle(x + s * 0.42, y + s * 0.42, s * 0.55, o);
  pen.line(x + s * 0.62, y + s * 0.62, x + s * 0.9, y + s * 0.9, o);
});

registerIcon(["user", "person"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.circle(x + s * 0.5, y + s * 0.3, s * 0.34, o);
  pen.path(`M${x + s * 0.14},${y + s * 0.9} Q${x + s * 0.5},${y + s * 0.48} ${x + s * 0.86},${y + s * 0.9}`, o);
});

registerIcon(["bell", "notification"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  const X = (n: number) => x + n * s;
  const Y = (n: number) => y + n * s;
  pen.path(
    `M${X(0.3)},${Y(0.6)} C${X(0.3)},${Y(0.26)} ${X(0.38)},${Y(0.14)} ${X(0.5)},${Y(0.14)}` +
      ` C${X(0.62)},${Y(0.14)} ${X(0.7)},${Y(0.26)} ${X(0.7)},${Y(0.6)}` +
      ` L${X(0.8)},${Y(0.74)} L${X(0.2)},${Y(0.74)} Z`,
    o
  );
  pen.path(`M${X(0.42)},${Y(0.8)} Q${X(0.5)},${Y(0.92)} ${X(0.58)},${Y(0.8)}`, o);
});

registerIcon(["mail", "email", "envelope"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.rect(x + s * 0.08, y + s * 0.2, s * 0.84, s * 0.6, o);
  pen.line(x + s * 0.1, y + s * 0.24, x + s * 0.5, y + s * 0.54, o);
  pen.line(x + s * 0.9, y + s * 0.24, x + s * 0.5, y + s * 0.54, o);
});

registerIcon("calendar", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.rect(x + s * 0.12, y + s * 0.18, s * 0.76, s * 0.7, o);
  pen.line(x + s * 0.12, y + s * 0.38, x + s * 0.88, y + s * 0.38, o);
  pen.line(x + s * 0.32, y + s * 0.08, x + s * 0.32, y + s * 0.26, o);
  pen.line(x + s * 0.68, y + s * 0.08, x + s * 0.68, y + s * 0.26, o);
});

registerIcon(["clock", "time"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.circle(x + s / 2, y + s / 2, s * 0.8, o);
  pen.line(x + s / 2, y + s / 2, x + s / 2, y + s * 0.26, o);
  pen.line(x + s / 2, y + s / 2, x + s * 0.68, y + s * 0.58, o);
});

registerIcon("bookmark", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  poly(pen, x, y, s, [[0.28, 0.1], [0.72, 0.1], [0.72, 0.9], [0.5, 0.7], [0.28, 0.9]], o);
});

registerIcon(["globe", "world"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.circle(x + s / 2, y + s / 2, s * 0.8, o);
  pen.ellipse(x + s / 2, y + s / 2, s * 0.34, s * 0.8, o);
  pen.line(x + s * 0.1, y + s / 2, x + s * 0.9, y + s / 2, o);
});

registerIcon("camera", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.roundRect(x + s * 0.08, y + s * 0.28, s * 0.84, s * 0.54, s * 0.06, o);
  pen.circle(x + s * 0.5, y + s * 0.55, s * 0.3, o);
  polyline(pen, x, y, s, [[0.34, 0.28], [0.4, 0.16], [0.6, 0.16], [0.66, 0.28]], o);
});

registerIcon(["image", "photo"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.rect(x + s * 0.08, y + s * 0.14, s * 0.84, s * 0.72, o);
  pen.circle(x + s * 0.32, y + s * 0.36, s * 0.12, o);
  polyline(pen, x, y, s, [[0.14, 0.8], [0.42, 0.48], [0.58, 0.64], [0.72, 0.5], [0.88, 0.8]], o);
});

registerIcon(["phone", "mobile"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.roundRect(x + s * 0.28, y + s * 0.08, s * 0.44, s * 0.84, s * 0.07, o);
  pen.line(x + s * 0.44, y + s * 0.8, x + s * 0.56, y + s * 0.8, o);
});

registerIcon(["pin", "location", "marker"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.circle(x + s * 0.5, y + s * 0.36, s * 0.42, o);
  pen.line(x + s * 0.34, y + s * 0.5, x + s * 0.5, y + s * 0.92, o);
  pen.line(x + s * 0.66, y + s * 0.5, x + s * 0.5, y + s * 0.92, o);
  pen.circle(x + s * 0.5, y + s * 0.36, s * 0.12, o);
});

// --- actions ---------------------------------------------------------------------

registerIcon("check", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.4 };
  polyline(pen, x, y, s, [[0.14, 0.55], [0.4, 0.8], [0.86, 0.2]], o);
});

registerIcon(["x", "close"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.3 };
  pen.line(x + s * 0.2, y + s * 0.2, x + s * 0.8, y + s * 0.8, o);
  pen.line(x + s * 0.8, y + s * 0.2, x + s * 0.2, y + s * 0.8, o);
});

registerIcon(["plus", "add"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.3 };
  pen.line(x + s * 0.5, y + s * 0.14, x + s * 0.5, y + s * 0.86, o);
  pen.line(x + s * 0.14, y + s * 0.5, x + s * 0.86, y + s * 0.5, o);
});

registerIcon("minus", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.3 };
  pen.line(x + s * 0.14, y + s * 0.5, x + s * 0.86, y + s * 0.5, o);
});

registerIcon(["trash", "delete"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.line(x + s * 0.14, y + s * 0.24, x + s * 0.86, y + s * 0.24, o);
  polyline(pen, x, y, s, [[0.4, 0.24], [0.42, 0.12], [0.58, 0.12], [0.6, 0.24]], o);
  polyline(pen, x, y, s, [[0.2, 0.24], [0.28, 0.92], [0.72, 0.92], [0.8, 0.24]], o);
  pen.line(x + s * 0.42, y + s * 0.38, x + s * 0.44, y + s * 0.78, o);
  pen.line(x + s * 0.58, y + s * 0.38, x + s * 0.56, y + s * 0.78, o);
});

registerIcon(["edit", "pencil"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  poly(pen, x, y, s, [[0.6, 0.16], [0.84, 0.4], [0.34, 0.9], [0.1, 0.9], [0.1, 0.66]], o);
  pen.line(x + s * 0.5, y + s * 0.26, x + s * 0.74, y + s * 0.5, o);
});

registerIcon("download", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.line(x + s * 0.5, y + s * 0.08, x + s * 0.5, y + s * 0.6, o);
  pen.line(x + s * 0.3, y + s * 0.42, x + s * 0.5, y + s * 0.62, o);
  pen.line(x + s * 0.7, y + s * 0.42, x + s * 0.5, y + s * 0.62, o);
  polyline(pen, x, y, s, [[0.12, 0.7], [0.12, 0.9], [0.88, 0.9], [0.88, 0.7]], o);
});

registerIcon("upload", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.line(x + s * 0.5, y + s * 0.62, x + s * 0.5, y + s * 0.1, o);
  pen.line(x + s * 0.3, y + s * 0.28, x + s * 0.5, y + s * 0.08, o);
  pen.line(x + s * 0.7, y + s * 0.28, x + s * 0.5, y + s * 0.08, o);
  polyline(pen, x, y, s, [[0.12, 0.7], [0.12, 0.9], [0.88, 0.9], [0.88, 0.7]], o);
});

registerIcon(["refresh", "reload"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  const r = s * 0.34;
  // 240° arc opening at the upper-left, drawn clockwise.
  pen.path(`M${x + s * 0.79},${y + s * 0.33} A${r} ${r} 0 1 1 ${x + s * 0.21},${y + s * 0.33}`, o);
  // Arrowhead at the arc's end, pointing along the direction of travel.
  pen.line(x + s * 0.21, y + s * 0.33, x + s * 0.05, y + s * 0.42, o);
  pen.line(x + s * 0.21, y + s * 0.33, x + s * 0.3, y + s * 0.5, o);
});

registerIcon("share", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.circle(x + s * 0.22, y + s * 0.5, s * 0.22, o);
  pen.circle(x + s * 0.78, y + s * 0.2, s * 0.22, o);
  pen.circle(x + s * 0.78, y + s * 0.8, s * 0.22, o);
  pen.line(x + s * 0.32, y + s * 0.44, x + s * 0.68, y + s * 0.26, o);
  pen.line(x + s * 0.32, y + s * 0.56, x + s * 0.68, y + s * 0.74, o);
});

registerIcon("filter", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  poly(pen, x, y, s, [[0.1, 0.14], [0.9, 0.14], [0.58, 0.52], [0.58, 0.86], [0.42, 0.76], [0.42, 0.52]], o);
});

registerIcon(["link", "chain"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  const r = s * 0.1;
  pen.path(
    `M${x + s * 0.5},${y + s * 0.36} L${x + s * 0.62},${y + s * 0.24}` +
      ` A${r} ${r} 0 0 1 ${x + s * 0.76},${y + s * 0.38} L${x + s * 0.64},${y + s * 0.5}`,
    o
  );
  pen.path(
    `M${x + s * 0.5},${y + s * 0.64} L${x + s * 0.38},${y + s * 0.76}` +
      ` A${r} ${r} 0 0 1 ${x + s * 0.24},${y + s * 0.62} L${x + s * 0.36},${y + s * 0.5}`,
    o
  );
  pen.line(x + s * 0.42, y + s * 0.58, x + s * 0.58, y + s * 0.42, o);
});

registerIcon("eye", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  const X = (n: number) => x + n * s;
  const Y = (n: number) => y + n * s;
  pen.path(`M${X(0.08)},${Y(0.5)} Q${X(0.5)},${Y(0.14)} ${X(0.92)},${Y(0.5)} Q${X(0.5)},${Y(0.86)} ${X(0.08)},${Y(0.5)} Z`, o);
  pen.circle(x + s * 0.5, y + s * 0.5, s * 0.2, o);
});

registerIcon("lock", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  const r = s * 0.16;
  pen.rect(x + s * 0.2, y + s * 0.44, s * 0.6, s * 0.44, o);
  pen.path(`M${x + s * 0.34},${y + s * 0.44} L${x + s * 0.34},${y + s * 0.28} A${r} ${r} 0 0 1 ${x + s * 0.66},${y + s * 0.28} L${x + s * 0.66},${y + s * 0.44}`, o);
  pen.circle(x + s * 0.5, y + s * 0.62, s * 0.09, o);
  pen.line(x + s * 0.5, y + s * 0.66, x + s * 0.5, y + s * 0.76, o);
});

registerIcon("unlock", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  const r = s * 0.16;
  pen.rect(x + s * 0.2, y + s * 0.44, s * 0.6, s * 0.44, o);
  pen.path(`M${x + s * 0.34},${y + s * 0.44} L${x + s * 0.34},${y + s * 0.24} A${r} ${r} 0 0 1 ${x + s * 0.66},${y + s * 0.24} L${x + s * 0.66},${y + s * 0.34}`, o);
  pen.circle(x + s * 0.5, y + s * 0.62, s * 0.09, o);
  pen.line(x + s * 0.5, y + s * 0.66, x + s * 0.5, y + s * 0.76, o);
});

// --- navigation / ui -------------------------------------------------------------

registerIcon(["menu", "hamburger"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.2 };
  pen.line(x + s * 0.14, y + s * 0.26, x + s * 0.86, y + s * 0.26, o);
  pen.line(x + s * 0.14, y + s * 0.5, x + s * 0.86, y + s * 0.5, o);
  pen.line(x + s * 0.14, y + s * 0.74, x + s * 0.86, y + s * 0.74, o);
});

registerIcon(["dots", "more", "kebab"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s), fill: color, fillStyle: "solid" };
  pen.circle(x + s * 0.18, y + s * 0.5, s * 0.11, o);
  pen.circle(x + s * 0.5, y + s * 0.5, s * 0.11, o);
  pen.circle(x + s * 0.82, y + s * 0.5, s * 0.11, o);
});

registerIcon("arrow-up", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.2 };
  pen.line(x + s * 0.5, y + s * 0.9, x + s * 0.5, y + s * 0.1, o);
  pen.line(x + s * 0.26, y + s * 0.36, x + s * 0.5, y + s * 0.1, o);
  pen.line(x + s * 0.74, y + s * 0.36, x + s * 0.5, y + s * 0.1, o);
});

registerIcon("arrow-down", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.2 };
  pen.line(x + s * 0.5, y + s * 0.1, x + s * 0.5, y + s * 0.9, o);
  pen.line(x + s * 0.26, y + s * 0.64, x + s * 0.5, y + s * 0.9, o);
  pen.line(x + s * 0.74, y + s * 0.64, x + s * 0.5, y + s * 0.9, o);
});

registerIcon("arrow-left", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.2 };
  pen.line(x + s * 0.9, y + s * 0.5, x + s * 0.1, y + s * 0.5, o);
  pen.line(x + s * 0.36, y + s * 0.26, x + s * 0.1, y + s * 0.5, o);
  pen.line(x + s * 0.36, y + s * 0.74, x + s * 0.1, y + s * 0.5, o);
});

registerIcon("arrow-right", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.2 };
  pen.line(x + s * 0.1, y + s * 0.5, x + s * 0.9, y + s * 0.5, o);
  pen.line(x + s * 0.64, y + s * 0.26, x + s * 0.9, y + s * 0.5, o);
  pen.line(x + s * 0.64, y + s * 0.74, x + s * 0.9, y + s * 0.5, o);
});

registerIcon("chevron-up", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.3 };
  polyline(pen, x, y, s, [[0.18, 0.66], [0.5, 0.32], [0.82, 0.66]], o);
});

registerIcon("chevron-down", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.3 };
  polyline(pen, x, y, s, [[0.18, 0.34], [0.5, 0.68], [0.82, 0.34]], o);
});

registerIcon("chevron-left", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.3 };
  polyline(pen, x, y, s, [[0.66, 0.18], [0.32, 0.5], [0.66, 0.82]], o);
});

registerIcon("chevron-right", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.3 };
  polyline(pen, x, y, s, [[0.34, 0.18], [0.68, 0.5], [0.34, 0.82]], o);
});

registerIcon("play", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  poly(pen, x, y, s, [[0.28, 0.14], [0.86, 0.5], [0.28, 0.86]], o);
});

registerIcon("pause", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) * 1.6 };
  pen.line(x + s * 0.36, y + s * 0.18, x + s * 0.36, y + s * 0.82, o);
  pen.line(x + s * 0.64, y + s * 0.18, x + s * 0.64, y + s * 0.82, o);
});

registerIcon("info", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.circle(x + s / 2, y + s / 2, s * 0.84, o);
  pen.circle(x + s * 0.5, y + s * 0.3, s * 0.05, { ...o, fill: color, fillStyle: "solid" });
  pen.line(x + s * 0.5, y + s * 0.44, x + s * 0.5, y + s * 0.72, { ...o, strokeWidth: sw(s) * 1.3 });
});

registerIcon(["warning", "alert-triangle"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  poly(pen, x, y, s, [[0.5, 0.08], [0.94, 0.88], [0.06, 0.88]], o);
  pen.line(x + s * 0.5, y + s * 0.36, x + s * 0.5, y + s * 0.62, { ...o, strokeWidth: sw(s) * 1.3 });
  pen.circle(x + s * 0.5, y + s * 0.75, s * 0.05, { ...o, fill: color, fillStyle: "solid" });
});

registerIcon(["question", "help"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.circle(x + s / 2, y + s / 2, s * 0.84, o);
  const X = (n: number) => x + n * s;
  const Y = (n: number) => y + n * s;
  pen.path(`M${X(0.36)},${Y(0.38)} Q${X(0.36)},${Y(0.24)} ${X(0.5)},${Y(0.24)} Q${X(0.66)},${Y(0.24)} ${X(0.64)},${Y(0.4)} Q${X(0.62)},${Y(0.5)} ${X(0.5)},${Y(0.54)} L${X(0.5)},${Y(0.62)}`, o);
  pen.circle(x + s * 0.5, y + s * 0.76, s * 0.05, { ...o, fill: color, fillStyle: "solid" });
});

registerIcon("folder", (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  poly(pen, x, y, s, [[0.08, 0.82], [0.08, 0.2], [0.38, 0.2], [0.48, 0.32], [0.92, 0.32], [0.92, 0.82]], o);
});

registerIcon(["file", "document"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  poly(pen, x, y, s, [[0.22, 0.08], [0.6, 0.08], [0.78, 0.26], [0.78, 0.92], [0.22, 0.92]], o);
  polyline(pen, x, y, s, [[0.6, 0.08], [0.6, 0.26], [0.78, 0.26]], o);
});

registerIcon(["cart", "shopping-cart"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  polyline(pen, x, y, s, [[0.06, 0.16], [0.2, 0.16], [0.34, 0.62], [0.78, 0.62], [0.88, 0.28], [0.26, 0.28]], o);
  pen.circle(x + s * 0.4, y + s * 0.8, s * 0.13, o);
  pen.circle(x + s * 0.72, y + s * 0.8, s * 0.13, o);
});

registerIcon(["chat", "message"], (pen, x, y, s, color) => {
  const o = { stroke: color, strokeWidth: sw(s) };
  pen.roundRect(x + s * 0.08, y + s * 0.12, s * 0.84, s * 0.56, s * 0.1, o);
  polyline(pen, x, y, s, [[0.3, 0.68], [0.26, 0.9], [0.46, 0.68]], o);
});
