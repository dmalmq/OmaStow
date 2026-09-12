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

Runtime: `omarchy bar position` through all four edges. Transparent toggle. Two monitors. `hyprctl layers` exclusive zone stays one bar thick while the drawer is open.
