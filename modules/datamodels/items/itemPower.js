import { descriptionPartialModel } from './partial/description.js'
import { effectsPartialModel } from './partial/effects.js'
import { activationPartialModel } from './partial/activation.js'
import { ratingPartialModel } from './partial/rating.js'

export class sr5ItemPowerDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...ratingPartialModel.defineSchema(),
      actionType: new fields.StringField({initial: ''}),
      duration: new fields.StringField({initial: ''}),
      range: new fields.StringField({initial: ''}),
      type: new fields.StringField({initial: ''}),
      isActive: new fields.BooleanField({initial: false}),
      hits: new fields.NumberField({initial: 0}),
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
