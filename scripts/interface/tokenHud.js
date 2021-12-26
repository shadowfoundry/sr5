export default class SR5TokenHud extends TokenHUD {
    constructor(...args) {
        super(...args);
    }

    /** @override */
    static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "token-hud",
      template: "systems/sr5/templates/interface/srtoken-hud.html"
    });
  }

}