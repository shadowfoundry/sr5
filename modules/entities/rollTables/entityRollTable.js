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
//
// A quantity on a line that points at another table means something stronger
// than a count: that inner table is rolled that many times, so "1d3 armes"
// draws one to three different weapons rather than three copies of one.

/** The flag namespace both formulas live under. */
const NAMESPACE = "sr5"

/** How many times the table is drawn. */
export const ROLLS_FORMULA = "rollsFormula"

/** How many a single line yields. */
export const QUANTITY_FORMULA = "quantityFormula"

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
    const draw = await super.roll({
      roll, recursive: false, _depth
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

      // The count rides on the drawn document until toMessage() renders it,
      // a few lines further on in the same call. It is deliberately not
      // stored: a quantity belongs to one draw, not to the table.
      result.sr5Quantity = quantity
      results.push(result)
    }

    return {
      roll: draw.roll, results
    }
  }
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
