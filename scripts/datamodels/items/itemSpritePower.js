import { descriptionPartialModel } from './partial/description.js'
import { effectsPartialModel } from './partial/effects.js'
import { activationPartialModel } from './partial/activation.js'

export class sr5ItemSpritePowerDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      hits: new fields.NumberField({initial: 0}),
      testSkill: new fields.StringField({initial: ''}),
      testLimit: new fields.StringField({initial: ''}),
      defenseAttribute: new fields.StringField({initial: ''}),
      defenseMatrixAttribute: new fields.StringField({initial: ''}),
      test: new fields.SchemaField({
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }),
    }
  }
}
