# Layout & chrome

## row / col

Containers that lay children out horizontally (`row`) or vertically (`col`).
Attributes: `gap=N`, `pad=N`, `align=start|center|end|stretch`. Add `fill` to a
child to make it stretch.

```grafiq
col gap=12 w=320
  row gap=8
    button "Cancel"
    spacer
    button "OK" primary
  row gap=8 align=center
    avatar size=32
    text "Aligned center"
```

## card

A panel with an optional title and children.

```grafiq
card "Visitors" w=200
  heading "12.4k"
  text "+8% this week" muted
```

## divider

A horizontal rule with an optional centered label.

```grafiq
col gap=10 w=280
  text "Above"
  divider "or"
  text "Below"
```

## spacer

An invisible flexible gap that pushes siblings apart (see `row` above).

## navbar

A top bar; children align to the right.

```grafiq
navbar "MyApp"
  link "Docs"
  avatar size=28
```

## tabs

A tab strip; labels split on `|`. Interactive — click to switch. `active=N` sets
the initial tab.

```grafiq
tabs "Overview | Reports | Settings" active=0
```

## sidebar

A left navigation panel with children.

```grafiq
row gap=12
  sidebar w=170
    list "Home, Traffic, Sales, Users" active=1
  card "Content"
    text "Main area"
```

## modal

A dialog with a title, close ✕, and children. Grows to fit wrapped text.

```grafiq
modal "Delete project?" w=360
  text "This action cannot be undone. All files and history will be permanently removed."
  row gap=8
    spacer
    button "Cancel"
    button "Delete" primary
```

## screen

A window frame. `size=WxH` fixes the viewport; content taller than the frame
scrolls. `scroll=vertical` (default) clips + scrolls vertically; `scroll=none`
clips only; `scroll=both` adds horizontal scrolling.

```grafiq
screen "Profile" size=320x420
  navbar "Profile"
  col pad=16 gap=14 align=center
    avatar size=90
    heading "Jane Doe"
    text "Product Designer" muted
    button "Edit Profile" primary fill
```
