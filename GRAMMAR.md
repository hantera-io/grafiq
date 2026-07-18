# Grafiq DSL — cheatsheet


A tiny text language for hand-drawn UI mockups. Designed to be easy for both
humans and LLMs to write. **Paste this whole file into a system prompt** to make
an assistant fluent in it.

## Syntax (3 rules)

```
component "primary text" key=value flag
  child
  child
```

1. **One component per line.** The first word is the component name.
2. **A quoted string** right after the name is its primary text (label/title/content).
3. **`key=value`** sets an attribute; a **bare word** is a boolean flag (`primary`, `checked`).

**Nesting is by indentation** (2 spaces per level). Optional inline children:
`card "Title" { heading "42"; text "hits" }` (separate children with `;`).

Comments start with `#`. Values with spaces need quotes: `label="First name"`.
The parser is forgiving: unknown attributes are ignored, common aliases are
accepted (`btn`→`button`), and errors show up as a sticky note instead of failing.

**Universal attributes** (work on any component):
- `tooltip="…"` — shows a hover bubble in the playground.
- `w=N` / `h=N` / `size=WxH` — explicit sizing.


## Layout

- `row` — lay children out horizontally
- `col` — lay children out vertically
- Attributes on any container: `gap=N` (space between children), `pad=N`
  (inner padding), `align=start|center|end|stretch` (cross-axis).
- Sizing: `w=N`, `h=N`, or `size=WxH`. Fill flags on a child claim the parent's
  free space: `fill` stretches in **both** directions, `fillx` only horizontally,
  `filly` only vertically. Explicit `w=`/`h=` wins over stretching. `spacer` is
  an invisible flexible gap (pushes siblings apart).

```
row gap=12
  button "Cancel"
  spacer
  button "OK" primary
```

## Components

### Text
| Component | Notes |
|---|---|
| `heading "Title"` | Large bold text. `size=N` to override. |
| `text "Body"` | Normal text. Flag `muted` for grey. |
| `link "Click me"` | Underlined accent-colored text. |

### Inputs
| Component | Notes |
|---|---|
| `button "Save"` | Flags: `primary`, `disabled`. |
| `input "value" label="Email" placeholder="…"` | `type=password` masks text. |
| `textarea placeholder="…"` | Multi-line field. |
| `search placeholder="Search"` | Field with magnifier. |
| `checkbox "Label" checked` | |
| `radio "Label" selected` | |
| `toggle "Label" on` | On/off switch. |
| `select "Placeholder" options="A, B, C"` | Dropdown; click to open + pick. `items=` works too. |
| `slider value=60` | 0–100. |


### Layout & chrome
| Component | Notes |
|---|---|
| `row` / `col` | Containers (see Layout). |
| `card "Title"` | Panel with optional title + children. |
| `divider "or"` | Horizontal rule; optional centered label. |
| `spacer` | Flexible empty space. |
| `navbar "AppName"` | Top bar; children align right. |
| `tabs "A \| B \| C" active=0` | Tab strip (labels split on `\|`). |
| `sidebar w=180` | Left nav panel with children. |
| `modal "Title" w=360` | Dialog with title, close X, children. Grows to fit wrapped text. |
| `screen "Name" size=WxH` | Window frame. `scroll=vertical` (default) clips + scrolls content taller than the frame; `scroll=none` clips only; `scroll=both` adds horizontal scrolling. |


### Feedback & status
| Component | Notes |
|---|---|
| `badge "New" variant=success` | Pill. Variants: default/primary/success/warning/danger/outline. |
| `tag "React" variant=primary` | Pill with an `×` (alias: `chip`). |
| `kbd "Ctrl"` | Keyboard keycap. |
| `alert "…" title="Heads up" variant=info` | Callout with accent stripe. Variants: info/success/warning/error. Wraps text. |
| `skeleton lines=3` | Grey loading-placeholder bars. |
| `note "Explanation"` | Always-visible yellow annotation (survives PNG export). |

### Navigation
| Component | Notes |
|---|---|
| `breadcrumb "Home / Products / Shoes"` | Trail split on `/` with chevrons. |
| `pagination pages=5 active=1` | ‹ 1 2 3 › — click a page (interactive). |
| `stepper "Cart \| Ship \| Pay" active=1` | Numbered step progress (split on `\|`). |
| `menubar "File \| Edit \| View"` | App menu bar. |
| `accordion` + child `item "Title"` | Collapsible sections; an item's children are its body. Click to expand (interactive). |

### Data & media
| Component | Notes |
|---|---|
| `list "A, B, C" active=1` | Items split on `,`. Or nest child lines. |
| `table "H1\|H2; a\|b; c\|d"` | Rows split on `;`, cells on `\|`. First row = header. Or nest `row` children (see below). |
| `tree` + child `item "Label"` | Collapsible tree/file view. Indentation nests; branches expand on click. |
| `image "caption" w=120 h=90` | Placeholder box with X. |
| `avatar size=40` | Circular profile placeholder. |
| `icon name=star` | Small labeled square. |
| `progress value=70` | Progress bar, 0–100. |
| `chart type=bar\|line\|pie` | Sketchy chart placeholder. |
| `stat "Revenue" value="$3.2k" delta="+8%"` | Big-number metric (green/red delta). |
| `rating value=4 max=5` | Star rating. |
| `calendar day=14 month="March 2025" start=6` | Month grid; `start` = weekday of the 1st. |

#### Data-heavy tables

For real data, nest `row` children instead of cramming everything into one
string. The primary text is the header; each `row`'s text holds the `|`-separated
cells:

```
table "Name | Role | Status" widths="2,1,1" align="left,left,center" zebra sort="0:asc"
  row "[x] Ada Lovelace | Engineer | Active"
  row "[ ] Grace Hopper | PM | Away" selected
  row "[ ] Alan Turing | Research | Active"
```

- `widths="2,1,1"` — relative column widths (defaults to equal).
- `align="left,right,center"` — per-column text alignment (`l`/`r`/`c` also work).
- `zebra` — striped alternate rows.
- `selected` on a `row` (or `selected=N` on the table, 1-based) — highlight a row.
- `sort="0:desc"` — draw a ▲/▼ arrow in that header column (0-based).
- `[x]` / `[ ]` at the start of a cell renders a sketchy checkbox.

#### Tree / file view

A `tree` nests `item` children by indentation. Items with children are branches
(click to expand/collapse); leaves are just labels.

```
tree
  item "src" open
    item "components" open
      item "Button.tsx" selected
      item "Input.tsx"
    item "index.ts"
  item "package.json"
  item "README.md"
```

- `open` — branch starts expanded (default collapsed).
- `selected` — highlight the row.


## Full example

```
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

## Interactivity

In the playground, mockups are lightly interactive so you can demo flows:

- **Dropdowns** (`select`) open on click; picking an option updates the value.
- **Tabs** switch on click.
- **Checkbox / radio / toggle** flip on click.
- **Screens** scroll with the mouse wheel when content exceeds the frame.

This is ephemeral demo state; it resets when the DSL is edited. Rendering is
otherwise deterministic (a fixed seed), so mockups look identical every run.


