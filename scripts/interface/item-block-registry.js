/**
 * Item Block Registry — single source of truth for all SR5 item sheet blocks.
 *
 * Each block maps to a Handlebars partial that can be rendered inside any
 * panel on any tab. Mirrors the actor block-registry.js pattern.
 */

const PARTIAL_ROOT = 'systems/sr5/templates/items'
const ICON_ROOT = 'systems/sr5/img/icons'

// ---------------------------------------------------------------------------
//  Size constants (reuse from actor block-registry)
// ---------------------------------------------------------------------------

export const ITEM_BLOCK_SIZE = Object.freeze({
  SINGLE: 'single',
  DOUBLE: 'double',
})

// ---------------------------------------------------------------------------
//  Tab icons — SVG partials rendered in the header icon nav
// ---------------------------------------------------------------------------

export const ITEM_TAB_ICONS = {
  info:     `${ICON_ROOT}/nav-information.svg.hbs`,
  bio:      `${ICON_ROOT}/nav-bio.svg.hbs`,
  stat:     `${ICON_ROOT}/nav-configuration.svg.hbs`,
  effects:  `${ICON_ROOT}/nav-modifiers.svg.hbs`,
}

// ---------------------------------------------------------------------------
//  Block definitions — { partial, label, size }
// ---------------------------------------------------------------------------

export const ITEM_BLOCK_REGISTRY = {

  // ---- Shared blocks (used across many item types) ----
  itemDescription:   { partial: `${PARTIAL_ROOT}/_partial/editable/_common/descriptionGameEffect-edit.html`, label: 'SR5.Description',   size: ITEM_BLOCK_SIZE.SINGLE },
  itemEffects:       { partial: `${PARTIAL_ROOT}/_partial/effect/effect.html`,                               label: 'SR5.ItemModifiers', size: ITEM_BLOCK_SIZE.SINGLE },

  // ---- SIDEBAR summary blocks (one per item type) ----
  weaponSummary:       { partial: `${PARTIAL_ROOT}/blocks/weapon/weapon-summary.html`,             label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  armorSummary:        { partial: `${PARTIAL_ROOT}/blocks/armor/armor-summary.html`,               label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  augmentationSummary: { partial: `${PARTIAL_ROOT}/blocks/augmentation/augmentation-summary.html`, label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  gearSummary:         { partial: `${PARTIAL_ROOT}/blocks/gear/gear-summary.html`,                 label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  deviceSummary:       { partial: `${PARTIAL_ROOT}/blocks/device/device-summary.html`,             label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  spellSummary:        { partial: `${PARTIAL_ROOT}/blocks/spell/spell-summary.html`,               label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  complexFormSummary:  { partial: `${PARTIAL_ROOT}/blocks/complexForm/complexForm-summary.html`,   label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  adeptPowerSummary:   { partial: `${PARTIAL_ROOT}/blocks/adeptPower/adeptPower-summary.html`,     label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  qualitySummary:      { partial: `${PARTIAL_ROOT}/blocks/quality/quality-summary.html`,           label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  programSummary:      { partial: `${PARTIAL_ROOT}/blocks/program/program-summary.html`,           label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  focusSummary:        { partial: `${PARTIAL_ROOT}/blocks/focus/focus-summary.html`,               label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  drugSummary:         { partial: `${PARTIAL_ROOT}/blocks/drug/drug-summary.html`,                 label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  ritualSummary:       { partial: `${PARTIAL_ROOT}/blocks/ritual/ritual-summary.html`,             label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  preparationSummary:  { partial: `${PARTIAL_ROOT}/blocks/preparation/preparation-summary.html`,   label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  powerSummary:        { partial: `${PARTIAL_ROOT}/blocks/power/power-summary.html`,               label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  contactSummary:      { partial: `${PARTIAL_ROOT}/blocks/contact/contact-summary.html`,           label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  lifestyleSummary:    { partial: `${PARTIAL_ROOT}/blocks/lifestyle/lifestyle-summary.html`,       label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  sinSummary:          { partial: `${PARTIAL_ROOT}/blocks/sin/sin-summary.html`,                   label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  ammunitionSummary:   { partial: `${PARTIAL_ROOT}/blocks/ammunition/ammunition-summary.html`,     label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  vehicleSummary:      { partial: `${PARTIAL_ROOT}/blocks/vehicle/vehicle-summary.html`,           label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  vehicleModSummary:   { partial: `${PARTIAL_ROOT}/blocks/vehicleMod/vehicleMod-summary.html`,    label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  martialArtSummary:   { partial: `${PARTIAL_ROOT}/blocks/martialArt/martialArt-summary.html`,    label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  traditionSummary:    { partial: `${PARTIAL_ROOT}/blocks/tradition/tradition-summary.html`,       label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  spiritSummary:       { partial: `${PARTIAL_ROOT}/blocks/spirit/spirit-summary.html`,             label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  spriteSummary:       { partial: `${PARTIAL_ROOT}/blocks/sprite/sprite-summary.html`,             label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  spritePowerSummary:  { partial: `${PARTIAL_ROOT}/blocks/spritePower/spritePower-summary.html`,   label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  metamagicSummary:    { partial: `${PARTIAL_ROOT}/blocks/metamagic/metamagic-summary.html`,       label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  echoSummary:         { partial: `${PARTIAL_ROOT}/blocks/echo/echo-summary.html`,                 label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  markSummary:         { partial: `${PARTIAL_ROOT}/blocks/mark/mark-summary.html`,                 label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  effectSummary:       { partial: `${PARTIAL_ROOT}/blocks/effect/effect-summary.html`,             label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  karmaSummary:        { partial: `${PARTIAL_ROOT}/blocks/karma/karma-summary.html`,               label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  knowledgeSummary:    { partial: `${PARTIAL_ROOT}/blocks/knowledge/knowledge-summary.html`,       label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  languageSummary:     { partial: `${PARTIAL_ROOT}/blocks/language/language-summary.html`,         label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  nuyenSummary:        { partial: `${PARTIAL_ROOT}/blocks/nuyen/nuyen-summary.html`,               label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },
  viergeSummary:       { partial: `${PARTIAL_ROOT}/blocks/vierge/vierge-summary.html`,             label: 'SR5.Summary', size: ITEM_BLOCK_SIZE.SINGLE },

  // ---- MAIN stat/config blocks (one per item type that has a config tab) ----
  weaponStat:          { partial: `${PARTIAL_ROOT}/blocks/weapon/weapon-stat.html`,                label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  armorStat:           { partial: `${PARTIAL_ROOT}/blocks/armor/armor-stat.html`,                  label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  augmentationStat:    { partial: `${PARTIAL_ROOT}/blocks/augmentation/augmentation-stat.html`,    label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  gearStat:            { partial: `${PARTIAL_ROOT}/blocks/gear/gear-stat.html`,                    label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  deviceStat:          { partial: `${PARTIAL_ROOT}/blocks/device/device-stat.html`,                label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  spellStat:           { partial: `${PARTIAL_ROOT}/blocks/spell/spell-stat.html`,                  label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  complexFormStat:     { partial: `${PARTIAL_ROOT}/blocks/complexForm/complexForm-stat.html`,      label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  adeptPowerStat:      { partial: `${PARTIAL_ROOT}/blocks/adeptPower/adeptPower-stat.html`,        label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  qualityStat:         { partial: `${PARTIAL_ROOT}/blocks/quality/quality-stat.html`,              label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  programStat:         { partial: `${PARTIAL_ROOT}/blocks/program/program-stat.html`,              label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  focusStat:           { partial: `${PARTIAL_ROOT}/blocks/focus/focus-stat.html`,                  label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  drugStat:            { partial: `${PARTIAL_ROOT}/blocks/drug/drug-stat.html`,                    label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  ritualStat:          { partial: `${PARTIAL_ROOT}/blocks/ritual/ritual-stat.html`,                label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  preparationStat:     { partial: `${PARTIAL_ROOT}/blocks/preparation/preparation-stat.html`,      label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  powerStat:           { partial: `${PARTIAL_ROOT}/blocks/power/power-stat.html`,                  label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  contactStat:         { partial: `${PARTIAL_ROOT}/blocks/contact/contact-stat.html`,              label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  lifestyleStat:       { partial: `${PARTIAL_ROOT}/blocks/lifestyle/lifestyle-stat.html`,          label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  sinStat:             { partial: `${PARTIAL_ROOT}/blocks/sin/sin-stat.html`,                      label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  ammunitionStat:      { partial: `${PARTIAL_ROOT}/blocks/ammunition/ammunition-stat.html`,        label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  vehicleStat:         { partial: `${PARTIAL_ROOT}/blocks/vehicle/vehicle-stat.html`,              label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  vehicleModStat:      { partial: `${PARTIAL_ROOT}/blocks/vehicleMod/vehicleMod-stat.html`,       label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  martialArtStat:      { partial: `${PARTIAL_ROOT}/blocks/martialArt/martialArt-stat.html`,        label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  traditionStat:       { partial: `${PARTIAL_ROOT}/blocks/tradition/tradition-stat.html`,          label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  spiritStat:          { partial: `${PARTIAL_ROOT}/blocks/spirit/spirit-stat.html`,                label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  spriteStat:          { partial: `${PARTIAL_ROOT}/blocks/sprite/sprite-stat.html`,                label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  spritePowerStat:     { partial: `${PARTIAL_ROOT}/blocks/spritePower/spritePower-stat.html`,      label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
  viergeStat:          { partial: `${PARTIAL_ROOT}/blocks/vierge/vierge-stat.html`,                label: 'SR5.ItemConfiguration', size: ITEM_BLOCK_SIZE.SINGLE },
}
