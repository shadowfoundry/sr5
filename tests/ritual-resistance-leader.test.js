import {
  describe, it, expect, vi, beforeEach
} from 'vitest'

const renderRollCard = vi.fn()
vi.mock('../modules/rolls/roll-test.js', () => ({
  SR5_RollTest: {
    rollDice: async () => ({
      hits: 0
    }),
    addInfoToCard: async () => {},
    renderRollCard: (...args) => renderRollCard(...args),
  },
}))
// Reads actor.isToken first, like the real one (roll-prepare.js): an absent actor throws there
vi.mock('../modules/rolls/roll-prepare.js', () => ({
  SR5_PrepareRollTest: {
    getBaseRollData: (_document, actor) => ({
      owner: {
        actorId: actor.isToken ? actor.token.id : actor.id
      },
      previousMessage: {
      },
      test: {
      },
      dicePool: {
      },
      magic: {
      },
      matrix: {
      },
      target: {
      },
    }),
  },
}))
vi.mock('../modules/socket.js', () => ({
  SR5_SocketHandler: {
  },
}))

const {
  SR5_ThirdPartyHelpers
} = await import('../modules/rolls/roll-helpers/thirdparty.js')

const LEADER_ID = 'leader'

/** Click "Ritual resistance" on the leader's sealing card. */
async function clickRitualResistance() {
  const cardData = {
    test: {
      type: 'ritual'
    },
    roll: {
      hits: 4
    },
    owner: {
      actorId: LEADER_ID, itemId: 'i1', itemUuid: 'Actor.leader.Item.i1'
    },
    magic: {
      force: 5, reagentsSpent: 0
    },
  }
  await SR5_ThirdPartyHelpers.createItemResistance(cardData, 'm1')
}

describe('ritual resistance - leader deleted before the GM clicks', () => {
  let warn
  beforeEach(() => {
    renderRollCard.mockClear()
    warn = vi.fn()
    globalThis.ui = {
      notifications: {
        warn
      }
    }
    globalThis.game.i18n.localize = (key) => key
    globalThis.canvas = {
      ready: false
    }
  })

  it('warns the GM and stops cleanly instead of crashing', async () => {
    globalThis.game.actors = {
      get: () => undefined
    }
    await expect(clickRitualResistance()).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalledWith('SR5.WARN_RitualLeaderMissing')
    expect(renderRollCard).not.toHaveBeenCalled()
  })

  it('still rolls the Force x 2 resistance when the leader is there', async () => {
    globalThis.game.actors = {
      get: (id) => (id === LEADER_ID ? {
        id: LEADER_ID, isToken: false
      } : undefined)
    }
    await clickRitualResistance()
    expect(warn).not.toHaveBeenCalled()
    expect(renderRollCard).toHaveBeenCalledOnce()
    const rollData = renderRollCard.mock.calls[0][0]
    expect(rollData.test.type).toBe('ritualResistance')
    expect(rollData.dicePool.value).toBe(10)
  })
})
