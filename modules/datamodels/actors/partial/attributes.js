import { sr5ModsPartialModel } from '../../common/mods.js'

export class characterAttributesPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      attributes: new fields.SchemaField({
        body: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        agility: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        reaction: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        strength: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        willpower: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        logic: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        intuition: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        charisma: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
      }),
    }
  }
}
