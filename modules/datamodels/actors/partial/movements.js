import { sr5ModsPartialModel } from '../../common/mods.js'

export class characterMovementsPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const movementSchema = (limitBase) => ({
      movement: new fields.SchemaField({ ...sr5ModsPartialModel.defineSchema() }),
      extraMovement: new fields.SchemaField({ ...sr5ModsPartialModel.defineSchema() }),
      test: new fields.SchemaField({
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }),
      maximum: new fields.SchemaField({ ...sr5ModsPartialModel.defineSchema() }),
      limit: new fields.SchemaField({
        base: new fields.StringField({initial: limitBase}),
        value: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }),
    })

    return {
      movements: new fields.SchemaField({
        walk: new fields.SchemaField({
          ...movementSchema(""),
          multiplier: new fields.SchemaField({
            base: new fields.NumberField({initial: 2}),
            value: new fields.NumberField({initial: 0}),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
          }),
        }),
        run: new fields.SchemaField({
          ...movementSchema("physicalLimit"),
          multiplier: new fields.SchemaField({
            base: new fields.NumberField({initial: 4}),
            value: new fields.NumberField({initial: 0}),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
          }),
        }),
        horizontalJumpStanding: new fields.SchemaField({ ...movementSchema("physicalLimit") }),
        horizontalJumpRunning: new fields.SchemaField({ ...movementSchema("physicalLimit") }),
        verticalJump: new fields.SchemaField({ ...movementSchema("physicalLimit") }),
        swim: new fields.SchemaField({ ...movementSchema("physicalLimit") }),
        treadWater: new fields.SchemaField({ ...movementSchema("physicalLimit") }),
        holdBreath: new fields.SchemaField({ ...movementSchema("physicalLimit") }),
        fly: new fields.SchemaField({ ...movementSchema("physicalLimit") }),
      }),
    }
  }
}
