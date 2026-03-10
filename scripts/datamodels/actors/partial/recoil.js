import { sr5ModsPartialModel } from '../../common/mods.js'

export class recoilPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      recoilCompensation: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
    }
  }
}
