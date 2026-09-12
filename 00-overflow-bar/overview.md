# Overflow bar

## Context

Omarchy’s bar is a full-screen-edge `PanelWindow` that hosts every widget in `bar.layout`. The tray already hides StatusNotifier apps behind a same-bar chevron. Plugins cannot join that drawer. The default product is one same-bar drawer that can hold both unpinned apps and overflowed plugins. A Bartender-style second strip is later, not v1.

The plugin id is `dmalmq.omabar`. It is a `kind: "bar"` replacement. Only one bar is active. Enabling this plugin sets `bar.id` in `~/.config/omarchy/shell.json`.

This repo starts empty. The implementation base is the packaged first-party bar at `/usr/share/omarchy/shell/plugins/bar/` (`Bar.qml`, `BarModel.js`, `widgets/`). Omarchy is MIT. Keep DHH’s copyright next to yours.

## Scope

Included:

- Fork the first-party bar under `dmalmq.omabar`.
- An `overflow: true` flag on each `bar.layout` entry.
- A same-bar overflow drawer, clipped and revealed like `omarchy.tray`.
- Unpinned tray apps and overflowed plugins in that one drawer.
- Drag a plugin into or out of the drawer.
- Click, hover, and an IPC toggle to reveal.
- A widget support matrix in the README.
- Package and list on [omarchyplugins.com](https://omarchyplugins.com).

Excluded:

- Menu-bar styling suites, clipboard, file shelf, live-activity notifications.
- Time-of-day rules, overflow folders, named layout presets, in-QML gestures.
- A second `PanelWindow` as the overflow surface.
- A second row under the bar, as the default look.
- A chevron `bar-widget` in the layout. The chevron is bar chrome.

## Constraints

- Third-party bars do not receive `ShellRoot`. They receive `PluginShellApi` with bar capabilities. That facade includes `mutateShellConfig` and narrow proxies for `omarchy.idle`, `omarchy.media`, `omarchy.nightlight`, and `omarchy.notifications`. See `shell.qml` `pluginHasBarCapabilities` and `PluginFirstPartyServiceApi.qml`.
- Hosted third-party widgets still get a service-less entry facade (`pluginShellForBarEntry`). First-party widgets get `bar = root` and then call `bar.shell.firstPartyServiceFor`.
- `omarchy-shell shell call <id> …` only reaches panel, overlay, and menu loaders (`callIfLoaded`). A bar toggle must be an `IpcHandler` on the bar instance.
- `moduleDropAtScene` rejects pointers outside the source window’s `contentItem`, then filters candidates with `sameWindow`. `sameWindow` falls back to `screen.name`. The bounds check still blocks a second `PanelWindow`.
- `inlineSettingsDelta` treats same ids in the same order as settings-only. An overflow flip must be structural or widgets will not move.
- Cloned `Bar.qml` files that still use `required` host properties fail to load ([omarchy#8202](https://github.com/basecamp/omarchy/issues/8202), [omarchy#9599](https://github.com/basecamp/omarchy/issues/9599)). The packaged copy on this machine already dropped `required`. Copy from `/usr/share/omarchy`, not from an old clone.
- Saving QML under `~/.config/omarchy/plugins/` often does not swap the live component. Restart the shell to verify. There is no Omarchy test for `BarModel.js` in the package. This repo owns that harness.
- Marketplace listings currently show zero community plugins. Publish still needs a public GitHub repo, `omarchy plugin validate`, README, and LICENSE.

## Alternatives

**Replace `omarchy.bar` with a forked `kind: "bar"` plugin.** This is the chosen path. Overflow has to own layout, drag, and the window. A companion overlay cannot move widgets out of the built-in bar. `scottjones/omarchy-flush-bar` is the prior art for a service that only watches bar config. That is the wrong kind for this product.

**Upstream overflow into `omarchy.bar`.** That is the only way to keep `ShellRoot`. Keep the fork diff small enough to offer as a later PR. Do not block the plugin on maintainer review.

**Second `PanelWindow` docked outside the bar.** Rejected. `moduleDropAtScene` discards drops outside the source window.

**Same `PanelWindow`, second row.** Mocked as inset. Not the default. Users already know the tray drawer.

**Same-bar drawer.** Chosen. Copy `Tray.qml`’s clip and `revealExtent`. Overflowed `ModuleSlot`s and unpinned tray items share that drawer. The bar grows along its length. Exclusive zone does not change. Drag stays in one window.

**`layout.overflow` as a fourth region.** Loses which of left, center, or right the widget belonged to, or duplicates that fact. Rejected. Keep section membership. Add `overflow: true` on the entry.

## Applicable skills

- `how` on `Bar.qml`, `shell.qml` facades, and drag before editing those files.
- `prototype` for the Phase 3 load and media check.
- `omarchy` for install paths under `~/.config/omarchy/` only.
- `technical-writing` for README and marketplace copy.
- `interrogate` on the overflow data shape before shipping.
- `/deslop` before each commit. `unslop` on every prose file.
- `show-me-your-work` into `00-overflow-bar/decisions.tsv`.
- `babysit` after the first implementation PR.

No browser control skill applies. Runtime proof is the live Omarchy session.

## Look

Collapsed and expanded treatments are in [look.md](look.md). The chosen expanded look is a same-bar drawer. Inset and flush stay as later strip options.

## Phases

1. [Scaffold the fork](phase-1-scaffold.md)
2. [Partition model and tests](phase-2-partition.md)
3. [Load the fork and probe widgets](phase-3-load.md)
4. [Render the same-bar drawer](phase-4-render.md)
5. [Reveal the drawer](phase-5-reveal.md)
6. [Drag into the drawer](phase-6-drag.md)
7. [Orientation and theme](phase-7-polish.md)
8. [Support matrix and README](phase-8-docs.md)
9. [Validate and publish](phase-9-publish.md)

Shared checks live in [testing.md](testing.md).

## Verification

Project-level:

```sh
omarchy plugin validate "$HOME/.config/omarchy/plugins/dmalmq.omabar"
node --test test/bar-model.test.js
qmllint -I "$OMARCHY_PATH/shell" Bar.qml widgets/*.qml
omarchy restart shell
hyprctl layers | grep omarchy-bar
```

Each phase adds a narrower check in its file.

## Implementation guidance

Run `how` on `Bar.qml` drag and `shell.qml` injection before changing either. Do not treat the original brief’s “drag is free” claim as given.

Run `interrogate` before Phase 9 if the overflow flag or same-window choice is still contested.

`/deslop` every diff. `unslop` the README.

Log forks and spikes in `decisions.tsv`.

After the PR exists, use `babysit`. Do not merge from this plan.

Keep the fork overlay small. Prefer a new function in `BarModel.js` over new QML components. The rebase lever is `scripts/sync-from-omarchy.sh`.
