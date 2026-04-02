import { descriptionPartialModel } from './partial/description.js'
import { effectsPartialModel } from './partial/effects.js'
import { activationPartialModel } from './partial/activation.js'

export class sr5ItemMartialArtDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      actionType: new fields.StringField({initial: ''}),
      rank: new fields.NumberField({initial: 0}),
      needRoll: new fields.BooleanField({initial: false}),
      testFirstAttribute: new fields.StringField({initial: ''}),
      testSecondAttribute: new fields.StringField({initial: ''}),
      defenseFirstAttribute: new fields.StringField({initial: ''}),
      defenseSecondAttribute: new fields.StringField({initial: ''}),
      test: new fields.SchemaField({
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }),
      targetOfEffect: new fields.ArrayField(new fields.ObjectField()),
    }
  }
}
