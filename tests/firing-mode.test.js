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

const fr = {
  "SR5.WeaponModeSSShort": "CC", "SR5.WeaponModeSAShort": "SA",
  "SR5.WeaponModeBFShort": "TR", "SR5.WeaponModeFAShort": "TA",
}
const localizeFr = key => fr[key] ?? key

describe('firingModeToCode', () => {
  const weapon = (modes, current = "") => ({
    singleShot: false, semiAutomatic: false, burstFire: false, fullyAutomatic: false, current, ...modes,
  })

  it('preselects the English code of the first enabled mode, whatever the language', () => {
    expect(SR5_ConverterHelpers.firingModeToCode(weapon({
      singleShot: true
    }), localizeFr)).toBe("SS")
    expect(SR5_ConverterHelpers.firingModeToCode(weapon({
      burstFire: true, fullyAutomatic: true
    }), localizeFr)).toBe("BF")
    expect(SR5_ConverterHelpers.firingModeToCode(weapon({
      fullyAutomatic: true
    }), localizeFr)).toBe("FA")
  })

  it('keeps a saved code', () => {
    expect(SR5_ConverterHelpers.firingModeToCode(weapon({
      semiAutomatic: true, burstFire: true
    }, "SB"), localizeFr)).toBe("SB")
  })

  it('turns a translated abbreviation saved by an earlier roll back into its code', () => {
    expect(SR5_ConverterHelpers.firingModeToCode(weapon({
      burstFire: true, fullyAutomatic: true
    }, "TA"), localizeFr)).toBe("FA")
    expect(SR5_ConverterHelpers.firingModeToCode(weapon({
      singleShot: true
    }, "CC"), localizeFr)).toBe("SS")
  })

  it('always yields a mode that converts to an action and to bullets', () => {
    const code = SR5_ConverterHelpers.firingModeToCode(weapon({
      burstFire: true
    }), localizeFr)
    expect(SR5_ConverterHelpers.firingModeToAction(code)).toBeTruthy()
    expect(SR5_ConverterHelpers.firingModeToBullet(code)).toBe(3)
  })
})

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
