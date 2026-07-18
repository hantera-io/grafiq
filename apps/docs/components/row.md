# row

A container that lays children out horizontally. See [col](/components/col) for
the vertical counterpart.

Attributes: `gap=N`, `pad=N`, `align=start|center|end|stretch` (cross-axis
alignment; defaults to `center`).

Fill flags on a child claim the parent's free space: `fill` stretches in
**both** directions, `fillx` only horizontally, `filly` only vertically.
An explicit `w=`/`h=` always wins over stretching. `spacer` is an invisible
flexible gap that pushes siblings apart.

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
