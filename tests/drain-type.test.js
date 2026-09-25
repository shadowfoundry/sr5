import {
  describe, it, expect
} from 'vitest'
import {
  isSpiritForceDrain
} from '../modules/rolls/roll-helpers/drainType.js'

// A card as the chat keeps it: binding and banishing are skill tests, told apart by typeSub
const card = (type, typeSub) => ({
  test: {
    type, typeSub
  },
})

describe('isSpiritForceDrain', () => {
  it('reads the spirit Force on binding and banishing cards, which are skill tests (SR5 p. 303-304)', () => {
    expect(isSpiritForceDrain(card("skillDicePool", "binding"))).toBe(true)
    expect(isSpiritForceDrain(card("skillDicePool", "banishing"))).toBe(true)
  })

  it('keeps the spirit Force on summoning', () => {
    expect(isSpiritForceDrain(card("summoningResistance", null))).toBe(true)
  })

  it('keeps the hits on every other card', () => {
    expect(isSpiritForceDrain(card("spell", null))).toBe(false)
    expect(isSpiritForceDrain(card("skillDicePool", "disenchanting"))).toBe(false)
    expect(isSpiritForceDrain(card("skillDicePool", "counterspelling"))).toBe(false)
  })
})
