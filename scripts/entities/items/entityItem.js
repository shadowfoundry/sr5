import { SR5_UtilityItem } from "./utilityItem.js";
import { SR5_CharacterUtility } from "../actors/utilityActor.js";
import AbilityTemplate from "../../interface/canvas-template.js";
import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_Roll } from "../../rolls/roll.js";
import { SR5 } from "../../config.js";

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
					if (!itemData.isLinkedToFocus) SR5_UtilityItem._handleWeaponFocus(item, owner);
					SR5_UtilityItem._checkIfWeaponIsFocus(this, owner);
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
				if (owner) SR5_UtilityItem._handlePreparation(item);
				break;
			case "itemRitual":
				if (owner) SR5_UtilityItem._handleRitual(item, owner);
				break;
			case "itemKnowledge":
				if (owner) SR5_CharacterUtility._generateKnowledgeSkills(itemData, owner);
				break;
			case "itemLanguage":
				if (owner) SR5_CharacterUtility._generateLanguageSkills(itemData, owner);
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
				break;
			case "itemFocus":
				SR5_UtilityItem._handleFocus(itemData);     
				break;
			case "itemSpirit":
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

	//Reload ammo based on weapon type && ammunitions
	reloadAmmo() {
		let lists = SR5_EntityHelpers.sortTranslations(SR5),
			ownerActor;
		if (this.actor.isToken) ownerActor = SR5_EntityHelpers.getRealActorFromID(this.actor.token.id);
		else ownerActor = SR5_EntityHelpers.getRealActorFromID(this.actor.id);

		let weapon = duplicate(this),
			weaponData = weapon.system;

		let ammoNeeded = weaponData.ammunition.max - weaponData.ammunition.value;
		if (ammoNeeded < 1) return;

		let ammo = ownerActor.items.find((i) => i.type === "itemAmmunition" && (i.system.type === weaponData.ammunition.type) && (i.system.class === weaponData.type));
		if (ammo) {
			let ammoData = duplicate(ammo.system);

			if (ammoData.quantity <=0) {
				Dialog.confirm({
					title: game.i18n.localize('SR5.DIALOG_WarningNoMoreAmmoTitle'),
					content: "<h3>" + game.i18n.localize('SR5.DIALOG_Warning') + "</h3><p>" 
									+ game.i18n.format('SR5.DIALOG_WarningNoMoreAmmo', 
									{actor: ownerActor.name, ammoType: game.i18n.localize(lists.allAmmunitionTypes[weaponData.ammunition.type]), 
										weaponType: game.i18n.localize(lists.rangedWeaponTypes[weaponData.type]),
										itemName: weapon.name
									}) + "</p>",
					yes: () => { 
						weaponData.ammunition.value = weaponData.ammunition.max;
						this.update({system: weaponData});
					},
				});
			} else {
				if (ammoNeeded <= ammoData.quantity) {
					weaponData.ammunition.value = weaponData.ammunition.max;
					this.update({system: weaponData});
					ammoData.quantity -= ammoNeeded;
					ammo.update({system: ammoData});
				} else {
					weaponData.ammunition.value += ammoData.quantity;
					this.update({system: weaponData});
					ammoData.quantity = 0;
					ammo.update({system: ammoData});
				}
			}
		} else {
			Dialog.confirm({
				title: game.i18n.localize('SR5.DIALOG_WarningNoAmmoTypeTitle'),
				content: "<h3>" + game.i18n.localize('SR5.DIALOG_Warning') + "</h3><p>" 
								+ game.i18n.format('SR5.DIALOG_WarningNoAmmoType', 
								{actor: ownerActor.name, ammoType: game.i18n.localize(lists.allAmmunitionTypes[weaponData.ammunition.type]), 
									weaponType: game.i18n.localize(lists.rangedWeaponTypes[weaponData.type]),
									itemName: weapon.name
								}) + "</p>",
				yes: () => { 
					weaponData.ammunition.value = weaponData.ammunition.max;
					this.update({system: weaponData});
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
