import { SR5_UtilityItem } from "./utilityItem.js";
import { SR5_CharacterUtility } from "../actors/utilityActor.js";
import AbilityTemplate from "../../interface/canvas-template.js";
import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_PrepareRollTest } from "../../rolls/roll-prepare.js";
import { SR5_RollMessage } from "../../rolls/roll-message.js";
import { SR5 } from "../../config.js";
import { SR5Combat } from "../../system/srcombat.js";

/**
 * Override and extend the basic :class:`Item` implementation
 */
export class SR5Item extends Item {
	static async create(data, options) {
		if (!data.img) data.img = `systems/sr5/img/items/${data.type}.svg`;
		return super.create(data, options);
	}

	prepareData() {
		super.prepareData();

		const item = this;
		const itemData = item.system;
		let owner;

		if(this.actor?.system) owner = this.actor;

		SR5_UtilityItem._resetItemModifiers(item);
		switch (item.type) {
			case "itemWeapon":
				// Pour faire fonctionner l'ajout et la suppression d'accessoire (pas trouvé mieux :/)
				if (typeof itemData.accessory === "object") itemData.accessory = Object.values(itemData.accessory);
				if (itemData.damageElement === "toxin") SR5_UtilityItem._handleWeaponToxin(itemData, owner);
				if (itemData.ammunition.value > itemData.ammunition.max) itemData.ammunition.value = itemData.ammunition.max;
				if (itemData.category === "meleeWeapon" && owner){
					SR5_UtilityItem._checkIfWeaponIsFocus(this, owner);
					if (itemData.isLinkedToFocus) SR5_UtilityItem._handleWeaponFocus(item, owner);
					if (!owner.system.visions.astral.isActive) itemData.isUsedAsFocus = false;
				}
				if (itemData.category === "rangedWeapon" && owner){
					if (!itemData.isLinkedToMount) SR5_UtilityItem._handleWeaponMount(item, owner);
					SR5_UtilityItem._checkIfWeaponIsMount(this, owner);
				}
				if (Object.keys(itemData.itemEffects).length) SR5_UtilityItem.applyItemEffects(item);
				SR5_UtilityItem._handleBow(item);
				SR5_UtilityItem._handleWeaponAccessory(itemData, owner);
				SR5_UtilityItem._handleWeaponAmmunition(itemData);
				SR5_UtilityItem._generateWeaponRange(itemData, owner);
				SR5_UtilityItem._generateWeaponDicepool(item, owner);
				SR5_UtilityItem._generateWeaponDamage(itemData, owner);
				SR5_UtilityItem._handleMatrixMonitor(item);
				SR5_EntityHelpers.GenerateMonitorBoxes(itemData, 'matrix');
				SR5_UtilityItem._handleItemPrice(itemData);
				SR5_UtilityItem._handleItemAvailability(itemData);
				if (itemData.conditionMonitors.matrix.actual.value >= itemData.conditionMonitors.matrix.value) itemData.wirelessTurnedOn = false;
				break;
			case "itemSpell":
				if (itemData.quickening) itemData.freeSustain = true;
				break;
			case "itemAmmunition":
				SR5_UtilityItem._handleAmmoPrice(itemData);
				SR5_UtilityItem._handleItemAvailability(itemData);
				break;
			case "itemPreparation":
				if (owner) SR5_UtilityItem._handlePreparation(item, owner);
				break;
			case "itemRitual":
				if (owner) SR5_UtilityItem._handleRitual(item, owner);
				break;
			case "itemKnowledge":
				if (owner) SR5_CharacterUtility._generateKnowledgeSkills(item, owner);
				break;
			case "itemLanguage":
				if (owner) SR5_CharacterUtility._generateLanguageSkills(item, owner);
				break;
			case "itemAugmentation":
				SR5_UtilityItem._handleAugmentation(itemData);
				SR5_UtilityItem._handleMatrixMonitor(item);
				SR5_EntityHelpers.GenerateMonitorBoxes(itemData, 'matrix');
				if (itemData.conditionMonitors.matrix.actual.value >= itemData.conditionMonitors.matrix.value) itemData.wirelessTurnedOn = false;
				if (owner && itemData.isAccessory){
					SR5_UtilityItem._checkIfAccessoryIsPlugged(item, owner);
					if (!itemData.isPlugged) {
						itemData.isActive = false;
						itemData.wirelessTurnedOn = false;
					}
				}
				break;
			case "itemVehicleMod":
				if (Object.keys(itemData.itemEffects).length) SR5_UtilityItem.applyItemEffects(item);
				if (itemData.isWeaponMounted) SR5_UtilityItem._handleWeaponMounted(item);
				SR5_UtilityItem._handleSlotsMultiplier(itemData);
				SR5_UtilityItem._handleThresholdMultiplier(itemData);
				break;
			case "itemArmor":
			case "itemGear":
				if (item.type === "itemGear"){
					if (Object.keys(itemData.systemEffects).length) SR5_UtilityItem.applyItemEffects(item);
				}
				if (item.type === "itemArmor"){ 
					if (Object.keys(itemData.itemEffects).length) SR5_UtilityItem.applyItemEffects(item);
					SR5_UtilityItem._handleArmorValue(itemData);
				}
				if (itemData.canRollTest) SR5_UtilityItem.generateTestDicepool(itemData);
				SR5_UtilityItem._handleItemCapacity(itemData);
				SR5_UtilityItem._handleItemPrice(itemData);
				SR5_UtilityItem._handleItemAvailability(itemData);
				SR5_UtilityItem._handleItemConcealment(itemData);
				SR5_UtilityItem._handleMatrixMonitor(item);
				SR5_EntityHelpers.GenerateMonitorBoxes(itemData, 'matrix');
				if (itemData.conditionMonitors.matrix.actual.value >= itemData.conditionMonitors.matrix.value) itemData.wirelessTurnedOn = false;
				if (owner && itemData.isAccessory){
					SR5_UtilityItem._checkIfAccessoryIsPlugged(item, owner);
					if (!itemData.isPlugged) {
						itemData.isActive = false;
						itemData.wirelessTurnedOn = false;
					}
				}
				break;
			case "itemDevice":
				SR5_UtilityItem._handleCommlink(itemData);
				SR5_UtilityItem._handleItemPrice(itemData);
				SR5_UtilityItem._handleItemAvailability(itemData);
				if (Object.keys(itemData.itemEffects).length) SR5_UtilityItem.applyItemEffects(item);
				SR5_UtilityItem._handleMatrixMonitor(item);
				if ((itemData.conditionMonitors.matrix.actual.value >= itemData.conditionMonitors.matrix.value) && (itemData.type !== "baseDevice")) itemData.isActive = false;
				SR5_EntityHelpers.GenerateMonitorBoxes(itemData, 'matrix');
				SR5_UtilityItem._handlePan(item);
				break;
			case "itemFocus":
				SR5_UtilityItem._handleFocus(itemData);     
				break;
			case "itemSpirit":
				if (typeof itemData.powers === "object") itemData.powers = Object.values(itemData.powers);
				SR5_UtilityItem._handleSpirit(itemData);
				break;
			case "itemAdeptPower":
				SR5_UtilityItem._handleAdeptPower(itemData, owner);
				break;
			case "itemMartialArt":    
				if (owner) SR5_UtilityItem._handleMartialArt(itemData, owner);
				break;
			case "itemPower":
				if (owner) SR5_UtilityItem._handlePower(itemData, owner) 
				break;
			case "itemSpritePower": 
				if (typeof itemData.spritePowers === "object") itemData.spritePowers = Object.values(itemData.spritePowers);
				if (owner) SR5_UtilityItem._handleSpritePower(itemData, owner)
				break;
			case "itemProgram":
				SR5_UtilityItem._handleItemPrice(itemData);
				SR5_UtilityItem._handleItemAvailability(itemData);
				break;
			case "itemLifestyle":
				if (typeof itemData.options === "object") itemData.options = Object.values(itemData.options);
				SR5_UtilityItem._handleLifeStyle(itemData);
				SR5_UtilityItem._handleItemPrice(itemData);
				break;
			case "itemSin":
				if (typeof itemData.license === "object") itemData.license = Object.values(itemData.license);
				SR5_UtilityItem._handleSinLicense(itemData);
				SR5_UtilityItem._handleItemPrice(itemData);
				SR5_UtilityItem._handleItemAvailability(itemData);
				break;
			case "itemSprite":
				SR5_UtilityItem._handleMatrixMonitor(item);
				SR5_EntityHelpers.GenerateMonitorBoxes(itemData, 'matrix');
				break;
			case "itemVehicle":
				SR5_UtilityItem._handleVehicle(itemData);
				SR5_UtilityItem._handleVehicleSlots(itemData);
				SR5_UtilityItem._handleItemPrice(itemData);
				SR5_UtilityItem._handleItemAvailability(itemData);
				SR5_UtilityItem._handleMatrixMonitor(item);
				if (itemData.type === "drone") itemData.conditionMonitors.condition.base = Math.ceil((itemData.attributes.body / 2) + 6);
				else itemData.conditionMonitors.condition.base = Math.ceil((itemData.attributes.body / 2) + 12);
				SR5_EntityHelpers.updateValue(itemData.conditionMonitors.condition, 1)
				SR5_EntityHelpers.updateValue(itemData.conditionMonitors.condition.actual, 0);
				SR5_EntityHelpers.GenerateMonitorBoxes(itemData, 'condition');
				SR5_EntityHelpers.GenerateMonitorBoxes(itemData, 'matrix');
				break;
			case "itemDrug":
				SR5_UtilityItem._handleItemPrice(itemData);
				SR5_UtilityItem._handleItemAvailability(itemData);
				itemData.vector.value = [];
				for (let key of Object.keys(SR5.propagationVectors)) {
					if (itemData.vector[key]) itemData.vector.value.push(game.i18n.localize(SR5.propagationVectors[key]));
				}
				break;
			default:
		}

		//Etiquette pour afficher le label des jets.
		const labels = {};
		this.labels = labels;
		return item;
	}

	// Expand data is used in most dropdown infos
	getExpandData(htmlOptions) {
		const itemData = duplicate(this.system);
		let lists = SR5_EntityHelpers.sortTranslations(SR5);
		let tags =[];
		let accessories =[];    
		let options =[];
		let license =[];
		let powers = [];
		let spritePowers = [];
		htmlOptions.async = false;

		itemData.description = itemData.description || "";
		itemData.description = TextEditor.enrichHTML(itemData.description, htmlOptions);

		switch(this.type){
			case "itemAugmentation":
				tags.push(
					game.i18n.localize(lists.augmentationTypes[itemData.type]),
					game.i18n.localize(lists.augmentationCategories[itemData.category]),
					game.i18n.localize(lists.augmentationGeneCategories[itemData.category]),
				);
				if (itemData.type === "bioware" || itemData.type === "culturedBioware" || itemData.type === "cyberware" || itemData.type === "nanocyber" || itemData.type === "symbionts") {
					tags.push(game.i18n.localize(lists.augmentationGrades[itemData.grade]));
				}
				if (itemData.itemRating > 0) {
					tags.push(game.i18n.localize("SR5.ItemRating") + ` ${itemData.itemRating}`);
				}
				if (itemData.marks.length){
					for (let m of itemData.marks){
						tags.push(game.i18n.localize("SR5.Mark") + game.i18n.localize(`SR5.Colons`) + ` ${m.ownerName} [${m.value}]`);
					}
				}
				if (itemData.isSlavedToPan){
					let panMaster = SR5_EntityHelpers.getRealActorFromID(itemData.panMaster);
					tags.push(game.i18n.localize("SR5.DeviceSlavedToPan") + ` (${panMaster.name})`);
				}
				break;
			case "itemWeapon":
				if (itemData.category === "rangedWeapon"){
					tags.push(
						game.i18n.localize(lists.rangedWeaponTypes[itemData.type]),
						game.i18n.localize(`SR5.WeaponModesShort`) + game.i18n.localize(`SR5.Colons`) + ` ${itemData.firingMode.value}`,
						game.i18n.localize(`SR5.WeaponModeCurrent`) + game.i18n.localize(`SR5.Colons`) + ` ` + game.i18n.localize(lists.weaponModesCode[itemData.firingMode.current]),
						game.i18n.localize(`SR5.RecoilCompensationShort`) + game.i18n.localize(`SR5.Colons`) + ` ${itemData.recoilCompensation.value}`,
						game.i18n.localize(`SR5.WeaponRange`) + game.i18n.localize(`SR5.Colons`) + ` ${itemData.range.short.value}/${itemData.range.medium.value}/${itemData.range.long.value}/${itemData.range.extreme.value}` + game.i18n.localize(`SR5.MeterUnit`),
						game.i18n.localize(`SR5.Ammunition`) + game.i18n.localize(`SR5.Colons`) + ` ` + game.i18n.localize(lists.allAmmunitionTypes[itemData.ammunition.type]),
					);
					if (itemData.accessory) {
						for (let a of itemData.accessory){
							accessories.push(`${a.name}: ${a.system?.gameEffect}`);
							tags.push([game.i18n.localize(lists.weaponAccessories[a.name]), a.gameEffects]);
						}
					}
				} else if (itemData.category === "meleeWeapon"){
					tags.push(
						game.i18n.localize(lists.meleeWeaponTypes[itemData.type]),
						game.i18n.localize(`SR5.WeaponReach`) + game.i18n.localize(`SR5.Colons`) + ` ${itemData.reach.value}`,
					);
				} else if (itemData.category === "grenade"){
					tags.push(
						game.i18n.localize(`SR5.WeaponRange`) + game.i18n.localize(`SR5.Colons`) + ` ${itemData.range.short.value}/${itemData.range.medium.value}/${itemData.range.long.value}/${itemData.range.extreme.value}` + game.i18n.localize(`SR5.MeterUnit`),
					);
				}
				if (itemData.marks.length){
					for (let m of itemData.marks){
						tags.push(game.i18n.localize("SR5.Mark") + game.i18n.localize(`SR5.Colons`) + ` ${m.ownerName} [${m.value}]`);
					}
				}
				if (itemData.isSlavedToPan){
					let panMaster = SR5_EntityHelpers.getRealActorFromID(itemData.panMaster);
					tags.push(game.i18n.localize("SR5.DeviceSlavedToPan") + ` (${panMaster.name})`);
				}
				break;
			case "itemPreparation":
			case "itemSpell":
				tags.push(`${game.i18n.localize('SR5.SpellType')}${game.i18n.localize('SR5.Colons')} ${game.i18n.localize(lists.spellTypes[itemData.type])}`);
				tags.push(game.i18n.localize(lists.spellCategories[itemData.category]));
				switch (itemData.category){
					case "combat":
						tags.push(game.i18n.localize(lists.spellCombatTypes[itemData.subCategory]));
						break;
					case "detection":
						tags.push(
							game.i18n.localize(lists.spellDetectionTypes[itemData.subCategory]),
							game.i18n.localize(lists.spellDetectionSens[itemData.detectionSense]),
						);
						break;
					case "health":
						if (itemData.healthEssence){
							tags.push(game.i18n.localize(`SR5.Essence`));
						}
						break;
					case "illusion":
						tags.push(
							game.i18n.localize(lists.spellIllusionTypes[itemData.subCategory]),
							game.i18n.localize(lists.spellIllusionSens[itemData.illusionSense]),
						);
						break;
					case "manipulation":
						tags.push(game.i18n.localize(lists.spellManipulationTypes[itemData.subCategory]));
						if (itemData.manipulationDamaging){
							tags.push(game.i18n.localize(`SR5.Damaging`));
						}
						break;
					default:
				}
				if (this.type === "itemSpell") {
					let plus = (itemData.drain.value <= 0 ? "" : "+");
					tags.push(`${game.i18n.localize('SR5.SpellDrain')}${game.i18n.localize('SR5.Colons')} ${game.i18n.localize('SR5.SpellForceShort')} ${plus}${itemData.drain.value}`);
					tags.push(`${game.i18n.localize('SR5.SpellDrainActual')}${game.i18n.localize('SR5.Colons')} ${itemData.drainValue.value}`);
				}
				break;
			case "itemGear":
				if (itemData.marks.length){
					for (let m of itemData.marks){
						tags.push(game.i18n.localize("SR5.Mark") + game.i18n.localize(`SR5.Colons`) + ` ${m.ownerName} [${m.value}]`);
					}
				}
				if (itemData.isSlavedToPan){
					let panMaster = SR5_EntityHelpers.getRealActorFromID(itemData.panMaster);
					tags.push(game.i18n.localize("SR5.DeviceSlavedToPan") + ` (${panMaster.name})`);
				}
				break;
			case "itemRitual":
				if (itemData.adeptRitual) tags.push(game.i18n.localize(`SR5.AdeptRitual`));
				if (itemData.anchored) tags.push(game.i18n.localize(`SR5.Anchored`));
				if (itemData.bloody) tags.push(game.i18n.localize(`SR5.Bloody`));
				if (itemData.contractual) tags.push(game.i18n.localize(`SR5.Contractual`));
				if (itemData.manaRitual) tags.push(game.i18n.localize(`SR5.ManaRitual`));
				if (itemData.materialLink) tags.push(game.i18n.localize(`SR5.MaterialLink`));
				if (itemData.minion) tags.push(game.i18n.localize(`SR5.Minion`));
				if (itemData.organicalLink) tags.push(game.i18n.localize(`SR5.OrganicalLink`));
				if (itemData.spotter) tags.push(game.i18n.localize(`SR5.Spotter`));
				if (itemData.spell) tags.push(game.i18n.localize(`SR5.Spell`));
				tags.push(`${game.i18n.localize('SR5.DurationToPerform')}${game.i18n.localize('SR5.Colons')} ${game.i18n.localize('SR5.SpellForceShort')} × ${game.i18n.localize(lists.ritualDurations[itemData.durationToPerform])}`);
				break;
			case "itemAdeptPower":
				tags.push(`${game.i18n.localize('SR5.PowerPointsCost')}${game.i18n.localize('SR5.Colons')} ${itemData.powerPointsCost.value}`);
				tags.push(`${game.i18n.localize('SR5.ActionType')}${game.i18n.localize('SR5.Colons')} ${game.i18n.localize(lists.powerActionTypes[itemData.actionType])}`);
				break;
			case "itemQuality":
				tags.push(`${game.i18n.localize(lists.qualityTypes[itemData.type])}`);
				if (itemData.itemRating !== 0) tags.push(`${game.i18n.localize('SR5.ItemRating')}${game.i18n.localize('SR5.Colons')} ${itemData.itemRating}`);
				tags.push(`${game.i18n.localize('SR5.KarmaCost')}${game.i18n.localize('SR5.Colons')} ${itemData.karmaCost}`);
				break;
			case "itemVehicle":
				tags.push(`${game.i18n.localize(lists.vehiclesCategories[itemData.category])}`);
				if (itemData.vehiclesMod.length){
					for (let v of itemData.vehiclesMod){
						tags.push(`${v.name}`);
					}
				}
				if (itemData.marks.length){
					for (let m of itemData.marks){
						tags.push(game.i18n.localize("SR5.Mark") + game.i18n.localize(`SR5.Colons`) + ` ${m.ownerName} [${m.value}]`);
					}
				}
				if (itemData.isSlavedToPan){
					let panMaster = SR5_EntityHelpers.getRealActorFromID(itemData.panMaster);
					tags.push(game.i18n.localize("SR5.DeviceSlavedToPan") + ` (${panMaster.name})`);
				}        
				break;
      		case "itemLifestyle":
        		tags.push(
       		   [`${game.i18n.localize('SR5.LifestyleComforts')}${game.i18n.localize('SR5.Colons')} ${itemData.comforts.value}`, itemData.comforts.gameEffects],
	  		   [`${game.i18n.localize('SR5.LifestyleSecurity')}${game.i18n.localize('SR5.Colons')} ${itemData.security.value}`, itemData.security.gameEffects],
       		   [`${game.i18n.localize('SR5.LifestyleNeighborhood')}${game.i18n.localize('SR5.Colons')} ${itemData.neighborhood.value} (${itemData.neighborhood.zone})`, itemData.neighborhood.gameEffects]
       		 );
        		if (itemData.options) {
          		for (let option of itemData.options){
            		if(option.type != "modification") {
            		options.push(`${option.name}`);
            		tags.push([game.i18n.localize(lists.allLifestyleOptions[option.name]), option.gameEffects]);
            		}
          		}		
        		}
        		break;
      		case "itemSin":
        		if (itemData.license) {
          		for (let l of itemData.license){
            		license.push(`${l.name}`);
            		tags.push(`${l.name} ${l.rating}`);
          		}
        		}
        		break;
			case "itemSpirit":
        		if (itemData.powers) {
          		for (let power of itemData.powers){
            		powers.push(`${power.name}: ${power.system?.gameEffect}`);
            		tags.push([power.name, power.system.gameEffect]);					
          		}
        		}
        		break;
      		case "itemSprite":
        		if (itemData.spritePowers) {
          		for (let power of itemData.spritePowers){
            		spritePowers.push(`${power.name}: ${power.system?.gameEffect}`);
            		tags.push([power.name, power.system.gameEffect]);					
          		}
        		}
        		break;
      		case "itemContact":
        		if (itemData.paymentMethod) {
					tags.push(`${game.i18n.localize('SR5.PreferedPaymentTypeShort')}${game.i18n.localize('SR5.Colons')} ${itemData.paymentMethod}`);
        		}
        		if (itemData.hobby) {
					tags.push(`${game.i18n.localize('SR5.HobbiesVices')}${game.i18n.localize('SR5.Colons')} ${itemData.hobby}`);
        		}
        		if (itemData.familySituation) {
					tags.push(`${game.i18n.localize('SR5.PersonalLife')}${game.i18n.localize('SR5.Colons')} ${itemData.familySituation}`);
        		}
        		break;
      		case "itemKarma":
			case "itemNuyen":
				const locateDate = new Date(itemData.date).toLocaleDateString(game.i18n.localize(`SR5.LocateDate`));
				tags.push(game.i18n.localize("SR5.Date") + game.i18n.localize(`SR5.Colons`) + ` ${locateDate}`);
				itemData.gameEffect = itemData.description;
        		break;		
			default:
		}

		itemData.properties = tags.filter(p => !!p);
		itemData.accessories = accessories.filter(p => !!p);		
		itemData.options = options.filter(p => !!p);
		itemData.license = license.filter(p => !!p);
		itemData.powers = powers.filter(p => !!p);
		itemData.spritePowers = spritePowers.filter(p => !!p);
		return itemData;
	}

	//Reload ammo based on weapon type && ammunitions
	async reloadAmmo(option) {
		let lists = SR5_EntityHelpers.sortTranslations(SR5);
		let actor = (this.actor.isToken ? SR5_EntityHelpers.getRealActorFromID(this.actor.token.id) : SR5_EntityHelpers.getRealActorFromID(this.actor.id));
		let weapon = duplicate(this),
			weaponData = weapon.system,
			ammoSpent = weaponData.ammunition.max - weaponData.ammunition.value,
			ammoNeeded, action, stop = false, falseAmmo = false;

		if (ammoSpent < 1) return;
		if (weaponData.ammunition.casing === "") return ui.notifications.warn(game.i18n.localize("SR5.WARN_MissingCasing"));

		//Manage action in combat, eventually return if no action available
		if (game.combat){
			switch (option){
				case "insert":
					if (weaponData.ammunition.casing === "clip") action = [{type: "simple", value: 1, source: "insertClip"}];
					else action = [{type: "complex", value: 1, source: "insertClip"}];
					break;
				case "replace":
					if (weaponData.ammunition.casing === "clip") {
						if (weaponData.isWireless && (weaponData.accessory.find(a => a.name === "smartgunSystemInternal" || a.name === "smartgunSystemExternal")) && (actor.system.specialProperties.smartlink.value > 0)){
							action = [{type: "free", value: 1, source: "removeClip"}, {type: "simple", value: 1, source: "insertClip"}];
						} else action = [{type: "simple", value: 2, source: "replaceClip"}];
					}
					else action = [{type: "complex", value: 2, source: "replaceClip"}];
					break;
				case "insertRound":
					if (weaponData.type === "bow")  action = [{type: "simple", value: 1, source: "insertRound"}];
					else action = [{type: "complex", value: 1, source: "insertRound"}];
					break;
				case "insertRoundFull":
					if (weaponData.ammunition.casing === "cylinder") action = [{type: "complex", value: 1, source: "insertRound"}];
					else return ui.notifications.warn(game.i18n.format('SR5.WARN_NotPossibleInCombat'));
				case "remove":
					if (weaponData.ammunition.casing === "clip") {
						if (weaponData.isWireless && (weaponData.accessory.find(a => a.name === "smartgunSystemInternal" || a.name === "smartgunSystemExternal")) && (actor.system.specialProperties.smartlink.value > 0)) action = [{type: "free", value: 1, source: "removeClip"}];
						else action = [{type: "simple", value: 1, source: "removeClip"}];
					}
					else action = [{type: "complex", value: 1, source: "removeClip"}];
					break;
			}

			//chek if actor has enought action left
			for (let a of action){
				if (a.value > actor.system.specialProperties.actions[a.type].current) return ui.notifications.warn(game.i18n.format('SR5.WARN_NotEnoughAction', {value: a.value, action: game.i18n.localize(SR5.actionTypes[a.type])}));;
			}
		}

		//Manage removing clip/belt/drum
		if (option === "remove"){
			weaponData.ammunition.value = 0;
			weaponData.ammunition.clipInserted = false;
			this.update({system: weaponData});

			//Update actions in combat
			if (game.combat){
				let actorId = (this.actor.isToken ? this.actor.token.id : this.actor.id);
				SR5Combat.changeActionInCombat(actorId, action);
			}
			return;
		}

		//Check if actor has good type of rounds in inventory
		let ammo = actor.items.find((i) => i.type === "itemAmmunition" && (i.system.type === weaponData.ammunition.type) && (i.system.class === weaponData.type));
		let ammoData = ammo ? duplicate(ammo.system) : {};

		if (!ammo || ammo.system.quantity <= 0) {
			await Dialog.confirm({
				title: game.i18n.localize('SR5.DIALOG_WarningNoAmmoTypeTitle'),
				content: "<h3>" + game.i18n.localize('SR5.DIALOG_Warning') + "</h3><p>" 
								+ game.i18n.format('SR5.DIALOG_WarningNoAmmoType', 
								{actor: actor.name, ammoType: game.i18n.localize(lists.allAmmunitionTypes[weaponData.ammunition.type]), 
									weaponType: game.i18n.localize(lists.rangedWeaponTypes[weaponData.type]),
									itemName: weapon.name
								}) + "</p>",
				yes: () => { 
					falseAmmo = true;
					ammoData.quantity = 1000;
				},
				no: () => {stop = true;},
				close: () => {stop = true;}
			});
		}
		if (stop) return;
	
		switch (option){
			case "insert":
			case "replace":
			case "insertRoundFull":
				if (option === "insert" && weaponData.ammunition.clipInserted && game.combat) return ui.notifications.warn(game.i18n.localize("SR5.WARN_RemoveClipFirst"));
				if (ammoSpent > ammoData.quantity) ammoNeeded = ammoData.quantity
				else ammoNeeded = ammoSpent;
				weaponData.ammunition.value += ammoNeeded;
				weaponData.ammunition.clipInserted = true;
				break;
			case "insertRound":
				if (weaponData.ammunition.casing === "breakAction"){
					if (ammoData.quantity < 2) ammoNeeded = ammoData.quantity;
					else ammoNeeded = 2
				} else {
					if (actor.system.attributes.agility.augmented.value > ammoData.quantity) ammoNeeded = ammoData.quantity;
					else ammoNeeded = actor.system.attributes.agility.augmented.value;
					if (ammoNeeded > ammoSpent) ammoNeeded = ammoSpent;
				}
				weaponData.ammunition.value += ammoNeeded;
				break;
		}


		//update weapon
		this.update({system: weaponData});

		//Update ammo in inventory if needed
		if (!falseAmmo){
			ammoData.quantity -= ammoNeeded;
			ammo.update({system: ammoData});
		}

		//Update actions in combat
		if (game.combat){
			let actorId = (this.actor.isToken ? this.actor.token.id : this.actor.id);
			SR5Combat.changeActionInCombat(actorId, action);
		}
	}

	async placeGabarit(messageId) {
		let actorPosition = SR5_EntityHelpers.getActorCanvasPosition(this.parent);
		if (canvas.scene && actorPosition !==0) {
			const template = await AbilityTemplate.fromItem(this);
			if (template) {
				await template.drawPreview();
				if (this.type === "itemWeapon") this.rollTest("weapon");
				if (messageId) SR5_RollMessage.updateChatButtonHelper(messageId, "templatePlace");
			}
		} else if (this.type === "itemWeapon") this.rollTest("weapon");
		if (this.actor.sheet._element) {
			if (this.isOwner && this.actor.sheet) this.actor.sheet.minimize();
		}
	}

	//Roll a test
	rollTest(rollType, rollKey, chatData){
		SR5_PrepareRollTest.rollTest(this, rollType, rollKey, chatData);
	}

	/** Overide Item's create Dialog to hide certain items and sort them alphabetically*/
	static async createDialog(data={}, {parent=null, pack=null, ...options}={}) {
		// Collect data
		const documentName = this.metadata.name;
		const hiddenTypes = ["itemKarma", "itemMark", "itemNuyen", "itemEffect", "itemCyberdeck"];
		const originalTypes = game.system.documentTypes[documentName];
		const types = originalTypes.filter((itemType) => !hiddenTypes.includes(itemType));
		const folders = parent ? [] : game.folders.filter(f => (f.type === documentName) && f.displayed);
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
				foundry.utils.mergeObject(data, fd.object, {inplace: true});
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
