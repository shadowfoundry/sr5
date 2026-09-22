import {
  describe, it, expect, beforeEach, afterEach
} from 'vitest'
import {
  SR5_SpiritTypes
} from '../modules/entities/items/spirit-types.js'
import {
  SR5
} from '../modules/config.js'

function makeType(name, system = {
}) {
  return {
    name,
    type: 'itemSpiritType',
    system: {
      key: '',
      basedOn: '',
      attributes: {
      },
      skills: [],
      halfSkills: [],
      baseSkillsRatio: '',
      initiative: {
        physicalDice: null, astralDice: null, astralBonus: 0
      },
      conditionMonitor: '',
      powers: [],
      optionalPowers: [],
      ...system,
    },
  }
}

function makeAttributes() {
  const attributes = {
  }
  for (const key of Object.keys(SR5.characterAttributes)) {
    attributes[key] = {
      natural: {
        base: 4, modifiers: []
      }
    }
  }
  return attributes
}

function makeSkills(...keys) {
  const skills = {
  }
  for (const key of keys) skills[key] = {
    rating: {
      base: 0, modifiers: []
    }
  }
  return skills
}

describe('SR5_SpiritTypes', () => {
  let officialTypes

  beforeEach(() => {
    officialTypes = {
      ...SR5.spiritTypes
    }
    SR5_SpiritTypes._officialKeys = new Set(Object.keys(SR5.spiritTypes))
    SR5_SpiritTypes.registry = new Map()
  })

  afterEach(() => {
    SR5_SpiritTypes.registry = new Map()
    SR5_SpiritTypes._inject()
    expect(Object.keys(SR5.spiritTypes)).toEqual(Object.keys(officialTypes))
  })

  describe('baseType', () => {
    it('leaves an official type alone', () => {
      expect(SR5_SpiritTypes.baseType('fire')).toBe('fire')
    })

    it('answers a custom type with the type it is based on', () => {
      SR5_SpiritTypes.registry.set('mist', makeType('Esprit de brume', {
        basedOn: 'air'
      }))
      expect(SR5_SpiritTypes.baseType('mist')).toBe('air')
    })

    it('answers an empty string for a custom type with no base, so no official branch runs', () => {
      SR5_SpiritTypes.registry.set('mist', makeType('Esprit de brume'))
      expect(SR5_SpiritTypes.baseType('mist')).toBe('')
    })
  })

  describe('registration', () => {
    it('refuses a key an official type already uses', () => {
      const found = new Map()
      SR5_SpiritTypes._add(found, makeType('Doublon', {
        key: 'fire'
      }))
      expect(found.size).toBe(0)
    })

    it('refuses a key a previous custom type already took', () => {
      const found = new Map()
      SR5_SpiritTypes._add(found, makeType('Brume'))
      SR5_SpiritTypes._add(found, makeType('Brume'))
      expect(found.size).toBe(1)
    })

    it('falls back on the name when no key is given', () => {
      expect(SR5_SpiritTypes.keyOf(makeType('Esprit de la Brume'))).toBe('esprit-de-la-brume')
    })

    it('adds custom types to the list and takes them away again', () => {
      SR5_SpiritTypes.registry.set('mist', makeType('Esprit de brume'))
      SR5_SpiritTypes._inject()
      expect(SR5.spiritTypes.mist).toBe('Esprit de brume')
      expect(SR5.spiritTypes.fire).toBe(officialTypes.fire)

      SR5_SpiritTypes.registry = new Map()
      SR5_SpiritTypes._inject()
      expect(SR5.spiritTypes.mist).toBeUndefined()
    })
  })

  describe('power tables', () => {
    it('names its own powers, and those of the type it is based on', () => {
      SR5_SpiritTypes.registry.set('mist', makeType('Esprit de brume', {
        basedOn: 'air', powers: ['fear']
      }))
      SR5_SpiritTypes._inject()
      const table = SR5.spiritBasePowersmist
      expect(table.fear).toBe(SR5.AllSpiritPowers.fear)
      expect(table.materialization).toBe(SR5.spiritBasePowersair.materialization)
    })

    it('names only its own powers when it has no base', () => {
      SR5_SpiritTypes.registry.set('mist', makeType('Esprit de brume', {
        powers: ['fear']
      }))
      SR5_SpiritTypes._inject()
      expect(Object.keys(SR5.spiritBasePowersmist)).toEqual(['fear'])
    })

    it('forgets the tables of a type that is gone', () => {
      SR5_SpiritTypes.registry.set('mist', makeType('Esprit de brume', {
        powers: ['fear']
      }))
      SR5_SpiritTypes._inject()
      SR5_SpiritTypes.registry = new Map()
      SR5_SpiritTypes._inject()
      expect(SR5.spiritBasePowersmist).toBeUndefined()
      expect(SR5.spiritOptionalPowersmist).toBeUndefined()
    })
  })

  describe('applyAttributes', () => {
    it('adds a modifier without touching the base', () => {
      const attributes = makeAttributes()
      const custom = makeType('Brume', {
        attributes: {
          body: {
            modifier: 2, override: null
          }
        }
      })
      SR5_SpiritTypes.applyAttributes(custom, attributes, 'Brume')
      expect(attributes.body.natural.base).toBe(4)
      expect(attributes.body.natural.modifiers).toHaveLength(1)
      expect(attributes.body.natural.modifiers[0].value).toBe(2)
    })

    it('replaces the base with an override, zero included', () => {
      const attributes = makeAttributes()
      const custom = makeType('Brume', {
        attributes: {
          body: {
            modifier: 0, override: 0
          }
        }
      })
      SR5_SpiritTypes.applyAttributes(custom, attributes, 'Brume')
      expect(attributes.body.natural.base).toBe(0)
      expect(attributes.body.natural.modifiers).toHaveLength(0)
    })

    it('ignores an attribute the actor does not have', () => {
      const attributes = makeAttributes()
      const custom = makeType('Brume', {
        attributes: {
          nonsense: {
            modifier: 2, override: null
          }
        }
      })
      expect(() => SR5_SpiritTypes.applyAttributes(custom, attributes, 'Brume')).not.toThrow()
    })
  })

  describe('applySkills', () => {
    it('rates a skill at Force, and a half skill at half Force rounded up', () => {
      const skills = makeSkills('unarmedCombat', 'perception')
      const custom = makeType('Brume', {
        skills: ['unarmedCombat'], halfSkills: ['perception']
      })
      SR5_SpiritTypes.applySkills(custom, skills, 5)
      expect(skills.unarmedCombat.rating.base).toBe(5)
      expect(skills.perception.rating.base).toBe(3)
    })

    it('ignores a skill the actor does not have', () => {
      const skills = makeSkills('unarmedCombat')
      const custom = makeType('Brume', {
        skills: ['nonsense']
      })
      expect(() => SR5_SpiritTypes.applySkills(custom, skills, 5)).not.toThrow()
    })
  })

  describe('initiative and monitors', () => {
    it('reports nothing when the type says nothing, so the base type decides', () => {
      const custom = makeType('Brume')
      expect(SR5_SpiritTypes.physicalDice(custom)).toBeNull()
      expect(SR5_SpiritTypes.astralDice(custom)).toBeNull()
      expect(SR5_SpiritTypes.astralBonus(custom)).toBe(0)
      expect(SR5_SpiritTypes.conditionMonitor(custom)).toBe('')
      expect(SR5_SpiritTypes.baseSkillsRatio(custom)).toBe('')
    })

    it('reports a zero dice count as a value, not as silence', () => {
      const custom = makeType('Brume', {
        initiative: {
          physicalDice: 0, astralDice: null, astralBonus: 0
        }
      })
      expect(SR5_SpiritTypes.physicalDice(custom)).toBe(0)
    })
  })
})
