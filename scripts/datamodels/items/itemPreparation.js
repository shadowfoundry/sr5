import { descriptionPartialModel } from './partial/description.js'
import { activationPartialModel } from './partial/activation.js'
import { effectsPartialModel } from './partial/effects.js'
import { damagePartialModel } from './partial/damage.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ItemPreparationDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...damagePartialModel.defineSchema(),
      category: new fields.StringField({initial: ''}),
      subCategory: new fields.StringField({initial: ''}),
      range: new fields.StringField({initial: ''}),
      duration: new fields.StringField({initial: ''}),
      type: new fields.StringField({initial: ''}),
      force: new fields.NumberField({initial: 0}),
      drainValue: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      spellAreaOfEffect: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      spellAreaExtended: new fields.BooleanField({initial: false}),
      hits: new fields.NumberField({initial: 0}),
      manipulationDamaging: new fields.BooleanField({initial: false}),
      illusionSense: new fields.StringField({initial: ''}),
      detectionSense: new fields.StringField({initial: ''}),
      healthEssence: new fields.BooleanField({initial: false}),
      freeSustain: new fields.BooleanField({initial: true}),
      lynchpin: new fields.StringField({initial: ''}),
      trigger: new fields.StringField({initial: ''}),
      potency: new fields.NumberField({initial: 0}),
      test: new fields.SchemaField({
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }),
    }
  }
}
