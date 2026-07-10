# Text

## heading

Large bold text. Use `size=N` to override the font size.

```grafiq
col gap=8
  heading "Welcome back"
  heading "Smaller heading" size=18
```

## text

Normal body text. It wraps to the available width. Add the flag `muted` for a
grey secondary color.

```grafiq
col gap=8 w=320
  text "This is a normal paragraph of text that will wrap across multiple lines when it exceeds the available width."
  text "Muted secondary text." muted
```

## link

Underlined, accent-colored text.

```grafiq
row gap=16
  link "Forgot password?"
  link "Learn more"
```
