import {
  describe, it, expect
} from 'vitest'
import {
  BROWSER_FILTERS, ACTOR_BROWSER_FILTERS, OTHER_BROWSER_FILTERS,
  ITEM_INDEX_FIELDS, ACTOR_INDEX_FIELDS, getEntryInfo,
} from '../modules/interface/compendium-browser-filters.js'

describe('BROWSER_FILTERS', () => {
  it('has a label and icon for every item type', () => {
    for (const [key, def] of Object.entries(BROWSER_FILTERS)) {
      expect(def.label, `${key}.label`).toBeTruthy()
      expect(def.icon, `${key}.icon`).toBeTruthy()
      expect(Array.isArray(def.filters), `${key}.filters`).toBe(true)
    }
  })

  it('has a label and icon for every actor type', () => {
    for (const [key, def] of Object.entries(ACTOR_BROWSER_FILTERS)) {
      expect(def.label, `${key}.label`).toBeTruthy()
      expect(def.icon, `${key}.icon`).toBeTruthy()
      expect(Array.isArray(def.filters), `${key}.filters`).toBe(true)
    }
  })

  it('has a label and icon for every other document type', () => {
    for (const [key, def] of Object.entries(OTHER_BROWSER_FILTERS)) {
      expect(def.label, `${key}.label`).toBeTruthy()
      expect(def.icon, `${key}.icon`).toBeTruthy()
      expect(Array.isArray(def.filters), `${key}.filters`).toBe(true)
    }
  })

  it('filter definitions have required fields', () => {
    const allFilters = {
      ...BROWSER_FILTERS, ...ACTOR_BROWSER_FILTERS
    }
    for (const [typeName, def] of Object.entries(allFilters)) {
      for (const filter of def.filters) {
        expect(filter.key, `${typeName} filter key`).toBeTruthy()
        expect(filter.type, `${typeName} filter type`).toMatch(/^(select|boolean)$/)
        expect(filter.label, `${typeName} filter label`).toBeTruthy()
        if (filter.type === 'select') {
          expect(filter.options, `${typeName} filter options`).toBeTruthy()
        }
      }
    }
  })

  it('subtypes definitions have field and options', () => {
    const allFilters = {
      ...BROWSER_FILTERS, ...ACTOR_BROWSER_FILTERS
    }
    for (const [typeName, def] of Object.entries(allFilters)) {
      if (def.subtypes) {
        expect(def.subtypes.field, `${typeName} subtypes.field`).toBeTruthy()
        expect(def.subtypes.options, `${typeName} subtypes.options`).toBeTruthy()
      }
    }
  })
})

describe('INDEX_FIELDS', () => {
  it('ITEM_INDEX_FIELDS is a non-empty array of strings', () => {
    expect(Array.isArray(ITEM_INDEX_FIELDS)).toBe(true)
    expect(ITEM_INDEX_FIELDS.length).toBeGreaterThan(0)
    for (const field of ITEM_INDEX_FIELDS) {
      expect(typeof field).toBe('string')
      expect(field).toMatch(/^system\./)
    }
  })

  it('ACTOR_INDEX_FIELDS is a non-empty array of strings', () => {
    expect(Array.isArray(ACTOR_INDEX_FIELDS)).toBe(true)
    expect(ACTOR_INDEX_FIELDS.length).toBeGreaterThan(0)
    for (const field of ACTOR_INDEX_FIELDS) {
      expect(typeof field).toBe('string')
      expect(field).toMatch(/^system\./)
    }
  })
})

describe('getEntryInfo', () => {
  // game.i18n.localize is stubbed as identity in setup.js
  const lists = {
    allWeaponsTypes: {
      assaultRifle: 'SR5.WeaponTypeAssaultRifle'
    },
    damageTypesShort: {
      physical: 'P', stun: 'S'
    },
    augmentationCategories: {
      standard: 'SR5.Standard', cultured: 'SR5.Cultured'
    },
    augmentationGrades: {
      standard: 'SR5.Standard'
    },
    spellCategories: {
      combat: 'SR5.SpellCategoryCombat'
    },
    spellTypes: {
      physical: 'SR5.SpellTypePhysical'
    },
    spellRanges: {
      lineOfSight: 'SR5.SpellRangeLOS'
    },
    qualityTypes: {
      positive: 'SR5.Positive'
    },
    focusTypes: {
      power: 'SR5.FocusPower'
    },
    ammunitionTypes: {
      regular: 'SR5.Regular'
    },
    programTypes: {
      common: 'SR5.Common'
    },
    complexFormTargets: {
      device: 'SR5.Device'
    },
    spellDurations: {
      sustained: 'SR5.Sustained'
    },
    powerActionTypes: {
      free: 'SR5.Free'
    },
  }

  it('returns empty string for unknown type', () => {
    const entry = {
      type: 'unknownType', system: {
      }
    }
    expect(getEntryInfo(entry, lists)).toBe('')
  })

  it('returns weapon info with damage and AP', () => {
    const entry = {
      type: 'itemWeapon',
      system: {
        category: 'rangedWeapon',
        type: 'assaultRifle',
        damageValue: {
          base: 11
        },
        damageType: 'physical',
        armorPenetration: {
          base: -2
        },
      },
    }
    const info = getEntryInfo(entry, lists)
    expect(info).toContain('SR5.WeaponTypeAssaultRifle')
    expect(info).toContain('11P')
    expect(info).toContain('-2')
  })

  it('returns armor value', () => {
    const entry = {
      type: 'itemArmor',
      system: {
        armorValue: {
          base: 12
        }
      },
    }
    expect(getEntryInfo(entry, lists)).toContain('12')
  })

  it('returns spell info with category, type, and range', () => {
    const entry = {
      type: 'itemSpell',
      system: {
        category: 'combat',
        type: 'physical',
        range: 'lineOfSight',
      },
    }
    const info = getEntryInfo(entry, lists)
    expect(info).toContain('SR5.SpellCategoryCombat')
    expect(info).toContain('SR5.SpellTypePhysical')
    expect(info).toContain('SR5.SpellRangeLOS')
  })

  it('returns quality info with type and karma', () => {
    const entry = {
      type: 'itemQuality',
      system: {
        type: 'positive', karmaCost: 10
      },
    }
    const info = getEntryInfo(entry, lists)
    expect(info).toContain('SR5.Positive')
    expect(info).toContain('10 karma')
  })

  it('returns device rating', () => {
    const entry = {
      type: 'itemDevice',
      system: {
        deviceRating: 6
      },
    }
    expect(getEntryInfo(entry, lists)).toContain('DR 6')
  })

  it('returns adept power info with PP cost', () => {
    const entry = {
      type: 'itemAdeptPower',
      system: {
        powerPointsCost: {
          base: 0.5
        },
        actionType: 'free',
      },
    }
    const info = getEntryInfo(entry, lists)
    expect(info).toContain('0.5 PP')
    expect(info).toContain('SR5.Free')
  })

  it('appends price when available', () => {
    const entry = {
      type: 'itemGear',
      system: {
        price: {
          base: 500
        }
      },
    }
    expect(getEntryInfo(entry, lists)).toContain('500¥')
  })

  it('does not append price for qualities', () => {
    const entry = {
      type: 'itemQuality',
      system: {
        type: 'positive',
        karmaCost: 5,
        price: {
          base: 100
        },
      },
    }
    expect(getEntryInfo(entry, lists)).not.toContain('100¥')
  })
})
