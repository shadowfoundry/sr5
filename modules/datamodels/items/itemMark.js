export class sr5ItemMarkDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      value: new fields.NumberField({
        initial: 0
      }),
      owner: new fields.StringField({
        initial: ''
      }),
    }
  }
}
