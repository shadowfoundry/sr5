import {
  describe, it, expect
} from 'vitest'
import {
  SR5
} from '../modules/config.js'
import {
  SR5_MarkHelpers
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
    expect(SR5.watchdogInterruptionCost.haywire).toBe(10)
    expect(SR5.watchdogInterruptionCost.popupHacking).toBe(10)
    expect(SR5.watchdogInterruptionCost.popupCybercombat).toBe(10)
  })

  it('costs 5 Initiative for Squelch', () => {
    expect(SR5.watchdogInterruptionCost.squelch).toBe(5)
  })

  it('opens no other matrix action', () => {
    expect(Object.keys(SR5.watchdogInterruptionCost).sort()).toEqual([
      'haywire', 'popupCybercombat', 'popupHacking', 'squelch'
    ])
  })

  it('names actions that exist in the Kill Code action list', () => {
    for (const key of Object.keys(SR5.watchdogInterruptionCost)) {
      expect(SR5.matrixRolledActions[key], key).toBeTruthy()
    }
  })

  // The init hook runs sortTranslations over every SR5 table and localizes its values.
  // A table of numbers must be left out, or the whole system dies at startup.
  it('survives the alphabetical sort run at init', () => {
    expect(() => SR5_EntityHelpers.sortTranslations(SR5)).not.toThrow()
    expect(SR5.watchdogInterruptionCost.haywire).toBe(10)
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
