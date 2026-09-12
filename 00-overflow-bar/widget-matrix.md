# Widget matrix draft

Back to [overview](overview.md). Phase 8 rewrites this into the README.

Probe date 2026-09-12. Host is this machine. Bar id `dmalmq.omabar`. Evidence lives in `.scratch/phase-3-load/` and is not committed.

## Bar load

`omarchy plugin enable dmalmq.omabar` set `bar.id`. `omarchy restart shell` exited 0. `omarchy-shell shell ping` returned `ok`. `hyprctl layers` showed `omarchy-bar` at `0,0 2400x24` on HDMI-A-2 after restart. Plugin list: `dmalmq.omabar` enabled and active, `omarchy.bar` not active.

The 24px strip matched the built-in bar. Workspaces `1 2 3`, clock, tray, and the right-side icons were present. Measured from `bar.before.png` and `bar.after.png`.

`omarchy toggle bar on` parked the layer at `y=-24`. `omarchy toggle bar off` restored `y=0`. `omarchy-toggle-bar` still talks to `omarchy.bar syncHidden`. Journal line from pid 390421: `Handler was registered but will not be used because another handler is registered for target omarchy.bar`. Toggle still moved this process's layer. Phase 5 should register `dmalmq.omabar` as well.

## First-party widgets on this layout

| id | Painted | Popup | Notes |
| --- | --- | --- | --- |
| omarchy.menu | yes | not probed | Left edge of the strip. |
| omarchy.workspaces | yes | not probed | `1 2 3` on the strip. |
| omarchy.indicators | yes | not probed | Center cluster. Uses `firstPartyServiceFor` for idle, nightlight, notifications. |
| omarchy.clock | yes | mixed | Time on the strip. `shell summon omarchy.clock` mapped overlay `omarchy-keyboard-panel`. |
| omarchy.keyboard-layout | yes | not probed | |
| omarchy.weather | yes | not probed | |
| omarchy.system-update | yes | not probed | |
| omarchy.tray | yes | not probed | Chevron cluster on the right. |
| omarchy.agents | yes | not probed | |
| omarchy.tailscale | yes | not probed | |
| omarchy.bluetooth | yes | yes | `shell summon omarchy.bluetooth` opened the Bluetooth panel with paired devices. |
| omarchy.network | yes | yes | `shell summon omarchy.network` opened Ethernet plus Wi-Fi list. |
| omarchy.audio | yes | yes | `shell summon omarchy.audio` opened output and input devices. |
| omarchy.monitor | yes | not probed | |
| omarchy.power | yes | no | Icon on the strip. `shell summon omarchy.power` returned `ok`. No extra Hyprland overlay. No panel in the screenshot. |
| omarchy.media | idle-hidden | not proven | Not on the saved layout. Enable placed it in center. `BarWidget.qml` sets `visible: hasMedia`. No MPRIS names on the session bus. `playerctl` is not installed. Removed again so the layout matches the backup. |

## Third-party widgets on this layout

These have no first-party service from the replacement bar. They still painted on the strip.

| id | Painted | Popup |
| --- | --- | --- |
| bjarneo.workspace-layout | yes | not probed |
| akshar.radio-atlas | yes | not probed |
| crmne.hyprmoncfg | yes | not probed |
| omamail | yes | not probed |
| io.github.thisisgm.omapods | yes | not probed |
| omaplug | yes | not probed |

## Do not block later phases

Power popup and media playback are gaps. The bar loaded. Audio, network, and bluetooth panels opened. Overflow work can proceed.
