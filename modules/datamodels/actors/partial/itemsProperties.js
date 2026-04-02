import {
  sr5ModsPartialModel 
} from '../../common/mods.js'

export class itemsPropertiesPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      itemsProperties: new fields.SchemaField({
        weapon: new fields.SchemaField({
          damageValue: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          }),
          accuracy: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          }),
        }),
        armor: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          specialDamage: new fields.SchemaField({
            acid: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            water: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            electricity: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            fire: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            cold: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            pollution: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            radiation: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            toxin: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            sound: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
          }),
          toxin: new fields.SchemaField({
            contact: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            ingestion: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            inhalation: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
            injection: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
          }),
          padded: new fields.BooleanField({
            initial: false
          }),
        }),
        environmentalMod: new fields.SchemaField({
          visibility: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          }),
          light: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          }),
          glare: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          }),
          wind: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          }),
          range: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          }),
        }),
        martialArts: new fields.SchemaField({
          breakWeapon: new fields.SchemaField({
            isActive: new fields.BooleanField({
              initial: false
            }),
            modifier: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
          }),
          disarm: new fields.SchemaField({
            isActive: new fields.BooleanField({
              initial: false
            }),
            modifier: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
          }),
          entanglement: new fields.SchemaField({
            isActive: new fields.BooleanField({
              initial: false
            }),
            modifier: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
          }),
          feint: new fields.SchemaField({
            isActive: new fields.BooleanField({
              initial: false
            }),
            modifier: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
          }),
          pin: new fields.SchemaField({
            isActive: new fields.BooleanField({
              initial: false
            }),
            modifier: new fields.SchemaField({
              ...sr5ModsPartialModel.defineSchema()
            }),
          }),
        }),
      }),
    }
  }
}
