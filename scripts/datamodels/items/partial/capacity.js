import { sr5ModsPartialModel } from '../../common/mods.js'

export class capacityPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      capacity: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
        multiplier: new fields.StringField({initial: ''}),
      }),
      capacityTaken: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
        multiplier: new fields.StringField({initial: ''}),
      }),
      isAccessory: new fields.BooleanField({initial: false}),
    }
  }
}
