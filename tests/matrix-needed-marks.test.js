import {
  describe, it, expect, beforeEach, vi
} from 'vitest'

// config.js writes CONFIG.statusEffects while it is being imported
globalThis.CONFIG ??= {
}
const {
  checkTargetMarks
} = await import('../modules/rolls/roll-prepare-case/rollData-MatrixAction.js')

const HACKER = 'hacker'

// A targeted token whose actor carries the given marks on its device
function target(marks){
  return {
    actor: {
      id: 'target',
      system: {
        matrix: {
          userGrid: 'local'
        }
      },
      items: [{
        system: {
        }
      }, {
        system: {
          marks: marks
        }
      }],
    },
  }
}

function check(neededMarks, marks){
  game.user.targets = new Set([target(marks)])
  const rollData = {
    owner: {
      speakerId: HACKER
    },
    target: {
    },
  }
  return checkTargetMarks(rollData, {
    neededMarks
  }, {
    id: HACKER
  })
}

describe('Marks needed before a matrix action (SR5 p. 238-244)', () => {
  beforeEach(() => {
    game.user = {
    }
    ui.notifications.info = vi.fn()
  })

  it('refuses Reboot Device (3 marks) with a single mark', async () => {
    expect(await check(3, [{
      ownerId: HACKER, value: 1
    }])).toBe(false)
    expect(ui.notifications.info).toHaveBeenCalled()
  })

  it('refuses Reboot Device (3 marks) with two marks', async () => {
    expect(await check(3, [{
      ownerId: HACKER, value: 2
    }])).toBe(false)
  })

  it('allows Reboot Device with three marks', async () => {
    expect(await check(3, [{
      ownerId: HACKER, value: 3
    }])).toBe(true)
  })

  it('refuses when the marks belong to someone else', async () => {
    expect(await check(1, [{
      ownerId: 'someone', value: 3
    }])).toBe(false)
  })

  it('allows Edit File (1 mark) with one mark', async () => {
    expect(await check(1, [{
      ownerId: HACKER, value: 1
    }])).toBe(true)
  })

  it('reads Erase Mark\'s "3" as three marks (SR5 p. 240)', async () => {
    expect(await check('3', [{
      ownerId: HACKER, value: 2
    }])).toBe(false)
  })

  it('asks for no mark on a special action', async () => {
    expect(await check('S', [])).toBe(true)
  })

  it('keeps asking one mark for the owner-only actions, ownership not being tracked', async () => {
    expect(await check(4, [{
      ownerId: HACKER, value: 1
    }])).toBe(true)
    expect(await check(4, [])).toBe(false)
  })
})
