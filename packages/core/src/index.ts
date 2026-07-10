// @grafiq/core — public API barrel.
//
// This exposes the parser, renderer, interaction layer, theme, and the
// component extension surface so downstream packages (markdown-it plugin,
// playground, docs) and third parties can consume Grafiq programmatically.

// --- Types -------------------------------------------------------------------
export type {
  AttrValue,
  Node,
  ParseError,
  ParseResult,
  Box,
  Measured,
  Placed,
} from "./types.ts";

// --- Parser ------------------------------------------------------------------
export { parse } from "./parser/parse.ts";
export { tokenizeLine, type Token } from "./parser/tokenize.ts";
export { resolveAlias, ALIASES } from "./parser/aliases.ts";

// --- Renderer ----------------------------------------------------------------
export { render, type RenderOptions, type RenderResult } from "./render/renderer.ts";
export { Pen, type TextAlign } from "./render/pen.ts";
export {
  DEFAULT_THEME,
  SPACING,
  VARIANTS,
  variant,
  type Theme,
} from "./render/theme.ts";

// --- Interaction -------------------------------------------------------------
export {
  InteractionStore,
  Frame,
  inside,
  type NodeState,
  type HitRegion,
  type Overlay,
} from "./render/interaction.ts";

// --- Layout ------------------------------------------------------------------
export {
  measureFlex,
  arrangeFlex,
  childFills,
  gapOf,
  padOf,
  type Axis,
} from "./layout/flex.ts";

// --- Component registry (extension point) ------------------------------------
export {
  register,
  getComponent,
  hasComponent,
  childPath,
  num,
  flag,
  str,
  explicitW,
  explicitH,
  type Component,
  type CompContext,
} from "./components/registry.ts";
export { registerControls } from "./components/controls.ts";
export { registerContainers } from "./components/containers.ts";
export { registerWidgets } from "./components/widgets.ts";
