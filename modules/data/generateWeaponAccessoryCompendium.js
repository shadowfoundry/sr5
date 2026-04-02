/**
 * Script to generate weapon accessory compendium items.
 * Run via: node scripts/data/generateWeaponAccessoryCompendium.js
 *
 * Outputs JSON files to the target compendium directory.
 */

import {
  WEAPON_ACCESSORY_CATALOG 
} from './weaponAccessoryCatalog.js'
import {
  readFileSync, writeFileSync, mkdirSync, existsSync 
} from 'fs'
import {
  join 
} from 'path'
import {
  randomBytes 
} from 'crypto'

// Load i18n for names and descriptions
const lang = JSON.parse(readFileSync(join(import.meta.dirname, '../../lang/fr.json'), 'utf8'))

// Config key → i18n key mapping (matches SR5.weaponAccessories in config.js)
const ACCESSORY_I18N = {
}
const configSrc = readFileSync(join(import.meta.dirname, '../config.js'), 'utf8')
const match = configSrc.match(/SR5\.weaponAccessories\s*=\s*\{([^}]+)\}/s)
if (match) {
  for (const m of match[1].matchAll(/(\w+)\s*:\s*"([^"]+)"/g)) {
    ACCESSORY_I18N[m[1]] = m[2]
  }
}

function generateId() {
  return randomBytes(8).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçœæÀÂÄÉÈÊËÏÎÔÙÛÜŸÇŒÆ ]/g, '_').replace(/\s+/g, '_')
}

const outputDir = join(import.meta.dirname, '../../..', 'sr5-compendiums/packs/fr_weapon-accessories/_source')

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, {
    recursive: true 
  })
}

const now = Date.now()
let count = 0

for (const [key, catalog] of Object.entries(WEAPON_ACCESSORY_CATALOG)) {
  const i18nKey = ACCESSORY_I18N[key]
  const name = i18nKey ? (lang[i18nKey] || key) : key

  // Game effect description
  const nameString = key.charAt(0).toUpperCase() + key.slice(1)
  const geKey = `SR5.Accessory${nameString}_GE`
  const gameEffect = lang[geKey] || ''

  const id = generateId()

  // Build itemEffects array from catalog
  const itemEffects = (catalog.itemEffects || []).map((e) => ({
    target: e.target, type: e.type || 'value', value: e.value, name: name,
    wifi: e.wifi || false, cumulative: e.cumulative !== undefined ? e.cumulative : true, multiplier: 1, category: '',
  }))

  // Special effect identifier (stored in weaponAccessory.specialEffect instead of systemEffects)
  const specialEffect = catalog.systemEffects?.[0]?.value || ''

  const item = {
    name: name,
    type: 'itemWeapon',
    img: 'systems/sr5/img/items/itemWeapon.svg',
    system: {
      description: '',
      gameEffect: gameEffect,
      source: 'core',
      page: 0,
      itemRating: 0,
      availability: {
        base: 0,
        modifiers: [],
        value: 0,
        multiplier: '',
      },
      legality: '',
      price: {
        base: catalog.price || 0,
        modifiers: [],
        value: 0,
        multiplier: '',
      },
      isWireless: false,
      wirelessTurnedOn: false,
      category: 'weaponAccessory',
      isAccessory: true,
      isPlugged: false,
      quantity: 1,
      customEffects: [],
      itemEffects: itemEffects,
      systemEffects: [],
      concealment: {
        value: 0, base: 0, modifiers: [] 
      },
      weaponAccessory: {
        slot: catalog.slot || '',
        type: catalog.type || 'accessory',
        priceMultiplier: catalog.priceMultiplier || 0,
        specialEffect: specialEffect,
      },
    },
    effects: [],
    folder: null,
    sort: count * 100000,
    ownership: {
      default: 0 
    },
    flags: {
    },
    _stats: {
      systemId: 'sr5',
      systemVersion: '13.0.0-alpha.17',
      coreVersion: '13.351',
      createdTime: now,
      modifiedTime: now,
      lastModifiedBy: 'generator',
    },
    _id: id,
    _key: `!items!${id}`,
  }

  const filename = `${sanitizeFilename(name)}_${id}.json`
  writeFileSync(join(outputDir, filename), JSON.stringify(item, null, 2))
  count++
}

console.log(`Generated ${count} weapon accessory items in ${outputDir}`)
