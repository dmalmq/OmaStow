# Phase 6. Drag into the drawer

Back to [overview](overview.md).

## Goal

Dragging a plugin onto the open drawer sets `overflow: true`. Dragging it onto the rest of the bar clears the flag. The drawer auto-opens while a drag is active.

## Changes

- Derive `dragHeld` from `barDragSource !== null` so collapsed drawer slots gain size.
- `BarModel.moveModule` mutates `{left,center,right}` and applies the overflow bit. `moveModuleInConfig` wraps it after `rawLayoutSection` guards.
- `dropBarModule` passes whether the target slot is in the drawer (`overflowSlot`).
- Drawer chrome (`moduleName` empty) appends in the source section with overflow true.
- Tray apps stay on pin and hide. Do not invent a second tray writer.
- Do not change `DragGhostPanel` unless the ghost clips.

## Data structures

Drop payload: `{ fromRegion, fromName, toRegion, beforeName, overflow: boolean }`.

## Verification

Static: `node --test test/bar-model.test.js` for the overflow bit on `BarModel.moveModule`.

Runtime: drag clock into the drawer, drag it out, abort a drag. Confirm `shell.json` matches the last drop. Restart the shell. Layout persists. Pinning a tray app still leaves it outside the drawer.
