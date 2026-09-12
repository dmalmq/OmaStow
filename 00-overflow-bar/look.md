# Look

Back to [overview](overview.md).

This is the visual contract for Phase 4, Phase 5, and Phase 7. Tokens come from the live Aether theme on this machine. `Color.bar.background` is `#00151c`. `Color.bar.text` is `#d1c1bf`. `Style.bar.sizeHorizontal` is 26. `Style.bar.iconSlot` is 27. `Style.font.body` is 12. `Style.cornerRadius` is 0. `gaps_out` is 10, so `Style.gapsOut` is 5.

The throwaway mock is [`.scratch/overflow-look/index.html`](../.scratch/overflow-look/index.html). It is not production code.

## Collapsed

The main bar is the stock Omarchy edge. Same height, same fill, same padding. Windows stay 10px below it.

The only new chrome is a down chevron in a 27px slot, immediately left of the tray. Idle fill is none. Open fill is `selected-fill-alpha` 0.18. It must not copy the tray’s left chevron. Overflow points at the desktop. Tray points along the bar.

No second strip. No extra exclusive zone. No window jump.

## Expanded, chosen. Inset

A second 26px row in the same `PanelWindow`, on the desktop side of the main row.

- 5px gap (`Style.gapsOut`) between the rows.
- Overflow fill is `Color.background` shades at about 94% alpha, not a new color.
- Hairline on the overflow’s top edge, foreground at 0.25 alpha. Bottom edge at 0.4 alpha, matching `normal-border-alpha`.
- Overflow widgets keep left, center, and right.
- Exclusive zone stays `barSize`. The strip overlays the window. It does not push gaps.

Click, hover, and the IPC toggle all show this same expanded look. Hover uses the same geometry. Do not invent a third peek style.

The chevron rotates to point at the main bar while open.

## Rejected treatments

**Flush.** A second row welded to the first, same fill, no gap. Reads as a 52px bar. Easy to drop on. Hides that this is overlay, not reserved space.

**Cluster.** A right-packed strip under the chevron, only as wide as the hidden widgets. Closest to Bartender. Weak as a drop target for the rest of the screen. Revisit only if overflow stays a handful of icons and drag-into-empty is solved another way.

## Motion

The row grows from 0 to 26px on the desktop axis. About 160ms, `Easing.OutCubic`, the same family as the open-panel mark. No bounce. `prefers-reduced-motion` skips it.
