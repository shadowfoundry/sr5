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

export class sr5ItemQualityDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...ratingPartialModel.defineSchema(),
      type: new fields.StringField({
        initial: ''
      }),
      karmaCost: new fields.NumberField({
        initial: 0
      }),
    }
  }
}
