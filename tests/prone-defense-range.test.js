import {
  describe, it, expect
} from 'vitest'

import {
  SR5_MiscellaneousHelpers
} from '../modules/rolls/roll-helpers/miscellaneous.js'

describe('proneDefenseRange', () => {
  it('gives no distance modifier when the distance was never measured', () => {
    // A shot with no target: NaN on the attack, null once the chat card is stored as JSON
    const carried = JSON.parse(JSON.stringify({
      rangeInMeters: NaN
    })).rangeInMeters
    expect(carried).toBe(null)
    expect(SR5_MiscellaneousHelpers.proneDefenseRange(carried)).toBe(null)
    expect(SR5_MiscellaneousHelpers.proneDefenseRange(NaN)).toBe(null)
    expect(SR5_MiscellaneousHelpers.proneDefenseRange(undefined)).toBe(null)
  })

  it('keeps both bands for a measured distance, bounds included', () => {
    expect(SR5_MiscellaneousHelpers.proneDefenseRange(1.5)).toBe("close")
    expect(SR5_MiscellaneousHelpers.proneDefenseRange(5)).toBe("close")
    expect(SR5_MiscellaneousHelpers.proneDefenseRange(6)).toBe(null)
    expect(SR5_MiscellaneousHelpers.proneDefenseRange(15)).toBe(null)
    expect(SR5_MiscellaneousHelpers.proneDefenseRange(20)).toBe("far")
    expect(SR5_MiscellaneousHelpers.proneDefenseRange(85.5)).toBe("far")
  })
})
