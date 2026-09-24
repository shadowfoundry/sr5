import {
  describe, it, expect
} from "vitest"
import {
  SR5_SpellShapingHelpers
} from "../modules/rolls/roll-helpers/spell-shaping.js"

// Spell Shaping (SR5 p. 329): each -1 dice pool modifier buys either one metre of
// radius or one bubble; the total may not exceed Magic, raised by a Spell Shaping
// focus (SR5 p. 323, already folded into spellShapingValue).
describe("Spell Shaping — sharing the points", () => {

  it("spends nothing when nothing is asked for", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: 0, spared: 0, max: 6, bubbleCost: 1, changed: "area"
    })
    expect(shaped).toMatchObject({
      area: 0, spared: 0, penalty: 0, clamped: false
    })
  })

  it("charges one die per metre of extra radius", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: 3, spared: 0, max: 6, bubbleCost: 1, changed: "area"
    })
    expect(shaped.penalty).toBe(3)
    expect(shaped.area).toBe(3)
  })

  it("charges the bubble cost per spared character", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: 0, spared: 2, max: 6, bubbleCost: 2, changed: "spared"
    })
    expect(shaped.penalty).toBe(4)
    expect(shaped.spared).toBe(2)
  })

  it("adds radius and bubbles into a single penalty", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: 2, spared: 1, max: 6, bubbleCost: 1, changed: "area"
    })
    expect(shaped.penalty).toBe(3)
  })

  // "He may not take a dice pool modifier greater in absolute value than his
  // Magic rating." — SR5 p. 329
  it("never lets the penalty exceed the cap", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: 10, spared: 0, max: 4, bubbleCost: 1, changed: "area"
    })
    expect(shaped.area).toBe(4)
    expect(shaped.penalty).toBe(4)
    expect(shaped.clamped).toBe(true)
  })

  it("trims the bubbles when the radius was the input just moved", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: 4, spared: 3, max: 5, bubbleCost: 1, changed: "area"
    })
    expect(shaped.area).toBe(4)
    expect(shaped.spared).toBe(1)
    expect(shaped.penalty).toBe(5)
  })

  it("trims the radius when the bubbles were the input just moved", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: 4, spared: 3, max: 5, bubbleCost: 1, changed: "spared"
    })
    expect(shaped.spared).toBe(3)
    expect(shaped.area).toBe(2)
    expect(shaped.penalty).toBe(5)
  })

  it("never buys a bubble it cannot pay for in full", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: 0, spared: 3, max: 5, bubbleCost: 2, changed: "spared"
    })
    expect(shaped.spared).toBe(2)
    expect(shaped.penalty).toBe(4)
  })

  it("refuses negative and unreadable inputs", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: -3, spared: undefined, max: 6, bubbleCost: 1, changed: "area"
    })
    expect(shaped).toMatchObject({
      area: 0, spared: 0, penalty: 0
    })
  })

  it("treats a bubble cost of zero as one, so a bubble is never free", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: 0, spared: 4, max: 6, bubbleCost: 0, changed: "spared"
    })
    expect(shaped.penalty).toBe(4)
  })

  // A character with no Spell Shaping, or with the metamagic but no Magic left,
  // must not be able to shape anything.
  it("shapes nothing when the cap is zero", () => {
    const shaped = SR5_SpellShapingHelpers.share({
      area: 2, spared: 2, max: 0, bubbleCost: 1, changed: "area"
    })
    expect(shaped).toMatchObject({
      area: 0, spared: 0, penalty: 0
    })
  })
})

describe("Spell Shaping — who stands in a bubble", () => {

  it("identifies a linked actor by its own id", () => {
    expect(SR5_SpellShapingHelpers.actorKey({
      id: "actor1", isToken: false
    })).toBe("actor1")
  })

  // Two copies of the same NPC share an actor id, so an unlinked token has to be
  // told apart by its token id — otherwise sparing one spares them all.
  it("identifies an unlinked actor by its token id", () => {
    expect(SR5_SpellShapingHelpers.actorKey({
      id: "actor1", isToken: true, token: {
        id: "token7"
      }
    })).toBe("token7")
  })

  it("spares an actor named in the list", () => {
    const spell = {
      sparedActors: [{
        id: "token7", name: "Kaz"
      }]
    }
    expect(SR5_SpellShapingHelpers.isSpared({
      id: "actor1", isToken: true, token: {
        id: "token7"
      }
    }, spell)).toBe(true)
  })

  it("does not spare anyone else", () => {
    const spell = {
      sparedActors: [{
        id: "token7", name: "Kaz"
      }]
    }
    expect(SR5_SpellShapingHelpers.isSpared({
      id: "actor2", isToken: false
    }, spell)).toBe(false)
  })

  // The single predicate the five resolution paths ask, so none of them can
  // disagree with the others about who is untouched.
  it("skips a spared actor on a spell card", () => {
    const carte = {
      test: {
        type: "spell"
      }, magic: {
        spell: {
          sparedActors: [{
            id: "actor1", name: "Kaz"
          }]
        }
      }
    }
    expect(SR5_SpellShapingHelpers.skips({
      id: "actor1", isToken: false
    }, carte)).toBe(true)
  })

  it("skips nobody on a card that is not a spell", () => {
    const carte = {
      test: {
        type: "attack"
      }, magic: {
        spell: {
          sparedActors: [{
            id: "actor1", name: "Kaz"
          }]
        }
      }
    }
    expect(SR5_SpellShapingHelpers.skips({
      id: "actor1", isToken: false
    }, carte)).toBe(false)
  })

  it("skips nobody on a card with no magic block", () => {
    expect(SR5_SpellShapingHelpers.skips({
      id: "actor1", isToken: false
    }, {
      test: {
        type: "spell"
      }
    })).toBe(false)
    expect(SR5_SpellShapingHelpers.skips({
      id: "actor1", isToken: false
    }, undefined)).toBe(false)
  })

  // Nothing in the system ever clears a target — measured by searching modules/ —
  // and the GM who cast an area spell still has the victim targeted, since that is
  // how they cast it. So "targets first" would spare the victim in the most
  // ordinary case at the table. When the two sources disagree, decide nothing.
  it("takes the targets when nothing is selected", () => {
    const choix = SR5_SpellShapingHelpers.tokensToSpare([{
      id: "a"
    }], [])
    expect(choix.tokens.map(t => t.id)).toEqual(["a"])
    expect(choix.ambiguous).toBe(false)
  })

  it("takes the selection when nothing is targeted", () => {
    const choix = SR5_SpellShapingHelpers.tokensToSpare([], [{
      id: "b"
    }])
    expect(choix.tokens.map(t => t.id)).toEqual(["b"])
    expect(choix.ambiguous).toBe(false)
  })

  it("proceeds when target and selection are the same tokens", () => {
    const choix = SR5_SpellShapingHelpers.tokensToSpare([{
      id: "a"
    }, {
      id: "b"
    }], [{
      id: "b"
    }, {
      id: "a"
    }])
    expect(choix.tokens.length).toBe(2)
    expect(choix.ambiguous).toBe(false)
  })

  it("refuses rather than guess when they disagree", () => {
    const choix = SR5_SpellShapingHelpers.tokensToSpare([{
      id: "victime"
    }], [{
      id: "allie"
    }])
    expect(choix.tokens).toEqual([])
    expect(choix.ambiguous).toBe(true)
  })

  it("refuses when the selection is a subset of the targets", () => {
    const choix = SR5_SpellShapingHelpers.tokensToSpare([{
      id: "a"
    }, {
      id: "b"
    }], [{
      id: "a"
    }])
    expect(choix.ambiguous).toBe(true)
  })

  // The other way round, and it is not the same case: the GM still has the victim
  // targeted from the cast, then selects the victim and an ally. Inclusion cannot
  // be read as agreement, precisely because targets are never cleared.
  it("refuses when the targets are a subset of the selection", () => {
    const choix = SR5_SpellShapingHelpers.tokensToSpare([{
      id: "victime"
    }], [{
      id: "victime"
    }, {
      id: "allie"
    }])
    expect(choix.tokens).toEqual([])
    expect(choix.ambiguous).toBe(true)
  })

  // Compared as sets of ids, so a duplicate cannot make two different collections
  // pass for an agreement. Unreachable through Foundry, whose targets and
  // selection are Sets — but this function is pure and takes plain arrays.
  it("does not mistake a duplicated id for an agreement", () => {
    const choix = SR5_SpellShapingHelpers.tokensToSpare([{
      id: "a"
    }, {
      id: "b"
    }], [{
      id: "a"
    }, {
      id: "a"
    }])
    expect(choix.ambiguous).toBe(true)
  })

  it("spares nobody when neither is set", () => {
    const choix = SR5_SpellShapingHelpers.tokensToSpare([], [])
    expect(choix.tokens).toEqual([])
    expect(choix.ambiguous).toBe(false)
  })

  // Chat cards cast before this feature existed carry no list at all.
  it("spares nobody when the card has no list", () => {
    expect(SR5_SpellShapingHelpers.isSpared({
      id: "actor1", isToken: false
    }, {
    })).toBe(false)
    expect(SR5_SpellShapingHelpers.isSpared({
      id: "actor1", isToken: false
    }, undefined)).toBe(false)
  })
})
