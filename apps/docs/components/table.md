# table

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
