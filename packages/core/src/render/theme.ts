// Visual theme + tunable constants for the hand-drawn look.

export interface Theme {
  ink: string; // primary stroke color
  inkLight: string; // secondary / disabled stroke
  fill: string; // subtle fill for controls
  accent: string; // primary buttons, active states
  accentFill: string; // fill for primary buttons
  paper: string; // canvas background
  font: string; // font family
  fontSize: number; // base font size (px)
  headingSize: number;
  roughness: number; // rough.js roughness
  bowing: number; // rough.js bowing
  seed: number; // deterministic sketch seed
}

export const DEFAULT_THEME: Theme = {
  ink: "#3a3a3a",
  inkLight: "#9aa0a6",
  fill: "#ffffff",
  accent: "#2f6fb0",
  accentFill: "#dbe8f5",
  paper: "#ffffff",
  font: '"Balsamiq Sans", "Comic Sans MS", cursive, sans-serif',
  fontSize: 15,
  headingSize: 24,
  roughness: 1.1,
  bowing: 1.2,
  seed: 42,
};

// Layout spacing defaults (px).
export const SPACING = {
  gap: 10,
  pad: 12,
  lineHeight: 1.35,
  controlHeight: 34,
  screenPad: 16,
};

/** Semantic variant colors: [stroke, fill] used by badges, alerts, tags. */
export const VARIANTS: Record<string, { stroke: string; fill: string }> = {
  default: { stroke: "#6b7280", fill: "#f1f2f4" },
  primary: { stroke: "#2f6fb0", fill: "#dbe8f5" },
  success: { stroke: "#2e7d46", fill: "#dcf1e2" },
  warning: { stroke: "#b5820e", fill: "#fdf1cf" },
  danger: { stroke: "#c0392b", fill: "#fbe0dc" },
  info: { stroke: "#2f6fb0", fill: "#dbe8f5" },
  error: { stroke: "#c0392b", fill: "#fbe0dc" },
  outline: { stroke: "#6b7280", fill: "#ffffff" },
};

export function variant(name: string) {
  return VARIANTS[name] ?? VARIANTS.default;
}


