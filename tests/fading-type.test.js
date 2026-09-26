import {
  describe, it, expect, vi
} from 'vitest'

vi.mock('../modules/config.js', () => ({
  SR5: {
    damageTypesShort: {
      physical: 'P', stun: 'S'
    }
  }
}))
vi.mock('../modules/rolls/roll-prepare-helpers.js', () => ({
  SR5_PrepareRollHelper: {
    getBaseDicepool: () => 0, getDicepoolModifiers: () => []
  }
}))

globalThis.game = {
  i18n: {
    localize: (key) => key
  }
}

const {
  default: fading
} = await import('../modules/rolls/roll-prepare-case/rollData-Fading.js')

const actor = (resonance) => ({
  system: {
    matrix: {
      resistances: {
        fading: {
          modifiers: []
        }
      }
    },
    specialAttributes: {
      resonance: {
        augmented: {
          value: resonance
        }
      }
    },
  },
})

const rollData = () => ({
  test: {
  },
  dicePool: {
  },
  matrix: {
    fading: {
    }
  },
  previousMessage: {
  },
})

// The card that carries the fading button, as the system builds it
const card = ({
  type, level, hits
}) => ({
  test: {
    type, typeSub: ""
  },
  matrix: {
    level, fading: {
      value: 6
    }
  },
  roll: {
    hits
  },
  owner: {
    messageId: "m"
  },
})

describe('fading damage type (SR5 p. 254)', () => {
  it('compiling: physical when the sprite Level exceeds Resonance, whatever the hits', () => {
    const rd = fading(rollData(), actor(5), card({
      type: "compilingResistance", level: 6, hits: 3
    }))
    expect(rd.matrix.fading.type).toBe("physical")
  })

  it('compiling: stun when the sprite Level does not exceed Resonance, even with many hits', () => {
    const rd = fading(rollData(), actor(5), card({
      type: "compilingResistance", level: 5, hits: 6
    }))
    expect(rd.matrix.fading.type).toBe("stun")
  })

  it('threading: physical only when the hits exceed Resonance', () => {
    expect(fading(rollData(), actor(5), card({
      type: "complexForm", level: 6, hits: 6
    })).matrix.fading.type).toBe("physical")
    expect(fading(rollData(), actor(5), card({
      type: "complexForm", level: 6, hits: 5
    })).matrix.fading.type).toBe("stun")
  })
})
