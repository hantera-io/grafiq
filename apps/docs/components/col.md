# col

A container that lays children out vertically. See [row](/components/row) for
the horizontal counterpart.

Attributes: `gap=N`, `pad=N`, `align=start|center|end|stretch` (cross-axis
alignment; defaults to `stretch`).

Fill flags on a child claim the parent's free space: `fill` stretches in
**both** directions, `fillx` only horizontally, `filly` only vertically.
An explicit `w=`/`h=` always wins over stretching.

```grafiq
col gap=12 w=320
  heading "Stacked"
  text "Children flow top to bottom." muted
  button "Full width (stretch default)"
  row gap=8
    button "Cancel"
    spacer
    button "OK" primary
```
