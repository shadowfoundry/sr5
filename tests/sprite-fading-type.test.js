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
vi.mock('../modules/rolls/roll-message.js', () => ({
  SR5_RollMessage: {
    generateChatButton: () => ({
    }),
    updateRollCardHelper: async () => {},
    updateChatButtonHelper: () => {},
  }
}))

// The technomancer's card, stored in the chat log, that receives the fading button
let technomancerCard
globalThis.game = {
  i18n: {
    localize: (key) => key
  },
  messages: {
    get: () => ({
      flags: {
        sr5data: technomancerCard
      }
    })
  },
}

const {
  default: fading
} = await import('../modules/rolls/roll-prepare-case/rollData-Fading.js')
const {
  default: registeringResistance
} = await import('../modules/rolls/roll-prepare-case/rollData-RegisteringResistance.js')
const {
  default: decompilingResistance
} = await import('../modules/rolls/roll-prepare-case/rollData-DecompilingResistance.js')
const {
  default: sidekickResistanceInfo
} = await import('../modules/rolls/roll-test-case/test-SidekickResistance.js')
const {
  default: resonanceActionInfo
} = await import('../modules/rolls/roll-test-case/test-ResonanceAction.js')

const technomancer = (resonance) => ({
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

const sprite = (level) => ({
  type: "actorSprite",
  system: {
    level, isRegistered: false, compilerResonance: 0
  },
})

const emptyRollData = () => ({
  test: {
  },
  dicePool: {
    modifiers: []
  },
  matrix: {
    fading: {
    }
  },
  previousMessage: {
  },
})

// The technomancer's Inscription or Decompilation card, as the system builds it
const resonanceCard = (typeSub, hits) => ({
  test: {
    type: "resonanceAction", typeSub
  },
  matrix: {
    level: 5, fading: {
      value: 0
    }
  },
  roll: {
    hits
  },
  owner: {
    actorId: "techno", messageId: "m"
  },
  chatCard: {
    buttons: {
    }
  },
  target: {
  },
  previousMessage: {
  },
})

// Play the whole chain: the sprite resists, then the technomancer resists the fading
const spriteFadingType = async ({
  typeSub, prepare, resistType, resonance, level, technoHits, spriteHits
}) => {
  technomancerCard = resonanceCard(typeSub, technoHits)
  const spriteRoll = prepare(emptyRollData(), sprite(level), technomancerCard)
  const spriteCard = {
    ...spriteRoll,
    roll: {
      hits: spriteHits
    },
    chatCard: {
      buttons: {
      }
    },
  }
  await sidekickResistanceInfo(spriteCard, resistType)
  return fading(emptyRollData(), technomancer(resonance), technomancerCard).matrix.fading
}

describe('sprite fading damage type (SR5 p. 254, 258, 259)', () => {
  it('registering: physical when the sprite Level exceeds Resonance, even with few hits', async () => {
    const f = await spriteFadingType({
      typeSub: "registerSprite", prepare: registeringResistance, resistType: "registeringResistance",
      resonance: 5, level: 6, technoHits: 3, spriteHits: 2
    })
    expect(f.type).toBe("physical")
    expect(f.value).toBe(4)
  })

  it('registering: stun when the sprite Level does not exceed Resonance, even with many hits', async () => {
    const f = await spriteFadingType({
      typeSub: "registerSprite", prepare: registeringResistance, resistType: "registeringResistance",
      resonance: 5, level: 3, technoHits: 6, spriteHits: 0
    })
    expect(f.type).toBe("stun")
    expect(f.value).toBe(2)
  })

  it('decompiling: physical when the sprite Level exceeds Resonance, even with few hits', async () => {
    const f = await spriteFadingType({
      typeSub: "decompileSprite", prepare: decompilingResistance, resistType: "decompilingResistance",
      resonance: 4, level: 6, technoHits: 2, spriteHits: 3
    })
    expect(f.type).toBe("physical")
    expect(f.value).toBe(6)
  })

  it('decompiling: stun when the sprite Level does not exceed Resonance, even with many hits', async () => {
    const f = await spriteFadingType({
      typeSub: "decompileSprite", prepare: decompilingResistance, resistType: "decompilingResistance",
      resonance: 4, level: 4, technoHits: 6, spriteHits: 1
    })
    expect(f.type).toBe("stun")
  })
})

describe('kill complex form fading damage type (SR5 p. 254)', () => {
  const killCard = (hits) => ({
    ...resonanceCard("killComplexForm", hits),
    target: {
      itemUuid: "cf"
    },
  })
  const withComplexForm = (level) => {
    globalThis.fromUuid = async () => ({
      system: {
        level, fadingValue: 3
      }
    })
  }

  it('physical when the complex form Level exceeds Resonance, even with few hits', async () => {
    withComplexForm(6)
    const card = killCard(1)
    await resonanceActionInfo(card)
    expect(fading(emptyRollData(), technomancer(5), card).matrix.fading.type).toBe("physical")
  })

  it('stun when the complex form Level does not exceed Resonance, even with many hits', async () => {
    withComplexForm(4)
    const card = killCard(6)
    await resonanceActionInfo(card)
    expect(fading(emptyRollData(), technomancer(5), card).matrix.fading.type).toBe("stun")
  })
})
