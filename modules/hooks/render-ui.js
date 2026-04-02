import {
  SR5_SystemHelpers, SR5_UiModifications
} from "../system/utilitySystem.js"
import {
  enhanceSelects
} from "../helpers/enhance-selects.js"

/** Merge aside footer buttons into a single full-width footer */
function _promoteAsideFooter(html) {
  const root = html.nodeType === 1 ? html : html
  const aside = root.querySelector('aside')
  if (!aside) return
  const asideFooter = aside.querySelector('footer')
  if (!asideFooter) return
  const windowContent = aside.closest('.window-content')
  if (!windowContent) return

  // Collect aside footer buttons
  const asideButtons = [...asideFooter.querySelectorAll('button')]
  asideFooter.remove()

  // Find existing main footer — check direct children first, then inside .main
  let mainFooter = windowContent.querySelector(':scope > footer, :scope > .form-footer')
  if (!mainFooter) {
    const mainDiv = windowContent.querySelector('.main')
    if (mainDiv) mainFooter = mainDiv.querySelector('footer')
  }

  // Switch to grid so the footer gets its own row below aside + main
  windowContent.style.display = 'grid'
  windowContent.style.gridTemplateColumns = 'auto 1fr'
  windowContent.style.gridTemplateRows = 'minmax(0, 1fr) auto'
  windowContent.style.overflow = 'hidden'

  // Ensure aside and main scroll their own content within the grid row
  aside.style.overflow = 'hidden auto'
  const mainDiv = windowContent.querySelector('.main')
  if (mainDiv) mainDiv.style.overflow = 'hidden auto'

  if (mainFooter) {
    // Prepend aside buttons to existing footer
    for (const btn of asideButtons.reverse()) {
      mainFooter.insertBefore(btn, mainFooter.firstChild)
    }
    // Move footer to be direct child of window-content
    if (mainFooter.parentElement !== windowContent) {
      windowContent.appendChild(mainFooter)
    }
  } else {
    // Create a new footer with all buttons
    const newFooter = document.createElement('footer')
    newFooter.classList.add('form-footer')
    for (const btn of asideButtons) newFooter.appendChild(btn)
    windowContent.appendChild(newFooter)
  }

  // Ensure the promoted footer spans both grid columns
  const finalFooter = windowContent.querySelector(':scope > footer, :scope > .form-footer')
  if (finalFooter) {
    finalFooter.style.gridColumn = '1 / -1'
  }
}

export function sr5HookRenderPlayers() {
  SR5_SystemHelpers.srLog(3, `Renderering Shadowrun 5 Help Window`)
  SR5_UiModifications.addHelpWindow()
}

export function sr5HookRenderFolderConfig(_app, html) {
  enhanceSelects(html)
  const input = html.querySelector(`input[type=text]`)
  if (input && !input.value) {
    input.value = input.placeholder
    input.focus()
  }
}

export function sr5HookRenderDialog(_app, html) {
  enhanceSelects(html)
  const input = html.querySelector(`input[type=text]`)
  if (input && !input.value) {
    input.value = input.placeholder
    input.focus()
  }
}

export function sr5HookRenderDialogV2(_app, html) { enhanceSelects(html) }
export function sr5HookRenderSettingsConfig(_app, html) {
  enhanceSelects(html)
  _promoteAsideFooter(html)
}
export function sr5HookRenderControlsConfig(_app, html) {
  enhanceSelects(html)
  _promoteAsideFooter(html)
}
export function sr5HookRenderDocumentOwnershipConfig(_app, html) { enhanceSelects(html) }
export function sr5HookRenderDocumentSheetConfig(_app, html) { enhanceSelects(html) }
export function sr5HookRenderWorldConfig(_app, html) { enhanceSelects(html) }
export function sr5HookRenderCombatTrackerConfig(_app, html) { enhanceSelects(html) }
export function sr5HookRenderMacroConfig(_app, html) { enhanceSelects(html) }
