/**
 * Icons of the system on the token HUD.
 *
 * The V13 TokenHUD builds its own parts from the core templates and never
 * reads a system template, so srtoken-hud.hbs had been dead weight since the
 * port: the only way back to the SR5 icons is to swap them once rendered.
 */
const HUD_ICONS = {
  '[data-action="config"]': "hud_configure.svg",
  '[data-action="target"]': "hud_target.svg",
  '[data-action="visibility"]': "hud_visibility.svg",
  '[data-action="togglePalette"][data-palette="effects"]': "hud_effect.svg",
  '[data-action="combat"]': "hud_combat.svg"
}

export default class SR5TokenHud extends foundry.applications.hud.TokenHUD {
  constructor(...args) {
    super(...args)
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "token-hud"
    })
  }

  _onRender(context, options) {
    super._onRender(context, options)
    this.#dressControlIcons()
  }

  /**
   * Give each control the SR5 drawing, and leave alone any control we have
   * no drawing for — the movement action and the two sort arrows.
   */
  #dressControlIcons() {
    for (const [selector, file] of Object.entries(HUD_ICONS)) {
      for (const control of this.element?.querySelectorAll(`.control-icon${selector}`) ?? []) {
        // Core draws some of these as a Font Awesome glyph and others as an
        // image of its own: both have to give way to the SR5 drawing.
        const icon = control.querySelector(":scope > i, :scope > img")
        if (!icon) continue
        const img = document.createElement("img")
        img.src = `systems/sr5/assets/img/ui/${file}`
        img.alt = ""
        icon.replaceWith(img)
      }
    }
  }
}
