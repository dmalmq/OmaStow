# Phase 3. Load the fork and probe widgets

Back to [overview](overview.md).

## Goal

The fork renders as the active bar. `omarchy.media` still shows a live player. The load path does not strand the session without a bar.

## Changes

- Install to `~/.config/omarchy/plugins/dmalmq.omabar`.
- Enable with `omarchy plugin enable dmalmq.omabar` (sets `bar.id`).
- Keep `IpcHandler { target: "omarchy.bar" }` so `omarchy-toggle-bar` still hits the loaded instance.
- Record a widget matrix draft from this spike. Do not code overflow yet.
- If the bar fails to appear, check `required` properties and `omarchy bar use built-in` before debugging features.

## Data structures

None new. The host injects `shell`, `barConfig`, and `barWidgetRegistry` after construction.

## Verification

Static: validate the installed copy.

Runtime:

1. `omarchy restart shell`.
2. `hyprctl layers` shows `omarchy-bar` on each monitor.
3. Clock, workspaces, tray, and media match the built-in bar.
4. Play a track. The media widget must show title and respond to play/pause.
5. Open audio, power, network, and bluetooth popups.
6. If any widget is dead, write the id into the Phase 8 matrix as unsupported. Do not block later phases on that id.
