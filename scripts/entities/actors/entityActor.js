import { SR5 } from "../../config.js";
import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_SystemHelpers } from "../../system/utility.js";
import { SR5_UtilityItem } from "../items/utilityItem.js";
import { SR5_CharacterUtility } from "./utility.js";
import { SR5_CompendiumUtility } from "./utilityCompendium.js";
import { SR5_Roll } from "../../rolls/roll.js";
import { SR5Combat } from "../../system/srcombat.js";
import { _getSRStatusEffect } from "../../system/effectsList.js"
import { SR5_SocketHandler } from "../../socket.js";
import { SR5_DiceHelper } from "../../rolls/diceHelper.js";

/**
 * Extend the base Actor class to implement additional logic specialized for Shadowrun 5.
 */

export class SR5Actor extends Actor {

  /** Overide Actor's create Dialog to hide certain type and sort them alphabetically*/
  static async createDialog(data={}, {parent=null, pack=null, ...options}={}) {

    // Collect data
    const documentName = this.metadata.name;
    const hiddenTypes = ["actorAgent"];
    const originalTypes = game.system.documentTypes[documentName];
    const types = originalTypes.filter(
      (actorType) => !hiddenTypes.includes(actorType)
    );
    const folders = parent ? [] : game.folders.filter(f => (f.data.type === documentName) && f.displayed);
    const label = game.i18n.localize(this.metadata.label);
    const title = game.i18n.format("DOCUMENT.Create", {type: label});

    // Render the document creation form
    const html = await renderTemplate(`templates/sidebar/document-create.html`, {
      name: data.name || game.i18n.format("DOCUMENT.New", {type: label}),
      folder: data.folder,
      folders: folders,
      hasFolders: folders.length >= 1,
      type: data.type || types[0],
      types: types.reduce((obj, t) => {
        const label = CONFIG[documentName]?.typeLabels?.[t] ?? t;
        obj[t] = game.i18n.has(label) ? game.i18n.localize(label) : t;
        return SR5_EntityHelpers.sortObjectValue(obj);
      }, {}),
      hasTypes: types.length > 1
    });

    // Render the confirmation dialog window
    return Dialog.prompt({
      title: title,
      content: html,
      label: title,
      callback: html => {
        const form = html[0].querySelector("form");
        const fd = new FormDataExtended(form);
        foundry.utils.mergeObject(data, fd.toObject(), {inplace: true});
        if ( !data.folder ) delete data["folder"];
        if ( types.length === 1 ) data.type = types[0];
        return this.create(data, {parent, pack, renderSheet: true});
      },
      rejectClose: false,
      options: options
    });
  }

  static async create(data, options) {
    if (!data.img) {
      data.img = `systems/sr5/img/actors/${data.type}.svg`;
    }
    // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
    if (data.items) {
      return super.create(data, options);
    }

    // Initialize empty items
    data.items = [];

    // Handle special create method
    let dialogData = {lists: SR5_EntityHelpers.sortTranslations(SR5),};
    let baseItems;

    switch (data.type){
      case "actorSpirit":
        let spiritForce, spiritType;
        renderTemplate("systems/sr5/templates/interface/createSpirit.html", dialogData).then((dlg) => {
          new Dialog({
            title: game.i18n.localize('SR5.SpiritType'),
            content: dlg,
            buttons: {
              ok: {
                label: "Ok",
                callback: async (dialog) => {
                  spiritType = dialog.find("[name=spiritType]").val();
                  spiritForce = dialog.find("[name=spiritForce]").val();
                  baseItems = await SR5_CompendiumUtility.getBaseItems(data.type, spiritType, spiritForce);
                  for (let baseItem of baseItems) {
                    data.items.push(baseItem);
                  }
                  data.data = {
                    "force": {
                      "base": parseInt(spiritForce),
                      "value": 0,
                      "modifiers": []
                    },
                    "type": spiritType
                  };
                  SR5_EntityHelpers.updateValue(data.data.force);
                  super.create(data, options);
                },
              },
            },
            default: "ok",
            close: () => SR5_SystemHelpers.srLog(3, data),
          }).render(true);
        });
      break;
      case "actorSprite":
        let spriteLevel, spriteType;
        renderTemplate("systems/sr5/templates/interface/createSprite.html", dialogData).then((dlg) => {
          new Dialog({
            title: game.i18n.localize('SR5.SpriteType'),
            content: dlg,
            buttons: {
              ok: {
                label: "Ok",
                callback: async (dialog) => {
                  spriteType = dialog.find("[name=spriteType]").val();
                  spriteLevel = dialog.find("[name=spriteLevel]").val();
                  baseItems = await SR5_CompendiumUtility.getBaseItems(data.type, spriteType, spriteLevel);
                  for (let baseItem of baseItems) {
                    data.items.push(baseItem);
                  }
                  data.data = {
                    "level": parseInt(spriteLevel),
                    "type": spriteType
                  };
                  super.create(data, options);
                },
              },
            },
            default: "ok",
            close: () => SR5_SystemHelpers.srLog(3, data),
          }).render(true);
        });
      break;
      case "actorDevice":
      case "actorDrone":
      case "actorAgent":
        baseItems = {
          "name": game.i18n.localize("SR5.Device"),
          "type": "itemDevice",
        }
        baseItems.data = {
          "isActive": true,
          "type": "baseDevice",
        }
        data.items.push(baseItems);
        super.create(data, options);
        break;
      case "actorGrunt":
      case "actorPc":
        baseItems = await SR5_CompendiumUtility.getBaseItems(data.type);
        for (let baseItem of baseItems) {
          data.items.push(baseItem);
        }
        super.create(data, options);
        break;
      default:
      super.create(data, options);
    }
  }

  async _preCreate(createData, options, user) {
    this.data.update({
      "token.vision": true,
      "token.dimSight": 100,
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER,
      "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER,
      "token.name": this.name,
    });

    let actorLink = false;
    if (this.type === "actorPc") actorLink = true;
    if (this.type === "actorAgent") actorLink = true;
    if (this.type === "actorSpirit" && this.data.data.creatorId !== "") actorLink = true;
    if (this.type === "actorDrone" && this.data.data.creatorId !== "") actorLink = true;
    if (this.type === "actorSprite" && this.data.data.creatorId !== "") actorLink = true;

    switch(this.type){
      case "actorPc":
        this.data.update({
          "token.actorLink": actorLink,
          "token.lockRotation": true,
          "token.bar1": {
            attribute: "statusBars.physical",
          },
          "token.bar2": {
            attribute: "statusBars.stun",
          },
        });
        break;
      case "actorGrunt":
        this.data.update({
          "token.lockRotation": true,
          "token.disposition": CONST.TOKEN_DISPOSITIONS.HOSTILE,
          "token.bar1": {
            attribute: "statusBars.condition",
          },
        });
        break;
      case "actorSpirit":
        this.data.update({
          "token.lockRotation": true,
          "token.actorLink": actorLink,
          "token.bar1": {
            attribute: "statusBars.physical",
          },
          "token.bar2": {
            attribute: "statusBars.stun",
          },
        });
        break;
      case "actorDrone":
        this.data.update({
          "token.lockRotation": true,
          "token.actorLink": actorLink,
          "token.bar1": {
            attribute: "statusBars.condition",
          },
          "token.bar2": {
            attribute: "statusBars.matrix",
          },
        });
        break;
      case "actorDevice":
      case "actorSprite":
      case "actorAgent":
        this.data.update({
          "token.lockRotation": true,
          "token.actorLink": actorLink,
          "token.bar2": {
            attribute: "statusBars.matrix",
          },
        });
        let effect = SR5_CharacterUtility.generateInitiativeEffect("matrixInit");
        let initiativeEffect = new CONFIG.ActiveEffect.documentClass(effect);
        const effects = this.effects.map(e => e.toObject());
        effects.push(initiativeEffect.toObject());
        this.data.update({ effects });
        break;
      default :
        SR5_SystemHelpers.srLog(1, `Unknown '${this.type}' type in 'base _preCreate()'`);
    }
  }

  prepareData() {
    if (!this.data.img) this.data.img = CONST.DEFAULT_TOKEN;
    if (!this.data.name)
      this.data.name = "[" + game.i18n.localize("SR5.New") + "]" + this.entity;
    this.prepareBaseData();
    this.prepareEmbeddedDocuments(); // first pass on items to add bonuses from the items to the characters
    this.prepareDerivedData();
    this.sortLists(this.data.data);
    this.updateItems(this); // second pass on items to get characters data for final items calculations
  }

  prepareBaseData() {
    let actor = this.data, data = actor.data;
    actor.lists = SR5_EntityHelpers.sortTranslations(SR5);
    data.isGM = game.user.isGM;

    switch (actor.type) {
      case "actorPc":
      case "actorGrunt":
        SR5_CharacterUtility.resetCalculatedValues(actor);
        SR5_CharacterUtility.applyRacialModifers(actor);
        break;
      case "actorDrone":
      case "actorDevice":
      case "actorSprite":
      case "actorAgent":
        SR5_CharacterUtility.resetCalculatedValues(actor);
        break;
      case "actorSpirit":
        if (!data.hasOwnProperty("type")) data.type = actor.flags.spiritType;
        if (data.force < 1) data.force = parseInt(actor.flags.spiritForce);
        SR5_CharacterUtility.resetCalculatedValues(actor);
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${actor.type}' actor type in prepareBaseData()`);
    }

    return actor;
  }

  prepareDerivedData() {
    let actor = this.data;

    if (actor.flags.sr5 === undefined) actor.flags.sr5 = {};

    switch (actor.type) {
      case "actorDrone":
        if (actor.flags.sr5?.vehicleControler) SR5_CharacterUtility.applyAutosoftEffect(actor);
        SR5_CharacterUtility.updateAttributes(actor);
        SR5_CharacterUtility.updateInitiativePhysical(actor);
        SR5_CharacterUtility.generateVehicleSkills(actor);
        SR5_CharacterUtility.updateResistances(actor);
        SR5_CharacterUtility.updateDefenses(actor);
        SR5_CharacterUtility.generateVehicleTest(actor);
        SR5_CharacterUtility.updateRecoil(actor);
        SR5_CharacterUtility.updateConditionMonitors(actor);
        SR5_CharacterUtility.updateVehicleSlots(actor);
        break;
      case "actorSpirit":
        SR5_CharacterUtility.updateSpiritValues(actor);
        SR5_CharacterUtility.updateSpiritAttributes(actor);
        SR5_CharacterUtility.updateAttributes(actor);
        SR5_CharacterUtility.updateEssence(actor);
        SR5_CharacterUtility.updateSpecialAttributes(actor);
        if (actor.data.isMaterializing) actor.data.specialProperties.hardenedArmorType = "essenceX2";
        SR5_CharacterUtility.updateSpecialProperties(actor);
        SR5_CharacterUtility.updateConditionMonitors(actor);
        SR5_CharacterUtility.updatePenalties(actor);
        SR5_CharacterUtility.updateInitiativePhysical(actor);
        SR5_CharacterUtility.updateInitiativeAstral(actor);
        SR5_CharacterUtility.updateLimits(actor);
        SR5_CharacterUtility.generateSpiritSkills(actor);
        SR5_CharacterUtility.updateSkills(actor);
        SR5_CharacterUtility.updateResistances(actor);
        SR5_CharacterUtility.updateDefenses(actor);
        SR5_CharacterUtility.updateDerivedAttributes(actor);
        SR5_CharacterUtility.updateMovements(actor);
        SR5_CharacterUtility.updateAstralValues(actor);
        SR5_CharacterUtility.updateEncumbrance(actor);
        SR5_CharacterUtility.handleVision(actor);
        break;
      case "actorSprite":
        SR5_CharacterUtility.updateSpriteValues(actor);
        SR5_CharacterUtility.updateAttributes(actor);
        SR5_CharacterUtility.updateSpecialAttributes(actor);
        SR5_CharacterUtility.updateLimits(actor);
        SR5_CharacterUtility.generateSpriteSkills(actor);
        SR5_CharacterUtility.updateSkills(actor);
        SR5_CharacterUtility.updateConditionMonitors(actor);
      case "actorDevice":
        SR5_CharacterUtility.updateConditionMonitors(actor);
        break;
      case "actorAgent":
        SR5_CharacterUtility.applyProgramToAgent(actor);
        break;
      case "actorPc":
      case "actorGrunt":
        SR5_CharacterUtility.updateAttributes(actor);
        SR5_CharacterUtility.updateEssence(actor);
        SR5_CharacterUtility.updateSpecialAttributes(actor);
        SR5_CharacterUtility.updateSpecialProperties(actor);
        SR5_CharacterUtility.updateConditionMonitors(actor);
        SR5_CharacterUtility.updatePenalties(actor);
        SR5_CharacterUtility.updateLimits(actor);
        SR5_CharacterUtility.updateInitiativePhysical(actor);
        SR5_CharacterUtility.updateInitiativeAstral(actor);
        SR5_CharacterUtility.updateSkills(actor);
        SR5_CharacterUtility.updateArmor(actor);
        SR5_CharacterUtility.updateResistances(actor);
        SR5_CharacterUtility.updateDefenses(actor);
        SR5_CharacterUtility.updateDerivedAttributes(actor);
        SR5_CharacterUtility.updateEncumbrance(actor);
        SR5_CharacterUtility.updateRecoil(actor);
        SR5_CharacterUtility.updateMovements(actor);
        SR5_CharacterUtility.updateAstralValues(actor);
        SR5_CharacterUtility.updatePowerPoints(actor);
        SR5_CharacterUtility.updateCounterSpellPool(actor);
        SR5_CharacterUtility.handleVision(actor);
        if (actor.type === "actorPc") {
          SR5_CharacterUtility.updateKarmas(actor);
          SR5_CharacterUtility.updateNuyens(actor);
          SR5_CharacterUtility.updateStreetCred(actor);
          SR5_CharacterUtility.updateNotoriety(actor);
          SR5_CharacterUtility.updatePublicAwareness(actor);
        }
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${actor.type}' actor type in prepareDerivedData()`);
    }
  }

  prepareEmbeddedDocuments() {
    //super.prepareEmbeddedDocuments();

    const actorData = this.data;
    const lists = SR5;

    // Iterate through items, allocating to containers
    for (let i of actorData.items) {
      let iData = i.data.data;
      SR5_SystemHelpers.srLog(3, `Parsing '${i.type}' item named '${i.name}'`, i);
      switch (i.type) {
        case "itemGear":
          i.prepareData();
          if (!iData.isSlavedToPan) actorData.data.matrix.potentialPanObject.gears[i.uuid] = i.name;
          if (iData.isActive && iData.wirelessTurnedOn) actorData.data.matrix.connectedObject.gears[i.id] = i.name;
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemPower":
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemMetamagic":
        case "itemEcho":
        case "itemMartialArt":
        case "itemPreparation":
        case "itemQuality":
          i.prepareData();
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemSpell":
          i.prepareData();
          if (!iData.freeSustain && !iData.preparation) actorData.data.magic.spellList[i.id] = i.name;
          SR5_UtilityItem._handleSpell(i.data, actorData);
          if (iData.isActive && Object.keys(iData.customEffects)) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemArmor":
          i.prepareData();
          let modifierType;
          SR5_UtilityItem._handleItemCapacity(iData);
          SR5_UtilityItem._handleItemPrice(iData);
          SR5_UtilityItem._handleItemAvailability(iData);
          SR5_UtilityItem._handleItemConcealment(iData);
          if (iData.isActive) {
            if (iData.isCumulative) modifierType = "armorAccessory";
            else modifierType = "armorMain";
            if (!iData.isAccessory) SR5_EntityHelpers.updateModifier(actorData.data.itemsProperties.armor, `${i.name}`, modifierType, iData.armorValue.value);
            if (!iData.isAccessory) SR5_EntityHelpers.updateModifier(actorData.data.resistances.fall, `${i.name}`, modifierType, iData.armorValue.value);
            if (Object.keys(iData.customEffects).length) {
              SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
            }
          }
          if (iData.isActive && iData.wirelessTurnedOn) actorData.data.matrix.connectedObject.armors[i.id] = i.name;
          if (!iData.isSlavedToPan) actorData.data.matrix.potentialPanObject.armors[i.uuid] = i.name;
          break;

        case "itemAugmentation":
          i.prepareData();
          SR5_UtilityItem._handleAugmentation(iData, actorData);
          if (!iData.isAccessory) {
            SR5_EntityHelpers.updateModifier(actorData.data.essence, `${i.name}`, `${game.i18n.localize(lists.itemTypes[i.type])}`, -iData.essenceCost.value);
          }
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          if (iData.isActive && iData.wirelessTurnedOn) actorData.data.matrix.connectedObject.augmentations[i.id] = i.name;
          if (!iData.isSlavedToPan) actorData.data.matrix.potentialPanObject.augmentations[i.uuid] = i.name;
          break;

        case "itemAdeptPower":
          SR5_EntityHelpers.updateModifier(actorData.data.magic.powerPoints, i.name, `${game.i18n.localize(lists.itemTypes[i.type])}`, iData.powerPointsCost.value);
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemSpirit":
          i.prepareData();
          SR5_UtilityItem._handleSpirit(iData);
          if (iData.isBounded) actorData.data.magic.boundedSpirit.current ++;
          if (iData.isActive) SR5_CharacterUtility._actorModifPossession(i, actorData);
          break;

        case "itemDevice":
          i.prepareData();
          if (actorData.type === "actorPc" || actorData.type === "actorGrunt"){
            iData.conditionMonitors.matrix.value = Math.ceil(iData.deviceRating / 2) + 8;
            if (iData.isActive) {
              SR5_CharacterUtility.generateMatrixAttributes(i.data, actorData);
              if (Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
            }
          }
          break;

        case "itemProgram":
          i.prepareData();
          //SR5_SystemHelpers.srLog(3, 'program', actorData);
          if (actorData.type === "actorDrone" && actorData.data.controlMode !== "autopilot") iData.isActive = false;
          if (iData.type === "common" || iData.type === "hacking" || iData.type === "autosoft" || iData.type === "agent") {
            if (iData.isActive) {
              SR5_EntityHelpers.updateModifier(actorData.data.matrix.programsCurrentActive, `${i.name}`, `${game.i18n.localize(lists.itemTypes[i.type])}`, 1);
              SR5_EntityHelpers.updateValue(actorData.data.matrix.programsCurrentActive, 0);
            }
          }
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            if (actorData.type === "actorDrone") SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
            if (iData.type !== "autosoft" && (actorData.type === "actorPc" || actorData.type === "actorGrunt"))
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemComplexForm":
          i.prepareData();
          if (!iData.freeSustain) actorData.data.matrix.complexFormList[i.id] = i.name;
          SR5_UtilityItem._handleComplexForm(i, this);
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemKarma":
        case "itemNuyen":
          i.prepareData();
          let target;
          if (iData.amount && iData.type) {
            let resourceLabel = `${game.i18n.localize(lists.transactionsTypes[iData.type])} (${i.name})`;
            switch (i.type) {
              case "itemKarma":
                target = actorData.data.karma;
                break;
              case "itemNuyen":
                target = actorData.data.nuyen;
                break;
            }
            if (iData.amount < 0) iData.amount = -iData.amount;
            SR5_EntityHelpers.updateModifier(target, resourceLabel, `${i.type}_${i.id}_${iData.type}`, iData.amount);
          }
          break;

        case "itemWeapon":
          let modes = (iData.weaponModes = []);
          for (let mode of Object.entries(iData.firingMode)) {
            if (mode[1].value)
              modes.push(game.i18n.localize(SR5.weaponModesAbbreviated[mode[0]]));
          }
          SR5_UtilityItem._handleVisionAccessory(iData, actorData);
          if(actorData.data.matrix){
            if (iData.isActive && iData.wirelessTurnedOn) actorData.data.matrix.connectedObject.weapons[i.id] = i.name;
            if (!iData.isSlavedToPan) actorData.data.matrix.potentialPanObject.weapons[i.uuid] = i.name;
          }
          break;

        case "itemFocus":
          SR5_UtilityItem._handleFocus(iData);
          let focusLabel = `${i.name} (${game.i18n.localize("SR5.Focus")})`;
          switch (iData.type) {
            case "alchemical":
            case "banishing":
            case "masking":
            case "centering":
            case "counterspelling":
            case "disenchanting":
            case "spellShaping":
            case "summoning":
            case "spellcasting":
            case "ritualSpellcasting":
            case "power":
            case "flexibleSignature":
            case "qi":
              break;
            case "weapon":
                iData.weaponChoices = SR5_UtilityItem._generateWeaponFocusWeaponList(i, this);
                if (iData.linkedWeapon){
                  let linkedWeapon = this.items.find(w => w.id === iData.linkedWeapon);
                  iData.linkedWeaponName = linkedWeapon.name;
                }
              break;
            case "sustaining":
              iData.spellChoices = SR5_UtilityItem._generateSustainFocusSpellList(iData, actorData);
              if (iData.isActive){
                let sustainedSpell = actorData.items.find(s => s.name == iData.sustainedSpell)
                if (sustainedSpell
                  && !sustainedSpell.data.data.freeSustain
                  && sustainedSpell.data.data.isActive
                  && (sustainedSpell.data.data.force <= iData.itemRating)){
                    sustainedSpell.data.data.freeSustain = true;
                  }
                }
              break;
            default:
              SR5_SystemHelpers.srLog(3,`Unknown focus type '${iData.type}' in 'prepareEmbeddedDocuments()'`);
          }
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemRitual":
          i.prepareData();
          iData.spellChoices = SR5_UtilityItem._generateSpellList(iData, actorData);
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemDrug":
          i.prepareData();
          if ((iData.isActive || iData.wirelessTurnedOn) && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemEffect":
          i.prepareData();
          if (Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          if (iData.type === "signalJam") actorData.data.matrix.isJamming = true;
          break;

        case "itemTradition":
          i.prepareData();
          SR5_CharacterUtility.updateTradition(actorData, iData);
          break;

        case "itemSprite":
          i.prepareData();
          if (iData.isRegistered) actorData.data.matrix.registeredSprite.current ++;
          break;

        case "itemVehicleMod":
          i.prepareData();
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          if (iData.secondaryPropulsion.isSecondaryPropulsion && iData.isActive) {
            SR5_CharacterUtility.handleSecondaryAttributes(actorData, i.data);
          }
          SR5_CharacterUtility.updateModificationsSlots(actorData, i.data);          
          SR5_UtilityItem._handleItemPrice(iData);
          SR5_UtilityItem._handleItemAvailability(iData);
          break;

        case "itemVehicle":        
          i.prepareData();
          SR5_UtilityItem._handleVehicleSlots(iData);
          break;

        case "itemLifestyle":
        case "itemAmmunition":
        case "itemSin":     
          i.prepareData();
          break;

        case "itemLanguage":
        case "itemKnowledge":
        case "itemMark":
        case "itemContact":
        case "itemCyberdeck":
        case "itemSpritePower":
          break;

        default:
          SR5_SystemHelpers.srLog(1, `Unknown '${i.type}' item type in prepareEmbeddedDocuments()`);
      }
    }
  }

  sortLists(data) {
    SR5_SystemHelpers.srLog(3, `Sorting specific lists by order of translated terms`);
    if (data.skills) data.skills = SR5_EntityHelpers.sortByTranslatedTerm(data.skills, "skills");
    if (data.skillGroups) data.skillGroups = SR5_EntityHelpers.sortByTranslatedTerm(data.skillGroups, "skillGroups");
    if (data.matrix && data.matrix.actions) data.matrix.actions = SR5_EntityHelpers.sortByTranslatedTerm(data.matrix.actions, "matrixActions");
  }

  updateItems(actor) {
    //super.prepareEmbeddedDocuments();
    let actorData = actor.data;
    for (let i of actorData.items) {
      let iData = i.data.data;
      switch (i.data.type){
        case "itemDevice":
          if (actorData.type === "actorPc" || actorData.type === "actorGrunt"){
            if (iData.isActive === true){
              SR5_CharacterUtility.generateMatrixAttributes(i.data, actorData);
              SR5_CharacterUtility.generateMatrixResistances(actorData, i.data);
              SR5_CharacterUtility.generateMatrixActions(actorData);
              SR5_CharacterUtility.generateMatrixActionsDefenses(actorData);
              SR5_CharacterUtility.updateInitiativeMatrix(actorData);
              if (iData.type ==="riggerCommandConsole") {
                if (actor.testUserPermission(game.user, 3)) SR5_CharacterUtility.updateControledVehicle(actorData);
              }
              if (iData.type === "livingPersona" || iData.type === "headcase") {
                SR5_CharacterUtility.generateResonanceMatrix(i.data, actorData);
              }
              iData.pan.max = actorData.data.matrix.deviceRating * 3;
            }
          } else if (actorData.type === "actorDrone"){
            SR5_CharacterUtility.generateVehicleMatrix(actorData, i.data);
            SR5_CharacterUtility.generateMatrixResistances(actorData, i.data);
            SR5_CharacterUtility.generateMatrixActionsDefenses(actorData);
          } else if (actorData.type === "actorDevice"){
            SR5_CharacterUtility.generateDeviceMatrix(actorData, i.data);
            SR5_CharacterUtility.generateMatrixResistances(actorData, i.data);
            SR5_CharacterUtility.generateMatrixActionsDefenses(actorData);
            if (actorData.data.matrix.deviceType === "ice") {
              SR5_CharacterUtility.updateInitiativeMatrix(actorData);
            }
          } else if (actorData.type === "actorSprite"){
            SR5_CharacterUtility.generateSpriteMatrix(actorData, i.data);
            SR5_CharacterUtility.generateMatrixResistances(actorData, i.data);
            SR5_CharacterUtility.generateMatrixActions(actorData);
            SR5_CharacterUtility.generateMatrixActionsDefenses(actorData);
            SR5_CharacterUtility.updateInitiativeMatrix(actorData);
          } else if (actorData.type === "actorAgent"){
            SR5_CharacterUtility.generateAgentMatrix(actorData, i.data);
            SR5_CharacterUtility.generateMatrixActionsDefenses(actorData);
            SR5_CharacterUtility.generateMatrixActions(actorData);
            SR5_CharacterUtility.generateMatrixResistances(actorData, i.data);
            SR5_CharacterUtility.updateConditionMonitors(actorData);
            SR5_CharacterUtility.updateInitiativeMatrix(actorData);
          }
          break;
        case "itemComplexForm":
          iData.threaderResonance = actorData.data.specialAttributes.resonance.augmented.value;
          break;
        case "itemArmor":
        case "itemGear":
        case "itemAugmentation":
          if (Object.keys(iData.accessory).length) SR5_UtilityItem._updatePluggedAccessory(i.data, actorData);
          break;
        case "itemSpell":
          iData.casterMagic = actorData.data.specialAttributes.magic.augmented.value;
          break;
        case "itemSpirit":
          if (iData.isBounded){
            for (let [key, value] of Object.entries(actorData.data.magic.elements)){
              if(iData.type === value) iData.spellType = key;
            }
          }
          break;
        case "itemVehicleMod":
            i.prepareData();
          break;
        case "itemWeapon":
        case "itemKnowledge":
        case "itemLanguage":
        case "itemPower":
        case "itemSpritePower":
        case "itemAdeptPower":
        case "itemVehicle":
          i.prepareData();
          break;
      }
    }
  }

  //Roll a test
  rollTest(rollType, rollKey, chatData){
    SR5_Roll.actorRoll(this, rollType, rollKey, chatData);
  }

  //Applique les dégâts à l'acteur
  async takeDamage(options) { //
    let damage = options.damageValue,
        damageType = options.damageType,
        actorData = deepClone(this.data),
        gelAmmo = 0,
        damageReduction = 0,
        realDamage;

    actorData = actorData.toObject(false);
    if (options.ammoType === "gel") gelAmmo = -2;
    if (actorData.data.specialProperties?.damageReduction) damageReduction = actorData.data.specialProperties.damageReduction.value;
    if (damage > 1) damage -= damageReduction;

    switch (actorData.type){
      case "actorPc":
      case "actorSpirit":
        if (options.matrixDamageValue) {
          damage = options.matrixDamageValue;
          damageType = "stun";
        }
        if (damageType === "stun") {
          actorData.data.conditionMonitors.stun.actual.base += damage;
          SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors[damageType].actual, 0);
          if (actorData.data.conditionMonitors.stun.actual.value > actorData.data.conditionMonitors.stun.value){
            realDamage = damage - (actorData.data.conditionMonitors.stun.actual.value - actorData.data.conditionMonitors.stun.value);
          } else realDamage = damage;        
        } else if (damageType === "physical") {
          actorData.data.conditionMonitors.physical.actual.base += damage;
          SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors[damageType].actual, 0);
          if (actorData.data.conditionMonitors.physical.actual.value > actorData.data.conditionMonitors.physical.value) {
            realDamage = damage - (actorData.data.conditionMonitors.physical.actual.value - actorData.data.conditionMonitors.physical.value);
          } else realDamage = damage ;
        }
        if (realDamage > 0) ui.notifications.info(`${this.name}: ${realDamage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);

        if (actorData.data.conditionMonitors.stun.actual.value > actorData.data.conditionMonitors.stun.value) {
          let carriedDamage = actorData.data.conditionMonitors.stun.actual.value - actorData.data.conditionMonitors.stun.value;
          actorData.data.conditionMonitors.physical.actual.base += carriedDamage;
          SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.physical.actual, 0);
          actorData.data.conditionMonitors.stun.actual.base = actorData.data.conditionMonitors.stun.value;
          SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.stun.actual, 0);
          ui.notifications.info(`${this.name}: ${carriedDamage}${game.i18n.localize(SR5.damageTypesShort.physical)} ${game.i18n.localize("SR5.Applied")}.`);
        }

        if ((actorData.data.conditionMonitors.physical.actual.value > actorData.data.conditionMonitors.physical.value) && actorData.type === "actorPc") {
          let carriedDamage = actorData.data.conditionMonitors.physical.actual.value - actorData.data.conditionMonitors.physical.value;
          actorData.data.conditionMonitors.overflow.actual.base += carriedDamage;
          SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.overflow.actual, 0);
          actorData.data.conditionMonitors.physical.actual.base = actorData.data.conditionMonitors.physical.value;
          SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.physical.actual, 0);
          if (actorData.data.conditionMonitors.overflow.actual.value > actorData.data.conditionMonitors.overflow.value){
            actorData.data.conditionMonitors.overflow.actual.base = actorData.data.conditionMonitors.overflow.value;
            SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.overflow.actual, 0);
          }
        }
        break;
      case "actorGrunt":
        actorData.data.conditionMonitors.condition.actual.base += damage;
        SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.condition.actual, 0);
        ui.notifications.info(`${this.name}: ${damage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);
        break;
      case "actorDrone":
        if (damageType === "physical") {
          actorData.data.conditionMonitors.condition.actual.base += damage;
          SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.condition.actual, 0);
          ui.notifications.info(`${this.name}: ${damage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);
          if (actorData.data.controlMode === "rigging"){
            let controler = SR5_EntityHelpers.getRealActorFromID(actorData.data.vehicleOwner.id)
            let chatData = {
              damageResistanceType : "biofeedback",
              damageValue: Math.ceil(damage/2),
            }
            controler.rollTest("resistanceCard", null, chatData);
          }
        }
        if (options.damageElement === "electricity") options.matrixDamageValue = Math.floor(options.damageValue / 2);
        if (options.matrixDamageValue) {
          actorData.data.conditionMonitors.matrix.actual.base += options.matrixDamageValue;
          SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.matrix.actual, 0);
          ui.notifications.info(`${this.name}: ${options.matrixDamageValue} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
        }
        break;
      case "actorAgent":
      case "actorSprite":
      case "actorDevice":
        if (options.matrixDamageValue) {
          actorData.data.conditionMonitors.matrix.actual.base += options.matrixDamageValue;
          SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.matrix.actual, 0);
          ui.notifications.info(`${this.name}: ${options.matrixDamageValue} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
        }
        break;
    }

    await this.update(actorData);

    //Status
    switch (actorData.type){
      case "actorPc":
      case "actorSpirit":
        if (actorData.data.conditionMonitors.physical.actual.value >= actorData.data.conditionMonitors.physical.value) await this.createDeadEffect();
        else if (actorData.data.conditionMonitors.stun.actual.value >= actorData.data.conditionMonitors.stun.value) await this.createKoEffect();
        else if ((damage > (actorData.data.limits.physicalLimit.value + gelAmmo) || damage >= 10)
          && actorData.data.conditionMonitors.stun.actual.value < actorData.data.conditionMonitors.stun.value
          && actorData.data.conditionMonitors.physical.actual.value < actorData.data.conditionMonitors.physical.value) await this.createProneEffect(damage, actorData, gelAmmo);
          break;
      case "actorGrunt":
      case "actorDrone":
        if (actorData.data.conditionMonitors.condition.actual.value >= actorData.data.conditionMonitors.condition.value) await this.createDeadEffect();
        else if (damage > (actorData.data.limits.physicalLimit.value + gelAmmo) || damage >= 10){ await this.createProneEffect(damage, actorData, gelAmmo);}
        break;
      case "actorSprite":
      case "actorDevice":
        if (actorData.data.conditionMonitors.matrix.actual.value >= actorData.data.conditionMonitors.matrix.value) await this.createDeadEffect();
        break;
    }

    //Special Element Damage
    if (options.damageElement === "electricity" && actorData.type !== "actorDrone"){
      await this.electricityDamageEffect();
    }
    if (options.damageElement === "acid"){
      await this.acidDamageEffect(damage, options.damageSource);
    }
    if (options.damageElement === "fire"){
      if (this.data.data.itemsProperties.armor.value <= 0) await this.fireDamageEffect()
      else await this.checkIfCatchFire(options.fireTreshold, options.damageSource, options.incomingPA);
    }
  }

  //Handle prone effect
  async createProneEffect(damage, actorData, gelAmmo){
    for (let e of this.data.effects){
      if (e.data.flags.core?.statusId === "prone") return;
    }
    let effect = await _getSRStatusEffect("prone");
    await this.createEmbeddedDocuments('ActiveEffect', [effect]);
    if (damage >= 10) ui.notifications.info(`${this.name}: ${game.i18n.format("SR5.INFO_DamageDropProneTen", {damage: damage})}`);
    else if (gelAmmo < 0) ui.notifications.info(`${this.name}: ${game.i18n.format("SR5.INFO_DamageDropProneGel", {damage: damage, limit: actorData.data.limits.physicalLimit.value})}`);
    else ui.notifications.info(`${this.name}: ${game.i18n.format("SR5.INFO_DamageDropProne", {damage: damage, limit: actorData.data.limits.physicalLimit.value})}`);
  }

  //Handle death effect
  async createDeadEffect(){
    for (let e of this.data.effects){
      if (e.data.flags.core?.statusId === "dead") return;
    }
    let effect = await _getSRStatusEffect("dead");
    await this.createEmbeddedDocuments('ActiveEffect', [effect]);
    ui.notifications.info(`${this.name}: ${game.i18n.localize("SR5.INFO_DamageActorDead")}`);
  }

  //Handle ko effect
  async createKoEffect(){
    for (let e of this.data.effects){
      if (e.data.flags.core?.statusId === "unconscious") return;
    }
    let effect = await _getSRStatusEffect("unconscious")
    await this.createEmbeddedDocuments('ActiveEffect', [effect]);
    ui.notifications.info(`${this.name}: ${game.i18n.localize("SR5.INFO_DamageActorKo")}`);
  }

  //Handle Elemental Damage : Electricity
  async electricityDamageEffect(){
    let existingEffect = this.items.find((item) => item.type === "itemEffect" && item.data.data.type === "electricityDamage");
    if (existingEffect){
      let updatedEffect = existingEffect.toObject(false);
      updatedEffect.data.duration += 1;
      await this.updateEmbeddedDocuments("Item", [updatedEffect]);
      ui.notifications.info(`${this.name}: ${existingEffect.name} ${game.i18n.localize("SR5.INFO_DurationExtendOneRound")}.`);
    } else {
      let effect = {
        name: `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageElectricity")})`,
        type: "itemEffect",
        "data.type": "electricityDamage",
        "data.target": game.i18n.localize("SR5.GlobalPenalty"),
        "data.value": -1,
        "data.durationType": "round",
        "data.duration": 1,
        "data.customEffects": {
          "0": {
              "category": "penaltyTypes",
              "target": "data.penalties.special.actual",
              "type": "value",
              "value": -1,
              "forceAdd": true,
          }
        }
      }
      ui.notifications.info(`${this.name}: ${effect.name} ${game.i18n.localize("SR5.Applied")}.`);
      await SR5Combat.changeInitInCombat(this, -5);
      await this.createEmbeddedDocuments("Item", [effect]);
      let statusEffect = await _getSRStatusEffect("electricityDamage");
      await this.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
    }
  }

  //Handle Elemental Damage : Acid
  async acidDamageEffect(damage, source){
    let existingEffect = this.items.find((item) => item.type === "itemEffect" && item.data.data.type === "acidDamage");
    let armor = this.items.find((item) => item.type === "itemArmor" && item.data.data.isActive && !item.data.data.isAccessory);
    if (existingEffect){
      return;
    } else {
      if (armor){
        let updatedArmor = armor.toObject(false);
        let armorEffect = {
          "name": `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageAcid")})`,
          "target": "data.armorValue",
          "wifi": false,
          "type": "value",
          "value": -1,
          "multiplier": 1
        }
        updatedArmor.data.itemEffects.push(armorEffect);
        await this.updateEmbeddedDocuments("Item", [updatedArmor]);
        ui.notifications.info(`${this.name}: ${game.i18n.format("SR5.INFO_AcidReduceArmor", {armor: armor.name})}`);
      }
      let duration;
      if (source === "spell") duration = 1;
      else duration = damage;
      let effect = {
        name: `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageAcid")})`,
        type: "itemEffect",
        "data.type": "acidDamage",
        "data.target": `${game.i18n.localize("SR5.Armor")}, ${game.i18n.localize("SR5.Damage")}`,
        "data.value": damage,
        "data.durationType": "round",
        "data.duration": duration,
      }
      ui.notifications.info(`${this.name}: ${effect.name} ${game.i18n.localize("SR5.Applied")}.`);
      await SR5Combat.changeInitInCombat(this, -5);
      await this.createEmbeddedDocuments("Item", [effect]);
      let statusEffect = await _getSRStatusEffect("acidDamage");
      await this.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
    }


  }

  //Handle Elemental Damage : Fire
  async fireDamageEffect(){
    let existingEffect = this.items.find((item) => item.type === "itemEffect" && item.data.data.type === "fireDamage");
    if (existingEffect) return;
    let effect = {
      name: `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageFire")})`,
      type: "itemEffect",
      "data.type": "fireDamage",
      "data.target": game.i18n.localize("SR5.PenaltyValuePhysical"),
      "data.value": 3,
      "data.durationType": "special",
      "data.duration": 0,
    }
    ui.notifications.info(`${this.name}: ${effect.name} ${game.i18n.localize("SR5.Applied")}.`);
    await this.createEmbeddedDocuments("Item", [effect]);
    let statusEffect = await _getSRStatusEffect("fireDamage");
    await this.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
  }

  async checkIfCatchFire (fireTreshold, source, force){
    let ap = -6
    let fireType = "weapon";
    if (source === "spell"){
      fireType = "magical";
      ap = force;
    }
    let rollInfo = {
      fireType: fireType,
			incomingPA: ap,
			fireTreshold: fireTreshold,
    }
    this.rollTest("resistFire", null, rollInfo);
  }

  //Reboot deck = reset Overwatch score and delete any marks on or from the actor
  async rebootDeck() {
    let actorID = (this.isToken ? this.token.id : this.id);
    let dataToUpdate = {};
    let updatedItems = duplicate(this.data.items);

    //Reset le SS à 0
    let actorData = duplicate(this.data.data);
    actorData.matrix.attributes.attack.base = 0;
    actorData.matrix.attributes.dataProcessing.base = 0;
    actorData.matrix.attributes.firewall.base = 0;
    actorData.matrix.attributes.sleaze.base = 0;
    actorData.matrix.attributesCollection.value1isSet = false;
    actorData.matrix.attributesCollection.value2isSet = false;
    actorData.matrix.attributesCollection.value3isSet = false;
    actorData.matrix.attributesCollection.value4isSet = false;
    actorData.matrix.overwatchScore = 0;

    //Delete marks on others actors
    if (actorData.matrix.markedItems.length) {
      if (!game.user?.isGM) {
        await SR5_SocketHandler.emitForGM("deleteMarksOnActor", {
          actorData: actorData,
          actorID: actorID,
        });
      } else {
        await SR5Actor.deleteMarksOnActor(actorData, actorID);
      }
    }

    //Delete marks from owned items
    for (let i of updatedItems){
      if (i.data.marks && i.data.marks?.length) {
        for (let m of i.data.marks){
          if (!game.user?.isGM) {
            await SR5_SocketHandler.emitForGM("deleteMarkInfo", {
              actorID: m.ownerId,
              item: i._id,
            });
          } else {
            await SR5Actor.deleteMarkInfo(m.ownerId, i._id);
          }
        }
        i.data.marks = [];
      }
      //Reset Marked items
      if (i.data.markedItems?.length) i.data.markedItems = [];
    }

    dataToUpdate = mergeObject(dataToUpdate, {
      "data": actorData,
      "items": updatedItems,
    });
    await this.update(dataToUpdate);

    //Delete effects from Deck
    for (let i of this.items){
      if (i.type === "itemEffect" && i.data.data.durationType === "reboot"){
        await this.deleteEmbeddedDocuments("Item", [i.id]);
      }
    }

    ui.notifications.info(`${actorData.matrix.deviceName} ${game.i18n.localize("SR5.Rebooted")}.`);
  }

  //Delete Marks on Other actors
  static async deleteMarksOnActor(actorData, actorID){
    for (let m of actorData.matrix.markedItems){
      let itemToClean = await fromUuid(m.uuid);
      if (itemToClean) {
        let cleanData = duplicate(itemToClean.data.data);
        for (let i = 0; i < cleanData.marks.length; i++){
          if (cleanData.marks[i].ownerId === actorID) {
            cleanData.marks.splice(i, 1);
            i--;
          }
        }
        await itemToClean.update({"data" : cleanData});
        //For Host, keep slaved device marks synchro
        if (itemToClean.parent.data.data.matrix.deviceType === "host") SR5_DiceHelper.markSlavedDevice(itemToClean.parent.id);
      } else {
        SR5_SystemHelpers.srLog(1, `No Item to Clean in deleteMarksOnActor()`);
      }
    }
  }

  //Socket for deletings marks on other actors;
  static async _socketDeleteMarksOnActor(message) {
    await SR5Actor.deleteMarksOnActor(message.data.actorData, message.data.actorID);
	}

  //Delete Mark info on other actors
  static async deleteMarkInfo(actorID, item){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorID);
    if (!actor) return SR5_SystemHelpers.srLog(1, `No Actor in deleteMarkInfo()`);

    let deck = actor.items.find(d => d.type === "itemDevice" && d.data.data.isActive),
        deckData = duplicate(deck.data.data),
        index=0;

    for (let m of deckData.markedItems){
      if (m.uuid.includes(item)){
        deckData.markedItems.splice(index, 1);
        index--;
      }
      index++;
    }

    await deck.update({"data": deckData});

    //For host, update all unlinked token with same marked items
    if (actor.data.data.matrix.deviceType === "host" && canvas.scene){
      for (let token of canvas.tokens.placeables){
          if (token.actor.id === actorID) {
              let tokenDeck = token.actor.items.find(i => i.data.type === "itemDevice" && i.data.data.isActive);
              let tokenDeckData = duplicate(tokenDeck.data.data);
              tokenDeckData.markedItems = deckData.markedItems;
              await tokenDeck.update({"data": tokenDeckData});
          }
      }
    }
  }

  //Socket for deletings marks info other actors;
  static async _socketDeleteMarkInfo(message) {
    await SR5Actor.deleteMarkInfo(message.data.actorID, message.data.item);
	}

  //Raise owerwatch score
  static async overwatchIncrease(defenseHits, actorId) {
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
    let actorData = duplicate(actor.data);

    if (actorData.data.matrix.overwatchScore === null) actorData.data.matrix.overwatchScore = 0;
    actorData.data.matrix.overwatchScore += defenseHits;
    actor.update(actorData);
    ui.notifications.info(`${actor.name}, ${game.i18n.localize("SR5.OverwatchScoreActual")} ${actorData.data.matrix.overwatchScore}`);
  }

  //Socket for increasing overwatch score;
  static async _socketOverwatchIncrease(message) {
    await SR5Actor.overwatchIncrease(message.data.defenseHits, message.data.actorId);
	}

  //Reset Cumulative Recoil
  resetRecoil(){
    this.setFlag("sr5", "cumulativeRecoil", 0);
    ui.notifications.info(`${this.name}: ${game.i18n.localize("SR5.CumulativeRecoilSetTo0")}.`);
  }

  //Create a Sidekick
  static async createSidekick(item, userId, actorId){
    let itemData = item.data,
        permissionPath, petType;
    let ownerActor = SR5_EntityHelpers.getRealActorFromID(actorId);
    if (item.type === "itemSpirit") {
      petType = "actorSpirit";
    } else if (item.type === "itemVehicle") {
      petType = "actorDrone";
    } else if (item.type === "itemSprite") {
      petType = "actorSprite";
    } else if (item.type === "itemProgram") {
      petType = "actorAgent";
    }

    let img;
    if (item.img === `systems/sr5/img/items/${item.type}.svg`) img = `systems/sr5/img/actors/${petType}.svg`;
    else img = item.img;

    // Handle base data for Actor Creation
    let data = {
      "name": item.name,
      "type": petType,
      "img": img,
    };

    // Give permission to player
    if (userId) {
      permissionPath = 'permission.' + userId;
      data = mergeObject(data, {
        [permissionPath]: 3,
      });
    }

    // Handle specific data for Actor creation
    if (item.type === "itemSpirit") {
      let baseItems = await SR5_CompendiumUtility.getBaseItems("actorSpirit", itemData.type, itemData.itemRating);
      baseItems = await SR5_CompendiumUtility.addOptionalSpiritPowersFromItem(baseItems, itemData.optionalPowers);
      for (let power of baseItems){
        if (power.data.systemEffects.length){
          for (let syseffect of power.data.systemEffects){
            if (syseffect.value === "noxiousBreath" && power.type === "itemPower"){
              let newWeapon = await SR5_CompendiumUtility.getWeaponFromCompendium("noxiousBreath");
              if (newWeapon) baseItems.push(newWeapon);
            }
            if (syseffect.value === "corrosiveSpit" && power.type === "itemPower"){
              let newWeapon = await SR5_CompendiumUtility.getWeaponFromCompendium("corrosiveSpit", itemData.itemRating);
              if (newWeapon) baseItems.push(newWeapon);
            }
          }
        }
      }
      data = mergeObject(data, {
        "data.type": itemData.type,
        "data.force.base": itemData.itemRating,
        "data.isBounded": itemData.isBounded,
        "data.services.value": itemData.services.value,
        "data.services.max": itemData.services.max,
        "data.summonerMagic": itemData.summonerMagic,
        "data.creatorId": actorId,
        "data.creatorItemId": item._id,
        "data.magic.tradition": itemData.magic.tradition,
        "data.conditionMonitors.physical.actual": itemData.conditionMonitors.physical.actual,
        "data.conditionMonitors.stun.actual": itemData.conditionMonitors.stun.actual,
        "items": baseItems,
      });
    }

    if (item.type === "itemSprite") {
      let baseItems = await SR5_CompendiumUtility.getBaseItems("actorSprite", itemData.type, itemData.itemRating);
      for (let deck of itemData.decks) {
        deck.data.marks = [];
        baseItems.push(deck);
      }

      data = mergeObject(data, {
        "data.type": itemData.type,
        "data.level": itemData.itemRating,
        "data.isRegistered": itemData.isRegistered,
        "data.tasks.value": itemData.tasks.value,
        "data.tasks.max": itemData.tasks.max,
        "data.compilerResonance": itemData.compilerResonance,
        "data.creatorId": actorId,
        "data.creatorItemId": item._id,
        "data.conditionMonitors.matrix.actual": itemData.conditionMonitors.matrix.actual,
        "items": baseItems,
      });
    }

    if (item.type === "itemProgram") {
      let baseItems = [];
      let ownerDeck = ownerActor.items.find(i => i.data.type === "itemDevice" && i.data.data.isActive);
      if(!ownerDeck) return;
      for (let deck of itemData.decks) {
        deck.data.marks = [];
        baseItems.push(deck);
      }

      let creatorData = SR5_EntityHelpers.getRealActorFromID(actorId);
      creatorData = creatorData.toObject(false);
      data = mergeObject(data, {
        "data.creatorId": actorId,
        "data.creatorItemId": item._id,
        "data.creatorData": creatorData,
        "data.conditionMonitors.matrix": ownerDeck.data.data.conditionMonitors.matrix,
        "data.rating": itemData.itemRating,
        "items": baseItems,
      });
    }

    if (item.type === "itemVehicle") {
      let baseItems = [];
      for (let autosoft of itemData.autosoft) baseItems.push(autosoft);
      for (let ammo of itemData.ammunitions) baseItems.push(ammo);
      for (let weapon of itemData.weapons) baseItems.push(weapon);
      for (let armor of itemData.armors) baseItems.push(armor);
      for (let vehicleMod of itemData.vehiclesMod) baseItems.push(vehicleMod);
      for (let deck of itemData.decks) {
        deck.data.marks = [];
        baseItems.push(deck);
      }

      data = mergeObject(data, {
        "data.creatorId": actorId,
        "data.creatorItemId": item._id,
        "data.type": itemData.type,
        "data.model": itemData.model,
        "data.attributes.handling.natural.base": itemData.attributes.handling,
        "data.attributes.handlingOffRoad.natural.base": itemData.attributes.handlingOffRoad,
        "data.attributes.secondaryPropulsionHandling.natural.base": itemData.secondaryPropulsion.handling,
        "data.attributes.secondaryPropulsionHandlingOffRoad.natural.base": itemData.secondaryPropulsion.handlingOffRoad,
        "data.attributes.speed.natural.base": itemData.attributes.speed,
        "data.attributes.speedOffRoad.natural.base": itemData.attributes.speedOffRoad,
        "data.attributes.secondaryPropulsionSpeed.natural.base": itemData.secondaryPropulsion.speed,
        "data.attributes.acceleration.natural.base": itemData.attributes.acceleration,
        "data.attributes.accelerationOffRoad.natural.base": itemData.attributes.accelerationOffRoad,
        "data.attributes.secondaryPropulsionAcceleration.natural.base": itemData.secondaryPropulsion.acceleration,
        "data.attributes.body.natural.base": itemData.attributes.body,
        "data.attributes.armor.natural.base": itemData.attributes.armor,
        "data.attributes.pilot.natural.base": itemData.attributes.pilot,
        "data.attributes.sensor.natural.base": itemData.attributes.sensor,
        "data.attributes.seating.natural.base": itemData.seating,
        "data.modificationSlots.powerTrain.base": itemData.modificationSlots.powerTrain,
        "data.modificationSlots.protection.base": itemData.modificationSlots.protection,
        "data.modificationSlots.weapons.base": itemData.modificationSlots.weapons,
        "data.modificationSlots.body.base": itemData.modificationSlots.body,
        "data.modificationSlots.electromagnetic.base": itemData.modificationSlots.electromagnetic,
        "data.modificationSlots.cosmetic.base": itemData.modificationSlots.cosmetic,
        "data.conditionMonitors.condition.actual": itemData.conditionMonitors.condition.actual,
        "data.conditionMonitors.matrix.actual": itemData.conditionMonitors.matrix.actual,
        "data.isSecondaryPropulsion": itemData.secondaryPropulsion.isSecondaryPropulsion,
        "data.secondaryPropulsionType": itemData.secondaryPropulsion.type,
        "data.pilotSkill": itemData.pilotSkill,
        "data.riggerInterface": itemData.riggerInterface,
        "data.offRoadMode": itemData.offRoadMode,
        "data.slaved": itemData.slaved,
        "data.vehicleOwner.id": actorId,
        "data.vehicleOwner.name": ownerActor.name,
        "data.controlMode": itemData.controlMode,
        "flags.sr5.vehicleControler": ownerActor.data.toObject(false),
        "items": baseItems,
      });
    }

    //Create actor
    await Actor.createDocuments([data]);
  }

  //Socket for creating sidekick;
  static async _socketCreateSidekick(message) {
    await SR5Actor.createSidekick(message.data.item, message.data.userId, message.data.actorId);
	}

  //Dismiss sidekick : update his parent item and then delete actor
  static async dimissSidekick(actor){
    let ownerActor = SR5_EntityHelpers.getRealActorFromID(actor.data.creatorId);
    let itemOwner = ownerActor.items.get(actor.data.creatorItemId);
    let modifiedItem = deepClone(itemOwner.data);
    modifiedItem = modifiedItem.toObject(false);

    if (actor.type === "actorSpirit"){
      modifiedItem.img = actor.img;
      modifiedItem.data.services.value = actor.data.services.value;
      modifiedItem.data.services.max = actor.data.services.max;
      modifiedItem.data.conditionMonitors.physical.actual = actor.data.conditionMonitors.physical.actual;
      modifiedItem.data.conditionMonitors.stun.actual = actor.data.conditionMonitors.stun.actual;
      modifiedItem.data.isBounded = actor.data.isBounded;
      modifiedItem.data.isCreated = false;
      itemOwner.update(modifiedItem);
    }

    if (actor.type === "actorSprite"){
      let decks = [];
      for (let a of actor.items){
        if (a.type === "itemDevice") decks.push(a);
      }
      modifiedItem.img = actor.img;
      modifiedItem.data.decks = decks;
      modifiedItem.data.tasks.value = actor.data.tasks.value;
      modifiedItem.data.tasks.max = actor.data.tasks.max;
      modifiedItem.data.conditionMonitors.matrix.actual = actor.data.conditionMonitors.matrix.actual;
      modifiedItem.data.isRegistered = actor.data.isRegistered;
      modifiedItem.data.isCreated = false;
      itemOwner.update(modifiedItem);
    }

    if (actor.type === "actorAgent"){
    let decks = [];
      for (let a of actor.items){
        if (a.type === "itemDevice") decks.push(a);
      }
      modifiedItem.img = actor.img;
      modifiedItem.data.decks = decks;
      itemOwner.update(modifiedItem);
    }

    if (actor.type === "actorDrone"){
      let autosoft = [],
          weapons = [],
          ammunitions = [],
          armors = [],
          decks = [],
          vehiclesMod = [];
      for (let a of actor.items){
        if (a.type === "itemProgram") autosoft.push(a);
        if (a.type === "itemWeapon") weapons.push(a);
        if (a.type === "itemAmmunition") ammunitions.push(a);
        if (a.type === "itemArmor") armors.push(a);
        if (a.type === "itemDevice") decks.push(a);
        if (a.type === "itemVehicleMod") vehiclesMod.push(a);
      }
      modifiedItem.img = actor.img;
      modifiedItem.data.autosoft = autosoft;
      modifiedItem.data.weapons = weapons;
      modifiedItem.data.ammunitions = ammunitions;
      modifiedItem.data.armors = armors;
      modifiedItem.data.decks = decks;
      modifiedItem.data.vehiclesMod = vehiclesMod;
      modifiedItem.data.model = actor.data.model;
      modifiedItem.data.slaved = actor.data.slaved;
      modifiedItem.data.controlMode = actor.data.controlMode;
      modifiedItem.data.riggerInterface = actor.data.riggerInterface;
      modifiedItem.data.offRoadMode = actor.data.offRoadMode; 
      modifiedItem.data.attributes.handling = actor.data.attributes.handling.natural.base;
      modifiedItem.data.attributes.handlingOffRoad = actor.data.attributes.handlingOffRoad.natural.base;
      modifiedItem.data.secondaryPropulsion.handling = actor.data.attributes.secondaryPropulsionHandling.natural.base;
      modifiedItem.data.secondaryPropulsion.handlingOffRoad = actor.data.attributes.secondaryPropulsionHandlingOffRoad.natural.base;
      modifiedItem.data.attributes.speed = actor.data.attributes.speed.natural.base;
      modifiedItem.data.attributes.speedOffRoad = actor.data.attributes.speedOffRoad.natural.base;
      modifiedItem.data.secondaryPropulsion.speed = actor.data.attributes.secondaryPropulsionSpeed.natural.base;
      modifiedItem.data.attributes.acceleration = actor.data.attributes.acceleration.natural.base;
      modifiedItem.data.attributes.accelerationOffRoad = actor.data.attributes.accelerationOffRoad.natural.base;
      modifiedItem.data.secondaryPropulsion.acceleration = actor.data.attributes.secondaryPropulsionAcceleration.natural.base;
      modifiedItem.data.attributes.body = actor.data.attributes.body.natural.base;
      modifiedItem.data.attributes.armor = actor.data.attributes.armor.natural.base;
      modifiedItem.data.attributes.pilot = actor.data.attributes.pilot.natural.base;
      modifiedItem.data.attributes.sensor = actor.data.attributes.sensor.natural.base;
      modifiedItem.data.seating = actor.data.attributes.seating.natural.base;
      modifiedItem.data.modificationSlots.powerTrain = actor.data.modificationSlots.powerTrain.base;
      modifiedItem.data.modificationSlots.protection = actor.data.modificationSlots.protection.base;
      modifiedItem.data.modificationSlots.weapons = actor.data.modificationSlots.weapons.base;
      modifiedItem.data.modificationSlots.body = actor.data.modificationSlots.body.base;
      modifiedItem.data.modificationSlots.electromagnetic = actor.data.modificationSlots.electromagnetic.base;
      modifiedItem.data.modificationSlots.cosmetic = actor.data.modificationSlots.cosmetic.base;
      modifiedItem.data.conditionMonitors.condition.actual = actor.data.conditionMonitors.condition.actual;
      modifiedItem.data.conditionMonitors.matrix.actual = actor.data.conditionMonitors.matrix.actual;
      modifiedItem.data.secondaryPropulsion.isSecondaryPropulsion = actor.data.isSecondaryPropulsion;
      modifiedItem.data.secondaryPropulsion.type = actor.data.secondaryPropulsionType;
      modifiedItem.data.isCreated = false;
      modifiedItem.img = actor.img;
      itemOwner.update(modifiedItem);
    }

    if (canvas.scene){
      for (let token of canvas.tokens.placeables) {
        if (token.data.actorId === actor._id) await token.document.delete();
      }
    }
    await Actor.deleteDocuments([actor._id]);
  }

  //Socket to dismiss sidekick;
  static async _socketDismissSidekick(message) {
    await SR5Actor.dimissSidekick(message.data.actor);
	}

  static async addItemtoPan(targetItem, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
        deck = actor.items.find(d => d.type === "itemDevice" && d.data.data.isActive),
        item = await fromUuid(targetItem),
        itemToAdd = item.toObject(false);

    itemToAdd.data.isSlavedToPan = true;
    itemToAdd.data.panMaster = actorId;
    await item.update({"data": itemToAdd.data});

    let currentPan = duplicate(deck.data.data.pan);
    let panObject = {
      "name": item.name,
      "uuid": targetItem,
    }
    currentPan.content.push(panObject);
    currentPan.current += 1;
    await deck.update({"data.pan": currentPan,});
  }

  static async _socketAddItemToPan(message){
    await SR5Actor.addItemtoPan(message.data.targetItem, message.data.actorId);
  }

  static async deleteItemFromPan(targetItem, actorId, index){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
        deck = actor.items.find(d => d.type === "itemDevice" && d.data.data.isActive),
        item = await fromUuid(targetItem);

    if (item) {
      let newItem = duplicate(item.data.data);
      newItem.isSlavedToPan = false;
      newItem.panMaster = "";
      await item.update({"data": newItem,});
    }

    let currentPan = duplicate(deck.data.data.pan);
    if (index){
      currentPan.content.splice(index, 1);
      currentPan.current -=1;
    } else {
      index = 0;
      let isExisting;
      for (let p of currentPan.content){
        isExisting = await fromUuid(p.uuid);
        if (!isExisting){
          currentPan.content.splice(index, 1);
          currentPan.current -=1;
          index--;
        }
        index++;
      }
    }

    await deck.update({"data.pan": currentPan,});
  }

  static async _socketDeleteItemFromPan(message){
    await SR5Actor.deleteItemFromPan(message.data.targetItem, message.data.actorId, message.data.index);
  }

  //Apply an external effect to actor (such spell, complex form). Data is provided by chatMessage
  async applyExternalEffect(data, effectType){
    let item = await fromUuid(data.itemUuid);
    let itemData = item.data;

    for (let e of Object.values(itemData.data[effectType])){
      if (e.transfer) {
        let value, key, newData;
        if (e.type === "hits") value = Math.floor(data.test.hits * (e.multiplier || 1));
        else if (e.type === "netHits") value = Math.floor(data.netHits * (e.multiplier || 1));
        else if (e.type === "value") value = Math.floor(e.value * (e.multiplier || 1));
        else if (e.type === "rating") value = Math.floor(item.data.data.itemRating * (e.multiplier || 1));

        //Handle heal effect
        if (e.target.includes("removeDamage")){
          key = e.target.replace('.removeDamage','');
          newData = this.data.data;
          if(newData.conditionMonitors[key]){
            newData.conditionMonitors[key].actual.base -= value;
            SR5_EntityHelpers.updateValue(newData.conditionMonitors[key].actual, 0);
            await this.update({"data": newData});
            continue;
          } else continue;
        }

        //Handle non resisted damage
        if (e.target.includes("addDamage")){
          key = e.target.replace('.addDamage','');
          newData = this.data.data;
          if(newData.conditionMonitors[key]){
            newData.conditionMonitors[key].actual.base += value;
            SR5_EntityHelpers.updateValue(newData.conditionMonitors[key].actual, 0);
            await this.update({"data": newData});
            continue;
          } else continue;
        }

        let targetName = SR5_EntityHelpers.getLabelByKey(e.target);

        //Create the itemEffect
        let itemEffect = {
          name: itemData.name,
          type: "itemEffect",
          "data.target": targetName,
          "data.value": value,
          "data.type": itemData.type,
          "data.ownerID": data.actorId,
          "data.ownerName": data.speakerActor,
          "data.ownerItem": data.itemUuid,
          "data.duration": 0,
          "data.durationType": "sustained",
        };

        if (effectType === "customEffects"){
          itemEffect = mergeObject(itemEffect, {
            "data.customEffects": {
              "0": {
                  "category": e.category,
                  "target": e.target,
                  "type": "value",
                  "value": value,
                  "forceAdd": true,
                }
            },
          });
        } else if (effectType === "itemEffects"){
          itemEffect = mergeObject(itemEffect, {
            "data.hasEffectOnItem": true,
          });
        }
        await this.createEmbeddedDocuments("Item", [itemEffect]);

        //Link Effect to source owner
        let effect;
        if (this.isToken) {
          for (let i of this.token.actor.items){
            if (i.data.data.ownerItem === data.itemUuid){
              if (!Object.keys(itemData.data.targetOfEffect).length) effect = i;
              else for (let e of Object.values(itemData.data.targetOfEffect)) if (e !== data.itemUuid) effect = i;
            }
          }
        } else {
          for (let i of this.items){
            if (i.data.data.ownerItem === data.itemUuid){
              if (!Object.keys(itemData.data.targetOfEffect).length) effect = i;
              else for (let e of Object.values(itemData.data.targetOfEffect)) if (e !== data.itemUuid) effect = i;
            }
          }
        }

        if (!game.user?.isGM) {
          SR5_SocketHandler.emitForGM("linkEffectToSource", {
            actorID: data.actorId,
            targetItem: data.itemUuid,
            effectUuid: effect.uuid,
          });
        } else {
          await SR5Actor.linkEffectToSource(data.actorId, data.itemUuid, effect.uuid);
        }

        //If effect is on Item, update it
        if (effectType === "itemEffects"){
          let itemToUpdate;
          //Find the item
          if (data.typeSub === "redundancy"){
            if (this.isToken) itemToUpdate = this.token.actor.items.find(d => d.type === "itemDevice" && d.data.data.isActive);
            else itemToUpdate = this.items.find(d => d.type === "itemDevice" && d.data.data.isActive);
          }
          //Add effect to Item
          if (itemToUpdate){
            let newItem = itemToUpdate.toObject(false);
            let effectItem ={
              "name": itemData.name,
              "target": e.target,
              "wifi": false,
              "type": "value",
              "value": value,
              "multiplier": 1,
              "ownerItem": data.itemUuid,
            }
            newItem.data.itemEffects.push(effectItem);
            await this.updateEmbeddedDocuments("Item", [newItem]);
          }
        }
      }
    }
  }

  //Update the source Item of an external Effect
  static async linkEffectToSource(actorId, targetItem, effectUuid){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
        item = await fromUuid(targetItem),
        newItem = duplicate(item.data.data);

    if (newItem.duration === "sustained") newItem.isActive = true;
    if (item.type === "itemAdeptPower") newItem.isActive = true;
    newItem.targetOfEffect.push(effectUuid);
    await item.update({"data": newItem});
  }

  static async _socketLinkEffectToSource(message){
    await SR5Actor.linkEffectToSource(message.data.actorId, message.data.targetItem, message.data.effectUuid);
  }

  static async deleteSustainedEffect(targetItem){
    let item = await fromUuid(targetItem);
    if (item) await item.parent.deleteEmbeddedDocuments("Item", [item.id]);
    else SR5_SystemHelpers.srLog(2, `No item to delete in deleteSustainedEffect()`);
  }

  static async _socketDeleteSustainedEffect(message){
    await SR5Actor.deleteSustainedEffect(message.data.targetItem);
  }

  //Delete an effect on an item when parent's ItemEffect is deleted
  static async deleteItemEffectFromItem(actorId, parentItemEffect){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
        index, dataToUpdate;
    for (let i of actor.items){
      let needUpdate = false;
      if (i.data.data.itemEffects?.length){
        dataToUpdate = duplicate(i.data.data)
        index = 0;
        for (let e of dataToUpdate.itemEffects){
          if (e.ownerItem === parentItemEffect){
            dataToUpdate.itemEffects.splice(index, 1);
            needUpdate = true;
            index--;
          }
          index++;
        }
        if (needUpdate) await i.update({"data": dataToUpdate,});
      }
    }
  }

  //Apply specific toxin effect
  async applyToxinEffect(data){
    let effects, status, isStatusEffectOn;
    let toxinEffects = [];
    let statusEffects = [];

    for (let [key, value] of Object.entries(data.toxin.effect)){
      if (value) {
        effects = await SR5_DiceHelper.getToxinEffect(key, data, this);
        toxinEffects = toxinEffects.concat(effects);
        //Nausea Status Effect
        if (key === "nausea"){
          isStatusEffectOn = this.effects.find(e => e.data.origin === "toxinEffectNausea");
          if (!isStatusEffectOn){
            status = await _getSRStatusEffect("toxinEffectNausea");
            statusEffects = statusEffects.concat(status);
          }
          if (data.damageValue > this.data.data.attributes.willpower.augmented.value){
            isStatusEffectOn = this.effects.find(e => e.data.origin === "noAction");
            if (!isStatusEffectOn){
              status = await _getSRStatusEffect("noAction");
              statusEffects = statusEffects.concat(status);
            }
          }
        }
        //Disorientation Status Effect
        if (key === "disorientation"){
          isStatusEffectOn = this.effects.find(e => e.data.origin === "toxinEffectDisorientation");
          if (!isStatusEffectOn){
            status = await _getSRStatusEffect("toxinEffectDisorientation");
            statusEffects = statusEffects.concat(status);
          }
        }
        //Paralysis Status Effect
        if (key === "paralysis" && (data.damageValue > this.data.data.attributes.reaction.augmented.value)){
          let isStatusEffectOn = this.effects.find(e => e.data.origin === "noAction");
          if (!isStatusEffectOn){
            status = await _getSRStatusEffect("noAction");
            statusEffects = statusEffects.concat(status);
          }
        }
      }
    }

    if (toxinEffects.length) await this.createEmbeddedDocuments("Item", toxinEffects);
    if (statusEffects.length) await this.createEmbeddedDocuments("ActiveEffect", statusEffects);
    if (data.damageType && data.damageValue > 0) await this.takeDamage(data);
  }

  //Keep Agent condition Monitor synchro with Owner deck
  static async keepAgentMonitorSynchro(agent){
    if(!agent.data.data.creatorData) return;
    if(!canvas.scene) return;
    
    let owner = SR5_EntityHelpers.getRealActorFromID(agent.data.data.creatorId);
    let ownerDeck = owner.items.find(i => i.data.type === "itemDevice" && i.data.data.isActive);
    if (ownerDeck.data.data.conditionMonitors.matrix.actual.value !== agent.data.data.conditionMonitors.matrix.actual.value){
      let updatedActor = duplicate(agent.data.data);
      updatedActor.conditionMonitors.matrix = ownerDeck.data.data.conditionMonitors.matrix;
      await agent.update({"data": updatedActor,});
    }
  }

  //Keep Owner deck condition Monitor synchro with Agent
  static async keepDeckSynchroWithAgent(agent){
    let owner = SR5_EntityHelpers.getRealActorFromID(agent.data.data.creatorId);
    let ownerDeck = owner.items.find(i => i.data.type === "itemDevice" && i.data.data.isActive);

    if (ownerDeck.data.data.conditionMonitors.matrix.actual.value !== agent.data.data.conditionMonitors.matrix.actual.value){
      let newDeck = duplicate(ownerDeck.data.data);
      newDeck.conditionMonitors.matrix = agent.data.data.conditionMonitors.matrix;
      await ownerDeck.update({"data": newDeck});
    }
  }

  //Manage Regeneration
  async regenerate(data){
    let damageToRemove = data.netHits;
    let actorData = deepClone(this.data);
    actorData = actorData.toObject(false);

    if (actorData.type === "actorGrunt"){
      if (actorData.data.conditionMonitors.condition.actual.value > 0){
        actorData.data.conditionMonitors.condition.actual.base -= damageToRemove;
        damageToRemove -= actorData.data.conditionMonitors.condition.actual.value;
        await SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.condition.actual, 0);
      }
    } else {
      if (actorData.data.conditionMonitors.overflow.actual.value > 0){
        actorData.data.conditionMonitors.overflow.actual.base -= damageToRemove;
        damageToRemove -= actorData.data.conditionMonitors.overflow.actual.value;
        await SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.overflow.actual, 0);
      }
      if (actorData.data.conditionMonitors.physical.actual.value > 0 && damageToRemove > 0){
        actorData.data.conditionMonitors.physical.actual.base -= damageToRemove;
        damageToRemove -= actorData.data.conditionMonitors.physical.actual.value;
        await SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.physical.actual, 0);
      }
      if (actorData.data.conditionMonitors.stun.actual.value > 0 && damageToRemove > 0){
        actorData.data.conditionMonitors.stun.actual.base -= damageToRemove;
        damageToRemove -= actorData.data.conditionMonitors.stun.actual.value;
        await SR5_EntityHelpers.updateValue(actorData.data.conditionMonitors.stun.actual, 0);
      }
    }

    await this.update(actorData);
  }

}

CONFIG.Actor.documentClass = SR5Actor;
