import {
  describe, it, expect
} from 'vitest'
import {
  SR5
} from '../modules/config.js'
import {
  SR5_MarkHelpers, WATCHDOG_INTERRUPTION_COST
} from '../modules/rolls/roll-helpers/mark.js'
import {
  SR5_EntityHelpers
} from '../modules/entities/helpers.js'

// Build a minimal actor-like object carrying marks on its items
function actorWithMarks(marks){
  return {
    items: [{
      system: {
        marks: marks
      }
    }]
  }
}

describe('Watchdog interruption cost (Kill Code p. 45)', () => {
  it('costs 10 Initiative for Haywire and both Popups', () => {
    expect(WATCHDOG_INTERRUPTION_COST.haywire).toBe(10)
    expect(WATCHDOG_INTERRUPTION_COST.popupHacking).toBe(10)
    expect(WATCHDOG_INTERRUPTION_COST.popupCybercombat).toBe(10)
  })

  it('costs 5 Initiative for Squelch', () => {
    expect(WATCHDOG_INTERRUPTION_COST.squelch).toBe(5)
  })

  it('opens no other matrix action', () => {
    expect(Object.keys(WATCHDOG_INTERRUPTION_COST).sort()).toEqual([
      'haywire', 'popupCybercombat', 'popupHacking', 'squelch'
    ])
  })

  it('names actions that exist in the Kill Code action list', () => {
    for (const key of Object.keys(WATCHDOG_INTERRUPTION_COST)) {
      expect(SR5.matrixRolledActions[key], key).toBeTruthy()
    }
  })

  // config.js holds translation tables only: the init hook localizes every value it
  // finds there, and a number kills the whole system startup. Reproduce that death
  // rather than forbid one property name — the defect does not depend on the name.
  it('leaves the translation tables able to survive the sort run at init', () => {
    expect(() => SR5_EntityHelpers.sortTranslations(structuredClone(SR5))).not.toThrow()
  })
})

describe('SR5_MarkHelpers.hasWatchdogMark', () => {
  it('finds a Watchdog mark placed by the hacker', () => {
    const actor = actorWithMarks([{
      ownerId: 'hacker', value: 1, watchdog: true
    }])
    expect(SR5_MarkHelpers.hasWatchdogMark(actor, 'hacker')).toBe(true)
  })

  it('ignores an ordinary mark from the same hacker', () => {
    const actor = actorWithMarks([{
      ownerId: 'hacker', value: 3, watchdog: false
    }])
    expect(SR5_MarkHelpers.hasWatchdogMark(actor, 'hacker')).toBe(false)
  })

  it('ignores a mark predating the field, which has no flag at all', () => {
    const actor = actorWithMarks([{
      ownerId: 'hacker', value: 2
    }])
    expect(SR5_MarkHelpers.hasWatchdogMark(actor, 'hacker')).toBe(false)
  })

  it('ignores a Watchdog mark belonging to someone else', () => {
    const actor = actorWithMarks([{
      ownerId: 'someoneElse', value: 1, watchdog: true
    }])
    expect(SR5_MarkHelpers.hasWatchdogMark(actor, 'hacker')).toBe(false)
  })

  it('ignores an item carrying no mark, and a missing actor', () => {
    expect(SR5_MarkHelpers.hasWatchdogMark(actorWithMarks([]), 'hacker')).toBe(false)
    expect(SR5_MarkHelpers.hasWatchdogMark(undefined, 'hacker')).toBe(false)
  })
})
