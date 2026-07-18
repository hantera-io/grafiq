# Components

Grafiq ships a library of sketchy components. Each is written on its own line;
a quoted string is its primary text, and `key=value`/flags configure it.

::: tip Every mockup is editable
Hover any mockup and click **`</>`** to see (and edit!) its DSL — the mockup
re-renders live as you type. Click **`↺`** to reset, or **`⤢`** to view it
fullscreen. The code blocks below _are_ the examples; there's no separate copy
to fall out of date.
:::

Each component has its own page (see the sidebar for the full alphabetical
list). By category:

- **Text** — [heading](/components/heading), [text](/components/text),
  [link](/components/link)
- **Inputs** — [button](/components/button), [input](/components/input),
  [textarea](/components/textarea), [search](/components/search),
  [checkbox](/components/checkbox), [radio](/components/radio),
  [toggle](/components/toggle), [select](/components/select),
  [slider](/components/slider)
- **Layout & chrome** — [row](/components/row), [col](/components/col),
  [card](/components/card), [divider](/components/divider),
  [spacer](/components/spacer), [navbar](/components/navbar),
  [tabs](/components/tabs), [sidebar](/components/sidebar),
  [modal](/components/modal), [screen](/components/screen)
- **Feedback & status** — [badge](/components/badge), [tag](/components/tag),
  [kbd](/components/kbd), [alert](/components/alert),
  [skeleton](/components/skeleton), [note](/components/note)
- **Navigation** — [breadcrumb](/components/breadcrumb),
  [pagination](/components/pagination), [stepper](/components/stepper),
  [menubar](/components/menubar), [accordion](/components/accordion)
- **Data & media** — [list](/components/list), [table](/components/table),
  [tree](/components/tree), [image](/components/image),
  [avatar](/components/avatar), [icon](/components/icon),
  [progress](/components/progress), [chart](/components/chart),
  [stat](/components/stat), [rating](/components/rating),
  [calendar](/components/calendar)

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
`dropdown`/`menu` → `select`, `switch` → `toggle`, `dialog` → `modal`,
`window`/`page`/`phone` → `screen`.
