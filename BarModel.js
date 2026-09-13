function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function normalizePosition(value) {
  var next = String(value || "").trim()
  return /^(top|bottom|left|right)$/.test(next) ? next : "top"
}

function entrySettings(entry) {
  if (!isPlainObject(entry)) return {}
  var copy = {}
  for (var key in entry) {
    if (key === "id" || key === "overflow") continue
    copy[key] = entry[key]
  }
  return copy
}

function entryId(entry) {
  if (typeof entry === "string") return entry
  if (isPlainObject(entry)) {
    var id = entry["id"]
    if (id !== undefined && id !== null && String(id) !== "") return String(id)
  }
  return ""
}

function pinTrayToInner(entries, section) {
  var trayEntry = null
  var result = []
  var values = Array.isArray(entries) ? entries : []
  for (var i = 0; i < values.length; i++) {
    if (entryId(values[i]) === "omarchy.tray") trayEntry = values[i]
    else result.push(values[i])
  }
  if (trayEntry) {
    if (section === "right") result.unshift(trayEntry)
    else result.push(trayEntry)
  }
  return result
}

function entryOverflow(entry) {
  return isPlainObject(entry) && entry.overflow === true
}

function partitionSection(entries) {
  var values = Array.isArray(entries) ? entries : []
  var main = []
  var overflow = []
  for (var i = 0; i < values.length; i++) {
    if (entryOverflow(values[i])) overflow.push(values[i])
    else main.push(values[i])
  }
  return { main: main, overflow: overflow }
}

function layoutEntryById(layout, moduleName) {
  var id = String(moduleName || "")
  if (!isPlainObject(layout) || id === "") return null
  var regions = ["left", "center", "right"]
  for (var r = 0; r < regions.length; r++) {
    var entries = Array.isArray(layout[regions[r]]) ? layout[regions[r]] : []
    for (var i = 0; i < entries.length; i++) {
      if (entryId(entries[i]) === id) return entries[i]
    }
  }
  return null
}

function withPreservedOverflow(layout, moduleName, settings) {
  var next = {}
  if (isPlainObject(settings)) {
    for (var key in settings) next[key] = settings[key]
  }
  if (entryOverflow(layoutEntryById(layout, moduleName))) next.overflow = true
  return next
}

function overflowEntries(layout) {
  var result = []
  if (!isPlainObject(layout)) return result
  var regions = ["left", "center", "right"]
  for (var r = 0; r < regions.length; r++) {
    var overflow = partitionSection(layout[regions[r]]).overflow
    for (var i = 0; i < overflow.length; i++)
      result.push({ kind: "plugin", region: regions[r], entry: overflow[i] })
  }
  return result
}

function drawerChromeDropTarget(drawerEntries, sourceRegion, atFarEdge) {
  var rows = Array.isArray(drawerEntries) ? drawerEntries : []
  if (rows.length === 0) return { region: sourceRegion, beforeName: "" }
  if (atFarEdge) return { region: rows[rows.length - 1].region, beforeName: "" }
  return { region: rows[0].region, beforeName: entryId(rows[0].entry) }
}

function moduleString(entry, key, fallback) {
  var settings = entrySettings(entry)
  var value = settings[key]
  return value === undefined || value === null ? fallback : String(value)
}

function entryIndex(entries, name) {
  if (!Array.isArray(entries)) return -1
  for (var i = 0; i < entries.length; i++) {
    if (entryId(entries[i]) === name) return i
  }
  return -1
}

function entriesBefore(entries, name) {
  var index = entryIndex(entries, name)
  return index <= 0 ? [] : entries.slice(0, index)
}

function entriesAfter(entries, name) {
  var index = entryIndex(entries, name)
  return index === -1 ? [] : entries.slice(index + 1)
}

// Layout entries are shared with the live config. Copy when the overflow
// bit changes so a later write does not mutate the pre-drop object.
function applyMoveOverflow(entry, overflow) {
  if (overflow === undefined) return entry
  if (overflow === true) {
    if (entryOverflow(entry)) return entry
    if (typeof entry === "string") return { id: entry, overflow: true }
    var promoted = {}
    for (var key in entry) promoted[key] = entry[key]
    promoted.overflow = true
    return promoted
  }
  if (typeof entry === "string" || !isPlainObject(entry)) return entry
  if (!("overflow" in entry)) return entry
  var stripped = {}
  for (var key in entry) {
    if (key !== "overflow") stripped[key] = entry[key]
  }
  return stripped
}

function moveModule(layout, fromRegion, fromName, toRegion, beforeName, overflow) {
  if (!isPlainObject(layout)) return false
  var fromEntries = layout[fromRegion]
  var toEntries = layout[toRegion]
  if (!Array.isArray(fromEntries)) {
    fromEntries = []
    layout[fromRegion] = fromEntries
  }
  if (!Array.isArray(toEntries)) {
    toEntries = []
    layout[toRegion] = toEntries
  }

  var fromIndex = entryIndex(fromEntries, fromName)
  if (fromIndex < 0) return false

  var toIndex = beforeName ? entryIndex(toEntries, beforeName) : toEntries.length
  if (toIndex < 0) toIndex = toEntries.length

  var movedEntry = fromEntries[fromIndex]
  var nextEntry = applyMoveOverflow(movedEntry, overflow)
  var bitChanged = entryOverflow(movedEntry) !== entryOverflow(nextEntry)

  if (fromRegion === toRegion && fromIndex === toIndex) {
    if (!bitChanged) return false
    fromEntries[fromIndex] = nextEntry
    return true
  }

  fromEntries.splice(fromIndex, 1)
  if (fromRegion === toRegion && fromIndex < toIndex) toIndex -= 1
  if (toIndex < 0) toIndex = 0
  if (toIndex > toEntries.length) toIndex = toEntries.length
  if (fromRegion === toRegion && fromIndex === toIndex) {
    fromEntries.splice(fromIndex, 0, nextEntry)
    return bitChanged
  }

  toEntries.splice(toIndex, 0, nextEntry)
  return true
}

// A shell.json write that only changes inline widget settings (the battery
// percentage toggle, a clock format change) must not rebuild the bar.
// Compare two normalized layouts: when the structure is unchanged — same
// entry ids in the same order per region — return the settings-only changes
// as {region, index, entry}. Return null when the change is structural, or
// touches an entry a live settings push cannot safely reach: custom modules
// read their entry directly rather than an injected settings property, and
// a duplicated id makes the push ambiguous.
function inlineSettingsDelta(current, next) {
  if (!isPlainObject(current) || !isPlainObject(next)) return null
  var regions = ["left", "center", "right"]
  var counts = {}
  for (var r = 0; r < regions.length; r++) {
    var entries = Array.isArray(next[regions[r]]) ? next[regions[r]] : []
    for (var i = 0; i < entries.length; i++) {
      var id = entryId(entries[i])
      counts[id] = (counts[id] || 0) + 1
    }
  }
  var changes = []
  for (var s = 0; s < regions.length; s++) {
    var region = regions[s]
    var a = Array.isArray(current[region]) ? current[region] : []
    var b = Array.isArray(next[region]) ? next[region] : []
    if (a.length !== b.length) return null
    for (var j = 0; j < a.length; j++) {
      if (entryId(a[j]) !== entryId(b[j])) return null
      if (entryOverflow(a[j]) !== entryOverflow(b[j])) return null
      if (JSON.stringify(a[j]) === JSON.stringify(b[j])) continue
      if (customModuleType(a[j]) || customModuleType(b[j])) return null
      if (counts[entryId(b[j])] > 1) return null
      changes.push({ region: region, index: j, entry: b[j] })
    }
  }
  return changes
}

function expandPath(value, home) {
  var path = String(value || "")
  if (path === "") return ""
  if (path.indexOf("~/") === 0) return home + path.substring(1)
  if (path.indexOf("$HOME/") === 0) return home + path.substring(5)
  return path
}

function customModuleSafeName(name) {
  var value = String(name || "")
  return value !== "" && value.indexOf("..") === -1 && value[0] !== "/"
}

function customModuleType(entry) {
  var settings = entrySettings(entry)
  var type = String(settings.type || "")
  if (type) return type
  if (settings.exec) return "command"
  if (settings.source) return "qml"
  return ""
}

function customModulePath(entry, home, configDir) {
  var settings = entrySettings(entry)
  var name = entryId(entry)
  var source = settings.source ? expandPath(settings.source, home) : ""
  if (!source && customModuleSafeName(name))
    source = String(configDir || "") + "/bar/modules/" + String(name) + ".qml"
  return source
}

// A center module is mounted twice once an anchor is set: the copy that is
// actually drawn, and a zero-size placeholder holding its place in the flow
// beside the anchor. Panel routing has to pick the drawn one — it is the only
// one that can anchor a popup, carry the open-panel mark, or be found again
// by switchPanelFrom — and fall back to the placeholder only when nothing is
// on screen. The order the two are registered in is not stable across a live
// bar reconfiguration, so picking the first match is not good enough.
function isDrawnSlot(slot) {
  return !!slot && slot.visible === true && slot.width > 0 && slot.height > 0
}

function pickDrawnSlot(slots) {
  var placeholder = null
  var list = slots || []
  for (var i = 0; i < list.length; i++) {
    if (!list[i]) continue
    if (isDrawnSlot(list[i])) return list[i]
    if (!placeholder) placeholder = list[i]
  }
  return placeholder
}

// A bar surface is built per monitor, so a panel hotkey has several live
// copies of the same widget to route to, and the panel opens on whichever
// monitor's copy answers. Candidates are `{ slot, screenName, opened }`.
//
// An open copy wins first: hide and toggle have to reach the panel the user
// can actually see, wherever it was opened from. Otherwise the focused
// monitor's copy wins, so a summon lands where the user is working instead of
// on whichever output registered its slot first. Neither narrowing applies on
// a single monitor, or when the focused output has no bar of its own.
function pickPanelSlot(candidates, focusedScreen) {
  var rows = Array.isArray(candidates) ? candidates : []
  var pool = rows.filter(function(row) { return row && row.opened === true })
  if (pool.length === 0) pool = rows.filter(function(row) { return !!row })

  var focused = String(focusedScreen || "")
  if (focused) {
    var onFocused = pool.filter(function(row) { return row.screenName === focused })
    if (onFocused.length > 0) pool = onFocused
  }

  return pickDrawnSlot(pool.map(function(row) { return row.slot }))
}

// Resolve a pointer anywhere along the bar to the closest insertion edge.
// Requiring the pointer to sit inside another widget makes the empty space
// around a centered group a dead zone, even though it visually reads as the
// most natural place to drop.
function nearestDropTarget(candidates, point, vertical) {
  var rows = Array.isArray(candidates) ? candidates : []
  var axis = vertical ? Number(point && point.y) : Number(point && point.x)
  if (!isFinite(axis)) return null

  var best = null
  var bestDistance = Infinity
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i]
    if (!row || !row.slot) continue

    var start = Number(vertical ? row.y : row.x)
    var size = Number(vertical ? row.height : row.width)
    if (!isFinite(start) || !isFinite(size) || size <= 0) continue

    var beforeDistance = Math.abs(axis - start)
    var afterDistance = Math.abs(axis - (start + size))
    var after = afterDistance < beforeDistance
    var distance = after ? afterDistance : beforeDistance
    if (distance < bestDistance) {
      best = { slot: row.slot, after: after }
      bestDistance = distance
    }
  }
  return best
}

if (typeof module !== "undefined") {
  module.exports = {
    isDrawnSlot: isDrawnSlot,
    pickDrawnSlot: pickDrawnSlot,
    pickPanelSlot: pickPanelSlot,
    nearestDropTarget: nearestDropTarget,
    normalizePosition: normalizePosition,
    entrySettings: entrySettings,
    entryId: entryId,
    pinTrayToInner: pinTrayToInner,
    partitionSection: partitionSection,
    overflowEntries: overflowEntries,
    layoutEntryById: layoutEntryById,
    withPreservedOverflow: withPreservedOverflow,
    drawerChromeDropTarget: drawerChromeDropTarget,
    moduleString: moduleString,
    entryIndex: entryIndex,
    entriesBefore: entriesBefore,
    entriesAfter: entriesAfter,
    moveModule: moveModule,
    inlineSettingsDelta: inlineSettingsDelta,
    expandPath: expandPath,
    customModuleSafeName: customModuleSafeName,
    customModuleType: customModuleType,
    customModulePath: customModulePath
  }
}
