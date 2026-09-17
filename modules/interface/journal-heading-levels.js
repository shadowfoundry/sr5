/**
 * Journal page titles: five heading levels instead of three.
 *
 * The data model of a journal page allows levels 1 to 6, but core only offers the first three in the
 * page header. Long rule books need a deeper table of contents in the journal sidebar.
 */
export const SR5_JOURNAL_HEADING_LEVELS = 5

/** How many heading levels of a page appear under it in the journal sidebar (core shows 2). */
export const SR5_JOURNAL_TOC_DEPTH = 4

/**
 * Show more headings of a page in the sidebar table of contents.
 * Core keeps the headings of the two first levels only ("level < minLevel + 2"), which hides the
 * subtitles of a rule chapter.
 */
export function sr5DeepenJournalTableOfContents() {
  const sheet = foundry.applications.sheets.journal.JournalEntrySheet
  if (!sheet?.prototype?._renderHeadings) return

  sheet.prototype._renderHeadings = async function (pageNode, toc) {
    const pageId = pageNode.dataset.pageId
    const page = this.entry.pages.get(pageId)
    const tocNode = this.element.querySelector(`.toc [data-page-id="${pageId}"]`)
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
