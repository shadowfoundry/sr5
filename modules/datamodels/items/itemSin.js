import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  ratingPartialModel 
} from './partial/rating.js'
import {
  boughtOrSoldPartialModel 
} from './partial/boughtOrSold.js'

export class sr5ItemSinDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...ratingPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      nationality: new fields.StringField({
        initial: ''
      }),
      familySituation: new fields.StringField({
        initial: ''
      }),
      license: new fields.ArrayField(new fields.ObjectField()),
    }
  }
}
