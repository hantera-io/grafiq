# Feedback & status

## badge

A pill label. Variants: `default`, `primary`, `success`, `warning`, `danger`,
`outline`.

```grafiq
row gap=6
  badge "New" variant=success
  badge "Beta" variant=warning
  badge "v2" variant=primary
```

## tag

A pill with an `×` (alias: `chip`).

```grafiq
row gap=6
  tag "React"
  tag "TypeScript" variant=primary
```

## kbd

A keyboard keycap.

```grafiq
row gap=6 align=center
  kbd "Ctrl"
  text "+"
  kbd "K"
```

## alert

A callout with an accent stripe. Variants: `info`, `success`, `warning`,
`error`. Wraps text. `title="…"` adds a bold title.

```grafiq
alert "Your trial ends in 3 days." title="Heads up" variant=warning w=380
```

## skeleton

Grey loading-placeholder bars. `lines=N`.

```grafiq
skeleton lines=3 w=280
```

## note

An always-visible yellow annotation (survives PNG export).

```grafiq
note "Annotations stay visible in exported PNGs." w=280
```
