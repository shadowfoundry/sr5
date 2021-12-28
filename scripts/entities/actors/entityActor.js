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

/**
 * Extend the base Actor class to implement additional logic specialized for Shadowrun 5.
 */

export class SR5Actor extends Actor {
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
        renderTemplate(
          "systems/sr5/templates/interface/createSpirit.html",
          dialogData
        ).then((dlg) => {
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
            close: () => console.log(data),
          }).render(true);
        });
      break;
      case "actorSprite":
        let spriteLevel, spriteType;
        renderTemplate(
          "systems/sr5/templates/interface/createSprite.html",
          dialogData
        ).then((dlg) => {
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
            close: () => console.log(data),
          }).render(true);
        });
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
    if (this.type === "actorSpirit" && this.data.data.creatorId !== "") actorLink = true;
    if (this.type === "actorDrone" && this.data.data.creatorId !== "") actorLink = true;

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
    this.prepareEmbeddedDocuments();
    this.prepareDerivedData();
    this.sortLists(this.data.data);
    this.updateItems(this);
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
        SR5_CharacterUtility.resetCalculatedValues(actor);
        break;
      case "actorDevice":
        SR5_CharacterUtility.resetCalculatedValues(actor);
        break;
      case "actorSpirit":
        if (!data.hasOwnProperty("type")) data.type = actor.flags.spiritType;
        if (data.force < 1) data.force = parseInt(actor.flags.spiritForce);
        SR5_CharacterUtility.resetCalculatedValues(actor);
        break;
      case "actorSprite":
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
        SR5_CharacterUtility.updateVehicleDecking(actor);
        SR5_CharacterUtility.updateRecoil(actor);
        SR5_CharacterUtility.updateConditionMonitors(actor);
        break;
      case "actorSpirit":
        SR5_CharacterUtility.updatePenalties(actor);
        SR5_CharacterUtility.updateSpiritValues(actor);
        SR5_CharacterUtility.updateSpiritAttributes(actor);
        SR5_CharacterUtility.updateAttributes(actor);
        SR5_CharacterUtility.updateEssence(actor);
        SR5_CharacterUtility.updateSpecialAttributes(actor);
        SR5_CharacterUtility.updateConditionMonitors(actor);
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
        SR5_CharacterUtility.generateSpriteMatrix(actor);
        SR5_CharacterUtility.generateMatrixActions(actor);
        SR5_CharacterUtility.updateInitiativeMatrix(actor);
      case "actorDevice":
        SR5_CharacterUtility.generateDeviceMatrix(actor);
        if (actor.data.matrix.deviceType === "ice") {
          SR5_CharacterUtility.updateInitiativeMatrix(actor);
        }
        SR5_CharacterUtility.updateConditionMonitors(actor);
        break;
      case "actorPc":
      case "actorGrunt":
        SR5_CharacterUtility.updateSpecialProperties(actor);
        SR5_CharacterUtility.updatePenalties(actor);
        SR5_CharacterUtility.updateAttributes(actor);
        SR5_CharacterUtility.updateEssence(actor);
        SR5_CharacterUtility.updateSpecialAttributes(actor);
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
        SR5_CharacterUtility.updateTradition(actor);
        SR5_CharacterUtility.updateAstralValues(actor);
        SR5_CharacterUtility.handleVision(actor);
        SR5_CharacterUtility.updateConditionMonitors(actor);
        if (actor.type === "actorPc") {
          SR5_CharacterUtility.updateKarmas(actor);
          SR5_CharacterUtility.updateNuyens(actor);
        }
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${actor.type}' actor type in prepareDerivedData()`);
    }
  }

  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();

    const actorData = this.data;
    const lists = SR5;

    // Iterate through items, allocating to containers
    for (let i of actorData.items) {
      let iData = i.data.data;
      SR5_SystemHelpers.srLog(3, `Parsing '${i.type}' item named '${i.name}'`, i);
      switch (i.type) {
        case "itemQuality":
          if (Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemPower":
        case "itemGear":
        case "itemMetamagic":
        case "itemEcho":
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemSpell":
          SR5_UtilityItem._handleSpell(i.data, actorData);
          if (iData.isActive && Object.keys(iData.customEffects)) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemPreparation":
          if (iData.isActive && Object.keys(iData.customEffects)) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemArmor":
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
          break;

        case "itemAugmentation":
          SR5_UtilityItem._handleAugmentation(iData, actorData);
          if (!iData.isAccessory) {
            SR5_EntityHelpers.updateModifier(actorData.data.essence, `${i.name}`, `${game.i18n.localize(lists.itemTypes[i.type])}`, -iData.essenceCost.value);
          }
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemAdeptPower":
          SR5_EntityHelpers.updateModifier(actorData.data.magic.powerPoints, i.name, `${game.i18n.localize(lists.itemTypes[i.type])}`, iData.powerPointsCost.value);
          SR5_UtilityItem._handleAdeptPower(iData);
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemSpirit":
          SR5_UtilityItem._handleSpirit(iData);
          if (iData.isActive) {
            SR5_CharacterUtility._actorModifPossession(i, actorData);
          }
          break;

        case "itemDevice":
          iData.conditionMonitors.matrix.value = Math.ceil(iData.deviceRating / 2) + 8;
          if (iData.isActive) {
            SR5_CharacterUtility.generateMatrixAttributes(i.data, actorData);
            if (Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemProgram":
          if (iData.type === "common" || iData.type === "hacking" || iData.type === "autosoft" || iData.type === "agent"){
            if (iData.isActive) SR5_EntityHelpers.updateModifier(actorData.data.matrix.programsCurrentActive,`${i.name}`, `${game.i18n.localize(lists.itemTypes[i.type])}`, 1);
          }
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            if (actorData.type === "actorDrone") SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
            if (iData.type !== "autosoft" && (actorData.type === "actorPc" || actorData.type === "actorGrunt"))
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemComplexForm":
          SR5_UtilityItem._handleComplexForm(iData);
          if (iData.isActive && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemKarma":
        case "itemNuyen":
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
          break;

        case "itemFocus":
          SR5_UtilityItem._handleFocus(iData);
          let focusLabel = `${i.name} (${game.i18n.localize("SR5.Focus")})`;
          switch (iData.type) {
            case "alchemical":
            case "weapon":
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
            case "sustaining":
              iData.spellChoices = SR5_UtilityItem._focusMaintien(iData, actorData);
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

        case "itemDrug":
          if ((iData.isActive || iData.wirelessTurnedOn) && Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemEffect":
          if (Object.keys(iData.customEffects).length) {
            SR5_CharacterUtility.applyCustomEffects(i.data, actorData);
          }
          break;

        case "itemLanguage":
        case "itemKnowledge":
        case "itemMark":
        case "itemSprite":
        case "itemLifestyle":
        case "itemSin":
        case "itemVehicle":
        case "itemContact":
        case "itemCyberdeck":
        case "itemAmmunition":
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
    let actorData = actor.data;
    for (let i of actorData.items) {
      let iData = i.data.data;
      switch (i.data.type){
        case "itemDevice":
          if (iData.isActive === true){
            SR5_CharacterUtility.generateMatrixAttributes(i.data, actorData);
            SR5_CharacterUtility.generateMatrixData(i.data, actorData);
            SR5_CharacterUtility.generateMatrixActions(actorData);
            SR5_CharacterUtility.updateInitiativeMatrix(actorData);
            if (iData.type ==="riggerCommandConsole") {
              if (actor.testUserPermission(game.user, 3)) SR5_CharacterUtility.updateControledVehicle(actorData);
            }
            i.prepareData();
          }
          break;
        case "itemArmor":
        case "itemGear":
        case "itemAugmentation":
          if (Object.keys(iData.accessory).length) SR5_UtilityItem._updatePluggedAccessory(i.data, actorData);
          break;
        case "itemSpell":
        case "itemWeapon":
        case "itemKnowledge":
        case "itemLanguage":
        case "itemPower":
        case "itemSpritePower": 
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
        gelAmmo = 0;
    actorData = actorData.toObject(false);
    if (options.ammoType === "gel") gelAmmo = -2;

    switch (actorData.type){
      case "actorPc":
      case "actorSpirit":  
        if (options.matrixDamageValue) {
          damage = options.matrixDamageValue;
          damageType = "stun";
        }
        if (damageType === "stun") actorData.data.conditionMonitors.stun.current += damage; 
        else if (damageType === "physical") actorData.data.conditionMonitors.physical.current += damage;
        ui.notifications.info(`${this.name}: ${damage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);
  
        if (actorData.data.conditionMonitors.stun.current > actorData.data.conditionMonitors.stun.value) {
          let carriedDamage = actorData.data.conditionMonitors.stun.current - actorData.data.conditionMonitors.stun.value;
          actorData.data.conditionMonitors.physical.current += carriedDamage;
          actorData.data.conditionMonitors.stun.current = actorData.data.conditionMonitors.stun.value;
          ui.notifications.info(`${this.name}: ${carriedDamage}${game.i18n.localize(SR5.damageTypesShort.physical)} ${game.i18n.localize("SR5.Applied")}.`);
        }
  
        if (actorData.data.conditionMonitors.physical.current > actorData.data.conditionMonitors.physical.value) {
          let carriedDamage = actorData.data.conditionMonitors.physical.current - actorData.data.conditionMonitors.physical.value;
          actorData.data.conditionMonitors.overflow.current += carriedDamage;
          actorData.data.conditionMonitors.physical.current = actorData.data.conditionMonitors.physical.value;
        }

        if (actorData.data.conditionMonitors.stun.current >= actorData.data.conditionMonitors.stun.value) await this.createKoEffect();
        if (actorData.data.conditionMonitors.physical.current >= actorData.data.conditionMonitors.physical.value) await this.createDeadEffect();
        if ((damage > (actorData.data.limits.physicalLimit.value + gelAmmo) || damage >= 10)
          && actorData.data.conditionMonitors.stun.current < actorData.data.conditionMonitors.stun.value
          && actorData.data.conditionMonitors.physical.current < actorData.data.conditionMonitors.physical.value) await this.createProneEffect(damage, actorData, gelAmmo);
        break;
      case "actorGrunt":
        actorData.data.conditionMonitors.condition.current += damage;
        ui.notifications.info(`${this.name}: ${damage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);
        if (actorData.data.conditionMonitors.condition.current >= actorData.data.conditionMonitors.condition.value) await this.createDeadEffect();
        else if (damage > (actorData.data.limits.physicalLimit.value + gelAmmo) || damage >= 10) await this.createProneEffect(damage, actorData, gelAmmo);
        break;
      case "actorDrone":
        if (damageType === "physical") {
          actorData.data.conditionMonitors.condition.current += damage;
          ui.notifications.info(`${this.name}: ${damage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);
          if (actorData.data.conditionMonitors.condition.current >= actorData.data.conditionMonitors.condition.value) await this.createDeadEffect();
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
          actorData.data.conditionMonitors.matrix.current += options.matrixDamageValue;
          ui.notifications.info(`${this.name}: ${options.matrixDamageValue} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
        }
        break;
      case "actorSprite":
      case "actorDevice":
        if (options.matrixDamageValue) {
          actorData.data.conditionMonitors.matrix.current += options.matrixDamageValue;
          ui.notifications.info(`${this.name}: ${options.matrixDamageValue} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
          if (actorData.data.conditionMonitors.matrix.current >= actorData.data.conditionMonitors.matrix.value) await this.createDeadEffect();
        }
        break;
    }
    
    await this.update(actorData);

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
    let effect = await _getSRStatusEffect("dead")
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
        "data.target": armor.name,
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
    
    let actorID = (this.token ? this.token.data.id : this.data.id);

    //Retire toutes les marks sur l'acteur
    let marks = this.data.items.filter((i) => i.type === "itemMark");
    let deletions = marks.map((i) => i.id);
    await this.deleteEmbeddedDocuments("Item", deletions); // Deletes multiple EmbeddedEntity objects

    //Delete ICE effects from Deck
    let iceEffects = this.data.items.filter((i) => (i.type === "itemEffect" && i.data.data.type === "iceAttack"));
    deletions = iceEffects.map((i) => i.id);
    await this.deleteEmbeddedDocuments("Item", deletions); // Deletes multiple EmbeddedEntity objects

    //Reset le SS à 0
    let actor = this.data.toObject(false);
    actor.data.matrix.attributes.attack.base = 0;
    actor.data.matrix.attributes.dataProcessing.base = 0;
    actor.data.matrix.attributes.firewall.base = 0;
    actor.data.matrix.attributes.sleaze.base = 0;
    actor.data.matrix.attributesCollection.value1isSet = false;
    actor.data.matrix.attributesCollection.value2isSet = false;
    actor.data.matrix.attributesCollection.value3isSet = false;
    actor.data.matrix.attributesCollection.value4isSet = false;
    actor.data.matrix.overwatchScore = 0;
    this.update(actor);

    //Retire les marks du perso sur les autres acteurs.
    for (let a of game.actors) {
      for (let i of a.data.items) {
        if (i.type === "itemMark" && i.data.owner === actorID) {
          await a.deleteEmbeddedDocuments("Item", [i.id]);
        }
      }
    }

    //Retire les marks du perso sur les autres tokens.
    for (let token of canvas.tokens.placeables) {
      for (let i of token.actor.data.items) {
        if (i.type === "itemMark" && i.data.owner === actorID) {
          await token.actor.deleteEmbeddedDocuments("Item", [i.id]);
        }
      }
    }

    ui.notifications.info(`${actor.data.matrix.deviceName} ${game.i18n.localize("SR5.Rebooted")}.`);
  }

  //Raise owerwatch score
  overwatchIncrease(defenseHits) {
    let actorData = duplicate(this.data);
    //Vérifie que le SS existe, si non, le crée
    if (actorData.data.matrix.overwatchScore === null) actorData.data.matrix.overwatchScore = 0;
    //Ajoute le résultat du jet du défenseur au SS de l'attaquant
    actorData.data.matrix.overwatchScore += defenseHits;
    this.update(actorData);
    ui.notifications.info(`${this.name}, ${game.i18n.localize("SR5.OverwatchScoreActual")} ${actorData.data.matrix.overwatchScore}`);
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
    }
    
    let img;
    if (item.img !== "") img = item.img;
    else img = `systems/sr5/img/actors/${petType}.svg`;

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
      data = mergeObject(data, {
        "data.type": itemData.type,
        "data.force.base": itemData.itemRating,
        "data.isBounded": itemData.isBound,
        "data.services.value": itemData.services.value,
        "data.services.max": itemData.services.max,
        "data.summonerMagic": itemData.summonerMagic,
        "data.creatorId": actorId,
        "data.creatorItemId": item._id,
        "data.conditionMonitors.physical.current": itemData.conditionMonitors.physical.current,
        "data.conditionMonitors.stun.current": itemData.conditionMonitors.stun.current,
        "items": baseItems,
      });
    }

    if (item.type === "itemSprite") {
      let baseItems = await SR5_CompendiumUtility.getBaseItems("actorSprite", itemData.type, itemData.itemRating);
      data = mergeObject(data, {
        "data.type": itemData.type,
        "data.level": itemData.itemRating,
        "data.isRegistered": itemData.isRegistered,
        "data.tasks.value": itemData.tasks.value,
        "data.tasks.max": itemData.tasks.max,
        "data.compilerResonance": itemData.compilerResonance,
        "data.creatorId": actorId,
        "data.creatorItemId": item._id,
        "data.conditionMonitors.matrix.current": itemData.conditionMonitors.matrix.current,
        "items": baseItems,
      });
    }

    if (item.type === "itemVehicle") {
      let baseItems = [];
      for (let autosoft of itemData.autosoft) baseItems.push(autosoft);
      for (let ammo of itemData.ammunitions) baseItems.push(ammo);
      for (let weapon of itemData.weapons) baseItems.push(weapon);
      for (let armor of itemData.armors) baseItems.push(armor);

      data = mergeObject(data, {
        "data.creatorId": actorId,
        "data.creatorItemId": item._id,
        "data.type": itemData.type,
        "data.model": itemData.model,
        "data.attributes.handling.natural.base": itemData.attributes.handling,
        "data.attributes.speed.natural.base": itemData.attributes.speed,
        "data.attributes.acceleration.natural.base": itemData.attributes.acceleration,
        "data.attributes.body.natural.base": itemData.attributes.body,
        "data.attributes.armor.natural.base": itemData.attributes.armor,
        "data.attributes.pilot.natural.base": itemData.attributes.pilot,
        "data.attributes.sensor.natural.base": itemData.attributes.sensor,
        "data.attributes.seating.natural.base": itemData.seating,
        "data.conditionMonitors.condition.current": itemData.conditionMonitors.condition.current,
        "data.conditionMonitors.matrix.current": itemData.conditionMonitors.matrix.current,
        "data.pilotSkill": itemData.pilotSkill,
        "data.riggerInterface": itemData.riggerInterface,
        "data.slaved": true,
        "data.vehicleOwner.id": actorId,
        "data.vehicleOwner.name": ownerActor.name,
        "flags.sr5.vehicleControler": ownerActor.data.toObject(false),
        "items": baseItems,
      });
    }

    //Create actor
    await Actor.createDocuments([data]);
  }

  //Socket for creating sidekick;
  static async _handlecreateSidekickSocketMessage(message) {
    await SR5Actor.createSidekick(message.data.item, message.data.userId, message.data.actorId);
	}

  //Dismiss sidekick : update his parent item and then delete actor
  static async dimissSidekick(actor){
    let ownerActor = SR5_EntityHelpers.getRealActorFromID(actor.data.creatorId);
    let itemOwner = ownerActor.items.get(actor.data.creatorItemId);
    let modifiedItem = deepClone(itemOwner.data);
    modifiedItem = modifiedItem.toObject(false);

    if (actor.type === "actorSpirit"){
      modifiedItem.data.services.value = actor.data.services.value;
      modifiedItem.data.services.max = actor.data.services.max;
      modifiedItem.data.conditionMonitors.physical.current = actor.data.conditionMonitors.physical.current;
      modifiedItem.data.conditionMonitors.stun.current = actor.data.conditionMonitors.stun.current;
      modifiedItem.data.isBounded = actor.data.isBounded;
      modifiedItem.data.isCreated = false;
      itemOwner.update(modifiedItem);
    }

    if (actor.type === "actorSprite"){
      modifiedItem.data.tasks.value = actor.data.tasks.value;
      modifiedItem.data.tasks.max = actor.data.tasks.max;
      modifiedItem.data.conditionMonitors.matrix.current = actor.data.conditionMonitors.matrix.current;
      modifiedItem.data.isRegistered = actor.data.isRegistered;
      modifiedItem.data.isCreated = false;
      itemOwner.update(modifiedItem);
    }

    if (actor.type === "actorDrone"){
      let autosoft = [],
          weapons = [],
          ammunitions = [],
          armors = [];
      for (let a of actor.items){
        if (a.type === "itemProgram") autosoft.push(a);
        if (a.type === "itemWeapon") weapons.push(a);
        if (a.type === "itemAmmunition") ammunitions.push(a);
        if (a.type === "itemArmor") armors.push(a);
      }
      modifiedItem.data.autosoft = autosoft;
      modifiedItem.data.weapons = weapons;
      modifiedItem.data.ammunitions = ammunitions;
      modifiedItem.data.armors = armors;
      modifiedItem.data.model = actor.data.model;
      modifiedItem.data.attributes.handling = actor.data.attributes.handling.natural.base;
      modifiedItem.data.attributes.speed = actor.data.attributes.speed.natural.base;
      modifiedItem.data.attributes.acceleration = actor.data.attributes.acceleration.natural.base;
      modifiedItem.data.attributes.body = actor.data.attributes.body.natural.base;
      modifiedItem.data.attributes.armor = actor.data.attributes.armor.natural.base;
      modifiedItem.data.attributes.pilot = actor.data.attributes.pilot.natural.base;
      modifiedItem.data.attributes.sensor = actor.data.attributes.sensor.natural.base;
      modifiedItem.data.seating = actor.data.attributes.seating.natural.base;
      modifiedItem.data.conditionMonitors.condition.current = actor.data.conditionMonitors.condition.current;
      modifiedItem.data.conditionMonitors.matrix.current = actor.data.conditionMonitors.matrix.current;
      modifiedItem.data.isCreated = false;
      modifiedItem.img = actor.img;
      itemOwner.update(modifiedItem);
    }

    await Actor.deleteDocuments([actor._id]);
    if (canvas.scene){
      for (let token of canvas.tokens.placeables) {
        if (token.data.actorId === actor._id) token.document.delete();
      }
    }
  }

  //Socket to dismiss sidekick;
  static async _handleDismissSidekickSocketMessage(message) {
    await SR5Actor.dimissSidekick(message.data.actor);
	}

}

CONFIG.Actor.documentClass = SR5Actor;
