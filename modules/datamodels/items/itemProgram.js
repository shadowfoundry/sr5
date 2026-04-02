import { descriptionPartialModel } from './partial/description.js'
import { boughtOrSoldPartialModel } from './partial/boughtOrSold.js'
import { activationPartialModel } from './partial/activation.js'
import { effectsPartialModel } from './partial/effects.js'
import { ratingPartialModel } from './partial/rating.js'

export class sr5ItemProgramDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...ratingPartialModel.defineSchema(),
      decks: new fields.ArrayField(new fields.ObjectField()),
      type: new fields.StringField({initial: ''}),
      model: new fields.StringField({initial: ''}),
      isModelBased: new fields.BooleanField({initial: false}),
    }
  }
}
