import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  ratingPartialModel 
} from './partial/rating.js'
import {
  boughtOrSoldPartialModel 
} from './partial/boughtOrSold.js'
import {
  wirelessPartialModel 
} from './partial/wireless.js'
import {
  activationPartialModel 
} from './partial/activation.js'
import {
  concealmentPartialModel 
} from './partial/concealment.js'
import {
  effectsPartialModel 
} from './partial/effects.js'
import {
  capacityPartialModel 
} from './partial/capacity.js'

export class sr5ItemGearDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...ratingPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      ...wirelessPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...concealmentPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...capacityPartialModel.defineSchema(),
      quantity: new fields.NumberField({
        initial: 1
      }),
      charge: new fields.NumberField({
        initial: 0
      }),
      isMedkit: new fields.BooleanField({
        initial: false
      }),
      // A certified credstick carries money the way a magazine carries rounds:
      // it is bearer cash, so it moves with the item (SR5 p. 445).
      isCredstick: new fields.BooleanField({
        initial: false
      }),
      funds: new fields.SchemaField({
        // Nuyens currently loaded on the stick
        value: new fields.NumberField({
          initial: 0
        }),
        // Most it can be certified for. 0 means no ceiling.
        max: new fields.NumberField({
          initial: 0
        }),
      }),
      isPlugged: new fields.BooleanField({
        initial: false
      }),
      accessory: new fields.ArrayField(new fields.ObjectField()),
      canRollTest: new fields.BooleanField({
        initial: false
      }),
      test: new fields.SchemaField({
        dicePool: new fields.NumberField({
          initial: 0
        }),
        base: new fields.NumberField({
          initial: 0
        }),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
        type: new fields.StringField({
          initial: ''
        }),
      }),
    }
  }
}
