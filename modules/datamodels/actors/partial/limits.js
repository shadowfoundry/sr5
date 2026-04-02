import { sr5ModsPartialModel } from '../../common/mods.js'

export class characterLimitsPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      limits: new fields.SchemaField({
        astralLimit: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        mentalLimit: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        physicalLimit: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        socialLimit: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      }),
    }
  }
}
