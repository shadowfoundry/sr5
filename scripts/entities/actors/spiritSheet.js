import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for spirit type actors in the Shadowrun 5 system.
 */
export class SR5SpiritSheet extends ActorSheetSR5 {
  constructor(...args) {
    super(...args);

    this._shownUntrainedSkills = false;
    this._filters = {
      skills: "",
    };
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/sr5/templates/actors/spirit-sheet.html",
      width: 800,
      height: 618,
      resizable: false,
      classes: ["sr5", "sheet", "actor", "spirit"],
    });
  }

  getData() {
    const data ={};
    const actorData = this.actor.data.toObject(false);
    data.actor = actorData;
    data.data = actorData.data;

    // Owned Items
    data.items = actorData.items;
    for ( let i of data.items ) {
      const item = this.actor.items.get(i._id);
      i.labels = item.labels;
    }
    data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    
    this._prepareItems(data.actor);
    this._prepareSkills(data.actor);

    data.actor.lists = this.actor.data.lists;
    data.owner = this.actor.isOwner
    data.filters = this._filters;
    return data;
  }

  _prepareSkills(actor) {
    const activeSkills = {};
    for (let [key, skill] of Object.entries(actor.data.skills)) {
      if (skill.rating.value > 0 || this._shownUntrainedSkills)
        activeSkills[key] = skill;
    }
    actor.data.skills = activeSkills;
  }

  _prepareItems(actor) {
    const weapons = [];
    const spells = [];
    const powers = [];
    const effects = [];
    const traditions = [];

    // Iterate through items, allocating to containers
    for (let i of actor.items) {
      if (i.type === "itemSpell") spells.push(i);
      else if (i.type === "itemWeapon") weapons.push(i);
      else if (i.type === "itemPower") powers.push(i);
      else if (i.type === "itemEffect") effects.push(i);
      else if (i.type === "itemTradition") traditions.push(i);
    }

    actor.weapons = weapons;
    actor.spells = spells;
    actor.powers = powers;
    actor.effects = effects;
    actor.traditions = traditions;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  /** @override */
  async _onDropItemCreate(itemData) {
    switch(itemData.type){
      case "itemTradition":
        for (let i of this.actor.items){
          if (i.data.type === "itemTradition") {
            return ui.notifications.warn(game.i18n.localize('SR5.WARN_OnlyOneTradition'));
          }
        }
        return super._onDropItemCreate(itemData);
        break;
      case "itemWeapon":
        for (let i of this.actor.items){
          if (i.data.type === "itemWeapon" && i.data.data.isActive && (i.data.data.category === itemData.data.category)) {
            return super._onDropItemCreate(itemData);
          }
        }
        itemData.data.isActive = true;
        return super._onDropItemCreate(itemData);
        break;
      case "itemPower":
        if (itemData.data.actionType === "permanent") itemData.data.isActive = true;
        return super._onDropItemCreate(itemData);
        break;
      case "itemTradition":
      case "itemSpell":
      case "itemEffect":
        return super._onDropItemCreate(itemData);
        break;
      default:
        ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
        return;
    }        
  }

}
