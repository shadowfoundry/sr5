import { sr5ModsPartialModel } from '../../common/mods.js'

const fields = foundry.data.fields

function _dicePoolSchema() {
  return new fields.SchemaField({
    dicePool: new fields.NumberField({initial: 0}),
    base: new fields.NumberField({initial: 0}),
    modifiers: new fields.ArrayField(new fields.ObjectField()),
  })
}

export function baseSkillSchema(linkedAttribute, limitBase, skillGroup, category, canDefault) {
  return {
    rating: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
    test: _dicePoolSchema(),
    linkedAttribute: new fields.StringField({initial: linkedAttribute}),
    limit: new fields.SchemaField({
      value: new fields.NumberField({initial: 0}),
      base: new fields.StringField({initial: limitBase}),
      modifiers: new fields.ArrayField(new fields.ObjectField()),
    }),
    skillGroup: new fields.StringField({initial: skillGroup}),
    category: new fields.StringField({initial: category}),
    canDefault: new fields.BooleanField({initial: canDefault}),
    specializations: new fields.StringField({initial: ''}),
  }
}

function _spellCategorySchema() {
  return new fields.SchemaField({
    combat: _dicePoolSchema(),
    detection: _dicePoolSchema(),
    illusion: _dicePoolSchema(),
    manipulation: _dicePoolSchema(),
    health: _dicePoolSchema(),
  })
}

function _spiritTypeSchema() {
  return new fields.SchemaField({
    air: _dicePoolSchema(), beasts: _dicePoolSchema(), water: _dicePoolSchema(),
    fire: _dicePoolSchema(), guidance: _dicePoolSchema(), guardian: _dicePoolSchema(),
    man: _dicePoolSchema(), homunculus: _dicePoolSchema(), task: _dicePoolSchema(),
    plant: _dicePoolSchema(), earth: _dicePoolSchema(), watcher: _dicePoolSchema(),
    noxious: _dicePoolSchema(), barren: _dicePoolSchema(), sludge: _dicePoolSchema(),
    plague: _dicePoolSchema(), abomination: _dicePoolSchema(), nuclear: _dicePoolSchema(),
    blood: _dicePoolSchema(), shedim: _dicePoolSchema(), masterShedim: _dicePoolSchema(),
  })
}

/** Returns a fresh map of all base skill SchemaFields (unparented). */
export function allSkillFields() {
  return {
    animalHandling: new fields.SchemaField({...baseSkillSchema('charisma', 'mentalLimit', '', 'technicalSkills', true)}),
    alchemy: new fields.SchemaField({
      ...baseSkillSchema('magic', 'preparationForce', 'enchantingGroup', 'magicSkills', false),
      spellCategory: _spellCategorySchema(),
    }),
    pilotAircraft: new fields.SchemaField({...baseSkillSchema('reaction', 'vehicleHandling', '', 'vehicleSkills', false)}),
    arcana: new fields.SchemaField({...baseSkillSchema('logic', 'astralLimit', '', 'magicSkills', true)}),
    exoticRangedWeapon: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', '', 'combatSkills', false)}),
    exoticMeleeWeapon: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', '', 'combatSkills', false)}),
    automatics: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', 'firearmsGroup', 'combatSkills', true)}),
    clubs: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', 'closeCombatGroup', 'combatSkills', true)}),
    throwingWeapons: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', '', 'combatSkills', true)}),
    archery: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', '', 'combatSkills', true)}),
    gunnery: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', '', 'vehicleSkills', true)}),
    heavyWeapons: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', '', 'combatSkills', true)}),
    blades: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', 'closeCombatGroup', 'combatSkills', true)}),
    armorer: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', '', 'technicalSkills', true)}),
    artisan: new fields.SchemaField({...baseSkillSchema('intuition', 'mentalLimit', '', 'technicalSkills', false)}),
    banishing: new fields.SchemaField({
      ...baseSkillSchema('magic', 'astralLimit', 'conjuringGroup', 'magicSkills', false),
      spiritType: _spiritTypeSchema(),
    }),
    biotechnology: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'biotechGroup', 'technicalSkills', false)}),
    chemistry: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', '', 'technicalSkills', false)}),
    freeFall: new fields.SchemaField({...baseSkillSchema('body', 'physicalLimit', '', 'physicalSkills', true)}),
    unarmedCombat: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', 'closeCombatGroup', 'combatSkills', true)}),
    astralCombat: new fields.SchemaField({...baseSkillSchema('willpower', 'astralLimit', '', 'magicSkills', false)}),
    counterspelling: new fields.SchemaField({
      ...baseSkillSchema('magic', 'astralLimit', 'sorceryGroup', 'magicSkills', false),
      spellCategory: _spellCategorySchema(),
    }),
    running: new fields.SchemaField({...baseSkillSchema('strength', 'physicalLimit', 'athleticsGroup', 'physicalSkills', true)}),
    artificing: new fields.SchemaField({...baseSkillSchema('magic', 'formulaForce', 'enchantingGroup', 'magicSkills', false)}),
    cybercombat: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'crackingGroup', 'technicalSkills', true)}),
    cybertechnology: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'biotechGroup', 'technicalSkills', false)}),
    disguise: new fields.SchemaField({...baseSkillSchema('intuition', 'mentalLimit', 'stealthGroup', 'physicalSkills', true)}),
    disenchanting: new fields.SchemaField({...baseSkillSchema('magic', 'astralLimit', 'enchantingGroup', 'magicSkills', false)}),
    sneaking: new fields.SchemaField({...baseSkillSchema('agility', 'physicalLimit', 'stealthGroup', 'physicalSkills', true)}),
    instruction: new fields.SchemaField({...baseSkillSchema('charisma', 'socialLimit', '', 'socialSkills', true)}),
    palming: new fields.SchemaField({...baseSkillSchema('agility', 'physicalLimit', 'stealthGroup', 'physicalSkills', false)}),
    con: new fields.SchemaField({...baseSkillSchema('charisma', 'socialLimit', 'actingGroup', 'socialSkills', true)}),
    etiquette: new fields.SchemaField({...baseSkillSchema('charisma', 'socialLimit', 'influenceGroup', 'socialSkills', true)}),
    escapeArtist: new fields.SchemaField({...baseSkillSchema('agility', 'physicalLimit', '', 'physicalSkills', true)}),
    demolitions: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', '', 'technicalSkills', true)}),
    forgery: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', '', 'technicalSkills', true)}),
    longarms: new fields.SchemaField({...baseSkillSchema('agility', 'weaponAccuracy', 'firearmsGroup', 'combatSkills', true)}),
    electronicWarfare: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'crackingGroup', 'technicalSkills', false)}),
    gymnastics: new fields.SchemaField({...baseSkillSchema('agility', 'physicalLimit', 'athleticsGroup', 'physicalSkills', true)}),
    hacking: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'crackingGroup', 'technicalSkills', true)}),
    impersonation: new fields.SchemaField({...baseSkillSchema('charisma', 'socialLimit', 'actingGroup', 'socialSkills', true)}),
    computer: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'electronicsGroup', 'technicalSkills', true)}),
    intimidation: new fields.SchemaField({...baseSkillSchema('charisma', 'socialLimit', '', 'socialSkills', true)}),
    summoning: new fields.SchemaField({
      ...baseSkillSchema('magic', 'spiritForce', 'conjuringGroup', 'magicSkills', false),
      spiritType: _spiritTypeSchema(),
    }),
    spellcasting: new fields.SchemaField({
      ...baseSkillSchema('magic', 'spellForce', 'sorceryGroup', 'magicSkills', false),
      spellCategory: _spellCategorySchema(),
    }),
    leadership: new fields.SchemaField({...baseSkillSchema('charisma', 'socialLimit', 'influenceGroup', 'socialSkills', true)}),
    binding: new fields.SchemaField({
      ...baseSkillSchema('magic', 'spiritForce', 'conjuringGroup', 'magicSkills', false),
      spiritType: _spiritTypeSchema(),
    }),
    software: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'electronicsGroup', 'technicalSkills', false)}),
    ritualSpellcasting: new fields.SchemaField({
      ...baseSkillSchema('magic', 'spellForce', 'sorceryGroup', 'magicSkills', false),
      spellCategory: _spellCategorySchema(),
    }),
    walker: new fields.SchemaField({...baseSkillSchema('reaction', 'vehicleHandling', '', 'vehicleSkills', false)}),
    hardware: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'electronicsGroup', 'technicalSkills', false)}),
    aeronauticsMechanic: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'engineeringGroup', 'technicalSkills', false)}),
    automotiveMechanic: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'engineeringGroup', 'technicalSkills', false)}),
    industrialMechanic: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'engineeringGroup', 'technicalSkills', false)}),
    nauticalMechanic: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'engineeringGroup', 'technicalSkills', false)}),
    medecine: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'biotechGroup', 'technicalSkills', false)}),
    swimming: new fields.SchemaField({...baseSkillSchema('strength', 'physicalLimit', 'athleticsGroup', 'physicalSkills', true)}),
    negotiation: new fields.SchemaField({...baseSkillSchema('charisma', 'socialLimit', 'influenceGroup', 'socialSkills', true)}),
    assensing: new fields.SchemaField({...baseSkillSchema('intuition', 'astralLimit', '', 'magicSkills', false)}),
    navigation: new fields.SchemaField({...baseSkillSchema('intuition', 'mentalLimit', 'outdoorsGroup', 'technicalSkills', true)}),
    perception: new fields.SchemaField({
      ...baseSkillSchema('intuition', 'mentalLimit', '', 'physicalSkills', true),
      perceptionType: new fields.SchemaField({
        sight: new fields.SchemaField({ test: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}), limit: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}) }),
        hearing: new fields.SchemaField({ test: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}), limit: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}) }),
        smell: new fields.SchemaField({ test: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}), limit: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}) }),
        touch: new fields.SchemaField({ test: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}), limit: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}) }),
        taste: new fields.SchemaField({ test: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}), limit: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}) }),
      }),
    }),
    tracking: new fields.SchemaField({...baseSkillSchema('intuition', 'mentalLimit', 'outdoorsGroup', 'physicalSkills', true)}),
    pistols: new fields.SchemaField({...baseSkillSchema('agility', 'waeponAccuracy', 'firearmsGroup', 'combatSkills', true)}),
    diving: new fields.SchemaField({...baseSkillSchema('body', 'physicalLimit', '', 'physicalSkills', true)}),
    firstAid: new fields.SchemaField({...baseSkillSchema('logic', 'mentalLimit', 'biotechGroup', 'technicalSkills', true)}),
    performance: new fields.SchemaField({...baseSkillSchema('charisma', 'socialLimit', 'actingGroup', 'socialSkills', true)}),
    locksmith: new fields.SchemaField({...baseSkillSchema('agility', 'physicalLimit', '', 'technicalSkills', false)}),
    survival: new fields.SchemaField({...baseSkillSchema('willpower', 'physicalLimit', 'outdoorsGroup', 'physicalSkills', true)}),
    pilotExoticVehicle: new fields.SchemaField({...baseSkillSchema('reaction', 'vehicleHandling', '', 'vehicleSkills', false)}),
    pilotWatercraft: new fields.SchemaField({...baseSkillSchema('reaction', 'vehicleHandling', '', 'vehicleSkills', true)}),
    pilotAerospace: new fields.SchemaField({...baseSkillSchema('reaction', 'vehicleHandling', '', 'vehicleSkills', false)}),
    pilotGroundCraft: new fields.SchemaField({...baseSkillSchema('reaction', 'vehicleHandling', '', 'vehicleSkills', true)}),
  }
}

export class skillsPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      skills: new fields.SchemaField(allSkillFields()),
      languageSkills: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      knowledgeSkills: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
    }
  }
}
