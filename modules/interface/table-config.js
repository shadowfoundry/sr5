// The two SR5 formula fields, added to the sheets core already draws.
//
// Core's table sheet and result dialog are Handlebars applications whose
// parts are fixed, and a system cannot slip a line into them from a template
// of its own. So the fields are built here and placed beside the core field
// they extend: the rolls formula next to the table's own formula, the
// quantity next to the line's weight. A field carries the flag as its name,
// which is all the form handler of a DocumentSheetV2 needs to store it.

import {
  ROLLS_FORMULA, QUANTITY_FORMULA, NUYEN_FORMULA
} from "../entities/rollTables/entityRollTable.js"

/**
 * Build a form group holding one formula field.
 * @param {object} options
 * @param {string} options.name         the field name, flags included
 * @param {string} options.value        what is stored today
 * @param {string} options.label        the label, already localized
 * @param {string} options.hint         the hint, already localized
 * @param {string} options.placeholder  an example formula
 * @returns {HTMLElement}
 */
function formulaGroup({
  name, value, label, hint, placeholder
}) {
  const group = document.createElement("div")
  group.className = "form-group"

  const labelElement = document.createElement("label")
  labelElement.textContent = label
  labelElement.setAttribute("for", name)

  const fields = document.createElement("div")
  fields.className = "form-fields"

  const input = document.createElement("input")
  input.type = "text"
  input.name = name
  input.id = name
  input.value = value ?? ""
  input.placeholder = placeholder
  fields.append(input)

  const hintElement = document.createElement("p")
  hintElement.className = "hint"
  hintElement.textContent = hint

  group.append(labelElement, fields, hintElement)
  return group
}

/**
 * Place a group after the core group that holds a given field, once.
 *
 * Core names some of its fields after the document field alone and others
 * through the "source." prefix its templates read values with, so both
 * spellings are tried rather than assumed.
 *
 * @param {HTMLElement} root       the rendered sheet
 * @param {string} anchorName      the name of the core field to sit under
 * @param {HTMLElement} group      the group to place
 */
function placeAfter(root, anchorName, group) {
  const anchor = root.querySelector(`[name="${anchorName}"], [name="source.${anchorName}"]`)
    ?.closest(".form-group")
  if (!anchor) return
  anchor.after(group)
}

/**
 * Add "number of draws" to a table's sheet.
 *
 * The sheet opens in a view mode that has no form at all, so nothing is added
 * there: the anchor field is simply absent and the call falls through.
 *
 * @param {Application} app
 * @param {HTMLElement} html
 */
export function sr5AddTableFormulaField(app, html) {
  if (html.querySelector(`[name="flags.sr5.${ROLLS_FORMULA}"]`)) return

  placeAfter(html, "formula", formulaGroup({
    name: `flags.sr5.${NUYEN_FORMULA}`,
    value: app.document.getFlag("sr5", NUYEN_FORMULA),
    label: game.i18n.localize("SR5.TableNuyenFormula"),
    hint: game.i18n.localize("SR5.TableNuyenFormulaHint"),
    placeholder: "2d6*100"
  }))

  placeAfter(html, "formula", formulaGroup({
    name: `flags.sr5.${ROLLS_FORMULA}`,
    value: app.document.getFlag("sr5", ROLLS_FORMULA),
    label: game.i18n.localize("SR5.TableRollsFormula"),
    hint: game.i18n.localize("SR5.TableRollsFormulaHint"),
    placeholder: "1d4+1"
  }))
}

/**
 * Add "quantity" to the dialog of a single line.
 * @param {Application} app
 * @param {HTMLElement} html
 */
export function sr5AddResultQuantityField(app, html) {
  if (html.querySelector(`[name="flags.sr5.${QUANTITY_FORMULA}"]`)) return

  placeAfter(html, "weight", formulaGroup({
    name: `flags.sr5.${QUANTITY_FORMULA}`,
    value: app.document.getFlag("sr5", QUANTITY_FORMULA),
    label: game.i18n.localize("SR5.TableResultQuantity"),
    hint: game.i18n.localize("SR5.TableResultQuantityHint"),
    placeholder: "2d6"
  }))
}
