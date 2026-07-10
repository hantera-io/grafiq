# Data & media

## list

Items split on `,` (or nest child lines). `active=N` highlights a row.

```grafiq
list "Home, Traffic, Sales, Users" active=1 w=200
```

## table

Rows split on `;`, cells on `|`. The first row is the header.

```grafiq
table "Name | Role | Status; Ada | Eng | Active; Grace | PM | Away; Alan | Design | Active" w=380
```

For data-heavy tables, nest `row` children instead. The primary text is the
header; each `row`'s text holds the `|`-separated cells. You get relative column
`widths`, per-column `align`, `zebra` striping, a `selected` row, a `sort` arrow,
and `[x]`/`[ ]` checkbox cells:

```grafiq
table "Name | Role | Status" widths="2,1,1" align="left,left,center" zebra sort="0:asc" w=420
  row "[x] Ada Lovelace | Engineer | Active"
  row "[ ] Grace Hopper | PM | Away" selected
  row "[ ] Alan Turing | Research | Active"
```

## tree

A collapsible tree / file view. Nest `item` children by indentation — items with
children are branches you can click to expand or collapse. Add `open` to start a
branch expanded and `selected` to highlight a row.

```grafiq
tree w=240
  item "src" open
    item "components" open
      item "Button.tsx" selected
      item "Input.tsx"
    item "index.ts"
  item "package.json"
  item "README.md"
```

## image

A placeholder box with an X. Optional caption text.

```grafiq
image "caption" w=160 h=100
```

## avatar

A circular profile placeholder. `size=N`.

```grafiq
row gap=12
  avatar size=40
  avatar size=64
```

## icon

A small labeled square. `name=…`.

```grafiq
row gap=8
  icon name=star
  icon name=home
  icon name=gear
```

## progress

A progress bar, 0–100.

```grafiq
progress value=70 w=220
```

## chart

A sketchy chart placeholder. `type=bar|line|pie`.

```grafiq
row gap=16
  chart type=bar w=180 h=120
  chart type=line w=180 h=120
  chart type=pie w=140 h=120
```

## stat

A big-number metric with a green/red delta.

```grafiq
row gap=16
  stat "Revenue" value="$3.2k" delta="+8%"
  stat "Churn" value="1.2%" delta="-3%"
```

## rating

A star rating. `value=N`, `max=N`.

```grafiq
rating value=4 max=5
```

## calendar

A month grid. `day=N` selects a day, `month="…"`, `start=N` is the weekday the
1st falls on.

```grafiq
calendar day=14 start=6 month="March 2025"
```
