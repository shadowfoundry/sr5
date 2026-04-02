import { sr5ModsPartialModel } from '../../common/mods.js'

export class characterEssencePartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      essence: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
        base: new fields.NumberField({initial: 6}),
      }),
    }
  }
}
