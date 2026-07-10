---
layout: home

hero:
  name: "Grafiq"
  text: "Hand-drawn mockups from text"
  tagline: A code-backed mockup DSL — think “Mermaid for wireframes”. LLM-friendly, deterministic, and it drops straight into markdown.
  actions:
    - theme: brand
      text: Get started
      link: /guide/introduction
    - theme: alt
      text: Syntax cheatsheet
      link: /guide/syntax
    - theme: alt
      text: Components
      link: /components/
    - theme: alt
      text: Playground
      link: https://playground.grafiq.dev


features:
  - title: Tiny, forgiving DSL
    details: One component per line, indentation for nesting. Unknown attributes are ignored and errors render as sticky notes instead of throwing.
  - title: Deterministic sketch rendering
    details: A seeded RNG means the same DSL always renders identically — great for spec diffs and screenshots.
  - title: Lightly interactive
    details: Dropdowns open, tabs switch, checkboxes flip, and screens scroll — right inside your docs.
---

## Try it

```grafiq
screen "Login" size=380x520
  navbar "MyApp"
    avatar
  col pad=24 gap=16
    heading "Welcome back"
    text "Sign in to continue" muted
    input "Email" placeholder="you@example.com"
    input "Password" type=password
    row gap=8
      checkbox "Remember me" checked
      spacer
      link "Forgot password?"
    button "Sign In" primary fill
    divider "or"
    button "Continue with Google"
```

Hover the mockup and click the ⤢ button to open it fullscreen.
