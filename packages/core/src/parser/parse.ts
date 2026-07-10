// Indentation-based parser: raw DSL text -> AST (Node tree) + ParseErrors.
//
// Design goals:
//  - Forgiving: never throw. Malformed lines become error nodes / ParseErrors so
//    the renderer can still draw something and show a sticky-note.
//  - Indentation defines nesting. Tabs count as one indent step; leading spaces
//    are normalized (any positive indent delta = one level deeper).
//  - Inline `{ a; b }` children are supported for compact leaf groups.

import type { AttrValue, Node, ParseError, ParseResult } from "../types.ts";
import { resolveAlias } from "./aliases.ts";
import { tokenizeLine, type Token } from "./tokenize.ts";

interface RawLine {
  indent: number;
  text: string;
  line: number;
}

function coerce(value: string): AttrValue {
  if (value === "true") return true;
  if (value === "false") return false;
  // Numbers (including plain ints/floats). Leave dimension strings like
  // "400x520" and percentages like "50%" as strings.
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

/** Build a Node from a token list (one logical line). */
function nodeFromTokens(tokens: Token[], line: number, errors: ParseError[], source: string): Node | null {
  if (tokens.length === 0) return null;

  let idx = 0;
  const first = tokens[idx];
  if (first.kind !== "word") {
    errors.push({ line, message: `Line must start with a component name.`, source });
    return null;
  }
  const node: Node = {
    type: resolveAlias(first.value),
    attrs: {},
    children: [],
    line,
  };
  idx++;

  // Optional positional text: the first string right after the name.
  if (tokens[idx]?.kind === "string") {
    node.text = (tokens[idx] as Extract<Token, { kind: "string" }>).value;
    idx++;
  }

  // Remaining tokens: pairs, flags, extra strings, or inline braces.
  for (; idx < tokens.length; idx++) {
    const t = tokens[idx];
    switch (t.kind) {
      case "pair":
        node.attrs[t.key.toLowerCase()] = coerce(t.value);
        break;
      case "word":
        // Bare word = boolean flag.
        node.attrs[t.value.toLowerCase()] = true;
        break;
      case "string":
        // A later string appends to text (rare, but tolerant).
        node.text = node.text ? node.text + " " + t.value : t.value;
        break;
      case "brace_open":
      case "brace_close":
        // Inline braces are handled by splitLogical before tokenizing; if one
        // slips through, ignore it silently.
        break;
    }
  }
  return node;
}

/**
 * Expand inline `{ ... }` groups. We treat `;` inside braces as a child
 * separator. Returns the "head" line text (before `{`) plus a list of child
 * source strings. Nested braces are supported recursively by the caller.
 */
function extractInline(text: string): { head: string; inlineChildren: string[] } {
  const open = text.indexOf("{");
  if (open === -1) return { head: text, inlineChildren: [] };

  const head = text.slice(0, open).trim();
  // Find matching close brace.
  let depth = 0;
  let end = -1;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const inner = end === -1 ? text.slice(open + 1) : text.slice(open + 1, end);

  // Split top-level `;` separators (respecting nested braces & quotes).
  const parts: string[] = [];
  let buf = "";
  let d = 0;
  let q: string | null = null;
  for (const ch of inner) {
    if (q) {
      buf += ch;
      if (ch === q) q = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      q = ch;
      buf += ch;
      continue;
    }
    if (ch === "{") d++;
    if (ch === "}") d--;
    if (ch === ";" && d === 0) {
      if (buf.trim()) parts.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf.trim());
  return { head, inlineChildren: parts };
}

function parseLineToNode(source: string, line: number, errors: ParseError[]): Node | null {
  const { head, inlineChildren } = extractInline(source);
  const node = nodeFromTokens(tokenizeLine(head), line, errors, source);
  if (!node) return null;
  for (const childSrc of inlineChildren) {
    const child = parseLineToNode(childSrc, line, errors);
    if (child) node.children.push(child);
  }
  return node;
}

function measureIndent(raw: string): number {
  let indent = 0;
  for (const ch of raw) {
    if (ch === " ") indent += 1;
    else if (ch === "\t") indent += 4;
    else break;
  }
  return indent;
}

export function parse(text: string): ParseResult {
  const errors: ParseError[] = [];
  const root: Node = { type: "root", attrs: {}, children: [], line: 0 };

  // Collect non-empty, non-comment lines with their indent depth.
  const rawLines: RawLine[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  lines.forEach((ln, i) => {
    const stripped = ln.replace(/\s+$/, "");
    const trimmed = stripped.trim();
    if (trimmed === "" || trimmed.startsWith("#") || trimmed.startsWith("//")) return;
    rawLines.push({ indent: measureIndent(stripped), text: trimmed, line: i + 1 });
  });

  // Map raw indents to depth levels using a stack of indent widths.
  const indentStack: number[] = []; // indent widths per depth
  const nodeStack: Node[] = [root]; // node per depth (nodeStack[0] = root)

  for (const rl of rawLines) {
    const node = parseLineToNode(rl.text, rl.line, errors);
    if (!node) continue;

    // Determine depth by comparing this indent against the stack.
    while (indentStack.length > 0 && rl.indent <= indentStack[indentStack.length - 1]) {
      indentStack.pop();
      nodeStack.pop();
    }
    const parent = nodeStack[nodeStack.length - 1] ?? root;
    parent.children.push(node);

    indentStack.push(rl.indent);
    nodeStack.push(node);
  }

  return { root, errors };
}
