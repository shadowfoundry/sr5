export class characterDerivedAttributesPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const derivedAttribute = () => {
      return new fields.SchemaField({
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      })
    }

    return {
      derivedAttributes: new fields.SchemaField({
        composure: derivedAttribute(),
        judgeIntentions: derivedAttribute(),
        memory: derivedAttribute(),
        surprise: derivedAttribute(),
      }),
    }
  }
}
