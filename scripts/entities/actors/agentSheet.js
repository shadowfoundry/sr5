import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for spirit type actors in the Shadowrun 5 system.
 */
export class SR5AgentSheet extends ActorSheetSR5 {
  constructor(...args) {
    super(...args);

    this._shownUntrainedSkills = false;
    this._shownNonRollableMatrixActions = false;
    this._filters = {
      skills: "",
      matrixActions: "",
    };
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/sr5/templates/actors/agent-sheet.html",
      width: 800,
      height: 618,
      resizable: false,
      classes: ["sr5", "sheet", "actor", "agent"],
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
    this._prepareMatrixActions(data.actor);

    data.actor.lists = this.actor.data.lists;
    data.owner = this.actor.isOwner
    data.filters = this._filters;
    if (game.settings.get("sr5", "sr5MatrixGridRules")) data.rulesMatrixGrid = true;
    else data.rulesMatrixGrid = false;
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

  _prepareMatrixActions(actor) {
    const activeMatrixActions = {};
    for (let [key, matrixAction] of Object.entries(actor.data.matrix.actions)) {
      if (matrixAction.test?.dicePool > 0 || matrixAction.defense?.dicePool > 0 || this._shownNonRollableMatrixActions) {
        activeMatrixActions[key] = matrixAction;
      }
    }
    actor.data.matrix.actions = activeMatrixActions;
  }

  _prepareItems(actor) {
    const effects = [];

    // Iterate through items, allocating to containers
    for (let i of actor.items) {
      if (i.type === "itemEffect") effects.push(i);
    }
    actor.effects = effects;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  /** @override */
  async _onDropItemCreate(itemData) {
    switch(itemData.type){
      case "itemEffect":
        return super._onDropItemCreate(itemData);
        break;
      default:
        ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
        return;
    }        
  }
  
}
