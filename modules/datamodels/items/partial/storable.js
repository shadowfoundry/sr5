/**
 * Gear that can be left behind in a storage: a stash, a safe, a backpack
 * dropped on the ground, a garage. Holds the id of the itemStorage it sits
 * in, empty when the item is carried.
 */
export class storablePartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      storedIn: new fields.StringField({
        initial: ''
      })
    }
  }
}
