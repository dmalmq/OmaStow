# Phase 4. Render the overflow row

Back to [overview](overview.md).

## Goal

Overflowed entries render on a second row of the same `BarPanel`. The row is present but collapsed. A chevron sits on the bar as chrome, not as a layout id.

## Changes

- After `pinTrayToInner` in `normalizeLayout`, partition each section.
- Main `ModuleList` Repeaters consume `section.main`.
- Add one overflow row inside `horizontalBar` / `verticalBar` that Repeaters `left.overflow + center.overflow + right.overflow` through `ModuleSlot`.
- Chevron control in `Bar.qml`. Visible when the overflow list is non-empty or a drag is active.
- Collapse by height or width 0 and clip. Do not unmap the row.
- Do not add a second `PanelWindow`.

## Data structures

`layoutConfig` stays `{ left, center, right }`. Derived view: `{ left, center, right }` of `PartitionedSection`. Session flag `overflowExpanded: boolean`, default false.

## Verification

Static: `node --test`. `qmllint` on `Bar.qml`.

Runtime: set one right-section entry to `"overflow": true` in `shell.json`. Restart the shell. The widget is absent from the main row. Expand is still Phase 5, so a temporary `overflowExpanded: true` default is allowed only long enough to screenshot the row, then revert the default.
