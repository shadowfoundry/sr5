import {
  SR5ShopAvailability
} from './shop-availability.js'
import {
  SR5Shop
} from './shop.js'
import {
  SR5_SystemHelpers
} from '../system/utilitySystem.js'

/**
 * Fencing gear, SR5 p. 421 (Fourguer du matériel).
 *
 * Two ways out of a character's pockets:
 *
 * - **Through a contact**: it takes the item on the spot, "pour un prix de 5 %
 *   de la valeur listée, multiplié par son indice de Loyauté". No test, no
 *   questions, less money.
 * - **On one's own**: an extended Etiquette + Charisma [Social] test of
 *   threshold 10 to find a buyer, the interval coming from the search delay
 *   table, then an opposed Negotiation + Charisma [Social] test for the price:
 *   "25 % du prix listé, plus 5 % par succès excédentaire du personnage, ou
 *   moins 5 % par succès excédentaire de l'acheteur."
 *
 * Every figure above is the default of a world setting, not a constant: a
 * table whose fences are greedier or more generous moves them without the
 * system carrying anyone's house rules.
 */
export class SR5ShopFence {

  /** The numbers the sale runs on, as configured. */
  static get rules() {
    const number = (key, fallback) => {
      const value = Number(game.settings.get('sr5', key))
      return Number.isFinite(value) ? value : fallback
    }
    return {
      // Share of the listed price a found buyer starts from
      basePercent: Math.max(0, number('sr5ShopFenceBasePercent', 25)),
      // Moved by each net hit of the haggling, either way
      stepPercent: Math.max(0, number('sr5ShopFenceStepPercent', 5)),
      // Threshold of the extended test to find a buyer
      searchThreshold: Math.max(1, number('sr5ShopFenceThreshold', 10)),
      // Share of the listed price a contact pays, per point of Loyalty
      contactPercent: Math.max(0, number('sr5ShopContactFencePercent', 5)),
      // The buyer's haggling pool: the book gives none, so the table sets it
      buyerPool: Math.max(0, number('sr5ShopFenceBuyerPool', 6)),
    }
  }

  /**
   * Items the character could put on the market: anything with a price.
   * Transactions, contacts and the like carry none and never show up here.
   */
  static sellableItems(actor) {
    return actor?.items.filter(item => item.system?.price !== undefined) ?? []
  }

  /**
   * Listed price of one unit of an owned item.
   *
   * Most owned stacks carry the unit price, but the quantity multiplier is
   * applied to some of them: a price that has grown to at least the book
   * price times the quantity is a pile, and is brought back to the unit.
   */
  static listedPrice(item) {
    const quantity = Math.max(1, Number(item.system?.quantity ?? 1))
    const price = SR5Shop.unitPrice(item.system)
    const base = Number(item.system?.price?.base ?? 0)
    const isStackTotal = quantity > 1 && base > 0 && price >= base * quantity
    return isStackTotal ? Math.round(price / quantity) : price
  }

  /** How much a contact hands over on the spot, per unit. */
  static contactOffer(item, contact) {
    const loyalty = Number(contact?.system?.loyalty ?? 0)
    return Math.round(SR5ShopFence.listedPrice(item) * SR5ShopFence.rules.contactPercent / 100 * loyalty)
  }

  /** The share of the listed price a haggled sale ends on. */
  static hagglePercent(netHits) {
    const {
      basePercent, stepPercent
    } = SR5ShopFence.rules
    return Math.max(0, basePercent + netHits * stepPercent)
  }

  /* -------------------------------------------- */
  /*  Selling                                     */
  /* -------------------------------------------- */

  /**
   * Sell straight to a contact: no test, the money is there.
   *
   * @param {Actor} actor
   * @param {Item} contact
   * @param {Array<{itemId: string, quantity: number}>} lines
   */
  static async sellToContact(actor, contact, lines) {
    if (!contact) {
      ui.notifications.warn(game.i18n.localize('SR5.WARN_ShopNoFence'))
      return null
    }
    const priced = SR5ShopFence.#priceLines(actor, lines, item => SR5ShopFence.contactOffer(item, contact))
    if (!priced.length) return null

    const cardData = {
      buyerId: actor.id,
      sellerName: actor.name,
      fenceName: contact.name,
      loyalty: Number(contact.system.loyalty ?? 0),
      percent: SR5ShopFence.rules.contactPercent,
      immediate: true,
      results: priced,
      total: priced.reduce((sum, line) => sum + line.total, 0),
    }
    cardData.totalLabel = `${cardData.total.toLocaleString()}¥`
    return SR5ShopFence.#postCard(actor, cardData)
  }

  /**
   * Sell on one's own: find a buyer, then haggle.
   *
   * @param {Actor} actor
   * @param {Array<{itemId: string, quantity: number}>} lines
   * @param {object} [options]
   * @param {boolean} [options.useAvailability] add the availability rating as a
   *   teamwork test to the search, as SR5 p. 421 allows
   * @param {number} [options.overridePool] search and haggling pool set by hand
   */
  static async sellOnMarket(actor, lines, options = {
  }) {
    const priced = SR5ShopFence.#priceLines(actor, lines, () => 0)
    if (!priced.length) return null

    const rules = SR5ShopFence.rules
    const override = Math.max(0, Math.floor(Number(options.overridePool) || 0))
    const etiquette = override || SR5ShopFence.#skillPool(actor, 'etiquette')
    const negotiation = override || SR5ShopFence.#skillPool(actor, 'negotiation')
    const limit = Number(actor.system.limits?.socialLimit?.value ?? 0)

    // Finding a buyer is easier for rare goods: the availability rating helps
    // as a teamwork test, its hits joining the searcher's pool (SR5 p. 421).
    const topAvailability = Math.max(...priced.map(line => line.availability), 0)
    let teamwork = 0
    if (options.useAvailability !== false && topAvailability) {
      const help = await SR5ShopAvailability.rollDice(topAvailability)
      teamwork = help.hits
    }

    const interval = SR5ShopAvailability.delayFor(priced.reduce((sum, l) => sum + l.listed * l.quantity, 0))
    const search = await SR5ShopFence.#extendedTest(etiquette + teamwork, rules.searchThreshold, limit)

    if (!search.reached) {
      const cardData = {
        buyerId: actor.id,
        sellerName: actor.name,
        immediate: false,
        searchFailed: true,
        searchPool: etiquette + teamwork,
        teamwork,
        threshold: rules.searchThreshold,
        searchHits: search.hits,
        searchRolls: search.rolls,
        delayLabel: SR5ShopAvailability.formatDelay(interval * search.rolls),
        results: priced.map(line => ({
          ...line, offerLabel: '—', total: 0
        })),
        total: 0,
        totalLabel: '0¥',
        glitch: search.glitch,
        criticalGlitch: search.criticalGlitch,
      }
      return SR5ShopFence.#postCard(actor, cardData)
    }

    // The haggling itself, against whatever pool the table gives the buyer.
    const mine = await SR5ShopAvailability.rollDice(negotiation)
    const theirs = await SR5ShopAvailability.rollDice(rules.buyerPool)
    const myHits = limit ? Math.min(mine.hits, limit) : mine.hits
    const netHits = myHits - theirs.hits
    const percent = SR5ShopFence.hagglePercent(netHits)

    for (const line of priced) {
      line.unitOffer = Math.round(line.listed * percent / 100)
      line.total = line.unitOffer * line.quantity
      line.offerLabel = `${line.total.toLocaleString()}¥`
    }

    const cardData = {
      buyerId: actor.id,
      sellerName: actor.name,
      immediate: false,
      searchFailed: false,
      searchPool: etiquette + teamwork,
      teamwork,
      threshold: rules.searchThreshold,
      searchHits: search.hits,
      searchRolls: search.rolls,
      delayLabel: SR5ShopAvailability.formatDelay(interval * search.rolls),
      hagglePool: negotiation,
      buyerPool: rules.buyerPool,
      myHits,
      theirHits: theirs.hits,
      netHits,
      percent,
      override: override || null,
      glitch: search.glitch || mine.glitch,
      criticalGlitch: search.criticalGlitch || mine.criticalGlitch,
      results: priced,
      total: priced.reduce((sum, line) => sum + line.total, 0),
    }
    cardData.totalLabel = `${cardData.total.toLocaleString()}¥`
    return SR5ShopFence.#postCard(actor, cardData)
  }

  /* -------------------------------------------- */
  /*  Internals                                   */
  /* -------------------------------------------- */

  /** A character's pool for a social skill, defaulting when untrained. */
  static #skillPool(actor, key) {
    const skill = actor.system.skills?.[key]
    const rating = Number(skill?.rating?.value ?? 0)
    const charisma = Number(actor.system.attributes?.charisma?.augmented?.value ?? 0)
    const pool = Number(skill?.test?.value ?? 0)
    if (pool) return pool
    // Defaulting, SR5 p. 55: an untrained social skill is Charisma - 1.
    return rating ? rating + charisma : Math.max(0, charisma - 1)
  }

  /** Resolve the lines against the character's own items. */
  static #priceLines(actor, lines, offerFor) {
    const priced = []
    for (const line of lines ?? []) {
      const item = actor.items.get(line.itemId)
      if (!item) continue
      const owned = Math.max(1, Number(item.system?.quantity ?? 1))
      const quantity = Math.min(owned, Math.max(1, Math.floor(Number(line.quantity) || 1)))
      const listed = SR5ShopFence.listedPrice(item)
      const unitOffer = offerFor(item)
      priced.push({
        itemId: item.id,
        name: item.name,
        quantity,
        listed,
        listedLabel: `${listed.toLocaleString()}¥`,
        availability: SR5ShopAvailability.availabilityOf(item.system),
        unitOffer,
        total: unitOffer * quantity,
        offerLabel: `${(unitOffer * quantity).toLocaleString()}¥`,
      })
    }
    return priced
  }

  /**
   * An extended test, SR5 p. 50: repeated rolls, one die fewer each time,
   * hits counted under the limit, until the threshold is reached or the pool
   * runs out.
   */
  static async #extendedTest(pool, threshold, limit) {
    let hits = 0, rolls = 0, glitch = false, criticalGlitch = false
    for (let dice = pool; dice > 0; dice--) {
      const roll = await SR5ShopAvailability.rollDice(dice)
      rolls++
      hits += limit ? Math.min(roll.hits, limit) : roll.hits
      if (roll.glitch) glitch = true
      if (roll.criticalGlitch) criticalGlitch = true
      if (criticalGlitch || hits >= threshold) break
    }
    return {
      hits, rolls, glitch, criticalGlitch, reached: hits >= threshold && !criticalGlitch,
    }
  }

  /** Post the sale card. */
  static async #postCard(actor, cardData) {
    cardData.canSell = cardData.total > 0
    SR5_SystemHelpers.srLog(3, `Shop: ${actor.name} fences for ${cardData.total}`, cardData)
    const content = await foundry.applications.handlebars.renderTemplate(
      'systems/sr5/templates/interface/shop-fence-card.hbs', cardData)
    await foundry.documents.ChatMessage.create({
      speaker: foundry.documents.ChatMessage.getSpeaker({
        actor
      }),
      content,
      flags: {
        sr5fence: cardData
      },
    })
    return cardData
  }

  /* -------------------------------------------- */
  /*  Chat card                                   */
  /* -------------------------------------------- */

  /** Wire the "cash the sale" button of a fence card. */
  static chatListeners(html, message) {
    html.querySelectorAll('[data-fence-action="sell"]').forEach(el => {
      el.addEventListener('click', async (event) => {
        event.preventDefault()
        const data = message.flags?.sr5fence
        const actor = game.actors.get(data?.buyerId)
        if (!actor?.isOwner) {
          ui.notifications.warn(game.i18n.localize('SR5.WARN_ShopNotOwner'))
          return
        }
        const sold = await SR5ShopFence.handOver(actor, data)
        if (!sold) return
        await message.update({
          content: message.content.replace(
            /<footer class="sr-shop-card-footer">[\s\S]*?<\/footer>/,
            `<footer class="sr-shop-card-footer"><span class="sr-shop-cashed">${
              game.i18n.localize('SR5.ShopSaleDone')}</span></footer>`),
        })
      })
    })
  }

  /**
   * Hand the goods over and credit the money.
   *
   * Selling removes gear from the sheet, so it only ever happens on this
   * explicit click, and only the quantity sold leaves the character.
   */
  static async handOver(actor, data) {
    const toDelete = [], toUpdate = []
    for (const line of data.results) {
      if (!line.total) continue
      const item = actor.items.get(line.itemId)
      if (!item) continue
      const owned = Number(item.system?.quantity ?? 0)
      if (owned > line.quantity) {
        toUpdate.push({
          _id: item.id, 'system.quantity': owned - line.quantity
        })
      } else {
        toDelete.push(item.id)
      }
    }

    const sold = data.results.filter(line => line.total)
    if (!sold.length) return false

    const label = sold.length === 1 ?
      SR5Shop.lineLabel(sold[0].name, sold[0].quantity) :
      game.i18n.format('SR5.ShopPurchaseLines', {
        count: sold.length
      })

    await actor.createEmbeddedDocuments('Item', [{
      name: game.i18n.format('SR5.ShopSaleOf', {
        name: label
      }),
      type: 'itemNuyen',
      img: 'systems/sr5/assets/img/items/itemNuyen.svg',
      system: {
        amount: data.total,
        type: 'gain',
        date: new Date().toISOString().slice(0, 10),
        description: game.i18n.format('SR5.ShopSaleDescription', {
          name: sold.map(line => SR5Shop.lineLabel(line.name, line.quantity)).join(', '),
          price: data.total.toLocaleString(),
        }),
      },
    }])
    if (toUpdate.length) await actor.updateEmbeddedDocuments('Item', toUpdate)
    if (toDelete.length) await actor.deleteEmbeddedDocuments('Item', toDelete)

    ui.notifications.info(game.i18n.format('SR5.ShopSaleCashed', {
      name: label, price: data.total.toLocaleString()
    }))
    return true
  }
}
