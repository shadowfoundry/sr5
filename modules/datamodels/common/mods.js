export class sr5ModsPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      value: new fields.NumberField({
        initial: 0
      }),
      base: new fields.NumberField({
        initial: 0
      }),
      modifiers: new fields.ArrayField(new fields.ObjectField()),
    }
  }
}
