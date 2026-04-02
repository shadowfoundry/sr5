import {
  sr5ModsPartialModel 
} from '../../common/mods.js'

export class penaltiesPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const step = () => {
      return new fields.SchemaField({
        value: new fields.NumberField({
          initial: 0
        }),
        base: new fields.NumberField({
          initial: 3
        }),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      })
    }

    const penaltyWithBoxes = () => {
      return new fields.SchemaField({
        actual: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        boxReduction: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        step: step(),
      })
    }

    const penaltySimple = () => {
      return new fields.SchemaField({
        actual: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        })
      })
    }

    return {
      penalties: new fields.SchemaField({
        physical: penaltyWithBoxes(),
        stun: penaltyWithBoxes(),
        condition: penaltyWithBoxes(),
        matrix: penaltySimple(),
        magic: penaltySimple(),
        special: penaltySimple(),
      }),
    }
  }
}
