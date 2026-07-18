# Syntax

A tiny text language for hand-drawn UI mockups, designed to be easy for both
humans and LLMs to write.

::: tip Teaching an LLM Grafiq
Paste the full [GRAMMAR.md cheatsheet](https://raw.githubusercontent.com/hantera-io/grafiq/refs/heads/main/GRAMMAR.md)
into your system prompt to make an assistant fluent in the DSL.
:::


## Three rules

```
component "primary text" key=value flag
  child
  child
```

1. **One component per line.** The first word is the component name.
2. **A quoted string** right after the name is its primary text (label/title/content).
3. **`key=value`** sets an attribute; a **bare word** is a boolean flag
   (`primary`, `checked`).

**Nesting is by indentation** (2 spaces per level). Optional inline children use
braces, separated by `;`:

```grafiq
card "Title" { heading "42"; text "hits" }
```

Comments start with `#`. Values with spaces need quotes: `label="First name"`.

The parser is **forgiving**: unknown attributes are ignored, common aliases are
accepted (`btn` → `button`), and errors show up as a sticky note instead of
failing:

```grafiq
# This has a mistake, but still renders a helpful note:
buton "Typo!" primary
button "This one is fine" primary
```

## Universal attributes

These work on any component:

- `tooltip="…"` — shows a hover bubble.
- `w=N` / `h=N` / `size=WxH` — explicit sizing.

```grafiq
row gap=10
  button "Hover me" tooltip="I have a tooltip!"
  button "Fixed width" w=160
```

## Layout

- `row` — lay children out horizontally.
- `col` — lay children out vertically.
- Attributes on any container: `gap=N` (space between children), `pad=N`
  (inner padding), `align=start|center|end|stretch` (cross-axis).
- Sizing: `w=N`, `h=N`, or `size=WxH`. Fill flags on a child claim the parent's
  free space: `fill` stretches in **both** directions, `fillx` only
  horizontally, `filly` only vertically. Explicit `w=`/`h=` wins over
  stretching. `spacer` is an invisible flexible gap.

```grafiq
row gap=12
  button "Cancel"
  spacer
  button "OK" primary
```

## Full example

```grafiq
screen "Login" size=380x520
  navbar "MyApp"
    avatar
  col pad=24 gap=16
    heading "Welcome back"
    input "Email" placeholder="you@example.com"
    input "Password" type=password
    row gap=8
      checkbox "Remember me" checked
      spacer
      link "Forgot password?"
    button "Sign In" primary fill
    divider "or"
    button "Continue with Google"
```
