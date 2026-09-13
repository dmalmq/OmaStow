#!/usr/bin/env bash
set -euo pipefail

# Cycle the live bar through top, bottom, left, and right. Record exclusive
# zone size from hyprctl, screenshot collapsed and IPC-open, then restore
# position and transparency.
#
#   scripts/probe-phase-7-edges.sh

src="$(cd "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
scratch="$src/.scratch/phase-7-edges"
shell_json="${OMARCHY_SHELL_JSON:-$HOME/.config/omarchy/shell.json}"

mkdir -p -- "$scratch"
cp -- "$shell_json" "$scratch/shell.json.pre"
orig_position="$(jq -r '.bar.position // "top"' -- "$shell_json")"
orig_transparent="$(jq -r '.bar.transparent // false' -- "$shell_json")"

cleanup() {
  trap - EXIT
  cp -- "$scratch/shell.json.pre" "$shell_json"
  omarchy bar position "$orig_position" >/dev/null || true
  omarchy bar transparent "$orig_transparent" >/dev/null || true
}
trap cleanup EXIT

record_edge() {
  local edge="$1"
  local suffix="$2"
  hyprctl layers -j >"$scratch/layers.${edge}${suffix}.json"
  python3 - "$edge" "$scratch/layers.${edge}${suffix}.json" "$scratch/zone.${edge}${suffix}.txt" <<'PY'
import json, sys

edge, path, out = sys.argv[1], sys.argv[2], sys.argv[3]
data = json.loads(open(path).read())
bars = []
for mon in data.values():
    levels = mon.get("levels", {})
    for layer_list in levels.values():
        for layer in layer_list:
            if layer.get("namespace") == "omarchy-bar":
                bars.append(layer)

lines = []
ok = True
for layer in bars:
    x, y, w, h = int(layer["x"]), int(layer["y"]), int(layer["w"]), int(layer["h"])
    lines.append(f"{edge} xywh={x},{y} {w}x{h} pid={layer.get('pid', '')}")
    if edge in ("top", "bottom"):
        if h > 40:
            ok = False
            lines.append(f"FAIL exclusive height {h} exceeds one bar")
    elif w > 40:
        ok = False
        lines.append(f"FAIL exclusive width {w} exceeds one bar")
if not bars:
    ok = False
    lines.append("FAIL no omarchy-bar layer")
text = "\n".join(lines) + "\n"
open(out, "w").write(text)
sys.stdout.write(text)
sys.exit(0 if ok else 1)
PY
}

grim_bar() {
  local edge="$1"
  local tag="$2"
  python3 - "$edge" "$scratch/bar.${edge}.${tag}.png" <<'PY'
import json, subprocess, sys

edge, dest = sys.argv[1], sys.argv[2]
monitors = json.loads(subprocess.check_output(["hyprctl", "monitors", "-j"]))
m = monitors[0]
scale = float(m.get("scale") or 1)
x, y = int(m["x"]), int(m["y"])
w = int(round(int(m["width"]) / scale))
h = int(round(int(m["height"]) / scale))
thick = 48
if edge == "top":
    geom = f"{x},{y} {w}x{thick}"
elif edge == "bottom":
    geom = f"{x},{y + h - thick} {w}x{thick}"
elif edge == "left":
    geom = f"{x},{y} {thick}x{h}"
else:
    geom = f"{x + w - thick},{y} {thick}x{h}"
subprocess.check_call(["grim", "-g", geom, dest])
print("wrote", dest, geom)
PY
}

"$src/scripts/install-local.sh"
omarchy restart shell
sleep 2

failed=0
for edge in top bottom left right; do
  omarchy bar position "$edge"
  sleep 1
  if ! record_edge "$edge" ".collapsed"; then
    failed=1
  fi
  grim_bar "$edge" "collapsed" || failed=1
  omarchy-shell dmalmq.omastow toggleOverflow >/dev/null || true
  sleep 0.8
  if ! record_edge "$edge" ".open"; then
    failed=1
  fi
  grim_bar "$edge" "open" || failed=1
  omarchy-shell dmalmq.omastow toggleOverflow >/dev/null || true
  sleep 0.7
done

omarchy bar position "$orig_position"
sleep 1
omarchy bar transparent toggle >/dev/null || true
sleep 0.5
grim_bar "$orig_position" "transparent" || true
omarchy bar transparent "$orig_transparent" >/dev/null || true

python3 - "$scratch" <<'PY'
import json, subprocess, sys
from pathlib import Path

scratch = Path(sys.argv[1])
mons = json.loads(subprocess.check_output(["hyprctl", "monitors", "-j"]))
layers = json.loads(subprocess.check_output(["hyprctl", "layers", "-j"]))
bar_count = 0
for mon in layers.values():
    for layer_list in mon.get("levels", {}).values():
        for layer in layer_list:
            if layer.get("namespace") == "omarchy-bar":
                bar_count += 1
(scratch / "monitors.txt").write_text(
    f"monitors={len(mons)} omarchy-bar layers={bar_count}\n"
)
print(f"monitors={len(mons)} omarchy-bar layers={bar_count}")
PY

printf 'probe-phase-7-edges: done scratch=%s failed=%s\n' "$scratch" "$failed"
exit "$failed"
