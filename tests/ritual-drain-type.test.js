import {
  describe, it, expect, vi, beforeEach
} from 'vitest'

vi.mock('../modules/rolls/roll-message.js', () => ({
  SR5_RollMessage: {
    generateChatButton: () => ({
    }),
    updateChatButtonHelper: () => {},
  },
}))
vi.mock('../modules/rolls/roll-test-helper.js', () => ({
  SR5_RollTestHelper: {
    updateItemAfterRoll: () => {},
  },
}))

const {
  default: defenseResultInfo
} = await import('../modules/rolls/roll-test-case/test-DefenseResult.js')

const LEADER_ID = 'leader'

/** Seal a ritual: the leader's card (prevData) and the opposing Force x 2 card. */
async function seal({
  leaderHits, leaderMagic, oppositionHits
}) {
  const leaderCard = {
    test: {
      type: 'ritual'
    },
    roll: {
      hits: leaderHits, realHits: leaderHits
    },
    owner: {
      actorId: LEADER_ID
    },
  }
  globalThis.game.messages = {
    get: () => ({
      flags: {
        sr5data: leaderCard
      }
    })
  }
  globalThis.game.actors = {
    get: (id) => (id === LEADER_ID ? {
      system: {
        specialAttributes: {
          magic: {
            augmented: {
              value: leaderMagic
            }
          }
        }
      }
    } : undefined)
  }
  globalThis.fromUuid = async () => ({
    system: {
      durationMultiplier: ''
    }
  })

  const cardData = {
    previousMessage: {
      messageId: 'm1'
    },
    roll: {
      hits: oppositionHits
    },
    magic: {
      force: 6, reagentsSpent: 0, drain: {
        modifiers: {
        }
      }
    },
    chatCard: {
      buttons: {
      }
    },
    owner: {
      itemUuid: 'Item.x', actorId: LEADER_ID
    },
  }
  await defenseResultInfo(cardData, 'ritualResistance')
  return cardData.magic.drain
}

describe('ritual sealing - drain type (SR5 p. 299 + errata)', () => {
  beforeEach(() => {
    globalThis.game.i18n.localize = (key) => key
  })

  it('is physical when the leader\'s hits exceed their Magic', async () => {
    expect((await seal({
      leaderHits: 6, leaderMagic: 3, oppositionHits: 2
    })).type).toBe('physical')
  })

  it('is stun when the leader\'s hits do not exceed their Magic', async () => {
    expect((await seal({
      leaderHits: 3, leaderMagic: 3, oppositionHits: 1
    })).type).toBe('stun')
  })

  it('ignores the opposition\'s hits', async () => {
    expect((await seal({
      leaderHits: 2, leaderMagic: 3, oppositionHits: 7
    })).type).toBe('stun')
    expect((await seal({
      leaderHits: 6, leaderMagic: 3, oppositionHits: 7
    })).type).toBe('physical')
  })

  it('keeps the drain value at twice the opposition\'s hits', async () => {
    expect((await seal({
      leaderHits: 6, leaderMagic: 3, oppositionHits: 4
    })).value).toBe(8)
  })

  it('warns the GM when the leader cannot be found, instead of a silent stun', async () => {
    const warn = vi.fn()
    globalThis.ui = {
      notifications: {
        warn
      }
    }
    expect((await seal({
      leaderHits: 6, leaderMagic: undefined, oppositionHits: 2
    })).type).toBe('stun')
    expect(warn).toHaveBeenCalledWith('SR5.WARN_RitualLeaderNotFound')
  })
})
