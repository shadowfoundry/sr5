import {
  sr5ModsPartialModel 
} from '../../common/mods.js'

export class characterMagicAttributesPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      specialAttributes: new fields.SchemaField({
        magic: new fields.SchemaField({
          natural: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          }),
          augmented: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          }),
        }),
      }),
    }
  }
}
