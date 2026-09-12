# Phase 5. Reveal the drawer

Back to [overview](overview.md).

## Goal

Click, hover, and a Hyprland-bound IPC toggle expand and collapse the same-bar drawer.

## Changes

- Chevron click toggles `overflowExpanded`.
- Hover-to-reveal, matching `omarchy.tray`.
- `IpcHandler { target: "dmalmq.omabar"; function toggleOverflow(): void }`.
- Hyprland bind calls that IPC target. Do not use `omarchy-shell shell call`.
- Motion copies the tray drawer duration, about 600ms.

## Data structures

`OverflowReveal`: `{ expanded: boolean, hoverHeld: boolean, dragHeld: boolean }`. Derived `open = expanded || hoverHeld || dragHeld`. Not written to `shell.json`.

## Verification

Static: `qmllint`. Validate.

Runtime: click chevron, hover chevron, and fire the IPC bind. The bar grows along its length. Window gaps do not change. Multi-monitor hover stays per screen. IPC may open every copy. Document that if you keep global IPC.
