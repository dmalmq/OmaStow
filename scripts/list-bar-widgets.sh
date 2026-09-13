#!/usr/bin/env bash
set -euo pipefail

# Print every discovered bar-widget id. Does not record support.
# Join this list with 00-overflow-bar/widget-matrix.md.

shell_json="${OMARCHY_SHELL_JSON:-$HOME/.config/omarchy/shell.json}"

python3 - "$shell_json" <<'PY'
import json, subprocess, sys

shell_json = sys.argv[1]
plugins = json.loads(subprocess.check_output(["omarchy", "plugin", "list", "--json"]))
layout_ids = set()
if shell_json:
    try:
        bar = json.loads(open(shell_json).read()).get("bar", {})
        layout = bar.get("layout") or {}
        for section in layout.values():
            for entry in section or []:
                if isinstance(entry, str):
                    layout_ids.add(entry)
                elif isinstance(entry, dict) and entry.get("id"):
                    layout_ids.add(entry["id"])
    except OSError:
        pass

print("id\torigin\tenabled\ton_layout")
for plugin in plugins:
    kinds = plugin.get("kinds") or []
    if "bar-widget" not in kinds:
        continue
    origin = "first-party" if plugin.get("firstParty") else "third-party"
    enabled = "enabled" if plugin.get("enabled") else "disabled"
    on_layout = "yes" if plugin.get("id") in layout_ids else "no"
    print(f"{plugin['id']}\t{origin}\t{enabled}\t{on_layout}")
PY
