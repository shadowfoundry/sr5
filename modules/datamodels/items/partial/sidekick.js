/**
 * Gear that unfolds into its own actor: a spirit, a sprite, an agent, a
 * contact, a vehicle, a pack dropped on the ground. Holds the picture its
 * token wears on the map, and the prototype token kept when the actor is
 * dismissed so the next summoning looks like the last one.
 */
export class sidekickPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      tokenImg: new fields.FilePathField({
        categories: ["IMAGE"],
        // A FilePathField rejects the empty string unless it is told to accept
        // it, and an item with no token picture of its own is the normal case.
        blank: true,
        initial: ''
      }),
      // Written back when the actor is dismissed. May be empty or partial on
      // older items, so never read it without a fallback.
      sideKickPrototypeToken: new fields.ObjectField(),
    }
  }
}
