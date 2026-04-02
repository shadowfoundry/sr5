export class characterResistancesPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const resistance = () => {
      return new fields.SchemaField({
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      })
    }

    return {
      resistances: new fields.SchemaField({
        astralDamage: resistance(),
        physicalDamage: resistance(),
        directSpellMana: resistance(),
        directSpellPhysical: resistance(),
        disease: new fields.SchemaField({
          contact: resistance(),
          ingestion: resistance(),
          inhalation: resistance(),
          injection: resistance(),
        }),
        toxin: new fields.SchemaField({
          contact: resistance(),
          ingestion: resistance(),
          inhalation: resistance(),
          injection: resistance(),
        }),
        specialDamage: new fields.SchemaField({
          acid: resistance(),
          water: resistance(),
          electricity: resistance(),
          fire: resistance(),
          cold: resistance(),
          pollution: resistance(),
          radiation: resistance(),
          toxin: resistance(),
          sound: resistance(),
        }),
        fatigue: resistance(),
        fall: resistance(),
      }),
    }
  }
}
