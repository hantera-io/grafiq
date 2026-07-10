// Client-side hydration for Grafiq mockup placeholders emitted by the
// markdown-it plugin. Finds `.grafiq-mockup[data-grafiq-source]` elements and
// renders each into an interactive canvas, with an optional toolbar:
//   ⤢  open a fullscreen lightbox
//   </> toggle a source view (optionally editable, with live re-render + reset)

import type { Theme } from "@grafiq/core";
import { attach, type AttachHandle } from "./attach.ts";
import { openLightbox } from "./lightbox.ts";
import { MOCKUP_CLASS, SOURCE_ATTR } from "./index.ts";

export interface HydrateOptions {
  /** CSS selector (or root element) to search within. Defaults to document. */
  root?: ParentNode;
  /** Placeholder class to look for. Defaults to "grafiq-mockup". */
  className?: string;
  /** Max content width offered to the renderer. Defaults to 720. */
  maxWidth?: number;
  /** Partial theme overrides applied to every mockup. */
  theme?: Partial<Theme>;
  /** Show the fullscreen lightbox trigger. Defaults to true. */
  lightbox?: boolean;
  /** Show the source (code) toggle button. Defaults to true. */
  codeToggle?: boolean;
  /**
   * Allow editing the source when the code view is open, re-rendering live.
   * Implies `codeToggle`. Defaults to true.
   */
  editable?: boolean;
}

const HYDRATED_FLAG = "grafiqHydrated";

/** Decode HTML entities from the attribute value back into raw DSL text. */
function decodeSource(el: Element): string {
  const raw = el.getAttribute(SOURCE_ATTR) ?? "";
  const doc = document.createElement("textarea");
  doc.innerHTML = raw;
  return doc.value;
}

function iconButton(cls: string, label: string, glyph: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = cls;
  btn.type = "button";
  btn.setAttribute("aria-label", label);
  btn.title = label;
  btn.textContent = glyph;
  return btn;
}

export interface HydrateResult {
  handles: AttachHandle[];
  /** Tear down all hydrated mockups created by this call. */
  destroy: () => void;
}

/**
 * Hydrate all mockup placeholders under `root`. Safe to call multiple times;
 * already-hydrated elements are skipped.
 */
export function hydrate(options: HydrateOptions = {}): HydrateResult {
  const root = options.root ?? document;
  const className = options.className ?? MOCKUP_CLASS;
  const lightbox = options.lightbox ?? true;
  const editable = options.editable ?? true;
  // Editing requires the toggle; enable the toggle if either is on.
  const codeToggle = (options.codeToggle ?? true) || editable;

  const nodes = Array.from(root.querySelectorAll<HTMLElement>(`.${className}`));
  const handles: AttachHandle[] = [];

  for (const el of nodes) {
    if ((el.dataset as Record<string, string>)[HYDRATED_FLAG]) continue;
    const original = decodeSource(el);
    if (!original) continue;

    (el.dataset as Record<string, string>)[HYDRATED_FLAG] = "true";

    // Remove the no-JS fallback source, if present.
    el.querySelector(`.${className}__source`)?.remove();

    // Current (possibly edited) source; used by the lightbox too.
    let current = original;

    const handle = attach(current, {
      maxWidth: options.maxWidth ?? 720,
      theme: options.theme,
    });

    // --- surfaces ------------------------------------------------------------
    const surface = document.createElement("div");
    surface.className = `${className}__surface`;
    surface.appendChild(handle.canvas);
    el.appendChild(surface);

    // --- toolbar -------------------------------------------------------------
    const toolbar = document.createElement("div");
    toolbar.className = `${className}__toolbar`;

    let editor: HTMLDivElement | null = null;
    let textarea: HTMLTextAreaElement | null = null;
    let resetBtn: HTMLButtonElement | null = null;
    let showingCode = false;

    if (codeToggle) {
      // The code panel (hidden until toggled).
      editor = document.createElement("div");
      editor.className = `${className}__editor`;
      editor.hidden = true;

      textarea = document.createElement("textarea");
      textarea.className = `${className}__code`;
      textarea.value = current;
      textarea.spellcheck = false;
      textarea.readOnly = !editable;
      editor.appendChild(textarea);
      el.appendChild(editor);

      const codeBtn = iconButton(`${className}__btn`, editable ? "Edit source" : "View source", "</>");

      if (editable) {
        resetBtn = iconButton(`${className}__btn ${className}__reset`, "Reset to original", "↺");
        resetBtn.hidden = true;

        let timer: number | undefined;
        const scheduleRender = () => {
          window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            current = textarea!.value;
            handle.setSource(current);
            if (resetBtn) resetBtn.hidden = current === original;
          }, 150);
        };
        textarea.addEventListener("input", scheduleRender);
        // Tab inserts two spaces instead of moving focus.
        textarea.addEventListener("keydown", (e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const s = textarea!.selectionStart;
            const en = textarea!.selectionEnd;
            textarea!.value = textarea!.value.slice(0, s) + "  " + textarea!.value.slice(en);
            textarea!.selectionStart = textarea!.selectionEnd = s + 2;
            scheduleRender();
          }
        });

        resetBtn.addEventListener("click", () => {
          current = original;
          textarea!.value = original;
          handle.setSource(original);
          resetBtn!.hidden = true;
        });
      }

      codeBtn.addEventListener("click", () => {
        showingCode = !showingCode;
        editor!.hidden = !showingCode;
        surface.hidden = showingCode;
        codeBtn.classList.toggle(`${className}__btn--active`, showingCode);
      });

      if (resetBtn) toolbar.appendChild(resetBtn);
      toolbar.appendChild(codeBtn);
    }

    if (lightbox) {
      const fsBtn = iconButton(`${className}__btn ${className}__fullscreen`, "View fullscreen", "⤢");
      fsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openLightbox(current, { theme: options.theme });
      });
      toolbar.appendChild(fsBtn);
    }

    if (toolbar.childElementCount > 0) el.appendChild(toolbar);

    handles.push(handle);
  }

  return {
    handles,
    destroy() {
      for (const h of handles) h.destroy();
    },
  };
}

export { openLightbox, closeLightbox } from "./lightbox.ts";
export type { AttachHandle } from "./attach.ts";
