# Widget support matrix

Back to [overview](overview.md). This file is the support matrix. The README is a separate document.

A third-party `kind: "bar"` plugin receives a host `barWidgetRegistry` snapshot. OmaStow overlays only `omarchy.tray` through `overlayWidgetComponent`. Every other first-party widget loads from the host. A third-party `bar-widget` still paints on this bar. It does not receive a live service from another plugin through this bar.

`scripts/list-bar-widgets.sh` prints every discovered `bar-widget` id. Support, popup, and overflow columns are probe results. They are not generated. Overflow means `overflow: true` on the layout entry.

## Probe record

Strip and popup columns for the saved layout come from the 2026-09-12 load probe, when `bar.id` was `dmalmq.omabar`. The bar id is now `dmalmq.omastow`. Overflow columns for `omamail`, `akshar.radio-atlas`, and `bjarneo.workspace-layout` come from the 2026-09-13 edge probe, which opened the drawer on this layout. `omarchy.power` summon was repeated on 2026-09-13 and still mapped no extra Hyprland layer. `omarchy.media` stays unproven. The user bus had no MPRIS names on 2026-09-13.

Screenshots live under `.scratch/` and are not committed.

## Status words

`supported` means the widget painted on this bar.

`partial` means the strip icon painted and the summoned panel did not.

`unprobed` means the widget exists and this repo has no live proof on OmaStow.

`hidden` means the widget was enabled for a probe, stayed invisible, and no player was present.

Popup `mixed` is only `omarchy.clock`. `shell summon omarchy.clock` mapped overlay `omarchy-keyboard-panel`.

## First-party `bar-widget` plugins

| id | Strip | Popup | Overflow | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| omarchy.active-window | unprobed | unprobed | unprobed | unprobed | Packaged. Disabled. Not on the saved layout. |
| omarchy.agents | yes | unprobed | unprobed | supported | On the right, main. Overflowed during the Phase 4 drawer probe, then restored. |
| omarchy.audio | yes | yes | unprobed | supported | `shell summon omarchy.audio` opened output and input devices. |
| omarchy.bluetooth | yes | yes | unprobed | supported | `shell summon omarchy.bluetooth` opened the Bluetooth panel with paired devices. |
| omarchy.clock | yes | mixed | unprobed | supported | Time on the strip. Summon mapped `omarchy-keyboard-panel`. |
| omarchy.dropbox | unprobed | unprobed | unprobed | unprobed | Packaged. Disabled. Not on the saved layout. |
| omarchy.indicators | yes | unprobed | unprobed | supported | Center cluster. Uses `firstPartyServiceFor` for idle, nightlight, and notifications. |
| omarchy.keyboard-layout | yes | unprobed | unprobed | supported | Center. |
| omarchy.media | hidden | unprobed | unprobed | hidden | Disabled. A Phase 3 enable placed it in center. `BarWidget.qml` sets `visible: hasMedia`. No MPRIS names. `playerctl` is not installed. Removed again so the layout matches the backup. |
| omarchy.menu | yes | unprobed | unprobed | supported | Left edge of the strip. |
| omarchy.microphone | unprobed | unprobed | unprobed | unprobed | Packaged. Disabled. Not on the saved layout. |
| omarchy.monitor | yes | unprobed | unprobed | supported | Right. |
| omarchy.network | yes | yes | unprobed | supported | `shell summon omarchy.network` opened Ethernet plus a Wi-Fi list. |
| omarchy.power | yes | no | unprobed | partial | Icon on the strip. `shell summon omarchy.power` returned `ok`. No extra Hyprland overlay. |
| omarchy.spacer | unprobed | unprobed | unprobed | unprobed | Packaged. Disabled. Not on the saved layout. |
| omarchy.system-update | yes | unprobed | unprobed | supported | Center. |
| omarchy.tailscale | yes | unprobed | unprobed | supported | Right. |
| omarchy.tray | yes | unprobed | no | supported | OmaStow overlays `widgets/Tray.qml`. Unpinned StatusNotifier apps sit in the same drawer as overflowed plugins. The chevron is bar chrome, not a layout id. |
| omarchy.weather | yes | unprobed | unprobed | supported | Center. |
| omarchy.workspaces | yes | unprobed | unprobed | supported | `1 2 3` on the strip during the load probe. |

## Third-party `bar-widget` plugins on this machine

These painted without a first-party service from the replacement bar.

| id | Strip | Popup | Overflow | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| akshar.radio-atlas | yes | unprobed | yes | supported | `overflow: true` on the saved right section. Visible in the 2026-09-13 open-drawer crops. |
| bjarneo.workspace-layout | yes | unprobed | yes | supported | `overflow: true` on the saved right section. Visible in the 2026-09-13 open-drawer crops. |
| crmne.hyprmoncfg | yes | unprobed | unprobed | supported | Right, main. |
| io.github.thisisgm.omapods | yes | unprobed | unprobed | supported | Right, main. |
| now-playing | unprobed | unprobed | unprobed | unprobed | Installed. Disabled. MPRIS widget. Not on the saved layout. |
| omamail | yes | unprobed | yes | supported | `overflow: true` on the saved right section. Visible in the 2026-09-13 open-drawer crops. |
| omaplug | yes | unprobed | unprobed | supported | Right, main. |

`dmalmq.omastow` is the bar, not a widget. `dmalmq.omabar` is the old bar id and is disabled. Plugins whose kinds omit `bar-widget` are out of this matrix.

## Gaps that stay listed

`omarchy.power` has no proven panel on this bar. `omarchy.media` has no proven player on this bar. Neither blocked later phases.
