import {
  describe, it, expect, vi
} from 'vitest'

// config.js writes CONFIG.statusEffects at import time
vi.hoisted(() => {
  globalThis.CONFIG ??= {
  }
})

import {
  SR5_MiscellaneousHelpers
} from '../modules/rolls/roll-helpers/miscellaneous.js'
import {
  SR5_ConverterHelpers
} from '../modules/rolls/roll-helpers/converter.js'

describe('addActions', () => {
  it('ignores an undefined action, so readers never meet action.type on undefined', () => {
    const actions = SR5_MiscellaneousHelpers.addActions([], SR5_ConverterHelpers.firingModeToAction("CC"))
    expect(actions).toEqual([])
    expect(actions.some(a => a.type === "simple" || a.type === "complex")).toBe(false)
  })

  it('still replaces the action of the same source', () => {
    let actions = SR5_MiscellaneousHelpers.addActions([], SR5_ConverterHelpers.firingModeToAction("SA"))
    actions = SR5_MiscellaneousHelpers.addActions(actions, undefined)
    actions = SR5_MiscellaneousHelpers.addActions(actions, SR5_ConverterHelpers.firingModeToAction("SB"))
    expect(actions).toEqual([{
      type: "complex", value: 1, source: "attack"
    }])
  })
})
