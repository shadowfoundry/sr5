import {
  describe, it, expect
} from 'vitest'
import {
  getDrainTypeFromCard
} from '../modules/rolls/roll-helpers/drainType.js'

// A card as the chat keeps it: binding and banishing are skill tests, told apart by typeSub
const card = (type, typeSub, hits, force) => ({
  test: {
    type, typeSub
  },
  roll: {
    hits
  },
  magic: {
    force
  },
})

describe('getDrainTypeFromCard', () => {
  it('compares the spirit Force, not the hits, to the Magic on binding and banishing cards (SR5 p. 303-304)', () => {
    // Magic 3, spirit Force 6, 2 hits: the two readings disagree
    expect(getDrainTypeFromCard(card("skillDicePool", "binding", 2, 6), 3)).toBe("physical")
    expect(getDrainTypeFromCard(card("skillDicePool", "banishing", 2, 6), 3)).toBe("physical")
    // Magic 5, spirit Force 3, 6 hits
    expect(getDrainTypeFromCard(card("skillDicePool", "binding", 6, 3), 5)).toBe("stun")
    expect(getDrainTypeFromCard(card("skillDicePool", "banishing", 6, 3), 5)).toBe("stun")
  })

  it('keeps the spirit Force on summoning', () => {
    expect(getDrainTypeFromCard(card("summoningResistance", null, 1, 6), 3)).toBe("physical")
    expect(getDrainTypeFromCard(card("summoningResistance", null, 6, 3), 5)).toBe("stun")
  })

  it('keeps the hits on every other card', () => {
    expect(getDrainTypeFromCard(card("spell", null, 6, 3), 5)).toBe("physical")
    expect(getDrainTypeFromCard(card("skillDicePool", "disenchanting", 2, 6), 3)).toBe("stun")
  })
})
