# Components

Grafiq ships a library of sketchy components. Each is written on its own line;
a quoted string is its primary text, and `key=value`/flags configure it.

::: tip Every mockup is editable
Hover any mockup and click **`</>`** to see (and edit!) its DSL — the mockup
re-renders live as you type. Click **`↺`** to reset, or **`⤢`** to view it
fullscreen. The code blocks below _are_ the examples; there's no separate copy
to fall out of date.
:::

Browse by category:


- **[Text](/components/text)** — `heading`, `text`, `link`
- **[Inputs](/components/inputs)** — `button`, `input`, `textarea`, `search`,
  `checkbox`, `radio`, `toggle`, `select`, `slider`
- **[Layout & chrome](/components/layout)** — `row`, `col`, `card`, `divider`,
  `spacer`, `navbar`, `tabs`, `sidebar`, `modal`, `screen`
- **[Feedback & status](/components/feedback)** — `badge`, `tag`, `kbd`,
  `alert`, `skeleton`, `note`
- **[Navigation](/components/navigation)** — `breadcrumb`, `pagination`,
  `stepper`, `menubar`, `menu`, `accordion`
- **[Data & media](/components/data)** — `list`, `table`, `image`, `avatar`,
  `icon`, `progress`, `chart`, `stat`, `rating`, `calendar`

## Everything at a glance

```grafiq
heading "Components"
row gap=20 align=start
  col gap=10
    text "Buttons" muted
    button "Default"
    button "Primary" primary
    button "Disabled" disabled
  col gap=10
    text "Inputs" muted
    input placeholder="Text field"
    search placeholder="Search…"
    select "Choose one"
  col gap=10
    text "Choices" muted
    checkbox "Checkbox" checked
    radio "Radio" selected
    toggle "Toggle" on
    slider value=60
  col gap=10
    text "Data" muted
    progress value=70
    chart type=bar w=160 h=90
    image "caption" w=160 h=80
```

## Aliases

The parser accepts many synonyms so LLM-written DSL "just works". For example
`btn` → `button`, `img` → `image`, `hbox` → `row`, `vbox` → `col`,
`dropdown` → `select`, `switch` → `toggle`, `dialog` → `modal`,
`window`/`page`/`phone` → `screen`.
