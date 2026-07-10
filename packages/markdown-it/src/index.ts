// @grafiq/markdown-it — a markdown-it plugin that turns fenced Grafiq code
// blocks into hydratable placeholders.
//
// Because Grafiq renders to <canvas> (which needs a DOM / runtime), the plugin
// does NOT rasterize at build time. Instead it emits a static, SSR-safe
// placeholder element carrying the DSL source. On the client, call `hydrate()`
// (from "@grafiq/markdown-it/hydrate") to replace placeholders with live,
// interactive canvases.

import type MarkdownIt from "markdown-it";

/** The default class applied to emitted placeholders. */
export const MOCKUP_CLASS = "grafiq-mockup";
/** The attribute that carries the (HTML-escaped) DSL source. */
export const SOURCE_ATTR = "data-grafiq-source";

export interface GrafiqPluginOptions {
  /**
   * Info-string languages that should be treated as Grafiq mockups.
   * Defaults to `["grafiq", "mockup"]`.
   */
  langs?: string[];
  /** Class name for the placeholder wrapper. Defaults to "grafiq-mockup". */
  className?: string;
  /**
   * When true, also render the raw DSL inside a `<pre>` fallback so the source
   * is visible if JS is disabled (progressive enhancement). Default: true.
   */
  fallbackSource?: boolean;
}

/** Minimal HTML-attribute escaping. */
function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * markdown-it plugin. Usage:
 *
 *   import MarkdownIt from "markdown-it";
 *   import grafiq from "@grafiq/markdown-it";
 *   const md = new MarkdownIt().use(grafiq);
 */
export default function grafiqPlugin(md: MarkdownIt, options: GrafiqPluginOptions = {}): void {
  const langs = (options.langs ?? ["grafiq", "mockup"]).map((l) => l.toLowerCase());
  const className = options.className ?? MOCKUP_CLASS;
  const fallbackSource = options.fallbackSource ?? true;

  const defaultFence =
    md.renderer.rules.fence ??
    ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));

  md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    const info = (token.info || "").trim().split(/\s+/)[0].toLowerCase();

    if (!langs.includes(info)) {
      return defaultFence(tokens, idx, opts, env, self);
    }

    const source = token.content;
    const fallback = fallbackSource
      ? `<pre class="${className}__source"><code>${escapeHtml(source)}</code></pre>`
      : "";

    return (
      `<div class="${className}" ${SOURCE_ATTR}="${escapeAttr(source)}">` +
      fallback +
      `</div>\n`
    );
  };
}
