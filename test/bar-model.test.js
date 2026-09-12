const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { partitionSection, inlineSettingsDelta } = require("../BarModel.js")

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
})
