// Core data structures shared across parser, layout, and render.

/** Raw value of an attribute after parsing. */
export type AttrValue = string | number | boolean;

/** A parsed node in the mockup tree. */
export interface Node {
  /** Canonical component name (after alias resolution), e.g. "button". */
  type: string;
  /** Primary positional text argument, if present (the quoted string). */
  text?: string;
  /** key=value attributes and bare-word flags (flags stored as `true`). */
  attrs: Record<string, AttrValue>;
  /** Child nodes (from indentation or inline `{ }`). */
  children: Node[];
  /** 1-based source line, used for error reporting. */
  line: number;
}

/** A parse-time problem. Rendered as an inline sticky-note, never thrown. */
export interface ParseError {
  line: number;
  message: string;
  /** The raw source line that triggered the error. */
  source?: string;
}

export interface ParseResult {
  root: Node;
  errors: ParseError[];
}

/** A rectangle in canvas space. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Result of the measure pass: intrinsic (preferred) size of a node. */
export interface Measured {
  node: Node;
  /** Preferred width/height when sizing to content ("hug"). */
  w: number;
  h: number;
  /** Whether this node wants to stretch along the parent's main axis. */
  fill: boolean;
  children: Measured[];
}

/** Result of the arrange pass: absolute box for a node + its children. */
export interface Placed {
  node: Node;
  box: Box;
  children: Placed[];
}
