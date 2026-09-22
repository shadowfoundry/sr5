// The nuyen a table hands out, and the button that hands it over.
//
// A loot table says what was found; in Shadowrun it also says how much was on
// the bodies. The amount is rolled with the draw and written into the card, so
// it is part of what happened rather than something the game master works out
// afterwards. Paying it is one click, and the button is spent once used.
//
// The payment itself is the system's own: an `itemNuyen` of type `gain` on the
// character, exactly what a sale through the shop creates. Nothing about how
// money works is reinvented here.

/**
 * The footer a card wears when the table handed out nuyen.
 * @param {number} amount
 * @returns {string} HTML
 */
export function sr5NuyenFooter(amount) {
  const sum = amount.toLocaleString()
  return `<footer class="SR-TableNuyen">` +
    `<span class="SR-TableNuyenAmount">${game.i18n.format("SR5.TableNuyenFound", {
      amount: sum
    })}</span>` +
    `<button type="button" data-action="sr5PayTableNuyen">` +
    `<i class="fas fa-hand-holding-dollar"></i> ${game.i18n.localize("SR5.TableNuyenPay")}` +
    `</button></footer>`
}

/**
 * The characters a payment can go to: the selected tokens that hold a purse
 * and that the clicker is allowed to write on.
 *
 * Only `actorPc` carries `system.nuyen`; an `itemNuyen` dropped on anything
 * else is accepted and stays inert, so the others are left out rather than
 * paid into a void.
 *
 * @returns {Actor[]}
 */
function payees() {
  return canvas.tokens?.controlled
    .map(token => token.actor)
    .filter(actor => actor?.type === "actorPc" && actor.isOwner) ?? []
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
 * Pay a card's nuyen to the selected characters and spend the button.
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 */
async function payNuyen(message, html) {
  const amount = message.getFlag("sr5", "tableNuyen")
  if (!amount) return

  const actors = payees()
  if (!actors.length) {
    ui.notifications.warn(game.i18n.localize("SR5.TableNuyenNoTarget"))
    return
  }

  const shares = sr5SplitNuyen(amount, actors.length)
  const date = new Date().toISOString().slice(0, 10)
  const from = message.getFlag("sr5", "tableName") ?? ""

  for (const [index, actor] of actors.entries()) {
    await actor.createEmbeddedDocuments("Item", [{
      name: game.i18n.format("SR5.TableNuyenEntry", {
        name: from
      }),
      type: "itemNuyen",
      img: "systems/sr5/assets/img/items/itemNuyen.svg",
      system: {
        amount: shares[index],
        type: "gain",
        date,
        description: game.i18n.format("SR5.TableNuyenEntry", {
          name: from
        })
      }
    }])
  }

  const paid = game.i18n.format("SR5.TableNuyenPaid", {
    amount: amount.toLocaleString(),
    names: actors.map(actor => actor.name).join(", ")
  })

  // The card keeps what happened and the button does not play twice, the way
  // the shop's own cards are spent.
  const footer = html.querySelector(".SR-TableNuyen")
  if (footer) footer.innerHTML = `<span class="SR-TableNuyenAmount">${paid}</span>`
  await message.update({
    content: message.content.replace(/<footer class="SR-TableNuyen">[\s\S]*?<\/footer>/,
      `<footer class="SR-TableNuyen"><span class="SR-TableNuyenAmount">${paid}</span></footer>`)
  })
  ui.notifications.info(paid)
}

/**
 * Wire the payment button of a table draw.
 *
 * Registered as its own listener on `renderChatMessageHTML` rather than added
 * to the system's main one: the card carries its own flag and its own button,
 * and the general chat card handling expects a full `sr5data` and a selected
 * token before it will look at anything.
 *
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 */
export function sr5HookRenderTableNuyen(message, html) {
  const button = html.querySelector('[data-action="sr5PayTableNuyen"]')
  if (!button) return

  // Handing out loot is the game master's to do, and spending the button
  // means writing on the message, which only they may do. A player still
  // reads the amount; the button simply is not there.
  if (!game.user.isGM) {
    button.remove()
    return
  }

  button.addEventListener("click", () => payNuyen(message, html))
}
