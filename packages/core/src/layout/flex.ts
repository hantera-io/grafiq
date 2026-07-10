// Flexbox-lite: the shared row/col arrangement used by container components.
//
// Two passes conceptually, but exposed as helpers the row/col components call:
//  - measureFlex: intrinsic size of a stack of children along an axis.
//  - arrangeFlex: given a content box, compute each child's box, distributing
//    leftover main-axis space to `fill` children.

import type { Box, Node } from "../types.ts";
import type { CompContext } from "../components/registry.ts";
import { childPath, explicitH, explicitW, flag, getComponent, num } from "../components/registry.ts";


export type Axis = "row" | "col";

/** Does this child want to stretch along the given main axis? */
export function childFills(node: Node, axis: Axis): boolean {
  if (flag(node, "fill")) return true;
  const comp = getComponent(node.type);
  // A container marked defaultFill (none currently) or explicit fill only.
  if (axis === "row" && flag(node, "fillx")) return true;
  if (axis === "col" && flag(node, "filly")) return true;
  return comp?.defaultFill ?? false;
}

export function measureFlex(
  children: Node[],
  axis: Axis,
  gap: number,
  ctx: CompContext,
  availW: number
): { w: number; h: number } {
  if (children.length === 0) return { w: 0, h: 0 };
  let main = 0;
  let cross = 0;
  const isRow = axis === "row";
  for (const child of children) {
    const m = ctx.measure(child, availW);
    if (isRow) {
      main += m.w;
      cross = Math.max(cross, m.h);
    } else {
      main += m.h;
      cross = Math.max(cross, m.w);
    }
  }
  main += gap * (children.length - 1);
  return isRow ? { w: main, h: cross } : { w: cross, h: main };
}

/**
 * Arrange children within `content` box and draw each via ctx.drawNode.
 * `align` controls cross-axis alignment: start | center | end | stretch.
 */
export function arrangeFlex(
  children: Node[],
  axis: Axis,
  gap: number,
  content: Box,
  align: "start" | "center" | "end" | "stretch",
  ctx: CompContext
): void {
  const isRow = axis === "row";
  const mainSize = isRow ? content.w : content.h;
  const crossSize = isRow ? content.h : content.w;

  // Measure children; note which fill.
  const sizes = children.map((c) => ctx.measure(c, isRow ? content.w : content.w));
  const fills = children.map((c) => childFills(c, axis));

  const totalGap = gap * Math.max(0, children.length - 1);
  const usedMain = sizes.reduce((s, m) => s + (isRow ? m.w : m.h), 0) + totalGap;
  const fillCount = fills.filter(Boolean).length;
  const extra = Math.max(0, mainSize - usedMain);
  const perFill = fillCount > 0 ? extra / fillCount : 0;

  let cursor = isRow ? content.x : content.y;
  children.forEach((child, i) => {
    const m = sizes[i];
    let mainLen = isRow ? m.w : m.h;
    if (fills[i]) mainLen += perFill;

    // Cross length: explicit override, stretch, or intrinsic.
    let crossLen = isRow ? m.h : m.w;
    const exCross = isRow ? explicitH(child) : explicitW(child);
    if (exCross !== undefined) crossLen = exCross;
    else if (align === "stretch") crossLen = crossSize;

    // Cross offset.
    let crossOff = isRow ? content.y : content.x;
    if (align === "center") crossOff += (crossSize - crossLen) / 2;
    else if (align === "end") crossOff += crossSize - crossLen;

    const box: Box = isRow
      ? { x: cursor, y: crossOff, w: mainLen, h: crossLen }
      : { x: crossOff, y: cursor, w: crossLen, h: mainLen };

    ctx.drawNode(child, box, childPath(ctx.path, i));
    cursor += mainLen + gap;
  });
}


/** Read a gap/pad value with a default. */
export function gapOf(node: Node, dflt: number): number {
  return num(node, "gap", dflt);
}
export function padOf(node: Node, dflt: number): number {
  return num(node, "pad", dflt);
}
