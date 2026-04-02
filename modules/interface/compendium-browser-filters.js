/**
 * Compendium Browser Filter Definitions
 *
 * Each entry maps an item type to its displayable filters.
 * Filter types:
 *   - select:  dropdown from a config constant (options key in SR5 config)
 *   - boolean: checkbox toggle
 *
 * The `key` is a dot-path into the compendium index entry (e.g. 'system.category').
 * The `options` string references CONFIG.SR5[options] which is an object of { value: i18nKey }.
 */

export const BROWSER_FILTERS = {

  itemWeapon: {
    label: 'TYPES.Item.itemWeapon',
    icon: 'fa-crosshairs',
    subtypes: {
      field: 'system.category',
      options: 'weaponCategories',
    },
    filters: [
      {
        key: 'system.type', type: 'select', label: 'SR5.Type', options: 'allWeaponsTypes' 
      },
    ],
  },

  itemArmor: {
    label: 'TYPES.Item.itemArmor',
    icon: 'fa-shield-alt',
    filters: [
      {
        key: 'system.isAccessory', type: 'boolean', label: 'SR5.ArmorAccessory' 
      },
    ],
  },

  itemAugmentation: {
    label: 'TYPES.Item.itemAugmentation',
    icon: 'fa-microchip',
    subtypes: {
      field: 'system.type',
      options: 'augmentationTypes',
    },
    filters: [
      {
        key: 'system.category', type: 'select', label: 'SR5.Category', options: 'augmentationCategories' 
      },
      {
        key: 'system.grade', type: 'select', label: 'SR5.AugmentationGrade', options: 'augmentationGrades' 
      },
    ],
  },

  itemSpell: {
    label: 'TYPES.Item.itemSpell',
    icon: 'fa-hat-wizard',
    filters: [
      {
        key: 'system.category', type: 'select', label: 'SR5.SpellCategory', options: 'spellCategories' 
      },
      {
        key: 'system.type', type: 'select', label: 'SR5.SpellType', options: 'spellTypes' 
      },
      {
        key: 'system.range', type: 'select', label: 'SR5.Range', options: 'spellRanges' 
      },
      {
        key: 'system.duration', type: 'select', label: 'SR5.Duration', options: 'spellDurations' 
      },
    ],
  },

  itemComplexForm: {
    label: 'TYPES.Item.itemComplexForm',
    icon: 'fa-project-diagram',
    filters: [
      {
        key: 'system.target', type: 'select', label: 'SR5.Target', options: 'complexFormTargets' 
      },
      {
        key: 'system.duration', type: 'select', label: 'SR5.Duration', options: 'spellDurations' 
      },
    ],
  },

  itemQuality: {
    label: 'TYPES.Item.itemQuality',
    icon: 'fa-star',
    filters: [
      {
        key: 'system.type', type: 'select', label: 'SR5.Type', options: 'qualityTypes' 
      },
    ],
  },

  itemProgram: {
    label: 'TYPES.Item.itemProgram',
    icon: 'fa-code',
    filters: [
      {
        key: 'system.type', type: 'select', label: 'SR5.Type', options: 'programTypes' 
      },
    ],
  },

  itemAdeptPower: {
    label: 'TYPES.Item.itemAdeptPower',
    icon: 'fa-hand-sparkles',
    filters: [
      {
        key: 'system.actionType', type: 'select', label: 'SR5.ActionType', options: 'powerActionTypes' 
      },
    ],
  },

  itemFocus: {
    label: 'TYPES.Item.itemFocus',
    icon: 'fa-gem',
    filters: [
      {
        key: 'system.type', type: 'select', label: 'SR5.Type', options: 'focusTypes' 
      },
    ],
  },

  itemVehicle: {
    label: 'TYPES.Item.itemVehicle',
    icon: 'fa-car',
    subtypes: {
      field: 'system.type',
      options: 'vehicleTypes',
    },
    filters: [
      {
        key: 'system.category', type: 'select', label: 'SR5.Category', options: 'vehiclesCategories' 
      },
    ],
  },

  itemVehicleMod: {
    label: 'TYPES.Item.itemVehicleMod',
    icon: 'fa-wrench',
    filters: [
      {
        key: 'system.type', type: 'select', label: 'SR5.Type', options: 'vehicleModType' 
      },
    ],
  },

  itemAmmunition: {
    label: 'TYPES.Item.itemAmmunition',
    icon: 'fa-box',
    filters: [
      {
        key: 'system.type', type: 'select', label: 'SR5.Type', options: 'ammunitionTypes' 
      },
    ],
  },

  itemMartialArt: {
    label: 'TYPES.Item.itemMartialArt',
    icon: 'fa-fist-raised',
    filters: [],
  },

  itemDevice: {
    label: 'TYPES.Item.itemDevice',
    icon: 'fa-laptop',
    subtypes: {
      field: 'system.type',
      options: 'deckTypes',
    },
    filters: [],
  },

  // Types with no specific filters (name search + type filter only)
  itemGear:        {
    label: 'TYPES.Item.itemGear', icon: 'fa-briefcase', filters: [] 
  },
  itemDrug:        {
    label: 'TYPES.Item.itemDrug', icon: 'fa-syringe', filters: [] 
  },
  itemEcho:        {
    label: 'TYPES.Item.itemEcho', icon: 'fa-podcast', filters: [] 
  },
  itemMetamagic:   {
    label: 'TYPES.Item.itemMetamagic', icon: 'fa-magic', filters: [] 
  },
  itemRitual:      {
    label: 'TYPES.Item.itemRitual', icon: 'fa-book-dead', filters: [] 
  },
  itemTradition:   {
    label: 'TYPES.Item.itemTradition', icon: 'fa-scroll', filters: [] 
  },
  itemContact:     {
    label: 'TYPES.Item.itemContact', icon: 'fa-address-book', filters: [] 
  },
  itemPower:       {
    label: 'TYPES.Item.itemPower', icon: 'fa-bolt', filters: [] 
  },
  itemSprite:      {
    label: 'TYPES.Item.itemSprite', icon: 'fa-ghost', filters: [] 
  },
  itemSpritePower: {
    label: 'TYPES.Item.itemSpritePower', icon: 'fa-ghost', filters: [] 
  },
  itemLifestyle:   {
    label: 'TYPES.Item.itemLifestyle', icon: 'fa-home', filters: [] 
  },
  itemPreparation: {
    label: 'TYPES.Item.itemPreparation', icon: 'fa-flask', filters: [] 
  },
}

export const ACTOR_BROWSER_FILTERS = {
  actorPc: {
    label: 'TYPES.Actor.actorPc',
    icon: 'fa-user',
    filters: [
      {
        key: 'system.metatype', type: 'select', label: 'SR5.Metatype', options: 'metatypes' 
      },
    ],
  },
  actorGrunt: {
    label: 'TYPES.Actor.actorGrunt',
    icon: 'fa-skull-crossbones',
    filters: [],
  },
  actorSpirit: {
    label: 'TYPES.Actor.actorSpirit',
    icon: 'fa-ghost',
    subtypes: {
      field: 'system.type',
      options: 'spiritTypes',
    },
    filters: [],
  },
  actorSprite: {
    label: 'TYPES.Actor.actorSprite',
    icon: 'fa-microchip',
    subtypes: {
      field: 'system.type',
      options: 'spriteTypes',
    },
    filters: [],
  },
  actorDrone:  {
    label: 'TYPES.Actor.actorDrone', icon: 'fa-car', filters: [] 
  },
  actorDevice: {
    label: 'TYPES.Actor.actorDevice', icon: 'fa-laptop', filters: [] 
  },
  actorAgent:  {
    label: 'TYPES.Actor.actorAgent', icon: 'fa-robot', filters: [] 
  },
}

export const OTHER_BROWSER_FILTERS = {
  JournalEntry: {
    label: 'SR5.BrowserJournalEntry', icon: 'fa-book-open', filters: [] 
  },
  RollTable:    {
    label: 'SR5.BrowserRollTable', icon: 'fa-dice', filters: [] 
  },
  Macro:        {
    label: 'SR5.BrowserMacro', icon: 'fa-terminal', filters: [] 
  },
  Scene:        {
    label: 'SR5.BrowserScene', icon: 'fa-map', filters: [] 
  },
  Playlist:     {
    label: 'SR5.BrowserPlaylist', icon: 'fa-music', filters: [] 
  },
  Adventure:    {
    label: 'SR5.BrowserAdventure', icon: 'fa-treasure-chest', filters: [] 
  },
  Cards:        {
    label: 'SR5.BrowserCards', icon: 'fa-cards', filters: [] 
  },
}

/** All system.* fields needed in the compendium index for filtering and display */
export const ITEM_INDEX_FIELDS = [
  'system.category', 'system.type', 'system.isAccessory',
  'system.grade', 'system.target', 'system.duration',
  'system.range', 'system.actionType',
  // Display fields
  'system.damageValue.base', 'system.damageType', 'system.armorPenetration.base',
  'system.armorValue.base', 'system.essenceCost.base',
  'system.price.base', 'system.availability.base',
  'system.powerPointsCost.base', 'system.drain.base',
  'system.fadingModifier', 'system.karmaCost',
  'system.deviceRating', 'system.itemRating',
]

export const ACTOR_INDEX_FIELDS = [
  'system.type', 'system.metatype',
]

/**
 * Build a short info string for a compendium index entry.
 * @param {object} entry — compendium index entry with system.* fields
 * @param {object} lists — localized SR5 config lists
 * @returns {string} short info text
 */
export function getEntryInfo(entry, lists) {
  const s = entry.system || {
  }
  const loc = k => game.i18n.localize(k)
  const parts = []

  switch (entry.type) {
    case 'itemWeapon':
      if (s.category && s.category !== 'weaponAccessory') {
        if (s.type) parts.push(loc(lists.allWeaponsTypes?.[s.type] || s.type))
        if (s.damageValue?.base) parts.push(`${s.damageValue.base}${loc(lists.damageTypesShort?.[s.damageType] || '')}`)
        if (s.armorPenetration?.base) parts.push(`${loc('SR5.ArmorPenetrationShort')} ${s.armorPenetration.base}`)
      }
      break
    case 'itemArmor':
      if (s.armorValue?.base) parts.push(`${s.armorValue.base}`)
      if (s.isAccessory) parts.push(loc('SR5.ArmorAccessory'))
      break
    case 'itemAugmentation':
      if (s.category) parts.push(loc(lists.augmentationCategories?.[s.category] || lists.augmentationGeneCategories?.[s.category] || s.category))
      if (s.grade) parts.push(loc(lists.augmentationGrades?.[s.grade] || s.grade))
      break
    case 'itemSpell':
      if (s.category) parts.push(loc(lists.spellCategories?.[s.category] || s.category))
      if (s.type) parts.push(loc(lists.spellTypes?.[s.type] || s.type))
      if (s.range) parts.push(loc(lists.spellRanges?.[s.range] || s.range))
      break
    case 'itemComplexForm':
      if (s.target) parts.push(loc(lists.complexFormTargets?.[s.target] || s.target))
      if (s.duration) parts.push(loc(lists.spellDurations?.[s.duration] || s.duration))
      break
    case 'itemQuality':
      if (s.type) parts.push(loc(lists.qualityTypes?.[s.type] || s.type))
      if (s.karmaCost) parts.push(`${s.karmaCost} karma`)
      break
    case 'itemAdeptPower':
      if (s.powerPointsCost?.base) parts.push(`${s.powerPointsCost.base} PP`)
      if (s.actionType) parts.push(loc(lists.powerActionTypes?.[s.actionType] || s.actionType))
      break
    case 'itemProgram':
      if (s.type) parts.push(loc(lists.programTypes?.[s.type] || s.type))
      break
    case 'itemVehicle':
      break
    case 'itemDevice':
      if (s.deviceRating) parts.push(`DR ${s.deviceRating}`)
      break
    case 'itemAmmunition':
      if (s.type) parts.push(loc(lists.ammunitionTypes?.[s.type] || s.type))
      break
    case 'itemFocus':
      if (s.type) parts.push(loc(lists.focusTypes?.[s.type] || s.type))
      break
    case 'actorPc':
      if (s.metatype) parts.push(loc(lists.metatypes?.[s.metatype] || s.metatype))
      break
    case 'actorSpirit':
      if (s.type) parts.push(loc(lists.spiritTypes?.[s.type] || s.type))
      break
    case 'actorSprite':
      if (s.type) parts.push(loc(lists.spriteTypes?.[s.type] || s.type))
      break
    default:
      break
  }

  if (s.price?.base && entry.type !== 'itemQuality') parts.push(`${s.price.base}¥`)

  return parts.join(' · ')
}
