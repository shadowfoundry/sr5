export class characterDefensesPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const defenseLimit = (base) => {
      return new fields.SchemaField({
        base: new fields.StringField({initial: base}),
        value: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      })
    }

    const defense = (limitBase) => {
      return new fields.SchemaField({
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
        limit: defenseLimit(limitBase),
      })
    }

    return {
      defenses: new fields.SchemaField({
        defend: defense(''),
        dodge: defense('physicalLimit'),
        block: defense('physicalLimit'),
        parryBlades: defense('physicalLimit'),
        parryClubs: defense('physicalLimit'),
      }),
    }
  }
}
