import { descriptionPartialModel } from './partial/description.js'
import { boughtOrSoldPartialModel } from './partial/boughtOrSold.js'

export class sr5ItemAmmunitionDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      quantity: new fields.NumberField({initial: 1}),
      type: new fields.StringField({initial: ''}),
      class: new fields.StringField({initial: ''}),
      caseType: new fields.StringField({initial: ''}),
      rating: new fields.StringField({initial: ''}),
    }
  }
}
