export default class SR5TokenHud extends foundry.applications.hud.TokenHUD {
  constructor(...args) {
    super(...args)
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "token-hud",
      template: "systems/sr5/templates/interface/srtoken-hud.hbs"
    })
  }

  /**
   * A way into a storage left on the ground that costs no selection: opening
   * it by clicking its own token would make the bag the one who takes.
   *
   * The button is built here rather than in srtoken-hud.hbs because the V13
   * TokenHUD renders its own parts and never reads that template.
   */
  _onRender(context, options) {
    super._onRender(context, options)
    if (this.document?.actor?.type !== "actorStorage") return

    const middle = this.element?.querySelector(".col.middle")
    if (!middle || middle.querySelector(".sr-hud-storage")) return

    const button = document.createElement("button")
    button.type = "button"
    button.className = "control-icon sr-hud-storage"
    button.dataset.tooltip = game.i18n.localize("SR5.HUD.OpenStorage")
    button.innerHTML = "<img src=\"systems/sr5/assets/img/ui/hud_storage.svg\" alt=\"\" />"
    button.addEventListener("click", event => {
      event.preventDefault()
      event.stopPropagation()
      // Render alone: whoever is standing there stays the one who takes
      this.document?.actor?.sheet?.render(true)
    })
    middle.appendChild(button)
  }
}
