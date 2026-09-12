# Phase 5. Reveal the row

Back to [overview](overview.md).

## Goal

Click, hover, and a Hyprland-bound IPC toggle expand and collapse the overflow row.

## Changes

- Chevron click toggles `overflowExpanded`.
- Hover-to-reveal with a short leave delay so the pointer can reach the row.
- `IpcHandler { target: "dmalmq.omabar"; function toggleOverflow(): void }`.
- Hyprland bind calls that IPC target. Do not use `omarchy-shell shell call`. That path only loads panel plugins.
- Collapse on Escape and on empty-desktop click if those are cheap with existing popout machinery. Skip if they need new global input.

## Data structures

`OverflowReveal`: `{ expanded: boolean, hoverHeld: boolean, dragHeld: boolean }`. Derived `visible = expanded || hoverHeld || dragHeld`. Not written to `shell.json`.

## Verification

Static: `qmllint`. Validate.

Runtime: click chevron, hover chevron, and fire the IPC bind. The row appears and hides. Multi-monitor: each screen’s row follows its own hover, but IPC expands every copy. Document that in the README if you keep global IPC.
