import { sr5ModsPartialModel } from '../../common/mods.js'

export class concealmentPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      concealment: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
      }),
    }
  }
}
