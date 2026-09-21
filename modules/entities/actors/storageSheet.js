import {
  ActorSheetSR5 
} from "./baseSheet.js"

/**
 * An Actor sheet for a storage that has been put down on the map. It shows
 * what is inside, so anyone who can open it can go through it.
 */
export class SR5StorageSheet extends ActorSheetSR5 {
  static DEFAULT_OPTIONS = {
    classes: ["app", "window-app", "sr5", "actor", "storage"],
    position: {
      width: 560, height: 420 
    },
    window: {
      resizable: true 
    },
  }

  static PARTS = {
    sheet: {
      template: "systems/sr5/templates/actors/storage-sheet.hbs",
      root: true,
      scrollable: [".sr-panel"],
    },
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    this._prepareItems(context.actor)
    return context
  }

  _prepareItems(actor) {
    actor.contents = actor.items
      .filter(i => i.type !== "itemEffect")
      .sort((a, b) => a.name.localeCompare(b.name))
  }
}
