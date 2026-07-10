// Playground entry point: textarea (left) -> live canvas (right).

import { render, InteractionStore, type RenderResult } from "@grafiq/core";
import { EXAMPLES } from "./examples.ts";



const app = document.getElementById("app")!;


app.innerHTML = `
  <header>
    <h1>✎ Grafiq</h1>
    <span class="tagline">hand-drawn mockups from text</span>
    <span class="spacer"></span>
    <a class="docs-link" href="https://www.grafiq.dev" title="Open the documentation">Docs ↗</a>
    <select id="examples" title="Load an example"></select>
    <button id="copy" title="Copy DSL to clipboard">Copy</button>
    <button id="png" title="Download as PNG">PNG</button>
  </header>

  <div class="main">
    <div class="editor" id="editor">
      <textarea id="src" spellcheck="false"></textarea>
    </div>
    <div class="gutter" id="gutter" title="Drag to resize"></div>
    <div class="preview">
      <canvas id="canvas"></canvas>
    </div>
  </div>
  <div class="status" id="status">Ready.</div>
`;


const textarea = document.getElementById("src") as HTMLTextAreaElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const status = document.getElementById("status") as HTMLDivElement;
const select = document.getElementById("examples") as HTMLSelectElement;

// Populate examples dropdown.
EXAMPLES.forEach((ex, i) => {
  const opt = document.createElement("option");
  opt.value = String(i);
  opt.textContent = ex.name;
  select.appendChild(opt);
});

// --- Resizable editor/preview split (persisted to localStorage) -------------
const editor = document.getElementById("editor") as HTMLDivElement;
const gutter = document.getElementById("gutter") as HTMLDivElement;
const EDITOR_WIDTH_KEY = "grafiq.editorWidth";

function clampEditorWidth(px: number): number {
  const min = 260;
  const max = Math.max(min, window.innerWidth * 0.75);
  return Math.min(max, Math.max(min, px));
}

function applyEditorWidth(px: number) {
  editor.style.width = `${clampEditorWidth(px)}px`;
  editor.style.flex = "0 0 auto";
}

const savedWidth = Number(localStorage.getItem(EDITOR_WIDTH_KEY));
if (savedWidth > 0) applyEditorWidth(savedWidth);

let dragging = false;
gutter.addEventListener("mousedown", (e) => {
  dragging = true;
  e.preventDefault();
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";
});

window.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const left = document.querySelector(".main")!.getBoundingClientRect().left;
  applyEditorWidth(e.clientX - left);
  draw(); // re-fit the canvas live while dragging
});


window.addEventListener("mouseup", () => {
  if (!dragging) return;
  dragging = false;
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
  localStorage.setItem(EDITOR_WIDTH_KEY, String(parseInt(editor.style.width, 10)));
  draw();
});

// A persistent interaction store so clicks/scrolls survive re-renders.
const store = new InteractionStore();

// The most recent frame, for hit-testing pointer events.
let lastFrame: RenderResult["frame"] | null = null;
// Current cursor position over the canvas (for hover tooltips).
let hover: { x: number; y: number } | undefined;

function draw() {
  try {
    const previewWidth = (document.querySelector(".preview") as HTMLElement).clientWidth - 48;
    const result = render(canvas, textarea.value, { maxWidth: Math.max(320, previewWidth), store, hover });
    lastFrame = result.frame;

    if (result.errors.length) {
      status.textContent = `${result.errors.length} parse issue(s) — rendered with sticky note.`;
      status.classList.add("error");
    } else {
      status.textContent = `Rendered ${canvas.style.width} × ${canvas.style.height}. Try clicking dropdowns, tabs, checkboxes; scroll inside a screen.`;
      status.classList.remove("error");
    }
  } catch (err) {
    status.textContent = `Render error: ${(err as Error).message}`;
    status.classList.add("error");
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

// Editing the DSL resets interaction state (node paths may have shifted).
function drawFromEdit() {
  store.clear();
  draw();
}

/** Convert a mouse event to canvas-space (CSS px) coordinates. */
function eventPos(e: MouseEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener("click", (e) => {
  if (!lastFrame) return;
  const { x, y } = eventPos(e);
  const hit = lastFrame.hitTest(x, y);
  if (hit?.onClick) {
    hit.onClick();
    draw(); // re-render with updated state (keep store)
  }
});

// Hover cursor feedback + tooltip. We re-render on move so the hover bubble
// tracks the cursor; this is cheap for mockup-sized canvases.
canvas.addEventListener("mousemove", (e) => {
  if (!lastFrame) return;
  const { x, y } = eventPos(e);
  hover = { x, y };
  const hit = lastFrame.hitTest(x, y);
  canvas.style.cursor = hit?.onClick ? "pointer" : "default";
  draw();
});

canvas.addEventListener("mouseleave", () => {
  if (hover) {
    hover = undefined;
    draw();
  }
});


// Wheel scrolling inside scrollable screens.
canvas.addEventListener(
  "wheel",
  (e) => {
    if (!lastFrame) return;
    const { x, y } = eventPos(e);
    const target = lastFrame.wheelTarget(x, y);
    if (target?.onWheel) {
      e.preventDefault();
      target.onWheel(e.deltaX, e.deltaY);
      draw();
    }
  },
  { passive: false }
);


// Debounced re-render on input. Editing clears interaction state since node
// paths may have shifted.
let timer: number | undefined;
function scheduleDraw() {
  window.clearTimeout(timer);
  timer = window.setTimeout(drawFromEdit, 120);
}


textarea.addEventListener("input", scheduleDraw);
window.addEventListener("resize", scheduleDraw);

// Tab key inserts two spaces instead of moving focus.
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const s = textarea.selectionStart;
    const en = textarea.selectionEnd;
    textarea.value = textarea.value.slice(0, s) + "  " + textarea.value.slice(en);
    textarea.selectionStart = textarea.selectionEnd = s + 2;
    scheduleDraw();
  }
});

select.addEventListener("change", () => {
  const ex = EXAMPLES[Number(select.value)];
  if (ex) {
    textarea.value = ex.source;
    drawFromEdit();
  }
});


document.getElementById("copy")!.addEventListener("click", () => {
  navigator.clipboard.writeText(textarea.value).then(() => {
    status.textContent = "Copied DSL to clipboard.";
    status.classList.remove("error");
  });
});

document.getElementById("png")!.addEventListener("click", () => {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "mockup.png";
  a.click();
});

// Wait for the web font before the first render so text metrics are correct.
// Optional ?example=N selects a preset (used for testing/deep links).
function start() {
  const param = new URLSearchParams(location.search).get("example");
  const idx = param !== null ? Number(param) : 0;
  const ex = EXAMPLES[idx] ?? EXAMPLES[0];
  select.value = String(EXAMPLES.indexOf(ex));
  textarea.value = ex.source;
  draw();
}


if (document.fonts && document.fonts.ready) {
  // Ensure the specific font is loaded, then render.
  document.fonts.load('16px "Balsamiq Sans"').finally(() => {
    document.fonts.ready.then(start);
  });
} else {
  start();
}
