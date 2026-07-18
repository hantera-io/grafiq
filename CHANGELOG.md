# Changelog

All notable changes to **Grafiq** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-07-18

### Added
- New `icon` component with a built-in hand-drawn icon set (`packages/core/src/render/icons.ts`).
- Dedicated documentation page for the `icon` component.
- Per-component documentation pages, replacing the previous grouped pages (`data`, `feedback`, `inputs`, `layout`, `navigation`).
- New playground examples showcasing the icon component and updated components.
- `accordion`, `breadcrumb`, `calendar`, `menubar`, `pagination`, `sidebar`, `stepper`, `tree` and other component docs pages.

### Changed
- Reworked the documentation site structure in `apps/docs/.vitepress/config.ts` to list every component individually.
- Improved the flex layout engine (`packages/core/src/layout/flex.ts`).
- Refined container, control and widget components (`containers.ts`, `controls.ts`, `widgets.ts`).
- Updated the markdown-it plugin styles (`packages/markdown-it/src/styles.css`).
- Updated the component registry and renderer to support the new icon system.
- Tweaked the grammar (`GRAMMAR.md`) and syntax guide.

### Fixed
- Various rendering and parsing bugs across the core package.

## [0.1.0] - 2026-07-18

### Added
- Initial public release of Grafiq.
- `@grafiq/core` — hand-drawn mockup DSL parser and canvas renderer built on RoughJS.
- `@grafiq/markdown-it` — markdown-it plugin that renders Grafiq mockups from fenced code blocks, with client-side hydration and a built-in lightbox.
- Playground app (`@grafiq/playground`) and documentation site (`@grafiq/docs`).

[0.2.0]: https://github.com/hantera-io/grafiq/releases/tag/v0.2.0
[0.1.0]: https://github.com/hantera-io/grafiq/releases/tag/v0.1.0