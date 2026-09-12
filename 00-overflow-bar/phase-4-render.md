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
- Overlay `widgets/Tray.qml` for `omarchy.tray`. A third-party bar is handed a host registry snapshot, so the plugin’s tray file never loads through that map.
- Chevron visible when the drawer list is non-empty or a drag is active.

## Data structures

`layoutConfig` stays `{ left, center, right }`. Derived `PartitionedSection` per region. Drawer model is overflow entries in left, then center, then right order, plus tray items whose bucket is `drawer`. Session flag `overflowExpanded: boolean`, default false.

## Verification

Static: `node --test`. `qmllint` on `Bar.qml`.

Runtime: `scripts/probe-overflow-drawer.sh collapsed`, then `scripts/probe-overflow-drawer.sh expanded`. Each run overflow-flags `omarchy.agents`, restarts, screenshots `.scratch/phase-4-render/`, and restores `shell.json`. Expanded patches only the installed `Bar.qml`. Expect one chevron, not the stock tray expander plus this drawer.
