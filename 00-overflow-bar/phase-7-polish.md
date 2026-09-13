# Phase 7. Orientation and theme

Back to [overview](overview.md).

## Goal

The drawer works on top, bottom, left, and right. It uses `Style` and `Color.bar`. The exclusive zone stays `barSize`. Opening the drawer must not move windows.

## Changes

- Horizontal bars grow the drawer along x, inward, the way tray already does.
- Vertical bars grow it along y.
- No extra theme files. No second-row exclusive-zone math.

## Data structures

None. `barSize` remains the exclusive-zone source of truth.

## Verification

Static: `qmllint`.

Runtime: `scripts/probe-phase-7-edges.sh`. It cycles `omarchy bar position` through top, bottom, left, and right, toggles overflow over IPC, and records `hyprctl layers` plus grim crops under `.scratch/phase-7-edges/`. Exclusive zone must stay one bar thick while the drawer is open. The script restores position and transparency on exit. Two-monitor coverage is whatever the session has.
