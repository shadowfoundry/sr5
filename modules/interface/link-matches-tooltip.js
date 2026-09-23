/**
 * Translate the document type headers of the core "link matches" tooltip.
 * When text is selected in an editor, core lists the matching documents grouped under
 * their raw document name ("Item", "JournalEntryPage"). The tooltip is appended to the body,
 * then its content is replaced on each new selection, so both changes are watched.
 */
export function initLinkMatchesTooltip() {
  const translateHeaders = tooltip => {
    for (const header of tooltip.querySelectorAll("section > h4")) {
      const documentClass = CONFIG[header.textContent.trim()]?.documentClass
      if (!documentClass) continue
      header.textContent = game.i18n.localize(documentClass.metadata.labelPlural)
    }
  }

  const contentObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) translateHeaders(mutation.target)
  })

  const bodyObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!node.classList?.contains("link-matches")) continue
        translateHeaders(node)
        contentObserver.observe(node, {
          childList: true 
        })
      }
    }
  })
  bodyObserver.observe(document.body, {
    childList: true 
  })
}
