// A built-in "fullscreen" lightbox for Grafiq mockups. Opening a mockup renders
// it again at a larger width in a modal overlay with its own interaction store
// (so lightbox state doesn't leak into the inline mockup). Close via the ✕
// button, a backdrop click, or the Escape key.

import type { Theme } from "@grafiq/core";
import { attach, type AttachHandle } from "./attach.ts";

export interface LightboxOptions {
  theme?: Partial<Theme>;
  /** Max content width used when rendering inside the lightbox. */
  maxWidth?: number;
}

let activeHandle: AttachHandle | null = null;
let activeOverlay: HTMLElement | null = null;
let keyListener: ((e: KeyboardEvent) => void) | null = null;

/** Close the currently-open lightbox, if any. */
export function closeLightbox(): void {
  if (activeHandle) {
    activeHandle.destroy();
    activeHandle = null;
  }
  if (activeOverlay) {
    activeOverlay.remove();
    activeOverlay = null;
  }
  if (keyListener) {
    document.removeEventListener("keydown", keyListener);
    keyListener = null;
  }
}

/** Open `source` in a fullscreen lightbox overlay. */
export function openLightbox(source: string, opts: LightboxOptions = {}): void {
  closeLightbox();

  const overlay = document.createElement("div");
  overlay.className = "grafiq-lightbox";

  const dialog = document.createElement("div");
  dialog.className = "grafiq-lightbox__dialog";

  const closeBtn = document.createElement("button");
  closeBtn.className = "grafiq-lightbox__close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "✕";

  const body = document.createElement("div");
  body.className = "grafiq-lightbox__body";

  const maxWidth =
    opts.maxWidth ??
    Math.min(1400, Math.max(320, Math.floor(window.innerWidth * 0.9) - 48));

  const handle = attach(source, { maxWidth, theme: opts.theme });
  body.appendChild(handle.canvas);

  dialog.appendChild(closeBtn);
  dialog.appendChild(body);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  activeHandle = handle;
  activeOverlay = overlay;

  closeBtn.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeLightbox();
  });
  keyListener = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
  };
  document.addEventListener("keydown", keyListener);
}
