/**
 * Spell Shaping metamagic (SR5 p. 329).
 *
 * "For each -1 dice pool modifier taken on the Spellcasting test, he may either
 * increase the radius of a spell's area of effect by 1 metre, or create a
 * spherical 'bubble' one metre in radius inside the spell's area that the spell
 * leaves untouched. [...] He may not take a dice pool modifier greater in
 * absolute value than his Magic rating."
 *
 * A Spell Shaping focus adds its Force to that cap (SR5 p. 323); the system
 * already folds the focus into `magic.metamagics.spellShapingValue`.
 *
 * A one-metre bubble is smaller than a fifth of a grid square at the default
 * 1.5 m scale, so bubbles are not modelled as volumes. The system approximates
 * them as "one shaping point spares one character"; the rate is a world setting
 * because the book gives no conversion.
 */
export class SR5_SpellShapingHelpers {

  /**
   * Share the shaping points between radius and bubbles, never exceeding the cap.
   * The input the caster has just moved keeps its value; the other one is trimmed.
   *
   * @param {object} p
   * @param {number} p.area        metres of extra radius asked for
   * @param {number} p.spared      characters asked to be left untouched
   * @param {number} p.max         cap on the dice pool penalty (Magic + focus Force)
   * @param {number} p.bubbleCost  shaping points spent per spared character
   * @param {string} [p.changed]   "area" or "spared": which input was just moved
   * @returns {{area:number, spared:number, penalty:number, clamped:boolean}}
   */
  static share({
    area, spared, max, bubbleCost, changed
  }){
    let cap = SR5_SpellShapingHelpers._positive(max)
    let cost = Math.max(1, Math.floor(SR5_SpellShapingHelpers._positive(bubbleCost)) || 1)
    let wantedArea = SR5_SpellShapingHelpers._positive(area)
    let wantedSpared = SR5_SpellShapingHelpers._positive(spared)
    let keptArea = wantedArea
    let keptSpared = wantedSpared

    if (changed === "spared"){
      if (keptSpared * cost > cap) keptSpared = Math.floor(cap / cost)
      if (keptArea + keptSpared * cost > cap) keptArea = cap - keptSpared * cost
    } else {
      if (keptArea > cap) keptArea = cap
      if (keptArea + keptSpared * cost > cap) keptSpared = Math.floor((cap - keptArea) / cost)
    }

    return {
      area: keptArea,
      spared: keptSpared,
      penalty: keptArea + keptSpared * cost,
      clamped: (keptArea !== wantedArea) || (keptSpared !== wantedSpared),
    }
  }

  /**
   * The key a spared character is stored under: a synthetic (unlinked) actor is
   * identified by its token, so two copies of the same NPC are told apart.
   */
  static actorKey(actor){
    if (!actor) return null
    if (actor.isToken) return actor.token?.id ?? null
    return actor.id ?? null
  }

  /** Is this actor inside one of the bubbles the caster declared? */
  static isSpared(actor, spellData){
    if (!spellData || !Array.isArray(spellData.sparedActors) || !spellData.sparedActors.length) return false
    let key = SR5_SpellShapingHelpers.actorKey(actor)
    if (!key) return false
    return spellData.sparedActors.some(spared => spared.id === key)
  }

  /**
   * The one question the five resolution paths ask: does this card leave this
   * actor untouched? Pure on purpose — it says nothing and shows nothing, so it
   * can be tested without Foundry and so a path that also announces elsewhere
   * cannot print the message twice.
   */
  static skips(actor, chatData){
    if (chatData?.test?.type !== "spell") return false
    return SR5_SpellShapingHelpers.isSpared(actor, chatData.magic?.spell)
  }

  /** The single wording every path uses to say it. */
  static announceSpared(actor){
    ui.notifications.info(`${game.i18n.format("SR5.INFO_SparedBySpellShaping", {
      name: actor.name
    })}`)
  }

  static _positive(value){
    let parsed = parseInt(value)
    if (isNaN(parsed) || parsed < 0) return 0
    return parsed
  }
}
