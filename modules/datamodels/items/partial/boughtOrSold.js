import { sr5ModsPartialModel } from '../../common/mods.js'

export class boughtOrSoldPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      availability: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
        multiplier: new fields.StringField({initial: ''}),
      }),
      legality: new fields.StringField({initial: ''}),
      price: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
        multiplier: new fields.StringField({initial: ''}),
      }),
    }
  }
}
