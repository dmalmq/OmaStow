# Phase 6. Drag across strips

Back to [overview](overview.md).

## Goal

Dragging a widget onto the other row flips `overflow` and keeps its left, center, or right section. Dragging onto a collapsed row works because the row auto-expands while `barDragSource` is set.

## Changes

- Set `dragHeld` while `barDragSource` is non-null so collapsed overflow slots gain size.
- Extend `moveModuleInConfig` with the drop target’s overflow bit. One extra field on the moved entry. Same function, not a parallel writer.
- `dropBarModule` passes whether the target slot is in the overflow row.
- Do not change `DragGhostPanel` unless a screenshot shows the ghost clipped by the main row.
- If you ever add a second window, you must also rewrite the `contentItem` bounds reject in `moduleDropAtScene`. That is out of scope here.

## Data structures

Drop payload: `{ fromRegion, fromName, toRegion, beforeName, overflow: boolean }`.

## Verification

Static: node tests for `moveModuleInConfig` behaviour via a extracted helper if the function stays in QML, or a JS twin in `BarModel.js`. Prefer moving the mutation into `BarModel.js` so the test calls the same function.

Runtime: drag clock to overflow, drag it back, drag across sections on the overflow row, abort a drag. Confirm `shell.json` matches the last drop. Restart the shell. Layout persists.
