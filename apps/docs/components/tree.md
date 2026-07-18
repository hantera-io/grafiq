# tree

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
