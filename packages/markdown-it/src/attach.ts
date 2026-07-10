// Shared canvas rendering + event wiring used by both inline hydration and the
// lightbox. This mirrors the playground's interaction logic so mockups behave
// identically everywhere: click to toggle widgets, hover tooltips, wheel to
// scroll screens.

import { render, InteractionStore, type RenderResult, type Theme } from "@grafiq/core";

export interface AttachOptions {
  /** Max content width (CSS px) offered to the renderer. */
  maxWidth?: number;
  /** Partial theme overrides. */
  theme?: Partial<Theme>;
  /** Reuse an existing interaction store (e.g. to share state). */
  store?: InteractionStore;
}

export interface AttachHandle {
  canvas: HTMLCanvasElement;
  store: InteractionStore;
  /** Re-render (e.g. after a resize). */
  redraw: () => void;
  /** Replace the DSL source and re-render (resets interaction state). */
  setSource: (source: string) => void;
  /** Remove event listeners. */
  destroy: () => void;
}


/**
 * Render `source` into a fresh canvas and wire up interaction. Returns the
 * canvas plus lifecycle helpers. The canvas is NOT inserted into the DOM;
 * the caller decides where it goes.
 */
export function attach(source: string, opts: AttachOptions = {}): AttachHandle {
  const canvas = document.createElement("canvas");
  let store = opts.store ?? new InteractionStore();


  let lastFrame: RenderResult["frame"] | null = null;
  let hover: { x: number; y: number } | undefined;

  function draw() {
    const result = render(canvas, source, {
      maxWidth: opts.maxWidth ?? 720,
      theme: opts.theme,
      store,
      hover,
    });
    lastFrame = result.frame;
  }

  function eventPos(e: MouseEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    // Account for CSS scaling (the canvas may be displayed at a different size).
    const scaleX = canvas.clientWidth ? rect.width / canvas.clientWidth : 1;
    const scaleY = canvas.clientHeight ? rect.height / canvas.clientHeight : 1;
    return {
      x: (e.clientX - rect.left) / (scaleX || 1),
      y: (e.clientY - rect.top) / (scaleY || 1),
    };
  }

  const onClick = (e: MouseEvent) => {
    if (!lastFrame) return;
    const { x, y } = eventPos(e);
    const hit = lastFrame.hitTest(x, y);
    if (hit?.onClick) {
      hit.onClick();
      draw();
    }
  };

  const onMove = (e: MouseEvent) => {
    if (!lastFrame) return;
    const { x, y } = eventPos(e);
    hover = { x, y };
    const hit = lastFrame.hitTest(x, y);
    canvas.style.cursor = hit?.onClick ? "pointer" : "default";
    draw();
  };

  const onLeave = () => {
    if (hover) {
      hover = undefined;
      draw();
    }
  };

  const onWheel = (e: WheelEvent) => {
    if (!lastFrame) return;
    const { x, y } = eventPos(e);
    const target = lastFrame.wheelTarget(x, y);
    if (target?.onWheel) {
      e.preventDefault();
      target.onWheel(e.deltaX, e.deltaY);
      draw();
    }
  };

  canvas.addEventListener("click", onClick);
  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("mouseleave", onLeave);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  draw();

  return {
    canvas,
    store,
    redraw: draw,
    setSource(next: string) {
      source = next;
      // Editing changes node paths, so reset interaction state.
      store = new InteractionStore();
      hover = undefined;
      draw();
    },
    destroy() {

      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("wheel", onWheel);
    },
  };
}
