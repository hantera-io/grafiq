# screen

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
