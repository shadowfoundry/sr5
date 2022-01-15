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
        if (data.damageElement === "toxin") SR5_UtilityItem._handleWeaponToxin(data);
        if (data.ammunition.value > data.ammunition.max) data.ammunition.value = data.ammunition.max;
        SR5_UtilityItem._handleBow(itemData);
        SR5_UtilityItem._handleWeaponAccessory(data, owner);
        SR5_UtilityItem._handleWeaponAmmunition(data);
        SR5_UtilityItem._generateWeaponRange(data, owner);
        SR5_UtilityItem._generateWeaponDicepool(itemData, owner);
        SR5_UtilityItem._generateWeaponDamage(data, owner);
        data.conditionMonitors.matrix.value = Math.ceil(data.deviceRating / 2) + 8;
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'matrix');
        SR5_UtilityItem._handleItemPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        break;
      case "itemAmmunition":
        SR5_UtilityItem._handleAmmoPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        break;
      case "itemSpell":
        if (owner) SR5_UtilityItem._handleSpell(itemData, owner);
        break
      case "itemPreparation":
        if (owner) SR5_UtilityItem._handlePreparation(itemData, owner);
        break;
      case "itemKnowledge":
        if (owner) SR5_CharacterUtility._generateKnowledgeSkills(data, owner);
        break
      case "itemLanguage":
        if (owner) SR5_CharacterUtility._generateLanguageSkills(data, owner);
        break
      case "itemAugmentation":
        SR5_UtilityItem._handleAugmentation(data);
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
      case "itemArmor":
      case "itemGear":
        if (itemData.type === "itemArmor"){ 
          if (Object.keys(data.itemEffects).length) {
            SR5_UtilityItem.applyItemEffects(itemData);
          }
          SR5_UtilityItem._handleArmorValue(data);}
        SR5_UtilityItem._handleItemCapacity(data);
        SR5_UtilityItem._handleItemPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        SR5_UtilityItem._handleItemConcealment(data);
        data.conditionMonitors.matrix.value = Math.ceil(data.deviceRating / 2) + 8;
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'matrix');
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
        data.conditionMonitors.matrix.value = Math.ceil(data.deviceRating / 2) + 8;
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'matrix');
        break;
      case "itemFocus":
        SR5_UtilityItem._handleFocus(data);
        break;
      case "itemSpirit":
        SR5_UtilityItem._handleSpirit(data);
        break;
      case "itemAdeptPower":
        SR5_UtilityItem._handleAdeptPower(data);
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
        data.conditionMonitors.matrix.value = Math.ceil(data.itemRating/ 2) + 8;
        SR5_EntityHelpers.GenerateMonitorBoxes(data, 'matrix');
        break;
      case "itemVehicle":
        if (typeof data.mount === "object") data.mount = Object.values(data.mount);
        SR5_UtilityItem._handleVehicle(data);
        SR5_UtilityItem._handleItemPrice(data);
        SR5_UtilityItem._handleItemAvailability(data);
        data.conditionMonitors.matrix.value = Math.ceil(data.attributes.pilot / 2) + 8;
        if (data.type === "drone") data.conditionMonitors.condition.base = Math.ceil((data.attributes.body / 2) + 6);
        else data.conditionMonitors.condition.base = Math.ceil((data.attributes.body / 2) + 12);
        SR5_EntityHelpers.updateValue(data.conditionMonitors.condition, 1)
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
          game.i18n.localize(lists.augmentationGrades[data.grade]),
          game.i18n.localize("SR5.ItemRating") + ` ${data.itemRating}`,
        );
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
        break;
      case "itemPreparation":
      case "itemSpell":
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
        if (this.data.type === "itemSpell") tags.push(game.i18n.localize(`SR5.SpellDrain`) + game.i18n.localize(`SR5.Colons`) + ` ${data.drainModifier}`);
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


}
