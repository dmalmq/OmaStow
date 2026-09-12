#!/usr/bin/env bash
set -euo pipefail

src="$(cd "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
manifest="$src/manifest.json"

if [[ ! -f "$manifest" ]]; then
  printf 'install-local: missing %s\n' "$manifest" >&2
  exit 1
fi

id="$(jq -r '.id // empty' -- "$manifest")"
if [[ "$id" != "dmalmq.omastow" ]]; then
  printf 'install-local: %s is not dmalmq.omastow (id=%s)\n' "$src" "$id" >&2
  exit 1
fi

dest="${OMASTOW_INSTALL_DIR:-$HOME/.config/omarchy/plugins/$id}"

mkdir -p -- "$dest"
dest="$(cd -- "$dest" && pwd)"
if [[ "$dest" == "$src" ]]; then
  printf 'install-local: dest must not be the repo root\n' >&2
  exit 1
fi

rsync -a --delete --delete-excluded --no-owner --no-group --chmod=F644,D755 \
  --include 'Bar.qml' \
  --include 'BarModel.js' \
  --include 'LICENSE' \
  --include 'manifest.json' \
  --include 'scripts/' \
  --include 'scripts/***' \
  --include 'widgets/' \
  --include 'widgets/***' \
  --include 'indicators/' \
  --include 'indicators/***' \
  --exclude '*' \
  -- "$src/" "$dest/"
chmod 755 -- "$dest/scripts"/*.sh

omarchy plugin validate "$dest"
printf 'install-local: installed %s\n' "$dest"
