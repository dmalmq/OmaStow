# Phase 9. Validate and publish

Back to [overview](overview.md).

## Goal

A public GitHub repo that `omarchy plugin add` can clone, plus a marketplace listing request.

## Changes

- `omarchy plugin validate` on a clean checkout.
- Push `github.com/dmalmq/Omabar`.
- Submit via [the publish form](https://plugins.omarchy.org/publish.html).
- Do not keep `omarchy.clonedFrom` in the published manifest.

## Data structures

None.

## Verification

Static: validate, `qmllint`, `node --test`.

Runtime: from a second machine or a fresh `~/.config/omarchy/plugins/` copy, `omarchy plugin add <url> --enable --yes`, then repeat the Phase 5 and Phase 6 checks.
