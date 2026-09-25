import {
  describe, it, expect
} from "vitest"
import {
  SR5_CharacterUtility
} from "../modules/entities/actors/utilityActor.js"

// A player character holds its metatype in 'biography.metatype', which is the field its own
// sheet writes. A grunt, and the sidekick built from an item, hold it in
// 'biography.characterMetatype'. Reading only one of the two left the other kind of character
// without its metatype, and so without the vision that metatype is owed (SR5 p. 68).
const acteur = (biography) => ({
  system: {
    biography
  }
})

describe("SR5_CharacterUtility.getMetatype", () => {
  it("reads the field a player character sheet writes", () => {
    expect(SR5_CharacterUtility.getMetatype(acteur({
      metatype: "dwarf"
    }))).toBe("dwarf")
  })

  it("reads the field a grunt carries", () => {
    expect(SR5_CharacterUtility.getMetatype(acteur({
      characterMetatype: "troll"
    }))).toBe("troll")
  })

  it("prefers the grunt field when an actor somehow holds both", () => {
    expect(SR5_CharacterUtility.getMetatype(acteur({
      characterMetatype: "elf", metatype: "ork"
    }))).toBe("elf")
  })

  it("returns nothing for a character that has no metatype", () => {
    expect(SR5_CharacterUtility.getMetatype(acteur({
      metatype: "", characterMetatype: ""
    }))).toBe("")
    expect(SR5_CharacterUtility.getMetatype(acteur({
    }))).toBe("")
    expect(SR5_CharacterUtility.getMetatype({
      system: {
      }
    })).toBe("")
    expect(SR5_CharacterUtility.getMetatype(undefined)).toBe("")
  })
})
