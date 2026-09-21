import {
  describe, it, expect
} from 'vitest'
import {
  SR5
} from '../modules/config.js'
import {
  SR5_EntityHelpers
} from '../modules/entities/helpers.js'

/**
 * config.js holds translation tables, and sortTranslations() walks every one of
 * them at init expecting a string behind each key. A table of anything else
 * throws there, which kills the system before a single sheet can be built — so
 * it has to be caught here instead.
 */
describe('the configuration tables', () => {
  it('survive the sorting the system runs at startup', () => {
    expect(() => SR5_EntityHelpers.sortTranslations(structuredClone(SR5))).not.toThrow()
  })

  it('hold a translation key behind every entry', () => {
    // Tables sortTranslations() deliberately leaves alone, either because
    // their order matters or because they are not translations at all.
    const skipped = new Set(['statusEffects'])
    const offenders = []
    for (const [table, entries] of Object.entries(SR5)) {
      if (skipped.has(table) || Array.isArray(entries) || typeof entries !== 'object') continue
      for (const [key, value] of Object.entries(entries)) {
        if (typeof value !== 'string') offenders.push(`${table}.${key}`)
      }
    }
    expect(offenders, 'these entries are not translation keys').toEqual([])
  })
})
