# Look

Back to [overview](overview.md).

Default is a same-bar drawer, not a second strip. Tokens match the live Aether bar. `Color.bar.background` is `#00151c`. `Style.bar.sizeHorizontal` is 26. `Style.bar.iconSlot` is 27. `Style.cornerRadius` is 0.

The throwaway mock is [`.scratch/overflow-look/index.html`](../.scratch/overflow-look/index.html). The cluster shots are the closest picture of this default.

## What Omarchy already does

`omarchy.tray` splits StatusNotifier items into pinned, drawer, and hidden. Unpinned apps default to the drawer. Hover the left chevron and they slide out on the same bar. Right-click the chevron to pin or hide.

Bar widgets have no equivalent. Clock, media, audio, and every other plugin stay painted for as long as they sit in `bar.layout`.

## Collapsed

The bar stays 26px. Windows do not move.

One overflow chevron sits with the tray, pointing along the bar the way the tray chevron already does. Idle fill is none. Open fill is `selected-fill-alpha` 0.18.

Pinned tray apps and non-overflowed plugins stay visible. Overflowed plugins and unpinned tray apps are gone until the drawer opens.

If the tray widget is present, hide its own expander. One chevron, one drawer.

## Expanded, chosen. Same-bar drawer

The bar gets wider. Items slide out of the chevron on the same row, clipped like `Tray.qml`’s `revealExtent`. Exclusive zone stays `barSize`.

The drawer holds two kinds of thing, in one row:

- Bar plugins with `overflow: true` on their layout entry, rendered through `ModuleSlot`.
- Unpinned tray applications, rendered with the existing tray item delegate.

Pinned tray apps stay outside the drawer. Hidden tray apps stay hidden.

Click, hover, and the IPC toggle all show this same open state. Motion copies the tray drawer, about 600ms, not a second-row grow.

## Not the default

**Inset second strip.** A row below the bar. Keep it as a later option. It is not v1.

**Flush taller bar.** Rejected.

## Choosing membership

Drag a plugin onto the open drawer to set `overflow: true`. Drag it out to clear the flag. Auto-expand the drawer while a drag is active so a collapsed chevron is still a drop target.

Tray apps keep pin and hide through the existing manage popup, now on the unified chevron.
