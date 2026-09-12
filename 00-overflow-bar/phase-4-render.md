# Phase 4. Render the same-bar drawer

Back to [overview](overview.md).

## Goal

Overflowed plugins and unpinned tray apps render in one clipped drawer on the main bar. Collapsed, only the chevron shows. The chevron is bar chrome, not a layout id.

## Changes

- After `pinTrayToInner` in `normalizeLayout`, partition each section.
- Main `ModuleList` Repeaters consume `section.main`.
- Add a drawer next to the tray, copied from `Tray.qml`’s `drawerArea` and `revealExtent`.
- Drawer contents are overflowed `ModuleSlot`s, then unpinned tray items if `omarchy.tray` is in the layout.
- Hide the tray widget’s own expander when this drawer exists.
- Chevron visible when the drawer list is non-empty or a drag is active.

## Data structures

`layoutConfig` stays `{ left, center, right }`. Derived `PartitionedSection` per region. Drawer model is overflow entries in left, then center, then right order, plus tray items whose bucket is `drawer`. Session flag `overflowExpanded: boolean`, default false.

## Verification

Static: `node --test`. `qmllint` on `Bar.qml`.

Runtime: set one right-section plugin to `"overflow": true`. Restart the shell. The plugin is gone from the open bar. Leave `overflowExpanded` true only long enough to screenshot the open drawer, then revert the default.
