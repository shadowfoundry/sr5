import { sr5ModsPartialModel } from '../../common/mods.js'

export class damagePartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      damageValue: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
        isStrengthBased: new fields.BooleanField({initial: false}),
      }),
      damageType: new fields.StringField({initial: ''}),
      damageElement: new fields.StringField({initial: ''}),
      damageElementSecond: new fields.StringField({initial: ''}),
      armorPenetration: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      accuracy: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
        isPhysicalLimitBased: new fields.BooleanField({initial: false}),
      }),
    }
  }
}
