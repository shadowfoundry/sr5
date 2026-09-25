import {
  describe, it, expect
} from 'vitest'
import {
  readFileSync
} from 'node:fs'
import {
  _getSRStatusEffect
} from '../modules/system/effectsList.js'

// applyCalledShotsEffect() looks up a token status for every called shot effect
// it creates. A missing status used to throw before the effect was created
// (failed Disarm, Run & Gun p. 126), while the chat card said "Effect applied".
const source = readFileSync(new URL('../modules/rolls/roll-helpers/calledShot.js', import.meta.url), 'utf8')
const start = source.indexOf('static async getCalledShotsEffect')
const end = source.indexOf('static convertCalledShotToMod')
const calledShotEffects = [...new Set(
  [...source.slice(start, end).matchAll(/case "([a-zA-Z]+)"/g)].map(m => m[1])
)]
// Skipped by applyCalledShotsEffect() before the status lookup
const skipped = ['knockdown', 'buckled', 'stunned']

describe('called shot statuses', () => {
  it('finds the called shot effects in calledShot.js', () => {
    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    expect(calledShotEffects).toContain('disarm')
  })

  it('has a status for the failed Disarm', async () => {
    const status = await _getSRStatusEffect('disarm')
    expect(status).not.toBeNull()
    expect(status.origin).toBe('disarm')
    expect(status.name).toBeTruthy()
  })

  it('has a status for every called shot effect', async () => {
    for (const name of calledShotEffects.filter(n => !skipped.includes(n))) {
      const status = await _getSRStatusEffect(name)
      expect(status, name).not.toBeNull()
      expect(status.origin, name).toBe(name)
    }
  })
})
