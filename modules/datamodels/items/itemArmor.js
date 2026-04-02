import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  effectsPartialModel 
} from './partial/effects.js'
import {
  boughtOrSoldPartialModel 
} from './partial/boughtOrSold.js'
import {
  ratingPartialModel 
} from './partial/rating.js'
import {
  activationPartialModel 
} from './partial/activation.js'
import {
  concealmentPartialModel 
} from './partial/concealment.js'
import {
  wirelessPartialModel 
} from './partial/wireless.js'
import {
  capacityPartialModel 
} from './partial/capacity.js'
import {
  sr5ModsPartialModel 
} from '../common/mods.js'

export class sr5ItemArmorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      ...ratingPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...concealmentPartialModel.defineSchema(),
      ...wirelessPartialModel.defineSchema(),
      ...capacityPartialModel.defineSchema(),
      armorValue: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema()
      }),
      isPlugged: new fields.BooleanField({
        initial: false
      }),
      isCumulative: new fields.BooleanField({
        initial: false
      }),
      accessory: new fields.ArrayField(new fields.ObjectField()),
    }
  }
}
