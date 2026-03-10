export class effectsPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      customEffects: new fields.ArrayField(new fields.ObjectField()),
      itemEffects: new fields.ArrayField(new fields.ObjectField()),
      systemEffects: new fields.ArrayField(new fields.ObjectField()),
    }
  }
}
