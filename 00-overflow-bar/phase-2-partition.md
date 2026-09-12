# Phase 2. Partition model and tests

Back to [overview](overview.md).

## Goal

A pure function that splits each section into main and overflow, and an `inlineSettingsDelta` that treats an overflow flip as structural.

## Changes

- Add `partitionSection(entries)` to [BarModel.js](/usr/share/omarchy/shell/plugins/bar/BarModel.js). Same style as `pinTrayToInner`.
- Extend `inlineSettingsDelta` so a differing `overflow` value returns `null`.
- Add `test/bar-model.test.js` that requires `BarModel.js` through its existing `module.exports`.
- No QML changes.

## Data structures

`LayoutEntry`: `{ id: string, overflow?: boolean, ...settings }`. Missing `overflow` means main.

`PartitionedSection`: `{ main: LayoutEntry[], overflow: LayoutEntry[] }`. Order inside each list is the original section order.

## Verification

Static: `node --test test/bar-model.test.js`.

Runtime: none. This phase has no shell surface.
