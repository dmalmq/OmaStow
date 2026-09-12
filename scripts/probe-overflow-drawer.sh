#!/usr/bin/env bash
set -euo pipefail

# Live Phase 4 check. Sets overflow on one right-section widget, installs,
# restarts the shell, screenshots the bar, then restores shell.json.
# `expanded` patches only the installed Bar.qml so the repo stays collapsed.
#
#   scripts/probe-overflow-drawer.sh collapsed
#   scripts/probe-overflow-drawer.sh expanded

src="$(cd "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
mode="${1:-collapsed}"
widget="${OVERFLOW_WIDGET:-omarchy.agents}"
scratch="$src/.scratch/phase-4-render"
shell_json="${OMARCHY_SHELL_JSON:-$HOME/.config/omarchy/shell.json}"
shot="$scratch/bar.${mode}.png"
patched_installed=0

if [[ "$mode" != "collapsed" && "$mode" != "expanded" ]]; then
  printf 'probe-overflow-drawer: mode must be collapsed or expanded\n' >&2
  exit 1
fi

mkdir -p -- "$scratch"
cp -- "$shell_json" "$scratch/shell.json.pre"

cleanup() {
  trap - EXIT
  if [[ -f "$scratch/shell.json.pre" ]]; then
    cp -- "$scratch/shell.json.pre" "$shell_json"
  fi
  if (( patched_installed )); then
    "$src/scripts/install-local.sh"
    omarchy restart shell || true
  fi
}
trap cleanup EXIT

python3 - "$shell_json" "$widget" <<'PY'
import json, sys
from pathlib import Path
path = Path(sys.argv[1])
widget = sys.argv[2]
data = json.loads(path.read_text())
found = False
for entry in data.get("bar", {}).get("layout", {}).get("right", []):
    if isinstance(entry, dict) and entry.get("id") == widget:
        entry["overflow"] = True
        found = True
if not found:
    raise SystemExit(f"probe-overflow-drawer: {widget} is not in bar.layout.right")
path.write_text(json.dumps(data, indent=2) + "\n")
PY

"$src/scripts/install-local.sh"

if [[ "$mode" == "expanded" ]]; then
  installed="${OMASTOW_INSTALL_DIR:-$HOME/.config/omarchy/plugins/dmalmq.omastow}/Bar.qml"
  python3 - "$installed" <<'PY'
from pathlib import Path
path = Path(__import__("sys").argv[1])
text = path.read_text()
old = "property bool overflowExpanded: false"
new = "property bool overflowExpanded: true"
if old not in text:
    raise SystemExit("probe-overflow-drawer: overflowExpanded: false not found in installed Bar.qml")
path.write_text(text.replace(old, new, 1))
PY
  patched_installed=1
fi

omarchy restart shell
sleep 2
omarchy-shell shell ping
hyprctl layers | grep omarchy-bar
grim -g '0,0 2400x24' "$shot"
file -- "$shot"
printf 'probe-overflow-drawer: wrote %s\n' "$shot"
