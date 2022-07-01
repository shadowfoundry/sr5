import { SR5_UtilityItem } from "./utilityItem.js";
import { SR5_CharacterUtility } from "../actors/utility.js";
import AbilityTemplate from "../../interface/canvas-template.js";
import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_Roll } from "../../rolls/roll.js";
import { SR5 } from "../../config.js";

/**
 * Override and extend the basic :class:`Item` implementation
 */
export class SR5Item extends Item {
  static async create(data, options) {
    if (!data.img) {
      data.img = `systems/sr5/img/items/${data.type}.svg`;
    }

    return super.create(data, options);
  }

  prepareData() {
    super.prepareData();

    const itemData = this.data;
    const data = itemData.data;
    let owner, ownerData;

    if(this.actor?.data){
      owner = this.actor.data;
      let ownerObject = this.actor.data.toObject(false);
      ownerData = ownerObject.data;
    }

    SR5_UtilityItem._resetItemModifiers(itemData);
    switch (itemData.type) {
      case "itemWeapon":
        // Pour faire fonctionner l'ajout et la suppression d'accessoire (pas trouvé mieux :/)
        if (typeof data.accessory === "object") data.accessory = Object.values(data.accessory);
        if (data.damageElement === "toxin") SR5_UtilityItem._handleWeaponToxin(data, owner);
        if (data.ammunition.value > data.ammunition.max) data.ammunition.value = data.ammunition.max;
        if (data.category === "meleeWeapon" && owner){
          if (!data.isLinkedToFocus) SR5_UtilityItem._handleWeaponFocus(itemData, owner);
          SR5_UtilityItem._checkIfWeaponIsFocus(this, owner);
          if (!owner.data.visions.astral.isActive) data.isUsedAsFocus = false;
        }
        if (data.category === "rangedWeapon" && owner){
          if (!data.isLinkedToMount) SR5_UtilityItem._handleWeaponMount(itemData, owner);
          SR5_UtilityItem._checkIfWeaponIsMount(this, owner);
        }
        if (Object.keys(data.itemEffects).length) SR5_UtilityItem.applyItemEffects(itemData);
        SR5_UtilityItem._handleBow(itemData);
        SR5_UtilityItem._handleWeaponAccessory(data, owner);
        SR5_UtilityItem._handleWeaponAmmunition(data);
        SR5_UtilityItem._generateWeaponRange(data, owner);
        SR5_UtilityItem._generateWeaponDicepool(itemData, owner);
        SR5_UtilityItem._generateWeaponDamage(data, owner);
        SR5_UtilityItem._handleMatrixMonitor(itemData);
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'matrix');
        SR5_UtilityItem._handleItemPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        if (data.conditionMonitors.matrix.actual.value >= data.conditionMonitors.matrix.value) {
          data.wirelessTurnedOn = false;
        }
        break;
      case "itemSpell":
        if (data.quickening) data.freeSustain = true;
        break;
      case "itemAmmunition":
        SR5_UtilityItem._handleAmmoPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        break;
      case "itemPreparation":
        if (owner) SR5_UtilityItem._handlePreparation(itemData);
        break;
      case "itemRitual":
        if (owner) SR5_UtilityItem._handleRitual(itemData, owner);
        break;
      case "itemKnowledge":
        if (owner) SR5_CharacterUtility._generateKnowledgeSkills(data, owner);
        break;
      case "itemLanguage":
        if (owner) SR5_CharacterUtility._generateLanguageSkills(data, owner);
        break;
      case "itemAugmentation":
        SR5_UtilityItem._handleAugmentation(data);
        SR5_UtilityItem._handleMatrixMonitor(itemData);
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'matrix');
        if (data.conditionMonitors.matrix.actual.value >= data.conditionMonitors.matrix.value) {
          data.wirelessTurnedOn = false;
        }
        if (owner){
          if (data.isAccessory) {
            SR5_UtilityItem._checkIfAccessoryIsPlugged(itemData, owner);
            if (!data.isPlugged) {
              data.isActive = false;
              data.wirelessTurnedOn = false;
            }
          }
        }
        break;
      case "itemVehicleMod":
        if (Object.keys(data.itemEffects).length) {
          SR5_UtilityItem.applyItemEffects(itemData);
        }
        if (data.isWeaponMounted) {
          SR5_UtilityItem._handleWeaponMounted(itemData);
        }
        SR5_UtilityItem._handleSlotsMultiplier(data);
        SR5_UtilityItem._handleThresholdMultiplier(data);
      break;
      case "itemArmor":
      case "itemGear":
        if (itemData.type === "itemArmor"){ 
          if (Object.keys(data.itemEffects).length) {
            SR5_UtilityItem.applyItemEffects(itemData);
          }
          SR5_UtilityItem._handleArmorValue(data);
        }
        SR5_UtilityItem._handleItemCapacity(data);
        SR5_UtilityItem._handleItemPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        SR5_UtilityItem._handleItemConcealment(data);
        SR5_UtilityItem._handleMatrixMonitor(itemData);
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'matrix');
        if (data.conditionMonitors.matrix.actual.value >= data.conditionMonitors.matrix.value) {
          data.wirelessTurnedOn = false;
        }
        if (owner){
          if (data.isAccessory) {
            SR5_UtilityItem._checkIfAccessoryIsPlugged(itemData, owner);
            if (!data.isPlugged) {
              data.isActive = false;
              data.wirelessTurnedOn = false;
            }
          }
        }
        break;
      case "itemDevice":
        SR5_UtilityItem._handleCommlink(data);
        SR5_UtilityItem._handleItemPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        if (Object.keys(data.itemEffects).length) {
          SR5_UtilityItem.applyItemEffects(itemData);
        }
        SR5_UtilityItem._handleMatrixMonitor(itemData);
        if ((data.conditionMonitors.matrix.actual.value >= data.conditionMonitors.matrix.value) && (data.type !== "baseDevice")) {
          data.isActive = false;
        }
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'matrix');
        break;
      case "itemFocus":
        SR5_UtilityItem._handleFocus(data);     
        break;
      case "itemSpirit":
        SR5_UtilityItem._handleSpirit(data);
        break;
      case "itemAdeptPower":
        SR5_UtilityItem._handleAdeptPower(data, owner);
        break;
      case "itemPower":
        if (owner) SR5_UtilityItem._handlePower(data, owner) 
        break;
      case "itemSpritePower": 
        if (owner) SR5_UtilityItem._handleSpritePower(data, owner)
        break;
      case "itemProgram":
        SR5_UtilityItem._handleItemPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        break;
      case "itemLifestyle":
        if (typeof data.options === "object") data.options = Object.values(data.options);
        SR5_UtilityItem._handleLifeStyle(data);
        SR5_UtilityItem._handleItemPrice(data);
        break;
      case "itemSin":
        if (typeof data.license === "object") data.license = Object.values(data.license);
        SR5_UtilityItem._handleSinLicense(data);
        SR5_UtilityItem._handleItemPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        break;
      case "itemSprite":
        SR5_UtilityItem._handleMatrixMonitor(itemData);
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'matrix');
        break;
      case "itemVehicle":
        SR5_UtilityItem._handleVehicle(data);
        SR5_UtilityItem._handleVehicleSlots(data);
        SR5_UtilityItem._handleItemPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        SR5_UtilityItem._handleMatrixMonitor(itemData);
        if (data.type === "drone") data.conditionMonitors.condition.base = Math.ceil((data.attributes.body / 2) + 6);
        else data.conditionMonitors.condition.base = Math.ceil((data.attributes.body / 2) + 12);
        SR5_EntityHelpers.updateValue(data.conditionMonitors.condition, 1)
        SR5_EntityHelpers.updateValue(data.conditionMonitors.condition.actual, 0);
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'condition');
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'matrix');
        break;
      case "itemDrug":
        SR5_UtilityItem._handleItemPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        data.vector.value = [];
        for (let key of Object.keys(SR5.propagationVectors)) {
          if (data.vector[key]) {
            data.vector.value.push(game.i18n.localize(SR5.propagationVectors[key]));
          }
        }
        break;
      default:
    }

    //Etiquette pour afficher le label des jets.
    const labels = {};
    this.labels = labels;
    return itemData;
  }

  // Expand data is used in most dropdown infos
  getExpandData(htmlOptions) {
    const data = duplicate(this.data.data);
    let lists = SR5_EntityHelpers.sortTranslations(SR5);
    let tags =[];
    let accessories =[];

    data.description = data.description || "";
    data.description = TextEditor.enrichHTML(data.description, htmlOptions);

    switch(this.data.type){
      case "itemAugmentation":
        tags.push(
          game.i18n.localize(lists.augmentationTypes[data.type]),
          game.i18n.localize(lists.augmentationCategories[data.category]),
          game.i18n.localize(lists.augmentationGeneCategories[data.category]),
        );
        if (data.type === "bioware" || data.type === "culturedBioware" || data.type === "cyberware" || data.type === "nanocyber" || data.type === "symbionts") {
          tags.push(game.i18n.localize(lists.augmentationGrades[data.grade]));
        }
        if (data.itemRating > 0) {
          tags.push(game.i18n.localize("SR5.ItemRating") + ` ${data.itemRating}`);
        }
        if (data.marks.length){
          for (let m of data.marks){
            tags.push(game.i18n.localize("SR5.Mark") + game.i18n.localize(`SR5.Colons`) + ` ${m.ownerName} [${m.value}]`);
          }
        }
        if (data.isSlavedToPan){
          let panMaster = SR5_EntityHelpers.getRealActorFromID(data.panMaster);
          tags.push(game.i18n.localize("SR5.DeviceSlavedToPan") + ` (${panMaster.name})`);
        }
        break;
      case "itemWeapon":
        if (data.category === "rangedWeapon"){
          tags.push(
            game.i18n.localize(lists.rangedWeaponTypes[data.type]),
            game.i18n.localize(`SR5.WeaponModesShort`) + game.i18n.localize(`SR5.Colons`) + ` ${data.firingMode.value}`,
            game.i18n.localize(`SR5.RecoilCompensationShort`) + game.i18n.localize(`SR5.Colons`) + ` ${data.recoilCompensation.value}`,
            game.i18n.localize(`SR5.WeaponRange`) + game.i18n.localize(`SR5.Colons`) + ` ${data.range.short.value}/${data.range.medium.value}/${data.range.long.value}/${data.range.extreme.value}` + game.i18n.localize(`SR5.MeterUnit`),
            game.i18n.localize(`SR5.Ammunition`) + game.i18n.localize(`SR5.Colons`) + ` ` + game.i18n.localize(lists.allAmmunitionTypes[data.ammunition.type]),
          );
          if (data.accessory) {
            for (let a of data.accessory){
              accessories.push(`${a.name}: ${a.data?.gameEffect}`);
              tags.push([game.i18n.localize(lists.weaponAccessories[a.name]), a.gameEffects]);
            }
          }
        } else if (data.category === "meleeWeapon"){
          tags.push(
            game.i18n.localize(lists.meleeWeaponTypes[data.type]),
            game.i18n.localize(`SR5.WeaponReach`) + game.i18n.localize(`SR5.Colons`) + ` ${data.reach.value}`,
          );
        } else if (data.category === "grenade"){
          tags.push(
            game.i18n.localize(`SR5.WeaponRange`) + game.i18n.localize(`SR5.Colons`) + ` ${data.range.short.value}/${data.range.medium.value}/${data.range.long.value}/${data.range.extreme.value}` + game.i18n.localize(`SR5.MeterUnit`),
          );
        }
        if (data.marks.length){
          for (let m of data.marks){
            tags.push(game.i18n.localize("SR5.Mark") + game.i18n.localize(`SR5.Colons`) + ` ${m.ownerName} [${m.value}]`);
          }
        }
        if (data.isSlavedToPan){
          let panMaster = SR5_EntityHelpers.getRealActorFromID(data.panMaster);
          tags.push(game.i18n.localize("SR5.DeviceSlavedToPan") + ` (${panMaster.name})`);
        }
        break;
      case "itemPreparation":
      case "itemSpell":
        tags.push(`${game.i18n.localize('SR5.SpellType')}${game.i18n.localize('SR5.Colons')} ${game.i18n.localize(lists.spellTypes[data.type])}`);
        tags.push(game.i18n.localize(lists.spellCategories[data.category]));
        switch (data.category){
          case "combat":
            tags.push(game.i18n.localize(lists.spellCombatTypes[data.subCategory]));
            break;
          case "detection":
            tags.push(
              game.i18n.localize(lists.spellDetectionTypes[data.subCategory]),
              game.i18n.localize(lists.spellDetectionSens[data.detectionSense]),
            );
            break;
          case "health":
            if (data.healthEssence){
              tags.push(game.i18n.localize(`SR5.Essence`));
            }
            break;
          case "illusion":
            tags.push(
              game.i18n.localize(lists.spellIllusionTypes[data.subCategory]),
              game.i18n.localize(lists.spellIllusionSens[data.illusionSense]),
            );
            break;
          case "manipulation":
            tags.push(game.i18n.localize(lists.spellManipulationTypes[data.subCategory]));
            if (data.manipulationDamaging){
              tags.push(game.i18n.localize(`SR5.Damaging`));
            }
            break;
          default:
        }
        if (this.data.type === "itemSpell") {
          let plus = (data.drain.value <= 0 ? "" : "+");
          tags.push(`${game.i18n.localize('SR5.SpellDrain')}${game.i18n.localize('SR5.Colons')} ${game.i18n.localize('SR5.SpellForceShort')} ${plus}${data.drain.value}`);
          tags.push(`${game.i18n.localize('SR5.SpellDrainActual')}${game.i18n.localize('SR5.Colons')} ${data.drainValue.value}`);
        }
        break;
      case "itemGear":
        if (data.marks.length){
          for (let m of data.marks){
            tags.push(game.i18n.localize("SR5.Mark") + game.i18n.localize(`SR5.Colons`) + ` ${m.ownerName} [${m.value}]`);
          }
        }
        if (data.isSlavedToPan){
          let panMaster = SR5_EntityHelpers.getRealActorFromID(data.panMaster);
          tags.push(game.i18n.localize("SR5.DeviceSlavedToPan") + ` (${panMaster.name})`);
        }
        break;
      case "itemRitual":
        if (data.anchored) tags.push(game.i18n.localize(`SR5.Anchored`));
        if (data.materialLink) tags.push(game.i18n.localize(`SR5.MaterialLink`));
        if (data.minion) tags.push(game.i18n.localize(`SR5.Minion`));
        if (data.spotter) tags.push(game.i18n.localize(`SR5.Spotter`));
        if (data.spell) tags.push(game.i18n.localize(`SR5.Spell`));
        tags.push(`${game.i18n.localize('SR5.DurationToPerform')}${game.i18n.localize('SR5.Colons')} ${game.i18n.localize('SR5.SpellForceShort')} × ${game.i18n.localize(lists.ritualDurations[data.durationToPerform])}`);
        break;
      case "itemAdeptPower":
        tags.push(`${game.i18n.localize('SR5.PowerPointsCost')}${game.i18n.localize('SR5.Colons')} ${data.powerPointsCost.value}`);
        tags.push(`${game.i18n.localize('SR5.ActionType')}${game.i18n.localize('SR5.Colons')} ${game.i18n.localize(lists.actionTypes[data.actionType])}`);
        break;
      case "itemQuality":
        tags.push(`${game.i18n.localize(lists.qualityTypes[data.type])}`);
        if (data.itemRating !== 0) tags.push(`${game.i18n.localize('SR5.ItemRating')}${game.i18n.localize('SR5.Colons')} ${data.itemRating}`);
        tags.push(`${game.i18n.localize('SR5.KarmaCost')}${game.i18n.localize('SR5.Colons')} ${data.karmaCost}`);
        break;
      case "itemVehicle":
        tags.push(`${game.i18n.localize(lists.vehiclesCategories[data.category])}`);
        if (data.vehiclesMod.length){
          for (let v of data.vehiclesMod){
            tags.push(`${v.name}`);
          }
        }
        if (data.marks.length){
          for (let m of data.marks){
            tags.push(game.i18n.localize("SR5.Mark") + game.i18n.localize(`SR5.Colons`) + ` ${m.ownerName} [${m.value}]`);
          }
        }
        if (data.isSlavedToPan){
          let panMaster = SR5_EntityHelpers.getRealActorFromID(data.panMaster);
          tags.push(game.i18n.localize("SR5.DeviceSlavedToPan") + ` (${panMaster.name})`);
        }        
        break;
      default:
    }

    data.properties = tags.filter(p => !!p);
    data.accessories = accessories.filter(p => !!p);
    return data;
  }

  // Recharge les armes à distance
  reloadAmmo() {
    let lists = SR5_EntityHelpers.sortTranslations(SR5);
    let ownerActor, itemAmmoData;
    if (this.actor.isToken) ownerActor = SR5_EntityHelpers.getRealActorFromID(this.actor.token.id);
    else ownerActor = SR5_EntityHelpers.getRealActorFromID(this.actor.id);

    const data = duplicate(this.data);
    let ammoNeeded = data.data.ammunition.max - data.data.ammunition.value;
    if (ammoNeeded < 1) return;

    let itemAmmo = ownerActor.items.find((item) => item.type === "itemAmmunition" && (item.data.data.type === data.data.ammunition.type) && (item.data.data.class === data.data.type));
    if (itemAmmo) {
      itemAmmoData = itemAmmo.data.toObject();

      if (itemAmmoData.data.quantity <=0) {
        Dialog.confirm({
          title: game.i18n.localize('SR5.DIALOG_WarningNoMoreAmmoTitle'),
          content: "<h3>" + game.i18n.localize('SR5.DIALOG_Warning') + "</h3><p>" 
                  + game.i18n.format('SR5.DIALOG_WarningNoMoreAmmo', 
                  {actor: ownerActor.name, ammoType: game.i18n.localize(lists.allAmmunitionTypes[data.data.ammunition.type]), 
                    weaponType: game.i18n.localize(lists.rangedWeaponTypes[data.data.type]),
                    itemName: data.name
                  }) + "</p>",
          yes: () => { 
            data.data.ammunition.value = data.data.ammunition.max;
            this.update(data);
          },
        });
      } else {
        if (ammoNeeded <= itemAmmoData.data.quantity) {
          data.data.ammunition.value = data.data.ammunition.max;
          this.update(data);
          itemAmmoData.data.quantity -= ammoNeeded;
          itemAmmo.update(itemAmmoData);
        } else {
          data.data.ammunition.value += itemAmmoData.data.quantity;
          this.update(data);
          itemAmmoData.data.quantity = 0;
          itemAmmo.update(itemAmmoData);
        }
      }
    } else {
      Dialog.confirm({
        title: game.i18n.localize('SR5.DIALOG_WarningNoAmmoTypeTitle'),
        content: "<h3>" + game.i18n.localize('SR5.DIALOG_Warning') + "</h3><p>" 
                + game.i18n.format('SR5.DIALOG_WarningNoAmmoType', 
                {actor: ownerActor.name, ammoType: game.i18n.localize(lists.allAmmunitionTypes[data.data.ammunition.type]), 
                  weaponType: game.i18n.localize(lists.rangedWeaponTypes[data.data.type]),
                  itemName: data.name
                }) + "</p>",
        yes: () => { 
          data.data.ammunition.value = data.data.ammunition.max;
          this.update(data);
        },
      });
    }
    
  }

  async placeGabarit(event) {
    if (canvas.scene) {
      const template = AbilityTemplate.fromItem(this);
      if (template) await template.drawPreview(event, this);
    } else if (this.type === "itemWeapon") this.rollTest("weapon");
    if (this.actor.sheet._element) {
      if (this.isOwner && this.actor.sheet) this.actor.sheet.minimize();
    }
  }

  //Roll a test
  rollTest(rollType, rollKey, chatData){
    SR5_Roll.actorRoll(this, rollType, rollKey, chatData);
  }

  /** Overide Item's create Dialog to hide certain items and sort them alphabetically*/
  static async createDialog(data={}, {parent=null, pack=null, ...options}={}) {
    // Collect data
    const documentName = this.metadata.name;
    const hiddenTypes = ["itemKarma", "itemMark", "itemNuyen", "itemEffect", "itemCyberdeck"];
    const originalTypes = game.system.documentTypes[documentName];
    const types = originalTypes.filter(
      (itemType) => !hiddenTypes.includes(itemType)
    );
    const folders = parent ? [] : game.folders.filter(f => (f.data.type === documentName) && f.displayed);
    const title = game.i18n.localize('SR5.DIALOG_CreateNewItem');
    
    // Render the document creation form
    const html = await renderTemplate(`templates/sidebar/document-create.html`, {
      name: game.i18n.localize('SR5.DIALOG_NewItem'),
      folder: data.folder,
      folders: folders,
      hasFolders: folders.length >= 1,
      type: types[0],
      types: types.reduce((obj, t) => {
        const label = CONFIG[documentName]?.typeLabels?.[t] ?? t;
        obj[t] = game.i18n.has(label) ? game.i18n.localize(label) : t;
        return SR5_EntityHelpers.sortObjectValue(obj);
      }, {}),
      hasTypes: types.length > 1,
      presets: CONFIG.Cards.presets
    });
    
    // Render the confirmation dialog window
    return Dialog.prompt({
      title: title,
      content: html,
      label: title,
      callback: async html => {
        const form = html[0].querySelector("form");
        const fd = new FormDataExtended(form);
        foundry.utils.mergeObject(data, fd.toObject(), {inplace: true});
        if ( !data.folder ) delete data["folder"];
        const preset = CONFIG.Cards.presets[data.preset];
        if ( preset && (preset.type === data.type) ) {
          const presetData = await fetch(preset.src).then(r => r.json());
          data = foundry.utils.mergeObject(presetData, data);
        }
        return this.create(data, {parent, pack, renderSheet: true});
      },
      rejectClose: false,
      options: options
    });
  }


}
