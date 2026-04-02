export class activationPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {isActive: new fields.BooleanField({initial: false})}
  }
}
