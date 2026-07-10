// Component registry. Each component declares how to measure its intrinsic
// size and how to draw itself into a given box. Adding a component = adding
// one entry here (or via `register`). This is the primary extension point.

import type { Box, Node } from "../types.ts";
import type { Pen } from "../render/pen.ts";
import type { Frame, InteractionStore, NodeState } from "../render/interaction.ts";

/** Context passed to measure/draw so components can size text, recurse, etc. */
export interface CompContext {
  pen: Pen;
  /** Hit/overlay collector for the current frame. */
  frame: Frame;
  /** Persistent interaction state store. */
  store: InteractionStore;
  /** Path of the node currently being drawn (e.g. "0/2/1"). */
  path: string;
  /** Measure a child subtree's intrinsic size (delegates to layout engine). */
  measure: (node: Node, availW: number) => { w: number; h: number };
  /**
   * Arrange + draw a child subtree within a box. `childPath` must be provided
   * so interaction state / hit regions stay keyed correctly.
   */
  drawNode: (node: Node, box: Box, childPath: string) => void;
  /** Resolve this node's (or a child's) merged interaction state. */
  state: (path: string) => NodeState;
}

/** Append a child index to a parent path. */
export function childPath(parent: string, index: number): string {
  return parent === "" ? String(index) : `${parent}/${index}`;
}


export interface Component {
  /**
   * Intrinsic size when hugging content. `availW` is the width the parent can
   * offer (useful for wrapping / fill children). Container components recurse.
   */
  measure(node: Node, ctx: CompContext, availW: number): { w: number; h: number };
  /** Draw into the resolved box. */
  draw(node: Node, box: Box, ctx: CompContext): void;
  /** True for row/col/card/etc. that lay out children. */
  container?: boolean;
  /** Whether this node stretches along the parent's main axis by default. */
  defaultFill?: boolean;
}

const REGISTRY = new Map<string, Component>();

export function register(names: string | string[], comp: Component): void {
  for (const n of Array.isArray(names) ? names : [names]) {
    REGISTRY.set(n, comp);
  }
}

export function getComponent(type: string): Component | undefined {
  return REGISTRY.get(type);
}

export function hasComponent(type: string): boolean {
  return REGISTRY.has(type);
}

// --- shared attribute helpers ------------------------------------------------

export function num(node: Node, key: string, dflt: number): number {
  const v = node.attrs[key];
  if (typeof v === "number") return v;
  if (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return dflt;
}

export function flag(node: Node, key: string): boolean {
  return node.attrs[key] === true || node.attrs[key] === "true";
}

export function str(node: Node, key: string, dflt = ""): string {
  const v = node.attrs[key];
  return v === undefined ? dflt : String(v);
}

/** Parse an explicit width from `w=` or `size=WxH`. Returns undefined if none. */
export function explicitW(node: Node): number | undefined {
  if (node.attrs.w !== undefined) return num(node, "w", 0);
  const size = node.attrs.size;
  if (typeof size === "string" && size.includes("x")) {
    const w = Number(size.split("x")[0]);
    if (!Number.isNaN(w)) return w;
  }
  return undefined;
}

export function explicitH(node: Node): number | undefined {
  if (node.attrs.h !== undefined) return num(node, "h", 0);
  const size = node.attrs.size;
  if (typeof size === "string" && size.includes("x")) {
    const h = Number(size.split("x")[1]);
    if (!Number.isNaN(h)) return h;
  }
  return undefined;
}
