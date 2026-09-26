import {
  describe, it, expect
} from 'vitest'
import {
  isRolledByTarget
} from '../modules/rolls/roll-helpers/cardRoller.js'

describe('isRolledByTarget', () => {
  it('lets the magician resist the binding and banishing drain (SR5 p. 304)', () => {
    expect(isRolledByTarget("drain", "binding", "spiritId")).toBe(false)
    expect(isRolledByTarget("drain", "banishing", "spiritId")).toBe(false)
  })

  it('lets the technomancer resist the registering and decompiling fading (SR5 p. 254)', () => {
    expect(isRolledByTarget("fading", "registerSprite", "spriteId")).toBe(false)
    expect(isRolledByTarget("fading", "decompileSprite", "spriteId")).toBe(false)
  })

  it('still lets the spirit or sprite handle its own buttons', () => {
    expect(isRolledByTarget("bindingResistance", "binding", "spiritId")).toBe(true)
    expect(isRolledByTarget("banishingResistance", "banishing", "spiritId")).toBe(true)
    expect(isRolledByTarget("reduceService", "banishing", "spiritId")).toBe(true)
    expect(isRolledByTarget("registeringResistance", "registerSprite", "spriteId")).toBe(true)
    expect(isRolledByTarget("decompilingResistance", "decompileSprite", "spriteId")).toBe(true)
  })

  it('leaves every other card to its owner', () => {
    expect(isRolledByTarget("drain", "spell", "targetId")).toBe(false)
    expect(isRolledByTarget("bindingResistance", "binding", undefined)).toBe(false)
  })
})
