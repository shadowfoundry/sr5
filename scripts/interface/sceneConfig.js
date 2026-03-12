import { SR5 } from "../config.js"

export default class SR5SceneConfig extends foundry.applications.sheets.SceneConfig {

  static PARTS = {
    ...foundry.applications.sheets.SceneConfig.PARTS,
    sr5tabs: { template: "systems/sr5/templates/interface/scene-sr5-tabs.html" }
  }

  static TABS = {
    sheet: {
      tabs: [
        ...foundry.applications.sheets.SceneConfig.TABS.sheet.tabs,
        { id: "environmentalMod", icon: "fa-solid fa-cloud-sun-rain", label: "SR5.EnvironmentalModifiers" },
        { id: "matrixNoise", icon: "fa-solid fa-wifi", label: "SR5.SceneMatrixNoise" },
        { id: "backgroundCount", icon: "fa-solid fa-hat-wizard", label: "SR5.SceneBackgroundCount" },
      ],
      initial: "basics",
      labelPrefix: "SCENE.TABS.SHEET"
    },
    ambience: foundry.applications.sheets.SceneConfig.TABS.ambience
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options)
    if (partId === "sr5tabs") {
      if (foundry.utils.isEmpty(this.document.flags.sr5)) {
        await this.document.setFlag("sr5", "placeholder", true)
      }
      context.sr5lists = SR5
    }
    return context
  }

  updateMatrixNoise(element) {
    let matrixNoise = (parseInt(this.document.flags.sr5?.matrixSpam) || 0) + (parseInt(this.document.flags.sr5?.matrixStatic) || 0)
    const noiseField = element.querySelector('[name="sceneNoiseRating"]')
    if (noiseField) noiseField.value = matrixNoise
    this.document.setFlag("sr5", "matrixNoise", matrixNoise)
  }

  async _onRender(context, options) {
    await super._onRender(context, options)
    this.updateMatrixNoise(this.element)

    const matrixSpam = this.element.querySelector('[name="flags.sr5.matrixSpam"]')
    if (matrixSpam) matrixSpam.addEventListener("change", _ev => {
      this.updateMatrixNoise(this.element)
    })

    const matrixStatic = this.element.querySelector('[name="flags.sr5.matrixStatic"]')
    if (matrixStatic) matrixStatic.addEventListener("change", _ev => {
      this.updateMatrixNoise(this.element)
    })
  }
}
