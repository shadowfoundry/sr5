import {
  ActorSheetSR5 
} from "./baseSheet.js"

/**
 * An Actor sheet for spirit type actors in the Shadowrun 5 system.
 */
export class SR5SpiritSheet extends ActorSheetSR5 {
  constructor(...args) {
    super(...args)

    this._shownUntrainedSkills = false
    this._filters = {
      skills: ""
    }
  }

  static DEFAULT_OPTIONS = {
    classes: ["app", "window-app", "sr5", "actor", "spirit"],
    position: {
      width: 800, height: 618 
    },
    window: {
      resizable: false 
    },
  }

  static PARTS = {
    sheet: {
      template: "systems/sr5/templates/actors/spirit-sheet.hbs",
      root: true,
      scrollable: [".sr-panel"],
    },
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)

    this._prepareItems(context.actor)
    this._prepareSkills(context.actor)

    return context
  }

  _prepareSkills(actor) {
    const activeSkills = {
    }
    for (let [key, skill] of Object.entries(actor.system.skills)) {
      if (skill.rating.value > 0 || this._shownUntrainedSkills) activeSkills[key] = skill
    }
    actor.system.skills = activeSkills
  }

  _prepareItems(actor) {
    const weapons = []
    const spells = []
    const powers = []
    const externalEffects = []
    const traditions = []

    // Iterate through items, allocating to containers
    for (let i of actor.items) {
      if (i.type === "itemSpell") spells.push(i)
      else if (i.type === "itemWeapon") weapons.push(i)
      else if (i.type === "itemPower") powers.push(i)
      else if (i.type === "itemEffect") externalEffects.push(i)
      else if (i.type === "itemTradition") traditions.push(i)
    }

    actor.weapons = weapons
    actor.spells = spells
    actor.powers = powers
    actor.externalEffects = externalEffects
    actor.traditions = traditions
  }

  /** @override */
  async _onDropItemCreate(item) {
    switch(item.type){
      case "itemTradition":
        for (let i of this.actor.items){
          if (i.type === "itemTradition") return ui.notifications.warn(game.i18n.localize('SR5.WARN_OnlyOneTradition'))
        }
        return super._onDropItemCreate(item)
      case "itemWeapon":
        for (let i of this.actor.items){
          if (i.type === "itemWeapon" && i.system.isActive && (i.system.category === item.system.category)) return super._onDropItemCreate(item)
        }
        item.system.isActive = true
        return super._onDropItemCreate(item)
      case "itemPower":
        if (item.system.actionType === "permanent") item.system.isActive = true
        return super._onDropItemCreate(item)
      case "itemSpell":
      case "itemEffect":
        return super._onDropItemCreate(item)
      default:
        ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'))
        return
    }
  }

}
