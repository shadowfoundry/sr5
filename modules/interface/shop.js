import {
  SR5_EntityHelpers 
} from '../entities/helpers.js'
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

  /**
   * What the character can actually spend.
   *
   * `system.nuyen.value` is the sum of every transaction, expenses included, so
   * it is not a balance. The sheet reads its total as gains minus losses (see
   * `money.hbs`, helpers `gainModifiersSum` / `lossModifiersSum`) and so do we,
   * otherwise a purchase would look affordable on a spent-out character.
   */
  static balance(actor) {
    const modifiers = actor?.system.nuyen?.modifiers ?? []
    const gains = SR5_EntityHelpers.modifiersOnlyPositivesSum(modifiers) || 0
    const losses = SR5_EntityHelpers.modifiersOnlyNegativesSum(modifiers) || 0
    return gains - losses
  }

  /** Unit price, falling back to the book value when nothing was derived. */
  static unitPrice(system) {
    return Number(system?.price?.value ?? system?.price?.base ?? 0) || 0
  }

  /**
   * Creation mode: gear is handed over without being charged.
   *
   * A character built outside Foundry arrives with its purchases already paid
   * for on paper, and a player fixing a badly entered item would be charged a
   * second time. The switch is remembered per user, not per world, so a
   * gamemaster equipping a character does not change anything for the table.
   */
  static get creationMode() {
    return game.settings.get('sr5', 'sr5ShopCreationMode') === true
  }

  /**
   * The documents to create for `quantity` of `source`.
   *
   * Types that carry their own quantity become one stack; the others are
   * created as that many separate items.
   */
  static _itemPayload(source, quantity) {
    const itemData = source.toObject()
    delete itemData._id
    const stackable = SR5Shop.STACKABLE_TYPES.includes(itemData.type) &&
      itemData.system.quantity !== undefined
    if (stackable) {
      itemData.system.quantity = quantity
      return [itemData]
    }
    const payload = []
    for (let i = 0; i < quantity; i++) payload.push(foundry.utils.deepClone(itemData))
    return payload
  }

  /** `Nom (x3)` when there is more than one. */
  static lineLabel(name, quantity) {
    return quantity > 1 ? `${name} (x${quantity})` : name
  }

  /**
   * Hand `lines` over to `actor` and charge for the lot in one transaction.
   *
   * Everything goes through here — a single buy button is a checkout of one
   * line — so the cart, the buy button and a purchase confirmed by an
   * availability test all write the same two things: the gear, and one
   * `itemNuyen` of type `loss` carrying the total.
   *
   * @param {Actor} actor
   * @param {Array<{uuid: string, quantity: number}>} lines
   * @returns {Promise<boolean>} whether the gear was added
   */
  static async checkout(actor, lines) {
    if (!actor) {
      ui.notifications.warn(game.i18n.localize('SR5.WARN_ShopNoBuyer'))
      return false
    }
    if (!actor.isOwner) {
      ui.notifications.warn(game.i18n.localize('SR5.WARN_ShopNotOwner'))
      return false
    }
    if (!lines?.length) return false

    // A line whose source has vanished from its compendium is dropped rather
    // than silently charged for.
    const resolved = []
    for (const line of lines) {
      const source = await fromUuid(line.uuid)
      if (!source) {
        ui.notifications.warn(game.i18n.format('SR5.WARN_ShopItemGone', {
          name: line.name ?? line.uuid 
        }))
        continue
      }
      const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1))
      const unit = SR5Shop.unitPrice(source.system)
      resolved.push({
        source, quantity, unit, total: unit * quantity 
      })
    }
    if (!resolved.length) return false

    const total = resolved.reduce((sum, line) => sum + line.total, 0)
    const balance = SR5Shop.balance(actor)
    const free = SR5Shop.creationMode

    if (!free && total > balance) {
      ui.notifications.warn(game.i18n.format('SR5.WARN_ShopNotEnoughNuyen', {
        name: actor.name,
        price: total.toLocaleString(),
        balance: balance.toLocaleString(),
      }))
      return false
    }

    const payload = []
    for (const line of resolved) payload.push(...SR5Shop._itemPayload(line.source, line.quantity))

    const labels = resolved.map(line => SR5Shop.lineLabel(line.source.name, line.quantity))
    const label = labels.length === 1 ?
      labels[0] :
      game.i18n.format('SR5.ShopPurchaseLines', {
        count: labels.length 
      })

    if (!free) payload.push({
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
          name: labels.join(', '), price: total.toLocaleString() 
        }),
      },
    })

    SR5_SystemHelpers.srLog(3, `Shop: ${actor.name} ${free ? 'receives' : 'buys'} ${label} (${total})`)
    await actor.createEmbeddedDocuments('Item', payload)

    // Creation mode charges nothing, so it says nothing to the table either.
    if (!free) {
      const rows = resolved.map(line =>
        `<li>${SR5Shop.lineLabel(line.source.name, line.quantity)} — ${line.total.toLocaleString()}&yen;</li>`).join('')
      const detail = resolved.length > 1 ? `<ul>${rows}</ul>` : ''
      await foundry.documents.ChatMessage.create({
        speaker: foundry.documents.ChatMessage.getSpeaker({
          actor 
        }),
        content: `<p>${game.i18n.format('SR5.ShopPurchaseChat', {
          actor: actor.name,
          name: label,
          price: total.toLocaleString(),
          balance: (balance - total).toLocaleString(),
        })}</p>${detail}`,
      })
    }

    ui.notifications.info(free ?
      game.i18n.format('SR5.ShopCreationDone', {
        name: label 
      }) :
      game.i18n.format('SR5.ShopPurchaseDone', {
        name: label, price: total.toLocaleString() 
      }))
    return true
  }

  /** Buy a single line — the buy button on a result row. */
  static async buy(actor, uuid, quantity = 1) {
    return SR5Shop.checkout(actor, [{
      uuid, quantity 
    }])
  }
}
