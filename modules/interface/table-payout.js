// What a table hands over: the money, and the gear itself.
//
// A loot table says what was found and how much was on the bodies. Both are
// rolled with the draw and written into the card, so they are part of what
// happened rather than notes the game master acts on later — and both are
// handed over with one click, days afterwards if the session stopped there.
//
// Neither payment invents a way of owning things. Money is an `itemNuyen` of
// type `gain`, the same document a sale creates; gear is copied onto the
// character the way the sheet itself holds it.

/**
 * The item types that hold a count rather than coming one per line.
 *
 * The shop of PR #592 knows the same list, as `SR5Shop.STACKABLE_TYPES`. It
 * lives on a branch this one is not built on, so the knowledge is repeated
 * here rather than imported from a file that does not exist yet: once that
 * PR lands, the two should become one.
 */
const STACKABLE_TYPES = ["itemAmmunition", "itemDrug", "itemGear", "itemWeapon"]

/**
 * The documents to create so that a character ends up holding `quantity` of
 * `source`.
 *
 * Ten rounds of ammunition are one line holding ten; two swords are two
 * swords, because a sword carries its own condition and its own
 * modifications.
 *
 * @param {Item} source
 * @param {number} quantity
 * @returns {object[]}
 */
function itemPayload(source, quantity) {
  const itemData = source.toObject()
  delete itemData._id

  if (STACKABLE_TYPES.includes(itemData.type) && itemData.system.quantity !== undefined) {
    itemData.system.quantity = quantity
    return [itemData]
  }

  const payload = []
  for (let i = 0; i < quantity; i++) payload.push(foundry.utils.deepClone(itemData))
  return payload
}

/**
 * `Nom (x3)` when there is more than one.
 * @param {string} name
 * @param {number} quantity
 * @returns {string}
 */
function lineLabel(name, quantity) {
  return quantity > 1 ? `${name} (x${quantity})` : name
}

/**
 * One row of the card's footer: what is on offer, and the button that hands
 * it over.
 * @param {string} kind   "loot" or "nuyen", the row's own name
 * @param {string} label  what is on offer, already localized
 * @param {string} action the button's action name
 * @param {string} button the button's text, already localized
 * @param {string} icon   the button's Font Awesome class
 * @returns {string} HTML
 */
function row(kind, label, action, button, icon) {
  return `<div class="SR-TablePayoutRow" data-payout="${kind}">` +
    `<span class="SR-TablePayoutLabel">${label}</span>` +
    `<button type="button" data-action="${action}">` +
    `<i class="fas ${icon}"></i> ${button}</button></div>`
}

/**
 * The footer a card wears when the table handed something over.
 * @param {object} payout
 * @param {number|null} payout.nuyen       the money, or null when there is none
 * @param {Array} payout.loot              the gear, possibly empty
 * @returns {string} HTML, empty when the table handed over nothing
 */
export function sr5PayoutFooter({
  nuyen, loot
}) {
  const rows = []

  if (loot.length) {
    rows.push(row("loot", game.i18n.format("SR5.TableLootFound", {
      count: loot.reduce((sum, line) => sum + line.quantity, 0)
    }), "sr5GiveTableLoot", game.i18n.localize("SR5.TableLootGive"), "fa-hand-holding-box"))
  }

  if (nuyen !== null) {
    rows.push(row("nuyen", game.i18n.format("SR5.TableNuyenFound", {
      amount: nuyen.toLocaleString()
    }), "sr5PayTableNuyen", game.i18n.localize("SR5.TableNuyenPay"), "fa-hand-holding-dollar"))
  }

  if (!rows.length) return ""
  return `<footer class="SR-TablePayout">${rows.join("")}</footer>`
}

/**
 * The gear a draw can actually hand over.
 *
 * A text result is a line of prose, and a result that drew an actor or another
 * table is not a thing to be carried: only a result pointing at an Item can be
 * given. The manifest is stored on the card rather than recomputed, so a draw
 * stays payable once the dice are long forgotten.
 *
 * @param {TableResult[]} results
 * @returns {Array<{uuid: string, quantity: number}>}
 */
export function sr5LootManifest(results) {
  return results
    .filter(result => result.type === "document" &&
      foundry.utils.parseUuid(result.documentUuid ?? "")?.type === "Item")
    .map(result => ({
      uuid: result.documentUuid,
      quantity: result.sr5Quantity ?? 1
    }))
}

/**
 * Share an amount between several characters, to the nuyen.
 *
 * A split that does not come out even leaves the remainder with the first
 * share rather than losing it: three characters splitting 1000¥ get 334, 333
 * and 333.
 *
 * @param {number} amount
 * @param {number} count
 * @returns {number[]}
 */
export function sr5SplitNuyen(amount, count) {
  if (count <= 0) return []
  const share = Math.floor(amount / count)
  const shares = new Array(count).fill(share)
  shares[0] += amount - share * count
  return shares
}

/**
 * Replace one row of the footer in a card's stored content.
 *
 * A row holds no nested block of its own, so the lazy match stops at its own
 * closing tag — a greedy one would swallow the other row and the footer with
 * it. Each row is spent on its own: handing over the gear leaves the money
 * still to pay.
 *
 * @param {string} content
 * @param {string} kind
 * @param {string} label   what the spent row now says
 * @returns {string}
 */
export function sr5SpendPayoutRow(content, kind, label) {
  const pattern = new RegExp(
    `<div class="SR-TablePayoutRow" data-payout="${kind}">[\\s\\S]*?</div>`)
  return content.replace(pattern,
    `<div class="SR-TablePayoutRow" data-payout="${kind}">` +
    `<span class="SR-TablePayoutLabel">${label}</span></div>`)
}

/**
 * Spend a row, on the card the reader sees and in the message that keeps it.
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 * @param {string} kind
 * @param {string} label
 */
async function spendRow(message, html, kind, label) {
  const rendered = html.querySelector(`.SR-TablePayoutRow[data-payout="${kind}"]`)
  if (rendered) rendered.innerHTML = `<span class="SR-TablePayoutLabel">${label}</span>`
  await message.update({
    content: sr5SpendPayoutRow(message.content, kind, label)
  })
  ui.notifications.info(label)
}

/**
 * The characters a money payment can go to: the selected tokens that hold a
 * purse and that the clicker may write on.
 *
 * Only `actorPc` carries `system.nuyen`; an `itemNuyen` dropped on anything
 * else is accepted and stays inert, so the others are left out rather than
 * paid into a void.
 *
 * @returns {Actor[]}
 */
function nuyenPayees() {
  return canvas.tokens?.controlled
    .map(token => token.actor)
    .filter(actor => actor?.type === "actorPc" && actor.isOwner) ?? []
}

/**
 * Pay a card's nuyen to the selected characters and spend that row.
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 */
async function payNuyen(message, html) {
  const amount = message.getFlag("sr5", "tableNuyen")
  if (!amount) return

  const actors = nuyenPayees()
  if (!actors.length) {
    ui.notifications.warn(game.i18n.localize("SR5.TableNuyenNoTarget"))
    return
  }

  const shares = sr5SplitNuyen(amount, actors.length)
  const date = new Date().toISOString().slice(0, 10)
  const from = message.getFlag("sr5", "tableName") ?? ""
  const name = game.i18n.format("SR5.TableNuyenEntry", {
    name: from
  })

  for (const [index, actor] of actors.entries()) {
    await actor.createEmbeddedDocuments("Item", [{
      name,
      type: "itemNuyen",
      img: "systems/sr5/assets/img/items/itemNuyen.svg",
      system: {
        amount: shares[index], type: "gain", date, description: name
      }
    }])
  }

  await spendRow(message, html, "nuyen", game.i18n.format("SR5.TableNuyenPaid", {
    amount: amount.toLocaleString(),
    names: actors.map(actor => actor.name).join(", ")
  }))
}

/**
 * Hand a card's gear to the one selected character and spend that row.
 *
 * Gear is not split: a single sword given to three characters would be three
 * swords. So exactly one recipient is asked for, and saying so is better than
 * quietly picking the first token of the selection.
 *
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 */
async function giveLoot(message, html) {
  const manifest = message.getFlag("sr5", "tableLoot") ?? []
  if (!manifest.length) return

  const actors = canvas.tokens?.controlled
    .map(token => token.actor)
    .filter(actor => actor?.isOwner) ?? []

  if (!actors.length) {
    ui.notifications.warn(game.i18n.localize("SR5.TableLootNoTarget"))
    return
  }
  if (actors.length > 1) {
    ui.notifications.warn(game.i18n.localize("SR5.TableLootOneTarget"))
    return
  }
  const [actor] = actors

  const payload = []
  const names = []
  let missing = 0

  for (const line of manifest) {
    const item = await fromUuid(line.uuid)
    if (!item) {
      missing += 1
      continue
    }
    payload.push(...itemPayload(item, line.quantity))
    names.push(lineLabel(item.name, line.quantity))
  }

  // A compendium disabled since the draw leaves holes. Saying how many is
  // more use than handing over a shorter pile without a word.
  if (missing) {
    ui.notifications.warn(game.i18n.format("SR5.TableLootGone", {
      count: missing
    }))
  }
  if (!payload.length) return

  await actor.createEmbeddedDocuments("Item", payload)
  await spendRow(message, html, "loot", game.i18n.format("SR5.TableLootGiven", {
    names: names.join(", "), actor: actor.name
  }))
}

/**
 * Wire the payout buttons of a table draw.
 *
 * Registered as its own listener on `renderChatMessageHTML` rather than added
 * to the system's main one: the card carries its own flags and its own
 * buttons, and the general chat card handling expects a full `sr5data` and a
 * selected token before it will look at anything.
 *
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 */
export function sr5HookRenderTablePayout(message, html) {
  const footer = html.querySelector(".SR-TablePayout")
  if (!footer) return

  // Handing out loot is the game master's to do, and spending a row means
  // writing on the message, which only they may do. A player still reads what
  // was found; the buttons simply are not there.
  if (!game.user.isGM) {
    for (const button of footer.querySelectorAll("button")) button.remove()
    return
  }

  footer.querySelector('[data-action="sr5PayTableNuyen"]')
    ?.addEventListener("click", () => payNuyen(message, html))
  footer.querySelector('[data-action="sr5GiveTableLoot"]')
    ?.addEventListener("click", () => giveLoot(message, html))
}
