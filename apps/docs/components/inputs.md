# Inputs

## button

Flags: `primary`, `disabled`.

```grafiq
row gap=8
  button "Default"
  button "Primary" primary
  button "Disabled" disabled
```

## input

A text field. `label="…"` renders a label above it, `placeholder="…"` sets
placeholder text, and `type=password` masks the value.

```grafiq
col gap=10 w=280
  input label="Email" placeholder="you@example.com"
  input label="Password" type=password
```

## textarea

A multi-line field.

```grafiq
textarea placeholder="Write a message…" w=320
```

## search

A field with a magnifier icon.

```grafiq
search placeholder="Search…" w=260
```

## checkbox / radio / toggle

Interactive — click to flip. Use `checked` / `selected` / `on` to start enabled.

```grafiq
col gap=10
  checkbox "Remember me" checked
  radio "Enable feature" selected
  toggle "Beta features" on
```

## select

A dropdown. Click to open, then pick an option. Options come from
`options="A, B, C"`.

```grafiq
select "Choose a theme" options="Light, Dark, System, High contrast"
```

## slider

A 0–100 range control.

```grafiq
slider value=60 w=220
```
