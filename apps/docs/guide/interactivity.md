# Interactivity

Grafiq mockups are **lightly interactive** so you can demo flows right in your
docs and playground:

- **Dropdowns** (`select`) open on click; picking an option updates the value.
- **Tabs** switch on click.
- **Checkbox / radio / toggle** flip on click.
- **Pagination**, **menus**, and **accordions** respond to clicks.
- **Screens** scroll with the mouse wheel when content exceeds the frame.

Try it — click the dropdown, the tabs, and the checkboxes, then scroll inside
the frame:

```grafiq
# Click the dropdown, tabs, and checkboxes.
# The screen has a fixed size, so its content scrolls (mouse wheel).
screen "Settings" size=380x420
  tabs "General | Account | Advanced" active=0
  col pad=16 gap=14
    heading "Preferences"
    select "Choose a theme" options="Light, Dark, System, High contrast"
    checkbox "Enable notifications" checked
    checkbox "Play sounds"
    toggle "Beta features" on
    divider
    heading "Danger zone"
    text "These settings affect your whole account and cannot easily be undone."
    button "Reset everything"
    text "Extra content below to demonstrate vertical scrolling within the fixed screen frame."
    input "Support PIN"
    button "Save changes" primary fill
```

## Ephemeral, deterministic

Interaction state is **ephemeral demo state** — it resets when the DSL is
edited. Rendering is otherwise **deterministic** (a fixed seed), so mockups look
identical on every run, which keeps spec diffs and screenshots stable.

## Fullscreen lightbox

When embedded via the [markdown-it plugin](/guide/markdown-it), each mockup has
a **⤢ fullscreen** button (hover to reveal it). It opens the same mockup at a
larger size in a lightbox with its own interaction state. Close it with the ✕,
a backdrop click, or the <kbd>Esc</kbd> key.
