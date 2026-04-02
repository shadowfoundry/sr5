import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  effectsPartialModel 
} from './partial/effects.js'
import {
  activationPartialModel 
} from './partial/activation.js'
import {
  ratingPartialModel 
} from './partial/rating.js'
import {
  sr5ModsPartialModel 
} from '../common/mods.js'

export class sr5ItemAdeptPowerDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...ratingPartialModel.defineSchema(),
      actionType: new fields.StringField({
        initial: ''
      }),
      hits: new fields.NumberField({
        initial: 0
      }),
      powerPointsCost: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
        isRatingBased: new fields.BooleanField({
          initial: false
        }),
      }),
      needRoll: new fields.BooleanField({
        initial: false
      }),
      testFirstAttribute: new fields.StringField({
        initial: ''
      }),
      testSecondAttribute: new fields.StringField({
        initial: ''
      }),
      test: new fields.SchemaField({
        dicePool: new fields.NumberField({
          initial: 0
        }),
        base: new fields.NumberField({
          initial: 0
        }),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }),
      targetOfEffect: new fields.ArrayField(new fields.ObjectField()),
      hasDrain: new fields.BooleanField({
        initial: false
      }),
      drainType: new fields.StringField({
        initial: ''
      }),
      drainMultiplier: new fields.NumberField({
        initial: 1
      }),
      drainValue: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema()
      }),
    }
  }
}
