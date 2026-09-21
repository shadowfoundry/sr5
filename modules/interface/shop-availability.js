import {
  SR5Shop
} from './shop.js'
import {
  SR5_SystemHelpers
} from '../system/utilitySystem.js'

/**
 * The availability test of SR5 p. 420.
 *
 * "Pour acheter un objet, il faut faire un test de Disponibilité. Il s'agit
 * d'un test opposé entre Négociation + Charisme [Sociale] contre l'indice de
 * Disponibilité de l'objet." The winner's net hits divide the search time of
 * the delay table; a tie still finds the goods but takes twice as long; a
 * failure means waiting twice the delay before trying again.
 *
 * Each line of a cart is its own object, so each one gets its own test.
 */
export class SR5ShopAvailability {

  /**
   * Charisma maxima per metatype (SR5 p. 68, table Attributs par métatype).
   * Only used to cap a contact whose sheet was never filled in.
   */
  static CHARISMA_MAX = {
    human: 6, elf: 8, dwarf: 6, ork: 5, troll: 4,
  }

  /** Search times, SR5 p. 420 (table Délais de recherche). */
  static DELAYS = [
    {
      max: 100, hours: 6
    },
    {
      max: 1000, hours: 24
    },
    {
      max: 10000, hours: 48
    },
    {
      max: 100000, hours: 24 * 7
    },
    {
      max: Infinity, hours: 24 * 30
    },
  ]

  /* -------------------------------------------- */
  /*  Dice pools                                  */
  /* -------------------------------------------- */

  /** The buyer's own pool: Negotiation + Charisma, capped by the social limit. */
  static buyerPool(actor) {
    const skill = actor.system.skills?.negotiation
    const pool = Number(skill?.test?.value ?? 0) ||
      (Number(skill?.rating?.value ?? 0) + Number(actor.system.attributes?.charisma?.augmented?.value ?? 0))
    return {
      pool,
      limit: Number(actor.system.limits?.socialLimit?.value ?? 0),
      label: actor.name,
      derived: false,
    }
  }

  /**
   * The contact's pool, SR5 p. 420: "il utilise ses propres scores de
   * Négociation et Charisme pour le test de Disponibilité, et son indice
   * d'Influence est ajouté à sa limite Sociale."
   *
   * The sheet is read field by field, and only what is missing is filled in:
   *
   * - Charisma and Negotiation written on the contact are used as they stand.
   * - A contact with a Charisma but no Negotiation defaults, `Charisma - 1`
   *   (SR5 p. 55, se défausser); Negotiation is not one of the skills that
   *   forbid it.
   * - A field left at zero on a sheet that was never filled in is read off the
   *   Connection rating: Run Faster p. 174 (Statistiques rapides pour contacts)
   *   scales a contact's attribute and skill points with its Connection, so a
   *   well-connected one is assumed to have put them where its trade is.
   *
   * The card states which of the three it was, rather than passing a guess off
   * as a sheet value.
   */
  static contactPool(contact) {
    const system = contact.system
    const connection = Number(system.connection ?? 0)
    // A contact is an item, not an actor: nothing derives its values, so the
    // computed field is empty until something prepares it. Read what was
    // typed on the sheet when the derived value is not there.
    const sheetCharisma = SR5ShopAvailability.sheetValue(system.attributes?.charisma?.augmented) ||
      SR5ShopAvailability.sheetValue(system.attributes?.charisma?.natural)
    const sheetNegotiation = SR5ShopAvailability.sheetValue(system.skills?.negotiation?.rating)

    const cap = SR5ShopAvailability.CHARISMA_MAX[system.metatype] ??
      SR5ShopAvailability.CHARISMA_MAX.human
    const charisma = sheetCharisma || Math.min(cap, 3 + connection)

    // Defaulting only makes sense against a Charisma the sheet really carries:
    // deriving one and then taking a penalty on it would be guesswork twice.
    const defaulting = !sheetNegotiation && sheetCharisma > 0
    const negotiation = sheetNegotiation ||
      (defaulting ? 0 : Math.min(12, 2 + connection))

    // A specialization belongs to a skill the contact actually has.
    const specialized = negotiation > 0 && SR5ShopAvailability.isDealer(system.type)
    const pool = defaulting ?
      Math.max(0, charisma - 1) :
      charisma + negotiation + (specialized ? 2 : 0)

    // Social limit: the contact's own when its sheet computes one, otherwise
    // the usual formula on whatever attributes it carries, plus its Connection.
    const willpower = SR5ShopAvailability.sheetValue(system.attributes?.willpower?.augmented) ||
      SR5ShopAvailability.sheetValue(system.attributes?.willpower?.natural) || 3
    const essence = SR5ShopAvailability.sheetValue(system.essence) || 6
    const ownLimit = SR5ShopAvailability.sheetValue(system.limits?.socialLimit)
    const limit = (ownLimit || Math.ceil((charisma * 2 + willpower + essence) / 3)) + connection

    return {
      pool, limit, charisma, negotiation, connection, specialized, defaulting,
      // What the card should say about where the pool came from
      derived: !sheetCharisma && !sheetNegotiation,
      partial: (!sheetCharisma && sheetNegotiation > 0),
      label: contact.name,
    }
  }

  /** A sheet field's computed value, or what was typed into it. */
  static sheetValue(field) {
    return Number(field?.value ?? 0) || Number(field?.base ?? 0) || 0
  }

  /**
   * Does this contact deal in goods? Matched on the free-text type field.
   *
   * A keyword in -eur also matches its -euse form, so "Receleuse" answers to
   * "receleur" without the table having to list both. Everything else is a
   * plain containment, which already covers plurals and feminines in -e.
   */
  static isDealer(type) {
    if (!type) return false
    const keywords = String(game.settings.get('sr5', 'sr5ShopDealerKeywords') || '')
      .split(',').map(k => SR5ShopAvailability.normalize(k)).filter(k => k.length)
    const needle = SR5ShopAvailability.normalize(type)
    return keywords.some(k => needle.includes(k) ||
      (k.endsWith('eur') && needle.includes(`${k.slice(0, -3)}eus`)))
  }

  /** Lowercase, accents removed: "Récéleur" and "receleur" are the same word. */
  static normalize(text) {
    return String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
  }

  /** The contacts the buyer can call on. */
  static getContacts(actor) {
    return actor?.items.filter(i => i.type === 'itemContact') ?? []
  }

  /* -------------------------------------------- */
  /*  The test                                    */
  /* -------------------------------------------- */

  /** Availability rating of a compendium entry, letter aside. */
  static availabilityOf(system) {
    return Number(system?.availability?.value ?? system?.availability?.base ?? 0) || 0
  }

  /** Search time for a price, SR5 p. 420. */
  static delayFor(price) {
    return SR5ShopAvailability.DELAYS.find(step => price <= step.max).hours
  }

  /** Hours as a sentence: 6 heures, 2 jours, 1 semaine… */
  static formatDelay(hours) {
    if (hours < 24) {
      return game.i18n.format('SR5.ShopDelayHours', {
        value: Math.round(hours * 10) / 10
      })
    }
    const days = hours / 24
    if (days < 7) {
      return game.i18n.format('SR5.ShopDelayDays', {
        value: Math.round(days * 10) / 10
      })
    }
    if (days < 30) {
      return game.i18n.format('SR5.ShopDelayWeeks', {
        value: Math.round(days / 7 * 10) / 10
      })
    }
    return game.i18n.format('SR5.ShopDelayMonths', {
      value: Math.round(days / 30 * 10) / 10
    })
  }

  /**
   * Roll `dice` d6 the SR5 way.
   * @returns {{hits: number, ones: number, glitch: boolean, criticalGlitch: boolean, faces: number[]}}
   */
  static async rollDice(dice) {
    const count = Math.max(0, Math.floor(dice))
    if (!count) {
      return {
        hits: 0, ones: 0, glitch: false, criticalGlitch: false, faces: []
      }
    }
    const roll = await new Roll(`${count}d6`).evaluate()
    const faces = roll.dice[0].results.map(r => r.result)
    const hits = faces.filter(f => f >= 5).length
    const ones = faces.filter(f => f === 1).length
    const glitch = ones * 2 >= count
    return {
      hits, ones, glitch, criticalGlitch: glitch && hits === 0, faces, roll,
    }
  }

  /**
   * Run one test per line and post a single card.
   *
   * @param {Actor} actor the buyer
   * @param {Item|null} contact the contact doing the looking, if any
   * @param {Array<{uuid: string, quantity: number, name: string}>} lines
   * @param {number} surcharge percentage of the price the buyer offers on top
   * @param {object} [options]
   * @param {number} [options.overridePool] a pool typed in by hand, which
   *   replaces the computed one — for a contact written up somewhere else, or
   *   a gamemaster who simply knows what the fixer is worth
   * @param {number} [options.overrideLimit] the limit that goes with it
   */
  static async testLines(actor, contact, lines, surcharge = 0, options = {
  }) {
    if (!actor) {
      ui.notifications.warn(game.i18n.localize('SR5.WARN_ShopNoBuyer'))
      return null
    }
    if (!lines?.length) return null

    const searcher = contact ? SR5ShopAvailability.contactPool(contact) : SR5ShopAvailability.buyerPool(actor)

    // "pour chaque tranche de 25 % du prix de l'objet que l'acheteur est prêt
    // à payer en plus, il gagne un dé supplémentaire", up to +12 (SR5 p. 420)
    const bonusDice = Math.min(12, Math.floor(Math.max(0, surcharge) / 25))
    const override = Math.max(0, Math.floor(Number(options.overridePool) || 0))
    const basePool = override || searcher.pool
    const pool = Math.max(0, basePool + bonusDice)
    const limit = override ?
      Math.max(0, Math.floor(Number(options.overrideLimit) || 0)) :
      searcher.limit

    const results = []
    for (const line of lines) {
      const source = await fromUuid(line.uuid)
      if (!source) continue
      const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1))
      const availability = SR5ShopAvailability.availabilityOf(source.system)
      const unit = Math.round(SR5Shop.unitPrice(source.system) * (1 + Math.max(0, surcharge) / 100))
      const price = unit * quantity

      // No availability rating: "Les objets sans Disponibilité peuvent être
      // achetés sans soucis" (SR5 p. 419). No test, straight to the counter.
      if (!availability) {
        results.push({
          uuid: line.uuid, name: source.name, quantity, price, availability: 0,
          priceLabel: `${price.toLocaleString()}¥`,
          outcome: 'common', obtained: true, delayLabel: '—',
          outcomeLabel: game.i18n.localize('SR5.ShopOutcome_common'),
        })
        continue
      }

      const test = await SR5ShopAvailability.rollDice(pool)
      const opposition = await SR5ShopAvailability.rollDice(availability)
      const hits = limit ? Math.min(test.hits, limit) : test.hits
      const netHits = hits - opposition.hits
      const baseDelay = SR5ShopAvailability.delayFor(price)

      let outcome, obtained, delay
      if (test.criticalGlitch) {
        // "En cas d'échec critique […] le personnage n'a aucune chance
        // d'acquérir l'objet convoité."
        outcome = 'criticalGlitch'
        obtained = false
        delay = null
      } else if (netHits > 0) {
        outcome = test.glitch ? 'successGlitch' : 'success'
        obtained = true
        delay = baseDelay / netHits
      } else if (netHits === 0) {
        // "En cas d'égalité, le personnage parvient à se procurer l'objet,
        // mais le temps de recherche est le double."
        outcome = test.glitch ? 'tieGlitch' : 'tie'
        obtained = true
        delay = baseDelay * 2
      } else {
        // "En cas d'échec, il est possible de réessayer après avoir attendu
        // le double du délai de recherche."
        outcome = 'failure'
        obtained = false
        delay = baseDelay * 2
      }

      results.push({
        uuid: line.uuid,
        name: source.name,
        quantity,
        price,
        priceLabel: `${price.toLocaleString()}¥`,
        availability,
        hits,
        opposition: opposition.hits,
        netHits,
        outcome,
        obtained,
        glitch: test.glitch,
        delayLabel: delay === null ? '—' : SR5ShopAvailability.formatDelay(delay),
        outcomeLabel: game.i18n.localize(`SR5.ShopOutcome_${outcome}`),
      })
    }

    if (!results.length) return null

    const obtained = results.filter(r => r.obtained)
    const total = obtained.reduce((sum, r) => sum + r.price, 0)
    const cardData = {
      buyerId: actor.id,
      buyerName: actor.name,
      searcherLabel: searcher.label,
      isContact: !!contact,
      // A hand-typed pool owes nothing to the contact's sheet, so neither the
      // derivation note nor the specialization applies to it.
      derived: !override && !!searcher.derived,
      partial: !override && !!searcher.partial,
      defaulting: !override && !!searcher.defaulting,
      specialized: !override && !!searcher.specialized,
      override: override || null,
      connection: searcher.connection ?? null,
      pool,
      bonusDice,
      surcharge,
      limit,
      results,
      total,
      totalLabel: `${total.toLocaleString()}¥`,
      canBuy: obtained.length > 0,
    }

    SR5_SystemHelpers.srLog(3, `Shop: availability test for ${actor.name} (pool ${pool})`, cardData)

    const content = await foundry.applications.handlebars.renderTemplate(
      'systems/sr5/templates/interface/shop-availability-card.hbs', cardData)

    await foundry.documents.ChatMessage.create({
      speaker: foundry.documents.ChatMessage.getSpeaker({
        actor
      }),
      content,
      flags: {
        sr5shop: cardData
      },
    })

    return cardData
  }

  /* -------------------------------------------- */
  /*  Chat card                                   */
  /* -------------------------------------------- */

  /** Wire the "cash the purchase" button of an availability card. */
  static chatListeners(html, message) {
    html.querySelectorAll('[data-shop-action="checkout"]').forEach(el => {
      el.addEventListener('click', async (event) => {
        event.preventDefault()
        const data = message.flags?.sr5shop
        if (!data) return
        const actor = game.actors.get(data.buyerId)
        const lines = data.results.filter(r => r.obtained).map(r => ({
          uuid: r.uuid, quantity: r.quantity, name: r.name,
        }))
        const bought = await SR5Shop.checkout(actor, lines)
        // The goods are cashed once: the button goes, the card stays.
        if (bought) {
          await message.update({
            content: message.content.replace(
              /<footer class="sr-shop-card-footer">[\s\S]*?<\/footer>/,
              `<footer class="sr-shop-card-footer"><span class="sr-shop-cashed">${
                game.i18n.localize('SR5.ShopAlreadyCashed')}</span></footer>`),
          })
        }
      })
    })
  }
}
