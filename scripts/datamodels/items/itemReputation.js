import { descriptionPartialModel } from './partial/description.js'

export class sr5ItemReputationDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      amount: new fields.NumberField({initial: 0}),
      type: new fields.StringField({initial: 'gain'}),
      reputationType: new fields.StringField({initial: 'streetCred'}),
      date: new fields.StringField({initial: ''}),
      gameDate: new fields.StringField({initial: ''}),
    }
  }
}
