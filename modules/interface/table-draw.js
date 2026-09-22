// A table draw is drawn by core, which gives it no header of its own and
// repeats the table's icon on every single result. Core's template is
// templates/dice/table-result.hbs, and it carries the table's id:
//
//   <div class="table-draw" data-table-id="…">
//     <div class="table-description">…</div>
//     <ul class="table-results">
//       <li class="flexrow"><img src="…"> …details…</li>
//
// So the card is finished here rather than in a template of our own: core
// never reads one for this message.

// The images core hands a result that has no icon of its own. They say
// nothing, so they are never worth a header.
const PLACEHOLDERS = ["icons/svg/d20", "icons/svg/invisible", "icons/svg/mystery-man"]

function isPlaceholder(src) {
  return !src || PLACEHOLDERS.some(p => src.includes(p))
}

/**
 * The table a draw came from, when it can still be reached: a table of the
 * world, or one of a compendium whose index is already loaded.
 * @param {string} id
 * @returns {RollTable|object|null}
 */
function findTable(id) {
  if (!id) return null
  const world = game.tables.get(id)
  if (world) return world
  for (const pack of game.packs) {
    if (pack.metadata.type !== "RollTable") continue
    const entry = pack.index?.get?.(id)
    if (entry) return entry
  }
  return null
}

/**
 * Give a table draw the header the SR5 cards wear, and hoist the icon its
 * results all share up into it.
 * @param {HTMLElement} html  the rendered chat message
 */
export function sr5DressTableDraw(html) {
  const draw = html.querySelector(".table-draw")
  if (!draw || draw.querySelector(".SR-TableHeader")) return

  const rows = [...draw.querySelectorAll(".table-results > li")]
  const images = rows.map(row => row.querySelector(":scope > img")).filter(Boolean)
  const drawings = images.map(img => img.getAttribute("src")).filter(src => !isPlaceholder(src))

  const table = findTable(draw.dataset.tableId)
  const title = table?.name ?? ""
  // The table's own drawing belongs beside the title. When the table has
  // none, a drawing that several results repeat is its drawing by another
  // name — but one that appears once is not: on a table that draws actors,
  // that would be the portrait of the single contact that came up.
  const repeated = new Set(drawings).size === 1 && drawings.length > 1 ? drawings[0] : null
  const icon = isPlaceholder(table?.img) ? repeated : table.img

  if (title || icon) {
    const header = document.createElement("header")
    header.className = "SR-CardHeader SR-TableHeader flexrow"

    if (icon) {
      const img = document.createElement("img")
      img.className = "SR-TableHeaderIcon"
      img.src = icon
      header.append(img)
    }

    const label = document.createElement("div")
    label.className = "SR-CardHeaderTitle"
    label.textContent = title
    header.append(label)

    draw.prepend(header)
  }

  // A placeholder never earns its line, and neither does the drawing that is
  // now in the header. An icon of its own — the portrait of an actor a result
  // drew — stays where it says something.
  for (const img of images) {
    const src = img.getAttribute("src")
    if (isPlaceholder(src) || src === icon) img.remove()
  }
}
