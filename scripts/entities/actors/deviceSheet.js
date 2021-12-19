import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for player character type actors in the Shadowrun 5 system.
 */
export class SR5AppareilSheet extends ActorSheetSR5 {
  constructor(...args) {
    super(...args);
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    return mergeObject(super.defaultOptions, {
      template: "systems/sr5/templates/actors/device-sheet.html",
      width: 800,
      height: 448,
      resizable: false,
      classes: ["sr5", "sheet", "actor", "device"],
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
    return data;
  }

  _prepareItems(actor) {
    const marks = [];
    const effects = [];

    // Iterate through items, allocating to containers
    for (let i of actor.items) {
      if (i.type === "itemMark") marks.push(i);
      else if (i.type === "itemEffect") effects.push(i);
    }
    actor.marks = marks;
    actor.effects = effects;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  /** @override */
  async _onDropItemCreate(itemData) {
    switch(itemData.type){
      case "itemMark":
      case "itemEffect":
        return super._onDropItemCreate(itemData);
        break;
      default:
        ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
        return;
    }        
  }
}
