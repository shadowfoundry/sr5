import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for player character type actors in the Shadowrun 5 system.
 */
export class SR5GruntSheet extends ActorSheetSR5 {
  constructor(...args) {
    super(...args);

    this._shownUntrainedSkills = false;
    this._shownNonRollableMatrixActions = false;
    this._shownUntrainedGroups = false;
    this._filters = {
      skills: "",
      matrixActions: "",
    };
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    return mergeObject(super.defaultOptions, {
      template: "systems/sr5/templates/actors/grunt-sheet.html",
      width: 800,
      height: 618,
      resizable: false,
      classes: ["sr5", "sheet", "actor", "grunt"],
    });
  }

  getData() {
    const data ={
      editable: this.isEditable,
    };
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
    this._prepareSkillGroups(data.actor);
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

  _prepareSkillGroups(actor) {
    const activeGroups = {};
    for (let [key, group] of Object.entries(actor.data.skillGroups)) {
      if (group.value > 0 || this._shownUntrainedGroups)
        activeGroups[key] = group;
    }
    actor.data.skillGroups = activeGroups;
  }

  _prepareMatrixActions(actor) {
    const activeMatrixActions = {};
    let hasAttack = (actor.data.matrix.attributes.attack.value > 0) ? true : false; 
    let hasSleaze = (actor.data.matrix.attributes.sleaze.value > 0) ? true : false; 
    
    for (let [key, matrixAction] of Object.entries(actor.data.matrix.actions)) {
      let linkedAttribute = matrixAction.limit?.linkedAttribute;
      if ( (matrixAction.test?.dicePool >= 0 && (linkedAttribute === "attack" && hasAttack) )
        || (matrixAction.test?.dicePool >= 0 && (linkedAttribute === "sleaze" && hasSleaze) )
        || (matrixAction.test?.dicePool > 0 && (linkedAttribute === "firewall" || linkedAttribute === "dataProcessing" || linkedAttribute === "") )
        || this._shownNonRollableMatrixActions) {
          activeMatrixActions[key] = matrixAction;

      }
    }
    actor.data.matrix.actions = activeMatrixActions;
  }

  _prepareItems(actor) {
    const knowledges = [];
    const languages = [];
    const weapons = [];
    const armors = [];
    const augmentations = [];
    const qualities = [];
    const spells = [];
    const focuses = [];
    const adeptPowers = [];
    const martialArts = [];
    const metamagics = [];
    const gears = [];
    const spirits = [];
    const cyberdecks = [];
    const programs = [];
    const vehicles = [];
    const marks = [];
    const powers = [];
    const preparations = [];
    const complexForms = [];
    const sprites = [];
    const echoes = [];
    const ammunitions = [];
    const effects = [];
    const traditions = [];

    // Iterate through items, allocating to containers
    for (let i of actor.items) {
      if (i.type === "itemKnowledge") knowledges.push(i);
      else if (i.type === "itemLanguage") languages.push(i);
      else if (i.type === "itemQuality") qualities.push(i);
      else if (i.type === "itemSpell") spells.push(i);
      else if (i.type === "itemFocus") focuses.push(i);
      else if (i.type === "itemWeapon") weapons.push(i);
      else if (i.type === "itemArmor") armors.push(i);
      else if (i.type === "itemAugmentation") augmentations.push(i);
      else if (i.type === "itemAdeptPower") adeptPowers.push(i);
      else if (i.type === "itemMartialArt") martialArts.push(i);
      else if (i.type === "itemMetamagic") metamagics.push(i);
      else if (i.type === "itemGear") gears.push(i);
      else if (i.type === "itemSpirit") spirits.push(i);
      else if (i.type === "itemDevice") cyberdecks.push(i);
      else if (i.type === "itemProgram") programs.push(i);
      else if (i.type === "itemVehicle") vehicles.push(i);
      else if (i.type === "itemMark") marks.push(i);
      else if (i.type === "itemPower") powers.push(i);
      else if (i.type === "itemPreparation") preparations.push(i);
      else if (i.type === "itemComplexForm") complexForms.push(i);
      else if (i.type === "itemSprite") sprites.push(i);
      else if (i.type === "itemEcho") echoes.push(i);
      else if (i.type === "itemAmmunition") ammunitions.push(i);
      else if (i.type === "itemEffect") effects.push(i);
      else if (i.type === "itemDrug") gears.push(i);
      else if (i.type === "itemTradition") traditions.push(i);
    }

    actor.knowledges = knowledges;
    actor.languages = languages;
    actor.weapons = weapons;
    actor.armors = armors;
    actor.augmentations = augmentations;
    actor.qualities = qualities;
    actor.spells = spells;
    actor.focuses = focuses;
    actor.adeptPowers = adeptPowers;
    actor.martialArts = martialArts;
    actor.metamagics = metamagics;
    actor.spirits = spirits;
    actor.gears = gears;
    actor.cyberdecks = cyberdecks;
    actor.programs = programs;
    actor.vehicles = vehicles;
    actor.marks = marks;
    actor.powers = powers;
    actor.preparations = preparations;
    actor.complexForms = complexForms;
    actor.sprites = sprites;
    actor.echoes = echoes;
    actor.ammunitions = ammunitions;
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
      case "itemDevice":
        for (let i of this.actor.items){
          if (i.data.type === "itemDevice" && i.data.data.isActive) {
            return super._onDropItemCreate(itemData);
          }
        }
        itemData.data.isActive = true;
        return super._onDropItemCreate(itemData);
        break;
      case "itemArmor":
        for (let i of this.actor.items){
          if (i.data.type === "itemArmor" && i.data.data.isActive) {
            return super._onDropItemCreate(itemData);
          }
        }
        itemData.data.isActive = true;
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
      case "itemFocus":
      case "itemAugmentation":
      case "itemQuality":
        itemData.data.isActive = true;
        return super._onDropItemCreate(itemData);
        break;
      case "itemAdeptPower":
      case "itemPower":
      case "itemMartialArt" :  
        if (itemData.data.actionType === "permanent") itemData.data.isActive = true;
        return super._onDropItemCreate(itemData);
        break;
      default:
        return super._onDropItemCreate(itemData);
    }        
  }
  
}
