// Interaction layer: ephemeral UI state + hit-testing + overlay queue.
//
// The renderer is stateless per-frame, but interactive widgets (open dropdown,
// toggled checkbox, active tab, scroll offset) need state that survives
// re-renders. We key that state by the node's *path* in the tree (e.g. "0/2/1")
// so it stays stable as long as the DSL structure around it doesn't change.

import type { Box } from "../types.ts";

/** Per-node ephemeral state. All fields optional; components read what they need. */
export interface NodeState {
  open?: boolean; // dropdowns / expandable
  checked?: boolean; // checkbox / toggle / radio
  active?: number; // selected tab / list index
  scrollY?: number; // screen vertical scroll offset
  scrollX?: number; // screen horizontal scroll offset
}

/** Global interaction store. One instance lives in the playground. */
export class InteractionStore {
  private state = new Map<string, NodeState>();

  get(path: string): NodeState {
    let s = this.state.get(path);
    if (!s) {
      s = {};
      this.state.set(path, s);
    }
    return s;
  }

  peek(path: string): NodeState | undefined {
    return this.state.get(path);
  }

  set(path: string, patch: Partial<NodeState>): void {
    this.state.set(path, { ...this.get(path), ...patch });
  }

  clear(): void {
    this.state.clear();
  }
}

/**
 * A clickable region registered during draw. Carries a closure that mutates
 * state, so dispatch needs no node lookup. `onWheel` handles scroll regions.
 */
export interface HitRegion {
  box: Box;
  z: number;
  cursor?: string; // CSS cursor when hovering (default "pointer")
  onClick?: () => void;
  onWheel?: (dx: number, dy: number) => void;
}

/** A deferred draw (e.g. an open dropdown's option list) painted after the tree. */
export interface Overlay {
  z: number;
  draw: () => void;
  regions: HitRegion[];
}

/** Collector passed through a render pass to gather hits + overlays. */
export class Frame {
  hits: HitRegion[] = [];
  overlays: Overlay[] = [];

  addHit(region: HitRegion): void {
    this.hits.push(region);
  }

  addOverlay(o: Overlay): void {
    this.overlays.push(o);
  }

  private allRegions(): HitRegion[] {
    return [...this.hits, ...this.overlays.flatMap((o) => o.regions)];
  }

  /** Resolve the topmost hit at a point (overlay regions included). */
  hitTest(x: number, y: number): HitRegion | undefined {
    let best: HitRegion | undefined;
    for (const h of this.allRegions()) {
      if (inside(h.box, x, y) && (!best || h.z >= best.z)) best = h;
    }
    return best;
  }

  /** Topmost region with a wheel handler at a point. */
  wheelTarget(x: number, y: number): HitRegion | undefined {
    let best: HitRegion | undefined;
    for (const h of this.allRegions()) {
      if (h.onWheel && inside(h.box, x, y) && (!best || h.z >= best.z)) best = h;
    }
    return best;
  }
}

export function inside(box: Box, x: number, y: number): boolean {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}
