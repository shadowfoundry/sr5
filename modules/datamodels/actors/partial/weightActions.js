import {
  sr5ModsPartialModel 
} from '../../common/mods.js'

export class characterWeightActionsPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const test = () => {
      return new fields.SchemaField({
        dicePool: new fields.NumberField({
          initial: 0
        }),
        base: new fields.NumberField({
          initial: 0
        }),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      })
    }

    const weightAction = () => {
      return new fields.SchemaField({
        baseWeight: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        extraWeight: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        test: test(),
      })
    }

    return {
      weightActions: new fields.SchemaField({
        carry: weightAction(),
        lift: weightAction(),
        liftAboveHead: weightAction(),
      }),
    }
  }
}
