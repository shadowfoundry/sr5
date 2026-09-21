import {
  SR5_EntityHelpers
} from '../entities/helpers.js'
import {
  SR5_SystemHelpers
} from '../system/utilitySystem.js'

/**
 * Certified credsticks: cash a character carries.
 *
 * SR5 p. 445: "Un créditube certifié n'est pas relié à une personne spécifique,
 * les fonds électroniques qui y sont encodés appartiennent au porteur […] Ils ne
 * disposent même pas de fonctions sans fil, il faut les brancher à un connecteur
 * universel pour retirer ou déposer de l'argent."
 *
 * Two kinds of money therefore live side by side:
 *
 * - the **ledger**, the `itemNuyen` transactions a character's sheet totals —
 *   accounted money, which leaves a trail;
 * - the **cash**, carried on credsticks — bearer money, which can be handed
 *   over, stashed, or taken off a body.
 *
 * Withdrawing writes an expense in the ledger and loads the stick; depositing
 * does the reverse. Nothing else moves money, so the two never double-count.
 */
export class SR5Credstick {

  /** Is this item a credstick? */
  static is(item) {
    return item?.type === 'itemGear' && item.system?.isCredstick === true
  }

  /** The credsticks an actor carries. */
  static carried(actor) {
    return actor?.items.filter(item => SR5Credstick.is(item)) ?? []
  }

  /** How much a stick holds. */
  static funds(item) {
    return Number(item?.system?.funds?.value ?? 0) || 0
  }

  /** What a stick can still take in. `max` of 0 means no ceiling. */
  static room(item) {
    const max = Number(item?.system?.funds?.max ?? 0) || 0
    return max ? Math.max(0, max - SR5Credstick.funds(item)) : Infinity
  }

  /** Cash on hand: everything loaded on the sticks the actor carries. */
  static cashOnHand(actor) {
    return SR5Credstick.carried(actor).reduce((sum, item) => sum + SR5Credstick.funds(item), 0)
  }

  /**
   * The ledger balance of a resource held as transactions.
   *
   * `system.nuyen.value` sums every transaction, expenses included, so it is
   * not a balance: the sheet reads gains minus losses (see `money.hbs`) and so
   * does this.
   */
  static ledgerBalance(actor) {
    const modifiers = actor?.system.nuyen?.modifiers ?? []
    const gains = SR5_EntityHelpers.modifiersOnlyPositivesSum(modifiers) || 0
    const losses = SR5_EntityHelpers.modifiersOnlyNegativesSum(modifiers) || 0
    return gains - losses
  }

  /* -------------------------------------------- */
  /*  Moving money                                */
  /* -------------------------------------------- */

  /**
   * Take money out of the ledger and load it onto a stick.
   *
   * @param {Actor} actor the bearer
   * @param {Item} credstick the stick being loaded
   * @param {number} amount nuyens to move
   * @returns {Promise<boolean>} whether the money moved
   */
  static async withdraw(actor, credstick, amount) {
    const sum = Math.floor(Number(amount) || 0)
    if (!SR5Credstick.#canAct(actor, credstick) || sum <= 0) return false

    const balance = SR5Credstick.ledgerBalance(actor)
    if (sum > balance) {
      ui.notifications.warn(game.i18n.format('SR5.WARN_CredstickNotEnoughFunds', {
        name: actor.name,
        amount: sum.toLocaleString(),
        balance: balance.toLocaleString(),
      }))
      return false
    }

    const room = SR5Credstick.room(credstick)
    if (sum > room) {
      ui.notifications.warn(game.i18n.format('SR5.WARN_CredstickFull', {
        name: credstick.name,
        room: room === Infinity ? '∞' : room.toLocaleString(),
      }))
      return false
    }

    await actor.createEmbeddedDocuments('Item', [
      SR5Credstick.#transaction('loss', sum, 'SR5.CredstickWithdrawalOf', credstick.name),
    ])
    await credstick.update({
      'system.funds.value': SR5Credstick.funds(credstick) + sum
    })

    SR5_SystemHelpers.srLog(3, `Credstick: ${actor.name} withdraws ${sum} onto ${credstick.name}`)
    await SR5Credstick.#announce(actor, 'SR5.CredstickWithdrawalChat', {
      actor: actor.name,
      amount: sum.toLocaleString(),
      name: credstick.name,
    })
    return true
  }

  /**
   * Put the cash on a stick back into the ledger.
   *
   * @param {Actor} actor the bearer
   * @param {Item} credstick the stick being emptied
   * @param {number} amount nuyens to move
   * @returns {Promise<boolean>} whether the money moved
   */
  static async deposit(actor, credstick, amount) {
    const sum = Math.floor(Number(amount) || 0)
    if (!SR5Credstick.#canAct(actor, credstick) || sum <= 0) return false

    const loaded = SR5Credstick.funds(credstick)
    if (sum > loaded) {
      ui.notifications.warn(game.i18n.format('SR5.WARN_CredstickNotEnoughOnStick', {
        name: credstick.name,
        amount: sum.toLocaleString(),
        loaded: loaded.toLocaleString(),
      }))
      return false
    }

    await credstick.update({
      'system.funds.value': loaded - sum
    })
    await actor.createEmbeddedDocuments('Item', [
      SR5Credstick.#transaction('gain', sum, 'SR5.CredstickDepositOf', credstick.name),
    ])

    SR5_SystemHelpers.srLog(3, `Credstick: ${actor.name} deposits ${sum} from ${credstick.name}`)
    await SR5Credstick.#announce(actor, 'SR5.CredstickDepositChat', {
      actor: actor.name,
      amount: sum.toLocaleString(),
      name: credstick.name,
    })
    return true
  }

  /* -------------------------------------------- */
  /*  Internals                                   */
  /* -------------------------------------------- */

  /** A ledger line, in the shape the sheet writes by hand. */
  static #transaction(type, amount, labelKey, credstickName) {
    return {
      name: game.i18n.format(labelKey, {
        name: credstickName
      }),
      type: 'itemNuyen',
      img: 'systems/sr5/assets/img/items/itemNuyen.svg',
      system: {
        amount,
        type,
        date: new Date().toISOString().slice(0, 10),
      },
    }
  }

  /** Only a bearer who owns both ends may move the money. */
  static #canAct(actor, credstick) {
    if (!actor?.isOwner) {
      ui.notifications.warn(game.i18n.localize('SR5.WARN_CredstickNotOwner'))
      return false
    }
    if (!SR5Credstick.is(credstick)) {
      ui.notifications.warn(game.i18n.localize('SR5.WARN_CredstickNotACredstick'))
      return false
    }
    return true
  }

  /** Money changing hands is worth a line in the log. */
  static async #announce(actor, key, data) {
    await foundry.documents.ChatMessage.create({
      speaker: foundry.documents.ChatMessage.getSpeaker({
        actor
      }),
      content: `<p>${game.i18n.format(key, data)}</p>`,
    })
  }
}
