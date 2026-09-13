const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { partitionSection, inlineSettingsDelta, entrySettings, overflowEntries, moveModule } = require("../BarModel.js")

describe("partitionSection", () => {
  it("puts entries without overflow on main and keeps order", () => {
    const entries = [{ id: "omarchy.clock" }, { id: "omarchy.audio" }]
    assert.deepEqual(partitionSection(entries), {
      main: entries,
      overflow: []
    })
  })

  it("puts overflow true entries on overflow and keeps section order", () => {
    const clock = { id: "omarchy.clock" }
    const media = { id: "omarchy.media", overflow: true }
    const audio = { id: "omarchy.audio", overflow: true }
    const power = { id: "omarchy.power" }
    assert.deepEqual(partitionSection([clock, media, audio, power]), {
      main: [clock, power],
      overflow: [media, audio]
    })
  })

  it("treats overflow false the same as missing", () => {
    const entry = { id: "omarchy.clock", overflow: false }
    assert.deepEqual(partitionSection([entry]), {
      main: [entry],
      overflow: []
    })
  })

  it("returns empty lists for a non-array", () => {
    assert.deepEqual(partitionSection(undefined), { main: [], overflow: [] })
  })

  it("treats a string entry as main", () => {
    assert.deepEqual(partitionSection(["omarchy.clock"]), {
      main: ["omarchy.clock"],
      overflow: []
    })
  })
})

describe("inlineSettingsDelta overflow", () => {
  it("returns null when overflow flips on the same id", () => {
    const current = { left: [], center: [], right: [{ id: "omarchy.clock" }] }
    const next = { left: [], center: [], right: [{ id: "omarchy.clock", overflow: true }] }
    assert.equal(inlineSettingsDelta(current, next), null)
  })

  it("returns null when overflow true becomes missing", () => {
    const current = { left: [], center: [], right: [{ id: "omarchy.clock", overflow: true }] }
    const next = { left: [], center: [], right: [{ id: "omarchy.clock" }] }
    assert.equal(inlineSettingsDelta(current, next), null)
  })

  it("still returns a settings delta when only format changes", () => {
    const current = { left: [], center: [{ id: "omarchy.clock", format: "HH:mm" }], right: [] }
    const next = { left: [], center: [{ id: "omarchy.clock", format: "hh:mm a" }], right: [] }
    assert.deepEqual(inlineSettingsDelta(current, next), [
      { region: "center", index: 0, entry: next.center[0] }
    ])
  })

  it("still returns a settings delta when overflow stays true and format changes", () => {
    const current = {
      left: [],
      center: [],
      right: [{ id: "omarchy.clock", overflow: true, format: "HH:mm" }]
    }
    const next = {
      left: [],
      center: [],
      right: [{ id: "omarchy.clock", overflow: true, format: "hh:mm a" }]
    }
    assert.deepEqual(inlineSettingsDelta(current, next), [
      { region: "right", index: 0, entry: next.right[0] }
    ])
  })
})

describe("entrySettings", () => {
  it("omits id and overflow from the settings bag", () => {
    assert.deepEqual(
      entrySettings({ id: "omarchy.clock", overflow: true, format: "HH:mm" }),
      { format: "HH:mm" }
    )
  })
})

describe("overflowEntries", () => {
  it("walks left, then center, then right and keeps section order", () => {
    const leftClock = { id: "omarchy.clock", overflow: true }
    const centerMedia = { id: "omarchy.media", overflow: true }
    const centerAudio = { id: "omarchy.audio" }
    const rightPower = { id: "omarchy.power", overflow: true }
    const rightTray = { id: "omarchy.tray" }
    assert.deepEqual(
      overflowEntries({
        left: [leftClock],
        center: [centerMedia, centerAudio],
        right: [rightPower, rightTray]
      }),
      [
        { kind: "plugin", region: "left", entry: leftClock },
        { kind: "plugin", region: "center", entry: centerMedia },
        { kind: "plugin", region: "right", entry: rightPower }
      ]
    )
  })

  it("returns an empty list when nothing is overflowed", () => {
    assert.deepEqual(
      overflowEntries({ left: [{ id: "omarchy.menu" }], center: [], right: [{ id: "omarchy.tray" }] }),
      []
    )
  })

  it("returns an empty list for a non-object layout", () => {
    assert.deepEqual(overflowEntries(undefined), [])
  })
})

describe("moveModule", () => {
  it("reorders in one section and leaves overflow unchanged", () => {
    const clock = { id: "omarchy.clock", overflow: true, format: "HH:mm" }
    const audio = { id: "omarchy.audio" }
    const layout = { left: [], center: [], right: [clock, audio] }
    assert.equal(moveModule(layout, "right", "omarchy.audio", "right", "omarchy.clock"), true)
    assert.deepEqual(layout, {
      left: [],
      center: [],
      right: [audio, clock]
    })
  })

  it("promotes a string to { id, overflow: true } on an overflow drop", () => {
    const layout = { left: ["omarchy.clock", "omarchy.audio"], center: [], right: [] }
    assert.equal(moveModule(layout, "left", "omarchy.clock", "left", "", true), true)
    assert.deepEqual(layout, {
      left: ["omarchy.audio", { id: "omarchy.clock", overflow: true }],
      center: [],
      right: []
    })
  })

  it("strips overflow on a main drop and keeps other keys", () => {
    const clock = { id: "omarchy.clock", overflow: true, format: "HH:mm" }
    const layout = { left: [], center: [], right: [clock, "omarchy.audio"] }
    assert.equal(moveModule(layout, "right", "omarchy.clock", "right", "", false), true)
    assert.deepEqual(clock, { id: "omarchy.clock", overflow: true, format: "HH:mm" })
    assert.deepEqual(layout, {
      left: [],
      center: [],
      right: ["omarchy.audio", { id: "omarchy.clock", format: "HH:mm" }]
    })
  })

  it("returns true when the same index flips overflow", () => {
    const layout = { left: ["omarchy.clock"], center: [], right: [] }
    assert.equal(moveModule(layout, "left", "omarchy.clock", "left", "omarchy.clock", true), true)
    assert.deepEqual(layout, {
      left: [{ id: "omarchy.clock", overflow: true }],
      center: [],
      right: []
    })
  })

  it("returns false when the same index already matches overflow", () => {
    const clock = { id: "omarchy.clock", overflow: true }
    const layout = { left: [clock], center: [], right: [] }
    assert.equal(moveModule(layout, "left", "omarchy.clock", "left", "omarchy.clock", true), false)
    assert.deepEqual(layout, { left: [clock], center: [], right: [] })
    assert.equal(layout.left[0], clock)
  })

  it("returns false when fromName is missing", () => {
    const layout = { left: ["omarchy.clock"], center: [], right: [] }
    assert.equal(moveModule(layout, "left", "omarchy.missing", "right", "", true), false)
    assert.deepEqual(layout, { left: ["omarchy.clock"], center: [], right: [] })
  })

  it("moves across regions and sets overflow true", () => {
    const layout = {
      left: ["omarchy.clock", "omarchy.workspaces"],
      center: ["omarchy.media"],
      right: []
    }
    assert.equal(moveModule(layout, "left", "omarchy.clock", "center", "omarchy.media", true), true)
    assert.deepEqual(layout, {
      left: ["omarchy.workspaces"],
      center: [{ id: "omarchy.clock", overflow: true }, "omarchy.media"],
      right: []
    })
  })
})
