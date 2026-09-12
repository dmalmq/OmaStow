# Phase 7. Orientation, exclusive zone, theme

Back to [overview](overview.md).

## Goal

The overflow row works on top, bottom, left, and right. It uses `Style` and `Color.bar` tokens. The exclusive zone stays the main bar thickness so windows do not jump when the row opens.

## Changes

- Place the overflow row on the desktop side of the main row (below a top bar, above a bottom bar, inward for vertical).
- Set `exclusiveZone` to `barSize` while the window is taller or wider than `barSize`.
- Match background, radius, and padding to the main strip. Translucent when `bar.transparent` is on.
- No extra theme files.

## Data structures

None. `barSize` remains the exclusive-zone source of truth.

## Verification

Static: `qmllint`.

Runtime: `omarchy bar position` through all four edges. Transparent toggle. Two monitors. Overflow row must not change window gaps. Compare against a screenshot of the Bartender strip only for placement, not for styling.
