import {
  SR5_SystemHelpers 
} from "../system/utilitySystem.js"

/**
 * Journal page titles: the six heading levels the data model allows, instead of three.
 *
 * The data model of a journal page allows levels 1 to 6, but core only offers the first three in the
 * page header. Long rule books need a deeper table of contents in the journal sidebar.
 */
export const SR5_JOURNAL_HEADING_LEVELS = 6

/** How many heading levels of a page appear under it in the journal sidebar (core shows 2). */
export const SR5_JOURNAL_TOC_DEPTH = 6

/**
 * Show more headings of a page in the sidebar table of contents.
 * Core keeps the headings of the two first levels only ("level < minLevel + 2"), which hides the
 * subtitles of a rule chapter. All six levels are kept here, so h5 and h6 reach the sidebar too.
 */
async function sr5RenderDeepHeadings(pageNode, toc) {
  const pageId = pageNode.dataset.pageId
  const page = this.entry.pages.get(pageId)
  // Monk's Enhanced Journal keeps the sheet it renders in `trueElement`
  const root = this.trueElement ?? this.element
  const tocNode = root?.querySelector(`.toc [data-page-id="${pageId}"]`)
  if (!tocNode || !toc) return
  let headings = Object.values(toc)
  headings.sort((a, b) => a.order - b.order)
  if (page.title.show) headings.shift()
  const minLevel = Math.min(...headings.map(node => node.level))
  tocNode.querySelector(":scope > ol")?.remove()
  headings = headings.reduce((arr, {
    text, level, slug, element 
  }) => {
    if (element) element.dataset.anchor = slug
    if (level < minLevel + SR5_JOURNAL_TOC_DEPTH) arr.push({
      text, slug, level: level - minLevel + 2 
    })
    return arr
  }, [])
  const html = await foundry.applications.handlebars.renderTemplate("templates/journal/toc.hbs", {
    headings 
  })
  tocNode.insertAdjacentHTML("beforeend", html)
}

/** Install it on the core journal sheet. */
export function sr5DeepenJournalTableOfContents() {
  const sheet = foundry.applications.sheets.journal.JournalEntrySheet
  if (!sheet?.prototype?._renderHeadings) return
  sheet.prototype._renderHeadings = sr5RenderDeepHeadings
}

/**
 * Monk's Enhanced Journal carries its own copy of the core method, kept at the two levels core
 * shows, so its window ignored the deeper table of contents. Install the same one on its sheet.
 */
export async function sr5DeepenModuleTableOfContents() {
  if (!game.modules.get("monks-enhanced-journal")?.active) return
  try {
    const module = await import("/modules/monks-enhanced-journal/sheets/JournalEntrySheet.js")
    const proto = module?.JournalEntrySheet?.prototype
    if (proto?._renderHeadings) proto._renderHeadings = sr5RenderDeepHeadings
  } catch (error) {
    SR5_SystemHelpers.srLog(1, `Table of contents of Monk's Enhanced Journal left as it is: ${error}`)
  }
}

/** Add the missing levels to the choices of the page header select. */
export function sr5ExtendJournalHeadingLevels() {
  const sheet = foundry.applications.sheets.journal.JournalEntryPageSheet
  if (!sheet?.prototype?._prepareHeadingLevels) return

  const prepareHeadingLevels = sheet.prototype._prepareHeadingLevels
  sheet.prototype._prepareHeadingLevels = function () {
    const levels = prepareHeadingLevels.call(this)
    for (let level = 1; level <= SR5_JOURNAL_HEADING_LEVELS; level++) {
      levels[level] ??= game.i18n.format("JOURNALENTRYPAGE.Level", {
        level 
      })
    }
    return levels
  }
}
