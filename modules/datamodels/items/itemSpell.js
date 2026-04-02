import { descriptionPartialModel } from './partial/description.js'
import { activationPartialModel } from './partial/activation.js'
import { boughtOrSoldPartialModel } from './partial/boughtOrSold.js'
import { effectsPartialModel } from './partial/effects.js'
import { damagePartialModel } from './partial/damage.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ItemSpellDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...damagePartialModel.defineSchema(),
      category: new fields.StringField({initial: ''}),
      subCategory: new fields.StringField({initial: ''}),
      range: new fields.StringField({initial: ''}),
      duration: new fields.StringField({initial: ''}),
      type: new fields.StringField({initial: ''}),
      drain: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      drainValue: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      force: new fields.NumberField({initial: 0}),
      casterMagic: new fields.NumberField({initial: 0}),
      spellAreaOfEffect: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      spellAreaExtended: new fields.BooleanField({initial: false}),
      hits: new fields.NumberField({initial: 0}),
      manipulationDamaging: new fields.BooleanField({initial: false}),
      illusionSense: new fields.StringField({initial: ''}),
      detectionSense: new fields.StringField({initial: ''}),
      healthEssence: new fields.BooleanField({initial: false}),
      freeSustain: new fields.BooleanField({initial: false}),
      preparation: new fields.BooleanField({initial: false}),
      fetish: new fields.BooleanField({initial: false}),
      targetOfEffect: new fields.ArrayField(new fields.ObjectField()),
      resisted: new fields.BooleanField({initial: false}),
      defenseFirstAttribute: new fields.StringField({initial: ''}),
      defenseSecondAttribute: new fields.StringField({initial: ''}),
      quickening: new fields.BooleanField({initial: false}),
      karmaSpent: new fields.NumberField({initial: 0}),
    }
  }
}
