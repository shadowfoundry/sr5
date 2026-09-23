/**
 * The observer watching the tab strip of the sidebar currently rendered.
 * @type {MutationObserver|null}
 */
let tabObserver = null

/**
 * Put the Settings tab and the collapse caret back at the end of the strip, in that order.
 * @param {HTMLElement} menu The menu element holding the sidebar tab buttons.
 */
function placeSettingsBeforeCollapse(menu) {
  const items = [...menu.children]
  const settings = items.find(li => li.querySelector('[data-tab="settings"]'))
  const collapse = items.find(li => li.querySelector("button.collapse"))
  if (!settings || !collapse) return

  // Already in place: leave the DOM alone, or the observer would answer its own changes.
  if (menu.lastElementChild === collapse && collapse.previousElementSibling === settings) return
  menu.append(settings, collapse)
}

/**
 * Keep the Settings tab just above the collapse caret, whatever tabs are added later.
 *
 * Core builds the strip from Sidebar.TABS, Settings last, then the collapse button. A module that
 * appends its own tab from a render hook lands after both, which leaves the caret in the middle of
 * the strip. The two elements are moved in the DOM rather than with the flex `order` property, so
 * the keyboard focus order still matches what is shown; and because a MutationObserver callback
 * runs before the browser paints, a tab added after the sidebar is on screen never shows the icons
 * moving.
 * @param {Application} sidebar The Sidebar application being rendered.
 */
export function sr5KeepSidebarSettingsLast(sidebar) {
  tabObserver?.disconnect()
  tabObserver = null

  const menu = sidebar?.element?.querySelector("#sidebar-tabs > menu")
  if (!menu) return

  placeSettingsBeforeCollapse(menu)
  tabObserver = new MutationObserver(() => placeSettingsBeforeCollapse(menu))
  tabObserver.observe(menu, {
    childList: true,
  })
}
