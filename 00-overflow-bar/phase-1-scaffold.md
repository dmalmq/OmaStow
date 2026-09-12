# Phase 1. Scaffold the fork

Back to [overview](overview.md).

## Goal

A loadable `dmalmq.omastow` directory that is a verbatim copy of the packaged bar, minus `required` host properties, with a valid third-party manifest.

## Changes

- Copy `/usr/share/omarchy/shell/plugins/bar/` into this repo root (the plugin lives at the repo root so `omarchy plugin add` works).
- Write `manifest.json` with `id: "dmalmq.omastow"`, `kinds: ["bar"]`, `entryPoints.bar: "Bar.qml"`. No `omarchy.clonedFrom`.
- Write `LICENSE` with both DHH and Daniel Malmqvist copyright lines.
- Add `scripts/sync-from-omarchy.sh` that recopies upstream `Bar.qml`, `BarModel.js`, and `widgets/` into a staging tree so later overlays can reapply.
- Do not edit layout or QML behaviour yet.

## Data structures

`PluginManifest`: `{ schemaVersion: 1, id, name, version, author, license, description, kinds: ["bar"], entryPoints: { bar } }`.

## Verification

Static: `omarchy plugin validate .` exits 0. Manifest id is not `omarchy.*`.

Runtime: skip visual behaviour. Confirm the folder can be listed after a copy into `~/.config/omarchy/plugins/dmalmq.omastow` and `omarchy-shell shell rescanPlugins`.
