import {
  SR5CompendiumInfo
} from "../interface/compendium.js"
import {
  SR5CompendiumBrowser
} from "../interface/compendium-browser.js"

export async function sr5HookRenderCompendium(pack, html, compendiumData) {
  SR5CompendiumInfo.onRenderCompendium(pack, html, compendiumData)
}

// Add Compendium Browser button to the compendium sidebar
export function sr5HookRenderCompendiumDirectory(_app, html) {
  const header = html.querySelector('.directory-header')
  if (!header) return
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.classList.add('sr-compendium-browser-btn')
  btn.innerHTML = `<i class="fas fa-search"></i> ${game.i18n.localize('SR5.CompendiumBrowser')}`
  btn.addEventListener('click', () => SR5CompendiumBrowser.open())
  header.appendChild(btn)
}
