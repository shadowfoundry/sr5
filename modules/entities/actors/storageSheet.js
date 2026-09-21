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

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options)
    const element = this.element
    const on = (sel, evt, fn) => element.querySelectorAll(sel).forEach(el => el.addEventListener(evt, fn))
    on(".storage-loot", "click", this._onStorageLoot.bind(this))
    on(".storage-loot-all", "click", this._onStorageLootAll.bind(this))
  }

  /**
   * Whoever is taking: the selected token's actor, not the character who put
   * the storage down — anyone can go through a pack left on the ground.
   */
  _looter() {
    const selected = canvas.tokens?.controlled ?? []
    if (selected.length !== 1) {
      ui.notifications.warn(game.i18n.localize("SR5.WARN_StorageLootNoToken"))
      return null
    }
    const looter = selected[0].actor
    if (!looter?.isOwner) {
      ui.notifications.warn(game.i18n.localize("SR5.WARN_StorageLootNotYours"))
      return null
    }
    return looter
  }

  // Hand the items over, carried rather than stored: they have been picked up.
  async _giveTo(looter, items) {
    if (!items.length) return
    const data = items.map(i => {
      const object = i.toObject(false)
      if (object.system.storedIn !== undefined) object.system.storedIn = ""
      return object
    })
    await looter.createEmbeddedDocuments("Item", data)
    await this.actor.deleteEmbeddedDocuments("Item", items.map(i => i.id))
    ui.notifications.info(game.i18n.format("SR5.StorageLooted", {
      count: items.length, actor: looter.name, storage: this.actor.name,
    }))
  }

  async _onStorageLoot(event) {
    event.preventDefault()
    const looter = this._looter()
    if (!looter) return
    const item = this.actor.items.get(event.currentTarget.dataset.itemId)
    if (item) await this._giveTo(looter, [item])
  }

  async _onStorageLootAll(event) {
    event.preventDefault()
    const looter = this._looter()
    if (!looter) return
    await this._giveTo(looter, [...this.actor.items])
  }

  _prepareItems(actor) {
    actor.contents = actor.items
      .filter(i => i.type !== "itemEffect")
      .sort((a, b) => a.name.localeCompare(b.name))
  }
}
