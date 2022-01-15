import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for player character type actors in the Shadowrun 5 system.
 */
export class SR5DroneSheet extends ActorSheetSR5 {
  constructor(...args) {
    super(...args);

    this._shownUntrainedSkills = false;
    this._shownUntrainedGroups = false;
    this._filters = {
      skills: "",
    };
  }

  static get defaultOptions() {
    // const options = super.defaultOptions;
    return mergeObject(super.defaultOptions, {
      template: "systems/sr5/templates/actors/drone-sheet.html",
      width: 800,
      height: 618,
      resizable: false,
      classes: ["sr5", "sheet", "actor", "drone"],
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

    data.actor.lists = this.actor.data.lists;
    data.owner = this.actor.isOwner
    data.filters = this._filters;
    if (game.settings.get("sr5", "sr5MatrixGridRules")) data.rulesMatrixGrid = true;
    else data.rulesMatrixGrid = false;
    return data;
  }

  _prepareItems(actor) {
    const weapons = [];
    const armors = [];
    const programs = [];
    const marks = [];
    const ammunitions = [];
    const effects = [];

    // Iterate through items, allocating to containers
    for (let i of actor.items) {
      if (i.type === "itemWeapon") weapons.push(i);
      else if (i.type === "itemArmor") armors.push(i);
      else if (i.type === "itemProgram") programs.push(i);
      else if (i.type === "itemMark") marks.push(i);
      else if (i.type === "itemAmmunition") ammunitions.push(i);
      else if (i.type === "itemEffect") effects.push(i);
    }

    actor.weapons = weapons;
    actor.armors = armors;
    actor.programs = programs;
    actor.marks = marks;
    actor.ammunitions = ammunitions;
    actor.effects = effects;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  /** @override */
  async _onDropItemCreate(itemData) {
    switch(itemData.type){
      case "itemWeapon":
        if (itemData.data.category !== "rangedWeapon") {
          ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
          return;
        }
        for (let i of this.actor.items){
          if (i.data.type === "itemWeapon" && i.data.data.isActive && (i.data.data.category === itemData.data.category)) {
            return super._onDropItemCreate(itemData);
          }
        }
        itemData.data.isActive = true;
        return super._onDropItemCreate(itemData);
        break;
      case "itemArmor":
      case "itemProgram":
      case "itemMark":
      case "itemAmmunition":
      case "itemEffect":
        return super._onDropItemCreate(itemData);
        break;
      default:
        ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
        return;
    }
        
  }
}
