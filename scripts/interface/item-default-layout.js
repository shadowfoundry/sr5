/**
 * Item Default Layouts — defines the initial tab/panel/block arrangement
 * for each SR5 item type. Mirrors the actor default-layout.js pattern.
 *
 * All items use 2 panels: SIDEBAR (width=1) + MAIN (width=2).
 * SIDEBAR always has 1 tab (Summary). MAIN tabs vary by item type.
 */

import { ITEM_TAB_ICONS } from './item-block-registry.js'

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------

let _nextId = 0
function _id() { return `item-default-${_nextId++}` }

function _panel(label, width, tabs) {
  return { id: _id(), label, width, tabs }
}

function _tab(label, icon, blocks) {
  return { id: _id(), label, icon: ITEM_TAB_ICONS[icon], iconKey: icon, blocks }
}

function _block(id) {
  return { id }
}

// ---------------------------------------------------------------------------
//  3-tab items: Description + Configuration + Effects
//  (22 types)
// ---------------------------------------------------------------------------

function _threeTabLayout(summaryBlock, statBlock) {
  _nextId = 0
  return {
    panels: [
      _panel('SIDEBAR', 1, [
        _tab('Summary', 'info', [
          _block(summaryBlock),
        ]),
      ]),
      _panel('MAIN', 2, [
        _tab('Description', 'bio', [
          _block('itemDescription'),
        ]),
        _tab('Configuration', 'stat', [
          _block(statBlock),
        ]),
        _tab('Effects', 'effects', [
          _block('itemEffects'),
        ]),
      ]),
    ],
  }
}

// ---------------------------------------------------------------------------
//  2-tab items: Description + Effects (no stat tab)
//  (4 types: Metamagic, Mark, Effect, Echo)
// ---------------------------------------------------------------------------

function _descEffectsLayout(summaryBlock) {
  _nextId = 0
  return {
    panels: [
      _panel('SIDEBAR', 1, [
        _tab('Summary', 'info', [
          _block(summaryBlock),
        ]),
      ]),
      _panel('MAIN', 2, [
        _tab('Description', 'bio', [
          _block('itemDescription'),
        ]),
        _tab('Effects', 'effects', [
          _block('itemEffects'),
        ]),
      ]),
    ],
  }
}

// ---------------------------------------------------------------------------
//  2-tab items: Description + Configuration (no effects tab)
//  (5 types: Vehicle, Sin, Lifestyle, Contact, Ammunition)
// ---------------------------------------------------------------------------

function _descStatLayout(summaryBlock, statBlock) {
  _nextId = 0
  return {
    panels: [
      _panel('SIDEBAR', 1, [
        _tab('Summary', 'info', [
          _block(summaryBlock),
        ]),
      ]),
      _panel('MAIN', 2, [
        _tab('Description', 'bio', [
          _block('itemDescription'),
        ]),
        _tab('Configuration', 'stat', [
          _block(statBlock),
        ]),
      ]),
    ],
  }
}

// ---------------------------------------------------------------------------
//  1-tab items: Description only (no stat, no effects)
//  (4 types: Karma, Knowledge, Language, Nuyen)
// ---------------------------------------------------------------------------

function _descOnlyLayout(summaryBlock) {
  _nextId = 0
  return {
    panels: [
      _panel('SIDEBAR', 1, [
        _tab('Summary', 'info', [
          _block(summaryBlock),
        ]),
      ]),
      _panel('MAIN', 2, [
        _tab('Description', 'bio', [
          _block('itemDescription'),
        ]),
      ]),
    ],
  }
}

// ---------------------------------------------------------------------------
//  Layout lookup — maps item type to layout function
// ---------------------------------------------------------------------------

const ITEM_LAYOUTS = {
  // 3-tab: Description + Configuration + Effects
  itemWeapon:       () => _threeTabLayout('weaponSummary', 'weaponStat'),
  itemArmor:        () => _threeTabLayout('armorSummary', 'armorStat'),
  itemAugmentation: () => _threeTabLayout('augmentationSummary', 'augmentationStat'),
  itemGear:         () => _threeTabLayout('gearSummary', 'gearStat'),
  itemDevice:       () => _threeTabLayout('deviceSummary', 'deviceStat'),
  itemSpell:        () => _threeTabLayout('spellSummary', 'spellStat'),
  itemComplexForm:  () => _threeTabLayout('complexFormSummary', 'complexFormStat'),
  itemAdeptPower:   () => _threeTabLayout('adeptPowerSummary', 'adeptPowerStat'),
  itemQuality:      () => _threeTabLayout('qualitySummary', 'qualityStat'),
  itemProgram:      () => _threeTabLayout('programSummary', 'programStat'),
  itemFocus:        () => _threeTabLayout('focusSummary', 'focusStat'),
  itemDrug:         () => _threeTabLayout('drugSummary', 'drugStat'),
  itemRitual:       () => _threeTabLayout('ritualSummary', 'ritualStat'),
  itemPreparation:  () => _threeTabLayout('preparationSummary', 'preparationStat'),
  itemPower:        () => _threeTabLayout('powerSummary', 'powerStat'),
  itemMartialArt:   () => _threeTabLayout('martialArtSummary', 'martialArtStat'),
  itemTradition:    () => _threeTabLayout('traditionSummary', 'traditionStat'),
  itemSpirit:       () => _threeTabLayout('spiritSummary', 'spiritStat'),
  itemSprite:       () => _threeTabLayout('spriteSummary', 'spriteStat'),
  itemSpritePower:  () => _threeTabLayout('spritePowerSummary', 'spritePowerStat'),
  itemVehicleMod:   () => _threeTabLayout('vehicleModSummary', 'vehicleModStat'),
  'SRItem-vierge':  () => _threeTabLayout('viergeSummary', 'viergeStat'),

  // 2-tab: Description + Effects (no stat)
  itemMetamagic:    () => _descEffectsLayout('metamagicSummary'),
  itemMark:         () => _descEffectsLayout('markSummary'),
  itemEffect:       () => _descEffectsLayout('effectSummary'),
  itemEcho:         () => _descEffectsLayout('echoSummary'),

  // 2-tab: Description + Configuration (no effects)
  itemVehicle:      () => _descStatLayout('vehicleSummary', 'vehicleStat'),
  itemSin:          () => _descStatLayout('sinSummary', 'sinStat'),
  itemLifestyle:    () => _descStatLayout('lifestyleSummary', 'lifestyleStat'),
  itemContact:      () => _descStatLayout('contactSummary', 'contactStat'),
  itemAmmunition:   () => _descStatLayout('ammunitionSummary', 'ammunitionStat'),

  // 1-tab: Description only
  itemKarma:        () => _descOnlyLayout('karmaSummary'),
  itemKnowledge:    () => _descOnlyLayout('knowledgeSummary'),
  itemLanguage:     () => _descOnlyLayout('languageSummary'),
  itemNuyen:        () => _descOnlyLayout('nuyenSummary'),
}

// ---------------------------------------------------------------------------
//  Public API
// ---------------------------------------------------------------------------

export function getItemDefaultLayout(itemType) {
  const fn = ITEM_LAYOUTS[itemType]
  if (fn) return fn()
  // Fallback: 3-tab with gear blocks
  return _threeTabLayout('gearSummary', 'gearStat')
}
