import {
  sr5ModsPartialModel 
} from '../../common/mods.js'

export class characterReachPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      reach: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema()
      })
    }
  }
}
