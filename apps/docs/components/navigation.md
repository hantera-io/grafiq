# Navigation

## breadcrumb

A trail split on `/` with chevrons.

```grafiq
breadcrumb "Home / Products / Shoes"
```

## pagination

`‹ 1 2 3 ›` — interactive; click a page. `pages=N`, `active=N`.

```grafiq
pagination pages=5 active=1
```

## stepper

Numbered step progress; labels split on `|`. `active=N`.

```grafiq
stepper "Cart | Shipping | Pay" active=1 w=360
```

## menubar

An app menu bar; items split on `|`.

```grafiq
menubar "File | Edit | View" w=280
```

## menu

A button that opens an action dropdown. Interactive — click to open. Items from
`items="A, B, C"`.

```grafiq
menu "Actions" items="Rename, Duplicate, Delete"
```

## accordion

Collapsible sections. Each child `item "Title"` has its own body children. Click
a header to expand.

```grafiq
accordion w=360
  item "What is this?"
    text "A hand-drawn mockup DSL. Click headers to expand."
  item "Is it interactive?"
    text "Yes — dropdowns, tabs, accordions and more."
  item "Can I export?"
    button "Download PNG" primary
```
