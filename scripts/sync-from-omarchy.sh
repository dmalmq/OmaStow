#!/usr/bin/env bash
set -euo pipefail

src="${OMARCHY_PATH:-/usr/share/omarchy}/shell/plugins/bar"
dest="$(cd "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
stage="$dest/.upstream"

if [[ ! -d "$src" ]]; then
  printf 'sync-from-omarchy: missing upstream bar at %s\n' "$src" >&2
  exit 1
fi

manifest="$dest/manifest.json"
if [[ ! -f "$manifest" ]]; then
  printf 'sync-from-omarchy: %s is not this repo (no manifest.json)\n' "$dest" >&2
  exit 1
fi

id="$(jq -r '.id // empty' -- "$manifest")"
if [[ "$id" != "dmalmq.omastow" ]]; then
  printf 'sync-from-omarchy: %s is not dmalmq.omastow (id=%s)\n' "$dest" "$id" >&2
  exit 1
fi

mkdir -p -- "$stage/widgets" "$stage/indicators"
rsync -rL --times --delete --no-owner --no-group --chmod=F644,D755 -- "$src/Bar.qml" "$stage/Bar.qml"
rsync -rL --times --delete --no-owner --no-group --chmod=F644,D755 -- "$src/BarModel.js" "$stage/BarModel.js"
rsync -rL --times --delete --no-owner --no-group --chmod=F644,D755 --exclude README.md --exclude manifest.json -- "$src/widgets/" "$stage/widgets/"
rsync -rL --times --delete --no-owner --no-group --chmod=F644,D755 --exclude README.md --exclude manifest.json -- "$src/indicators/" "$stage/indicators/"
chmod 644 -- "$stage/Bar.qml" "$stage/BarModel.js"
chmod -R a+rX -- "$stage/widgets" "$stage/indicators"

for rel in Bar.qml BarModel.js; do
  if [[ -f "$dest/$rel" ]] && ! diff -q -- "$stage/$rel" "$dest/$rel" >/dev/null; then
    printf 'sync-from-omarchy: live %s differs from upstream. Compare with: diff -u %s %s\n' \
      "$rel" "$stage/$rel" "$dest/$rel"
  fi
done
