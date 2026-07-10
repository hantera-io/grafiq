// Tokenizer for a single logical line of the DSL.
//
// A line looks like:
//   component "primary text" key=value key2="two words" flag { child ... }
//
// Rules:
//  - First bare token is the component name.
//  - A quoted string (") immediately usable as the positional `text`.
//  - `key=value` -> attribute. Value may be quoted or bare (no spaces).
//  - `key: value` and `key value` are also tolerated and normalized to key=value.
//  - A bare word with no `=` -> boolean flag (value true).
//  - `{` ... `}` opens an inline-children group (handled by the parser, but we
//    emit BRACE_OPEN / BRACE_CLOSE tokens here).

export type Token =
  | { kind: "word"; value: string }
  | { kind: "string"; value: string }
  | { kind: "pair"; key: string; value: string }
  | { kind: "brace_open" }
  | { kind: "brace_close" };

/**
 * Split a line into raw whitespace-separated chunks, but keep quoted strings
 * (including spaces) together and keep braces as standalone chunks.
 */
function chunk(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  const n = line.length;
  while (i < n) {
    const c = line[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    if (c === "{" || c === "}") {
      out.push(c);
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      // Quoted string; consume until matching quote (or EOL).
      const quote = c;
      let s = "";
      i++;
      while (i < n && line[i] !== quote) {
        if (line[i] === "\\" && i + 1 < n) {
          s += line[i + 1];
          i += 2;
        } else {
          s += line[i];
          i++;
        }
      }
      i++; // skip closing quote
      out.push('"' + s); // prefix marks this chunk as a string literal
      continue;
    }
    // Bare chunk: read until whitespace or brace. But allow an `=` followed by
    // a quoted value to swallow spaces (key="a b").
    let s = "";
    while (i < n && line[i] !== " " && line[i] !== "\t" && line[i] !== "{" && line[i] !== "}") {
      if ((line[i] === '"' || line[i] === "'") && s.endsWith("=")) {
        const quote = line[i];
        i++;
        while (i < n && line[i] !== quote) {
          if (line[i] === "\\" && i + 1 < n) {
            s += line[i + 1];
            i += 2;
          } else {
            s += line[i];
            i++;
          }
        }
        i++; // closing quote
        break;
      }
      s += line[i];
      i++;
    }
    out.push(s);
  }
  return out;
}

export function tokenizeLine(line: string): Token[] {
  const chunks = chunk(line);
  const tokens: Token[] = [];
  for (const raw of chunks) {
    if (raw === "{") {
      tokens.push({ kind: "brace_open" });
      continue;
    }
    if (raw === "}") {
      tokens.push({ kind: "brace_close" });
      continue;
    }
    if (raw.startsWith('"')) {
      tokens.push({ kind: "string", value: raw.slice(1) });
      continue;
    }
    // key=value ?
    const eq = raw.indexOf("=");
    if (eq > 0) {
      tokens.push({ kind: "pair", key: raw.slice(0, eq), value: raw.slice(eq + 1) });
      continue;
    }
    // key:value (colon form, but not a bare word ending in ':')
    const colon = raw.indexOf(":");
    if (colon > 0 && colon < raw.length - 1) {
      tokens.push({ kind: "pair", key: raw.slice(0, colon), value: raw.slice(colon + 1) });
      continue;
    }
    tokens.push({ kind: "word", value: raw });
  }
  return tokens;
}
