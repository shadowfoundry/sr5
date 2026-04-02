import {
  sr5ModsPartialModel 
} from '../../common/mods.js'

export class characterInitiativesPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      initiatives: new fields.SchemaField({
        astralInit: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          dice: new fields.SchemaField({
            value: new fields.NumberField({
              initial: 0
            }),
            base: new fields.NumberField({
              initial: 2
            }),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
          }),
          isActive: new fields.BooleanField({
            initial: false
          }),
        }),
        matrixInit: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          dice: new fields.SchemaField({
            value: new fields.NumberField({
              initial: 0
            }),
            base: new fields.NumberField({
              initial: 0
            }),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
          }),
          isActive: new fields.BooleanField({
            initial: false
          }),
        }),
        physicalInit: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          dice: new fields.SchemaField({
            value: new fields.NumberField({
              initial: 0
            }),
            base: new fields.NumberField({
              initial: 1
            }),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
          }),
          isActive: new fields.BooleanField({
            initial: false
          }),
        }),
      }),
    }
  }
}
