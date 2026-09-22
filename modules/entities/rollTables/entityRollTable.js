// Random tables that can say "how many".
//
// Core draws a table once and yields one copy of whatever line came up. A
// loot table wants neither: "roll 1d4+1 times on this table", and "this line
// gives 2d6 rounds of ammunition". Better Roll Tables carried both for years
// and stopped at Foundry 0.8; they live here now, as two flags read by the
// document classes themselves, so every way of drawing a table honours them —
// the sheet's button, the sidebar's context menu, a link in a journal, a macro.
//
//   flags.sr5.rollsFormula     on a RollTable   how many times to draw
//   flags.sr5.quantityFormula  on a TableResult how many the line yields
//   flags.sr5.nuyenFormula     on a RollTable   how much money came with it
//
// A quantity on a line that points at another table means something stronger
// than a count: that inner table is rolled that many times, so "1d3 armes"
// draws one to three different weapons rather than three copies of one.

import {
  sr5PayoutFooter, sr5LootManifest
} from "../../interface/table-payout.js"

/** The flag namespace the formulas live under. */
const NAMESPACE = "sr5"

/** How many times the table is drawn. */
export const ROLLS_FORMULA = "rollsFormula"

/** How many a single line yields. */
export const QUANTITY_FORMULA = "quantityFormula"

/** How much loose money the table hands out alongside what it drew. */
export const NUYEN_FORMULA = "nuyenFormula"

/**
 * Roll a formula written by a user and reduce it to a whole count.
 *
 * A blank formula means "once", and so does a formula that does not parse:
 * a table that misfires in the middle of a session is worse than a table that
 * quietly behaves like an ordinary one, so the failure is reported to the
 * game master and the draw carries on.
 *
 * @param {string} formula            the formula as typed on the sheet
 * @param {string} label              what to name in the warning, if it fails
 * @returns {Promise<number>}         a count of at least one
 */
export async function sr5RollFormulaAmount(formula, label = "") {
  const text = String(formula ?? "").trim()
  if (!text) return 1
  try {
    const roll = await Roll.create(text).evaluate()
    const amount = Math.floor(roll.total)
    // A formula that can come out at zero or below would drop the line
    // without saying so. A table that yields nothing writes a "Rien" line.
    return Number.isFinite(amount) ? Math.max(1, amount) : 1
  } catch (error) {
    ui.notifications.warn(game.i18n.format("SR5.TableFormulaInvalid", {
      formula: text, name: label
    }))
    console.warn(`SR5 | invalid table formula "${text}"`, error)
    return 1
  }
}

/**
 * Roll the money formula of a table.
 *
 * Unlike a count, an amount of nuyen is allowed to come out at nothing: a body
 * that carried nothing is a result, not an error. A negative total is not —
 * a table cannot take money away — so it is floored at zero.
 *
 * @param {string} formula   the formula as typed on the sheet
 * @param {string} label     the table to name, if the formula fails
 * @returns {Promise<number|null>}  the amount, or null when the table has none
 */
export async function sr5RollNuyenAmount(formula, label = "") {
  const text = String(formula ?? "").trim()
  if (!text) return null
  try {
    const roll = await Roll.create(text).evaluate()
    const amount = Math.floor(roll.total)
    return Number.isFinite(amount) ? Math.max(0, amount) : null
  } catch (error) {
    ui.notifications.warn(game.i18n.format("SR5.TableFormulaInvalid", {
      formula: text, name: label
    }))
    console.warn(`SR5 | invalid table nuyen formula "${text}"`, error)
    return null
  }
}

/**
 * The table a result points at, when it points at one.
 * @param {TableResult} result
 * @returns {Promise<RollTable|null>}
 */
async function innerTableOf(result) {
  if (result.type !== "document" || !result.documentUuid) return null
  if (foundry.utils.parseUuid(result.documentUuid)?.type !== "RollTable") return null
  return (await fromUuid(result.documentUuid)) ?? null
}

/**
 * A RollTable that reads the two SR5 formulas.
 */
export class SR5RollTable extends foundry.documents.RollTable {

  /**
   * Draw from the table, as many times as its own formula asks.
   *
   * Core's draw() takes one result; drawMany() takes several and builds the
   * pooled roll that goes on the card. So a table with a rolls formula is
   * simply routed to the second — except when results were handed in, which
   * is a redraw of something already decided.
   *
   * @inheritDoc
   */
  async draw(options = {
  }) {
    if (options.results?.length) return super.draw(options)

    const amount = await sr5RollFormulaAmount(this.getFlag(NAMESPACE, ROLLS_FORMULA), this.name)
    if (amount <= 1) return super.draw(options)

    const {
      roll, recursive, displayChat, rollMode
    } = options
    return this.drawMany(amount, {
      roll, recursive, displayChat, rollMode
    })
  }

  /* -------------------------------------------- */

  /**
   * Roll once on the table, then expand every line by its own quantity.
   *
   * Core recurses into inner tables inside roll() itself, and rolls each of
   * them exactly once. A quantity has to be known before that happens for it
   * to mean "roll the inner table this many times", so the recursion is done
   * here instead: core is asked for a flat draw, and the walk below replaces
   * the one it would have made. Kept in step with core's own recursion —
   * revisit this if RollTable#roll changes.
   *
   * @inheritDoc
   */
  async roll({
    roll, recursive = true, _depth = 0
  } = {
  }) {
    const draw = await this.#rollOnce({
      roll, _depth
    })
    if (!recursive) return draw

    const results = []
    for (const result of draw.results) {
      const quantity = await sr5RollFormulaAmount(result.getFlag(NAMESPACE, QUANTITY_FORMULA), this.name)
      const inner = await innerTableOf(result)

      if (inner) {
        for (let i = 0; i < quantity; i++) {
          const innerDraw = await inner.roll({
            _depth: _depth + 1
          })
          results.push(...innerDraw.results)
        }
        continue
      }

      // Each appearance gets its own copy of the drawn line, because each
      // carries its own count: "2d6 balles" drawn twice in the same handful
      // is two different numbers, and one shared document could only
      // remember the second. The copy keeps the id, so the grouping in
      // toMessage() still recognises it.
      const occurrence = result.clone(undefined, {
        keepId: true
      })
      occurrence.sr5Quantity = quantity

      // Core marks a line as drawn by writing `drawn` on the document it was
      // handed, and reads back from the table's own. Handed a copy, it would
      // mark the copy and leave the line available: a table without
      // replacement would quietly behave as if it had some. The copy
      // forwards the field to the line it came from.
      Object.defineProperty(occurrence, "drawn", {
        configurable: true,
        get: () => result.drawn,
        set: value => {
          result.drawn = value
        }
      })

      results.push(occurrence)
    }

    return {
      roll: draw.roll, results
    }
  }

  /* -------------------------------------------- */

  /**
   * Ask core for a flat draw, putting the table back in play if it has run
   * out of lines.
   *
   * A table that draws without replacement marks each line as it comes up,
   * and core simply stops once none are left: asking for five draws from a
   * table of three quietly yields three. That was invisible while a draw took
   * one line at a time, and it is what a rolls formula runs into first. A
   * table asked for more than it holds is recycled rather than cut short —
   * the game master asked for five things and gets five.
   *
   * @param {object} options
   * @returns {Promise<object>}  core's draw
   */
  async #rollOnce({
    roll, _depth
  }) {
    const draw = await super.roll({
      roll, recursive: false, _depth
    })
    if (draw.results.length || this.replacement || this.pack || !this.results.size) return draw

    await this.resetResults()
    return super.roll({
      roll, recursive: false, _depth
    })
  }

  /* -------------------------------------------- */

  /**
   * Group the lines that came up more than once before the card is written.
   *
   * Drawing five times on the same table, or rolling an inner table three
   * times, lands the same line on the card several times over. Read as loot,
   * three separate "Ares Predator V" lines say something they do not mean.
   * They are one line saying three.
   *
   * This is the single place every draw passes through on its way to chat —
   * draw(), drawMany() and a direct call all end here — so it is the only
   * place that needs to know.
   *
   * @inheritDoc
   */
  async toMessage(results, options = {
  }) {
    const grouped = sr5GroupResults(results)
    const message = await super.toMessage(grouped, options)
    if (message) await this.#addPayout(message, grouped)
    return message
  }

  /* -------------------------------------------- */

  /**
   * Write what the table hands over onto the card it just made: the money it
   * rolled, and the gear the draw can actually give.
   *
   * It is a second write, and deliberately so: core builds the card's content
   * itself, inside the creation it performs, and reads no template of ours for
   * this message. Appending afterwards is the only way to add to it without
   * copying core's method wholesale — and it keeps both in the message, where
   * they survive a reload and can be handed over days later.
   *
   * @param {ChatMessage} message
   * @param {TableResult[]} results  the drawn lines, already grouped
   */
  async #addPayout(message, results) {
    const nuyen = await sr5RollNuyenAmount(this.getFlag(NAMESPACE, NUYEN_FORMULA), this.name)
    const loot = sr5LootManifest(results)

    const footer = sr5PayoutFooter({
      nuyen, loot
    })
    if (!footer) return

    await message.update({
      content: message.content + footer,
      "flags.sr5.tableNuyen": nuyen,
      "flags.sr5.tableLoot": loot,
      "flags.sr5.tableName": this.name
    })
  }
}

/**
 * Merge the repeats in a list of drawn lines, adding up what each yielded.
 *
 * Order is that of the first appearance, so a card still reads in the order
 * the dice produced.
 *
 * @param {TableResult[]} results
 * @returns {TableResult[]}
 */
export function sr5GroupResults(results) {
  const grouped = new Map()

  for (const result of results) {
    // Lines are merged on identity, not on what they say: two sub-tables
    // that both offer "Munitions" are two lines of two tables, and a card
    // that silently added them up would be inventing a total the dice never
    // produced.
    const key = result.id ?? `${result.type}|${result.documentUuid ?? ""}|${result.text ?? ""}`
    const seen = grouped.get(key)

    if (!seen) {
      grouped.set(key, result)
      continue
    }
    seen.sr5Quantity = (seen.sr5Quantity ?? 1) + (result.sr5Quantity ?? 1)
  }

  return [...grouped.values()]
}

/**
 * A TableResult that says how many of itself came up.
 */
export class SR5TableResult extends foundry.documents.TableResult {

  /**
   * Core renders this into the chat card itself, so the count is written into
   * the message rather than painted over it afterwards: it survives a reload,
   * an export, and a scroll back through the log.
   *
   * @inheritDoc
   */
  async getHTML() {
    const html = await super.getHTML()
    const quantity = this.sr5Quantity
    if (!Number.isFinite(quantity) || quantity <= 1) return html
    return `<span class="SR-TableQuantity">×${quantity}</span>${html}`
  }
}
