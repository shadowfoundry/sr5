export class descriptionPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      description: new fields.HTMLField({
        initial: ''
      }),
      gameEffect: new fields.HTMLField({
        initial: ''
      }),
      source: new fields.StringField({
        initial: ''
      }),
      page: new fields.StringField({
        initial: ''
      }),
    }
  }
}
