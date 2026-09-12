# Testing

Back to [overview](overview.md).

There is no packaged Omarchy test for `BarModel.js`. This repo’s `node --test` file is the static proof for partition and overflow-as-structure.

## Static

```sh
omarchy plugin validate .
node --test test/bar-model.test.js
qmllint -I "$OMARCHY_PATH/shell" Bar.qml widgets/*.qml
```

## Runtime

The surface is the live `omarchy-shell` bar. Saved QML under `~/.config/omarchy/plugins/` often does not hot-reload. Use `omarchy restart shell` after every QML change.

| Check | How |
| --- | --- |
| Bar exists | `hyprctl layers` contains `omarchy-bar` |
| Fallback | `omarchy bar use built-in` restores `omarchy.bar` |
| Media | Play a track, then play/pause from the widget |
| Overflow flag | Edit `shell.json`, restart, widget sits on the overflow row |
| Reveal | Click, hover, IPC |
| Drag | Drop to overflow and back. Read `shell.json` |
| Edges | `omarchy bar position` top, bottom, left, right |
| Screens | Two monitors, one row each |

No browser, CLI, or mobile control skill covers this UI. Drive Hyprland and the bar with the real session.
