import {
  descriptionPartialModel 
} from './partial/description.js'

export class sr5ItemKarmaDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      amount: new fields.NumberField({
        initial: 0
      }),
      type: new fields.StringField({
        initial: 'gain'
      }),
      date: new fields.StringField({
        initial: ''
      }),
    }
  }
}
