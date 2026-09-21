import {
  SR5_SystemHelpers 
} from '../system/utilitySystem.js'

/**
 * Purchases made from the compendium browser.
 *
 * A purchase is two documents: the gear itself, and an `itemNuyen` transaction
 * of type `loss` that the actor's nuyen total already knows how to subtract
 * (see `helpers.js`, where a modifier whose type ends in `_loss` is removed
 * from the value). Nothing writes `system.nuyen.value` directly.
 */
export class SR5Shop {

  /** Item types that carry their own quantity: they are bought as one stack. */
  static STACKABLE_TYPES = ['itemAmmunition', 'itemDrug', 'itemGear', 'itemWeapon']

  /**
   * The actors the current user may spend for: their own character and anything
   * they own, the whole roster for a gamemaster.
   */
  static getBuyers() {
    const actors = game.actors.filter(a => a.type === 'actorPc' &&
      (game.user.isGM || a.isOwner))
    return actors.sort((a, b) => a.name.localeCompare(b.name))
  }

  /** The default buyer: the user's character, else the only actor they own. */
  static defaultBuyerId(buyers) {
    if (game.user.character && buyers.some(a => a.id === game.user.character.id)) {
      return game.user.character.id
    }
    return buyers.length === 1 ? buyers[0].id : null
  }

  /** Anything with a price can be bought; that is what `boughtOrSold` marks. */
  static isPurchasable(entry) {
    return entry.docName === 'Item' && entry.system?.price !== undefined
  }

  /** Unit price, falling back to the book value when nothing was derived. */
  static unitPrice(system) {
    return Number(system?.price?.value ?? system?.price?.base ?? 0) || 0
  }

  /**
   * Buy `quantity` of the item at `uuid` for `actor`.
   * @returns {Promise<boolean>} whether the purchase went through
   */
  static async buy(actor, uuid, quantity = 1) {
    if (!actor) {
      ui.notifications.warn(game.i18n.localize('SR5.WARN_ShopNoBuyer'))
      return false
    }
    if (!actor.isOwner) {
      ui.notifications.warn(game.i18n.localize('SR5.WARN_ShopNotOwner'))
      return false
    }

    const source = await fromUuid(uuid)
    if (!source) return false

    const qty = Math.max(1, Math.floor(Number(quantity) || 1))
    const unit = SR5Shop.unitPrice(source.system)
    const total = unit * qty
    const balance = Number(actor.system.nuyen?.value ?? 0)

    if (total > balance) {
      ui.notifications.warn(game.i18n.format('SR5.WARN_ShopNotEnoughNuyen', {
        name: actor.name,
        price: total.toLocaleString(),
        balance: balance.toLocaleString(),
      }))
      return false
    }

    const itemData = source.toObject()
    delete itemData._id
    const stackable = SR5Shop.STACKABLE_TYPES.includes(itemData.type) &&
      itemData.system.quantity !== undefined
    const payload = []
    if (stackable) {
      itemData.system.quantity = qty
      payload.push(itemData)
    } else {
      for (let i = 0; i < qty; i++) payload.push(foundry.utils.deepClone(itemData))
    }

    const label = qty > 1 ? `${source.name} (x${qty})` : source.name
    payload.push({
      name: game.i18n.format('SR5.ShopPurchaseOf', {
        name: label 
      }),
      type: 'itemNuyen',
      img: 'systems/sr5/assets/img/items/itemNuyen.svg',
      system: {
        amount: total,
        type: 'loss',
        date: new Date().toISOString().slice(0, 10),
        description: game.i18n.format('SR5.ShopPurchaseDescription', {
          name: label, price: total.toLocaleString() 
        }),
      },
    })

    SR5_SystemHelpers.srLog(3, `Shop: ${actor.name} buys ${label} for ${total}`)
    await actor.createEmbeddedDocuments('Item', payload)

    await foundry.documents.ChatMessage.create({
      speaker: foundry.documents.ChatMessage.getSpeaker({
        actor 
      }),
      content: `<p>${game.i18n.format('SR5.ShopPurchaseChat', {
        actor: actor.name,
        name: label,
        price: total.toLocaleString(),
        balance: (balance - total).toLocaleString(),
      })}</p>`,
    })

    ui.notifications.info(game.i18n.format('SR5.ShopPurchaseDone', {
      name: label, price: total.toLocaleString() 
    }))
    return true
  }
}
