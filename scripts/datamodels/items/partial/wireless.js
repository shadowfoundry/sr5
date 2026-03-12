import { sr5ModsPartialModel } from '../../common/mods.js'

export class wirelessPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      isWireless: new fields.BooleanField({initial: true}),
      wirelessTurnedOn: new fields.BooleanField({initial: true}),
      deviceRating: new fields.NumberField({initial: 0}),
      conditionMonitors: new fields.SchemaField({
        matrix: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
      }),
      isSlavedToPan: new fields.BooleanField({initial: false}),
      panMaster: new fields.StringField({initial: ''}),
      marks: new fields.ArrayField(new fields.ObjectField()),
    }
  }
}
