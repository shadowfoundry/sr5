export class ratingPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      itemRating: new fields.NumberField({
        initial: 0
      })
    }
  }
}
