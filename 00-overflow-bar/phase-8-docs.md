# Phase 8. Support matrix and README

Back to [overview](overview.md).

## Goal

Honest docs. First-party widgets that survived Phase 3 are listed as supported. Anything that died under the facade is listed as unsupported with the reason.

## Changes

- README: install via `omarchy plugin add`, enable, `overflow: true` example, IPC bind, removal.
- Widget matrix from the Phase 3 log. Include third-party `bar-widget` plugins as “should work, no live service from other plugins”.
- Note the fork rebase cost and the `scripts/sync-from-omarchy.sh` lever.
- Note that `shell call` cannot toggle this bar.

## Data structures

None.

## Verification

Static: `unslop` pass. Every command in the README is a real binary.

Runtime: follow the README on a clean enable and a clean `omarchy plugin remove`.
