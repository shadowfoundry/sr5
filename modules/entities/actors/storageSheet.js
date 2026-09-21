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
   * Whoever is taking: anyone can go through a pack left on the ground, not
   * just the character who put it down.
   *
   * Opening the storage means clicking its own token, which selects it, so a
   * selection is only trusted once the storage itself is out of it. Anything
   * else is asked rather than guessed.
   */
  async _looter() {
    const selected = (canvas.tokens?.controlled ?? [])
      .map(t => t.actor)
      .filter(a => a && a.id !== this.actor.id && a.isOwner)
    if (selected.length === 1) return selected[0]

    const candidates = (canvas.tokens?.placeables ?? [])
      .map(t => t.actor)
      .filter(a => a && a.id !== this.actor.id && a.isOwner && a.type !== "actorStorage")
      .filter((a, i, all) => all.findIndex(b => b.id === a.id) === i)
      .sort((a, b) => a.name.localeCompare(b.name))

    if (!candidates.length) {
      ui.notifications.warn(game.i18n.localize("SR5.WARN_StorageLootNobody"))
      return null
    }

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/sr5/templates/interface/storage-loot-who.hbs", {
        storageName: this.actor.name,
        candidates: candidates.map(a => ({
          id: a.id, name: a.name, img: a.img 
        })),
      })
    const result = await foundry.applications.api.DialogV2.wait({
      window: {
        title: game.i18n.localize("SR5.StorageLootWho") 
      },
      content: content,
      buttons: [
        {
          action: "ok",
          label: game.i18n.localize("SR5.StorageLoot"),
          default: true,
          callback: (event, button, dialog) => ({
            action: "ok", element: dialog.element 
          }),
        },
        {
          action: "cancel",
          label: game.i18n.localize("Cancel"),
          callback: () => ({
            action: "cancel" 
          }),
        },
      ],
      rejectClose: false,
    })
    if (!result || result.action !== "ok") return null
    const chosen = result.element.querySelector("[name=looter]:checked")?.value
    return candidates.find(a => a.id === chosen) ?? null
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
    // Read the row before anything is awaited: the browser clears
    // currentTarget as soon as the handler returns, and asking who takes it
    // can open a dialog.
    const itemId = event.currentTarget.dataset.itemId
    const looter = await this._looter()
    if (!looter) return
    const item = this.actor.items.get(itemId)
    if (item) await this._giveTo(looter, [item])
  }

  async _onStorageLootAll(event) {
    event.preventDefault()
    const looter = await this._looter()
    if (!looter) return
    await this._giveTo(looter, [...this.actor.items])
  }

  _prepareItems(actor) {
    actor.contents = actor.items
      .filter(i => i.type !== "itemEffect")
      .sort((a, b) => a.name.localeCompare(b.name))
  }
}
