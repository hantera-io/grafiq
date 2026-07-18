# modal

A dialog with a title, close ✕, and children. Grows to fit wrapped text.

```grafiq
modal "Delete project?" w=360
  text "This action cannot be undone. All files and history will be permanently removed."
  row gap=8
    spacer
    button "Cancel"
    button "Delete" primary
```
