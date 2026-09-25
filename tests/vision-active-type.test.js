import {
  describe, it, expect
} from "vitest"
import {
  SR5_EntityHelpers
} from "../modules/entities/helpers.js"

// A character owns the vision its metatype gives it, but owning it is not using it : the sheet
// offers a 'natural vision' pin, and the environmental modifiers of a vision are applied on
// 'isActive' only. getActiveVisionType used to fall back on the metatype vision, which made that
// pin impossible to pick and left the picture disagreeing with the dice.
const acteur = (visions) => ({
  system: {
    visions
  }
})
const vide = {
  augmented: false, isActive: false, natural: false
}

describe("SR5_EntityHelpers.getActiveVisionType", () => {
  it("returns the vision the character has switched on", () => {
    expect(SR5_EntityHelpers.getActiveVisionType(acteur({
      astral: vide,
      lowLight: vide,
      thermographic: {
        ...vide, natural: true, isActive: true
      },
      ultrasound: vide,
    }))).toBe("thermographic")
  })

  it("returns ordinary sight when the character owns a vision but uses none", () => {
    expect(SR5_EntityHelpers.getActiveVisionType(acteur({
      astral: vide,
      lowLight: {
        ...vide, natural: true
      },
      thermographic: {
        ...vide, augmented: true
      },
      ultrasound: vide,
    }))).toBe("basic")
  })

  it("returns ordinary sight for an actor that has no vision block at all", () => {
    expect(SR5_EntityHelpers.getActiveVisionType({
      system: {
      }
    })).toBe("basic")
    expect(SR5_EntityHelpers.getActiveVisionType(undefined)).toBe("basic")
  })
})
