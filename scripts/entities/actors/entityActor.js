import { SR5 } from "../../config.js";
import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5_UtilityItem } from "../items/utilityItem.js";
import { SR5_CharacterUtility } from "./utilityActor.js";
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
		const types = originalTypes.filter((actorType) => !hiddenTypes.includes(actorType));
		const folders = parent ? [] : game.folders.filter(f => (f.type === documentName) && f.displayed);
		const label = game.i18n.localize(this.metadata.label);
		const title = game.i18n.format("DOCUMENT.Create", {type: label});

		// Render the document creation form
		const html = await renderTemplate(`templates/sidebar/document-create.html`, {
			folders,
			name: data.name || game.i18n.format("DOCUMENT.New", {type: label}),
			folder: data.folder,
			hasFolders: folders.length >= 1,
			type: data.type || CONFIG[documentName]?.defaultType || types[0],
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
				foundry.utils.mergeObject(data, fd.object, {inplace: true});
				if ( !data.folder ) delete data.folder;
				if ( types.length === 1 ) data.type = types[0];
				if ( !data.name?.trim() ) data.name = this.defaultName();
				return this.create(data, {parent, pack, renderSheet: true});
			},
			rejectClose: false,
			options: options
		});
	}

	static async create(data, options) {
		if (!data.img) data.img = `systems/sr5/img/actors/${data.type}.svg`;

		// If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
		if (data.items) return super.create(data, options);

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
									data.system = {
										"force": {
											"base": parseInt(spiritForce),
											"value": 0,
											"modifiers": []
										},
										"type": spiritType
									};
									SR5_EntityHelpers.updateValue(data.system.force);
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
									data.system = {
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
				baseItems.system = {
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

	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user)
		let createData = {};
		mergeObject(createData, {
			"token.vision": true,
			"token.dimSight": 100,
			"token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER,
			"token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER,
			"token.name": this.name,
		});

		let actorLink = false;
		if (this.type === "actorPc") actorLink = true;
		if (this.type === "actorAgent") actorLink = true;
		if (this.type === "actorSpirit" && this.system.creatorId !== "") actorLink = true;
		if (this.type === "actorDrone" && this.system.creatorId !== "") actorLink = true;
		if (this.type === "actorSprite" && this.system.creatorId !== "") actorLink = true;

		switch(this.type){
			case "actorPc":
				mergeObject(createData, {
					"prototypeToken.actorLink": actorLink,
					"prototypeToken.lockRotation": true,
					"prototypeToken.bar1": {attribute: "statusBars.physical",},
					"prototypeToken.bar2": {attribute: "statusBars.stun",},
				});
				break;
			case "actorGrunt":
				mergeObject(createData, {
					"prototypeToken.lockRotation": true,
					"prototypeToken.disposition": CONST.TOKEN_DISPOSITIONS.HOSTILE,
					"prototypeToken.bar1": {attribute: "statusBars.condition",},
				});
				break;
			case "actorSpirit":
				mergeObject(createData, {
					"prototypeToken.lockRotation": true,
					"prototypeToken.actorLink": actorLink,
					"prototypeToken.bar1": {attribute: "statusBars.physical",},
					"prototypeToken.bar2": {attribute: "statusBars.stun",},
				});
				break;
			case "actorDrone":
				mergeObject(createData, {
					"prototypeToken.lockRotation": true,
					"prototypeToken.actorLink": actorLink,
					"prototypeToken.bar1": {attribute: "statusBars.condition",},
					"prototypeToken.bar2": {attribute: "statusBars.matrix",},
				});
				break;
			case "actorDevice":
			case "actorSprite":
			case "actorAgent":
				mergeObject(createData, {
					"prototypeToken.lockRotation": true,
					"prototypeToken.actorLink": actorLink,
					"prototypeToken.bar2": {attribute: "statusBars.matrix",},
				});
				let effect = await _getSRStatusEffect("matrixInit");
				let initiativeEffect = new CONFIG.ActiveEffect.documentClass(effect);
				const effects = this.effects.map(e => e.toObject());
				effects.push(initiativeEffect.toObject());
				mergeObject(createData, {"effects": effects });
				break;
			default :
				SR5_SystemHelpers.srLog(1, `Unknown '${this.type}' type in 'base _preCreate()'`);
		}

		this.updateSource(createData);
	}

	prepareData() {
		if (!this.img) this.img = CONST.DEFAULT_TOKEN;
		if (!this.name) this.name = "[" + game.i18n.localize("SR5.New") + "]" + this.entity;
		this.prepareBaseData();
		this.prepareEmbeddedDocuments(); // first pass on items to add bonuses from the items to the characters
		this.prepareDerivedData();
		this.sortLists(this.system);
		this.updateItems(this); // second pass on items to get characters data for final items calculations
	}

	prepareBaseData() {
		let actor = this;
		actor.system.lists = SR5_EntityHelpers.sortTranslations(SR5);
		actor.system.isGM = game.user.isGM;

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
				if (!actor.system.hasOwnProperty("type")) actor.system.type = actor.flags.spiritType;
				if (actor.system.force < 1) actor.system.force = parseInt(actor.flags.spiritForce);
				SR5_CharacterUtility.resetCalculatedValues(actor);
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${actor.type}' actor type in prepareBaseData()`);
		}

		return actor;
	}

	prepareDerivedData() {
		let actor = this;
		if (actor.flags.sr5 === undefined) actor.flags.sr5 = {};
		switch (actor.type) {
			case "actorDrone":
				if (actor.system.vehicleOwner.items.length) SR5_CharacterUtility.applyAutosoftEffect(actor);
				SR5_CharacterUtility.updateAttributes(actor);
				SR5_CharacterUtility.updateResistances(actor);
				SR5_CharacterUtility.updateDefenses(actor);
				SR5_CharacterUtility.updateRecoil(actor);
				SR5_CharacterUtility.updateConditionMonitors(actor);        
				SR5_CharacterUtility.updatePenalties(actor);        
				SR5_CharacterUtility.updateInitiativePhysical(actor);
				SR5_CharacterUtility.generateVehicleSkills(actor);
				SR5_CharacterUtility.generateVehicleTest(actor);        
				SR5_CharacterUtility.generateRammingTest(actor);
				SR5_CharacterUtility.updateVehicleSlots(actor);
				break;
			case "actorSpirit":
				SR5_CharacterUtility.updateSpiritValues(actor);
				SR5_CharacterUtility.updateSpiritAttributes(actor);
				SR5_CharacterUtility.updateAttributes(actor);
				SR5_CharacterUtility.updateEssence(actor);
				SR5_CharacterUtility.updateSpecialAttributes(actor);
				if (actor.system.isMaterializing) actor.system.specialProperties.hardenedArmorType = "essenceX2";
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
		const actor = this;
		const lists = SR5;

		// Iterate through items, allocating to containers
		for (let i of actor.items) {
			let iData = i.system;
			SR5_SystemHelpers.srLog(3, `Parsing '${i.type}' item named '${i.name}'`, i);
			switch (i.type) {
				case "itemGear":
					i.prepareData();
					if (!iData.isSlavedToPan) actor.system.matrix.potentialPanObject.gears[i.uuid] = i.name;
					if (iData.isActive && iData.wirelessTurnedOn) actor.system.matrix.connectedObject.gears[i.id] = i.name;
					if (iData.isActive && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					break;

				case "itemPower":
				case "itemMartialArt":
					if (iData.isActive && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					break;

				case "itemMetamagic":
				case "itemEcho":
				case "itemPreparation":
				case "itemQuality":
					i.prepareData();
					if (iData.isActive && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					break;

				case "itemSpell":
					i.prepareData();
					if (!iData.freeSustain && !iData.preparation) actor.system.magic.spellList[i.id] = i.name;
					SR5_UtilityItem._handleSpell(i, actor);
					if (iData.isActive && Object.keys(iData.customEffects)) SR5_CharacterUtility.applyCustomEffects(i, actor);
					break;

				case "itemArmor":
					i.prepareData();
					let modifierType;
					SR5_UtilityItem._handleItemCapacity(iData);
					SR5_UtilityItem._handleItemPrice(iData);
					SR5_UtilityItem._handleItemAvailability(iData);
					SR5_UtilityItem._handleItemConcealment(iData);
					SR5_UtilityItem._handleArmorValue(iData);
					if (iData.isActive) {
						if (iData.isCumulative) modifierType = game.i18n.localize("SR5.ArmorAccessory");
						else modifierType = game.i18n.localize("SR5.Armor");
						if (!iData.isAccessory) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.armor, `${i.name}`, modifierType, iData.armorValue.value);
						if (!iData.isAccessory && actor.system.resistances.fall) SR5_EntityHelpers.updateModifier(actor.system.resistances.fall, `${i.name}`, modifierType, iData.armorValue.value);
						if (Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					}
					if (iData.isActive && iData.wirelessTurnedOn) actor.system.matrix.connectedObject.armors[i.id] = i.name;
					if (!iData.isSlavedToPan) actor.system.matrix.potentialPanObject.armors[i.uuid] = i.name;
					break;

				case "itemAugmentation":
					i.prepareData();
					SR5_UtilityItem._handleAugmentation(iData, actor);
					if (!iData.isAccessory) SR5_EntityHelpers.updateModifier(actor.system.essence, `${i.name}`, `${game.i18n.localize(lists.itemTypes[i.type])}`, -iData.essenceCost.value);
					if (iData.isActive && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					if (iData.isActive && iData.wirelessTurnedOn) actor.system.matrix.connectedObject.augmentations[i.id] = i.name;
					if (!iData.isSlavedToPan) actor.system.matrix.potentialPanObject.augmentations[i.uuid] = i.name;
					break;

				case "itemAdeptPower":
					SR5_EntityHelpers.updateModifier(actor.system.magic.powerPoints, i.name, `${game.i18n.localize(lists.itemTypes[i.type])}`, iData.powerPointsCost.value);
					if (iData.isActive && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					break;

				case "itemSpirit":
					//i.prepareData();
					if (iData.isBounded) actor.system.magic.boundedSpirit.current ++;
					if (iData.isActive) SR5_CharacterUtility._actorModifPossession(i, actor);
					break;

				case "itemDevice":
					i.prepareData();
					if (actor.type === "actorPc" || actor.type === "actorGrunt"){
						iData.conditionMonitors.matrix.value = Math.ceil(iData.deviceRating / 2) + 8;
						if (iData.isActive) {
							SR5_CharacterUtility.generateMatrixAttributes(i, actor);
							if (Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
						}
					}
					break;

				case "itemProgram":
					i.prepareData();
					if (actor.type === "actorDrone" && actor.system.controlMode !== "autopilot") iData.isActive = false;
					if (iData.type === "common" || iData.type === "hacking" || iData.type === "autosoft" || iData.type === "agent") {
						if (iData.isActive) {
							SR5_EntityHelpers.updateModifier(actor.system.matrix.programsCurrentActive, `${i.name}`, `${game.i18n.localize(lists.itemTypes[i.type])}`, 1);
							SR5_EntityHelpers.updateValue(actor.system.matrix.programsCurrentActive, 0);
						}
					}
					if (iData.isActive && Object.keys(iData.customEffects).length) {
						if (actor.type === "actorDrone") SR5_CharacterUtility.applyCustomEffects(i, actor);
						if (iData.type !== "autosoft" && (actor.type === "actorPc" || actor.type === "actorGrunt"))
						SR5_CharacterUtility.applyCustomEffects(i, actor);
					}
					break;

				case "itemComplexForm":
					i.prepareData();
					if (!iData.freeSustain) actor.system.matrix.complexFormList[i.id] = i.name;
					SR5_UtilityItem._handleComplexForm(i, this);
					if (iData.isActive && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					break;

				case "itemKarma":
				case "itemNuyen":
					i.prepareData();
					let target;
					if (iData.amount && iData.type) {
						let resourceLabel = `${game.i18n.localize(lists.transactionsTypes[iData.type])} (${i.name})`;
						switch (i.type) {
							case "itemKarma":
								target = actor.system.karma;
								break;
							case "itemNuyen":
								target = actor.system.nuyen;
								break;
						}
						if (iData.amount < 0) iData.amount = -iData.amount;
						SR5_EntityHelpers.updateModifier(target, resourceLabel, `${i.type}_${i.id}_${iData.type}`, iData.amount);
					}
					break;

				case "itemWeapon":
					let modes = (iData.weaponModes = []);
					for (let mode of Object.entries(iData.firingMode)) {
						if (mode[1].value) modes.push(game.i18n.localize(SR5.weaponModesAbbreviated[mode[0]]));
					}
					SR5_UtilityItem._handleVisionAccessory(iData, actor);
					if(actor.system.matrix){
						if (iData.isActive && iData.wirelessTurnedOn) actor.system.matrix.connectedObject.weapons[i.id] = i.name;
						if (!iData.isSlavedToPan) actor.system.matrix.potentialPanObject.weapons[i.uuid] = i.name;
					}
					break;

				case "itemFocus":
					SR5_UtilityItem._handleFocus(iData);
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
								iData.weaponChoices = SR5_UtilityItem._generateWeaponFocusWeaponList(this);
								if (iData.linkedWeapon){
									let linkedWeapon = this.items.find(w => w.id === iData.linkedWeapon);
									iData.linkedWeaponName = linkedWeapon.name;
								}
							break;
						case "sustaining":
							iData.spellChoices = SR5_UtilityItem._generateSustainFocusSpellList(iData, actor);
							if (iData.isActive){
								let sustainedSpell = actor.items.find(s => s.name == iData.sustainedSpell)
								if (sustainedSpell
									&& !sustainedSpell.system.freeSustain
									&& sustainedSpell.system.isActive
									&& (sustainedSpell.system.force <= iData.itemRating)){
										sustainedSpell.system.freeSustain = true;
									}
								}
							break;
						default:
							SR5_SystemHelpers.srLog(3,`Unknown focus type '${iData.type}' in 'prepareEmbeddedDocuments()'`);
					}
					if (iData.isActive && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					break;

				case "itemRitual":
					i.prepareData();
					iData.spellChoices = SR5_UtilityItem._generateSpellList(actor);
					if (iData.isActive && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					break;

				case "itemDrug":
					i.prepareData();
					if ((iData.isActive || iData.wirelessTurnedOn) && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					break;

				case "itemEffect":
					i.prepareData();
					if (Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					if (iData.type === "signalJam") actor.system.matrix.isJamming = true;
					break;

				case "itemTradition":
					i.prepareData();
					SR5_CharacterUtility.updateTradition(actor, iData);
					break;

				case "itemSprite":
					i.prepareData();
					if (iData.isRegistered) actor.system.matrix.registeredSprite.current ++;
					break;

				case "itemVehicleMod":
					iData.weaponChoices = SR5_UtilityItem._generateWeaponMountWeaponList(iData, this);
					if (iData.mountedWeapon){ 
						let weapon = this.items.find(w => w.id === iData.mountedWeapon);
						iData.mountedWeaponName = weapon.name;
					}
					if (iData.isActive && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					if (iData.secondaryPropulsion.isSecondaryPropulsion && iData.isActive) SR5_CharacterUtility.handleSecondaryAttributes(actor, iData);
					SR5_CharacterUtility.updateModificationsSlots(actor, iData);
					SR5_CharacterUtility.handleVehiclePriceMultiplier(actor, iData);
					SR5_UtilityItem._handleItemPrice(iData);
					SR5_UtilityItem._handleItemAvailability(iData);
					break;

				case "itemVehicle":        
					i.prepareData();
					actor.system.matrix.connectedObject.vehicles[i.id] = i.name;
					if (!iData.isSlavedToPan) actor.system.matrix.potentialPanObject.vehicles[i.uuid] = i.name;
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
		let actorData = actor.system;
		for (let i of actor.items) {
			let iData = i.system;
			switch (i.type){
				case "itemDevice":
					if (actor.type === "actorPc" || actor.type === "actorGrunt"){
						if (iData.isActive === true){
							SR5_CharacterUtility.generateMatrixAttributes(i, actor);
							SR5_CharacterUtility.generateMatrixResistances(actor, i);
							SR5_CharacterUtility.generateMatrixActions(actor);
							SR5_CharacterUtility.generateMatrixActionsDefenses(actor);
							SR5_CharacterUtility.updateInitiativeMatrix(actor);
							if (iData.type ==="riggerCommandConsole") {
								if (actor.testUserPermission(game.user, 3)) SR5_CharacterUtility.updateControledVehicle(actor);
							}
							if (iData.type === "livingPersona" || iData.type === "headcase") SR5_CharacterUtility.generateResonanceMatrix(actor);
							iData.pan.max = actorData.matrix.deviceRating * 3;
						}
					} else if (actor.type === "actorDrone"){
						SR5_CharacterUtility.generateVehicleMatrix(actor, iData);
						SR5_CharacterUtility.generateMatrixResistances(actor, i);
						SR5_CharacterUtility.generateMatrixActionsDefenses(actor);
					} else if (actor.type === "actorDevice"){
						SR5_CharacterUtility.generateDeviceMatrix(actor, iData);
						SR5_CharacterUtility.generateMatrixResistances(actor, i);
						SR5_CharacterUtility.generateMatrixActionsDefenses(actor);
						if (actorData.matrix.deviceType === "ice") SR5_CharacterUtility.updateInitiativeMatrix(actor);
					} else if (actor.type === "actorSprite"){
						SR5_CharacterUtility.generateSpriteMatrix(actor, iData);
						SR5_CharacterUtility.generateMatrixResistances(actor, i);
						SR5_CharacterUtility.generateMatrixActions(actor);
						SR5_CharacterUtility.generateMatrixActionsDefenses(actor);
						SR5_CharacterUtility.updateInitiativeMatrix(actor);
					} else if (actor.type === "actorAgent"){
						SR5_CharacterUtility.generateAgentMatrix(actor, iData);
						SR5_CharacterUtility.generateMatrixActionsDefenses(actor);
						SR5_CharacterUtility.generateMatrixActions(actor);
						SR5_CharacterUtility.generateMatrixResistances(actor, i);
						SR5_CharacterUtility.updateConditionMonitors(actor);
						SR5_CharacterUtility.updateInitiativeMatrix(actor);
					}
					break;
				case "itemComplexForm":
					iData.threaderResonance = actorData.specialAttributes.resonance.augmented.value;
					break;
				case "itemArmor":
				case "itemGear":
				case "itemAugmentation":
					if (Object.keys(iData.accessory).length) SR5_UtilityItem._updatePluggedAccessory(iData, actor);
					break;
				case "itemSpell":
					iData.casterMagic = actorData.specialAttributes.magic.augmented.value;
					break;
				case "itemSpirit":
					if (iData.isBounded){
						for (let [key, value] of Object.entries(actorData.magic.elements)){
							if (iData.type === value) iData.spellType = key;
						}
					}
					break;
				case "itemVehicleMod":
					if (!iData.isWeaponMounted) SR5_UtilityItem._resetWeaponMounted(iData);  
					SR5_UtilityItem._handleItemPrice(iData);
					SR5_UtilityItem._handleItemAvailability(iData);
					break;
				case "itemWeapon":
				case "itemKnowledge":
				case "itemLanguage":
				case "itemPower":
				case "itemSpritePower":
				case "itemAdeptPower":
				case "itemVehicle":
				case "itemMartialArt":
					i.prepareData();
					break;
			}
		}
	}

	//Roll a test
	rollTest(rollType, rollKey, chatData){
		SR5_Roll.actorRoll(this, rollType, rollKey, chatData);
	}

	//Apply Damae to actor
	async takeDamage(options) {
		let damage = options.damageValue,
				damageType = options.damageType,
				actor = duplicate(this),
				actorData = actor.system,
				gelAmmo = 0,
				damageReduction = 0,
				realDamage;

		if (options.ammoType === "gel") gelAmmo = -2;
		if (actorData.specialProperties?.damageReduction) damageReduction = actorData.specialProperties.damageReduction.value;
		if (damage > 1) damage -= damageReduction;

		switch (actor.type){
			case "actorPc":
			case "actorSpirit":
				if (options.matrixDamageValue) {
					damage = options.matrixDamageValue;
					damageType = "stun";
				}
				if (damageType === "stun") {
					actorData.conditionMonitors.stun.actual.base += damage;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors[damageType].actual, 0);
					if (actorData.conditionMonitors.stun.actual.value > actorData.conditionMonitors.stun.value){
						realDamage = damage - (actorData.conditionMonitors.stun.actual.value - actorData.conditionMonitors.stun.value);
					} else realDamage = damage;        
				} else if (damageType === "physical") {
					actorData.conditionMonitors.physical.actual.base += damage;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors[damageType].actual, 0);
					if (actorData.conditionMonitors.physical.actual.value > actorData.conditionMonitors.physical.value) {
						realDamage = damage - (actorData.conditionMonitors.physical.actual.value - actorData.conditionMonitors.physical.value);
					} else realDamage = damage ;
				}
				if (realDamage > 0) ui.notifications.info(`${this.name}: ${realDamage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);

				if (actorData.conditionMonitors.stun.actual.value > actorData.conditionMonitors.stun.value) {
					let carriedDamage = actorData.conditionMonitors.stun.actual.value - actorData.conditionMonitors.stun.value;
					actorData.conditionMonitors.physical.actual.base += carriedDamage;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.physical.actual, 0);
					actorData.conditionMonitors.stun.actual.base = actorData.conditionMonitors.stun.value;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.stun.actual, 0);
					ui.notifications.info(`${this.name}: ${carriedDamage}${game.i18n.localize(SR5.damageTypesShort.physical)} ${game.i18n.localize("SR5.Applied")}.`);
				}

				if ((actorData.conditionMonitors.physical.actual.value > actorData.conditionMonitors.physical.value) && actorData.type === "actorPc") {
					let carriedDamage = actorData.conditionMonitors.physical.actual.value - actorData.conditionMonitors.physical.value;
					actorData.conditionMonitors.overflow.actual.base += carriedDamage;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.overflow.actual, 0);
					actorData.conditionMonitors.physical.actual.base = actorData.conditionMonitors.physical.value;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.physical.actual, 0);
					if (actorData.conditionMonitors.overflow.actual.value > actorData.conditionMonitors.overflow.value){
						actorData.conditionMonitors.overflow.actual.base = actorData.conditionMonitors.overflow.value;
						SR5_EntityHelpers.updateValue(actorData.conditionMonitors.overflow.actual, 0);
					}
				}
				break;
			case "actorGrunt":
				actorData.conditionMonitors.condition.actual.base += damage;
				SR5_EntityHelpers.updateValue(actorData.conditionMonitors.condition.actual, 0);
				ui.notifications.info(`${this.name}: ${damage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);
				break;
			case "actorDrone":
				if (damageType === "physical") {
					actorData.conditionMonitors.condition.actual.base += damage;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.condition.actual, 0);
					ui.notifications.info(`${this.name}: ${damage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);
					if (actorData.controlMode === "rigging"){
						let controler = SR5_EntityHelpers.getRealActorFromID(actorData.vehicleOwner.id)
						let chatData = {
							damageResistanceType : "biofeedback",
							damageValue: Math.ceil(damage/2),
						}
						controler.rollTest("resistanceCard", null, chatData);
					}
				}
				if (options.damageElement === "electricity") options.matrixDamageValue = Math.floor(options.damageValue / 2);
				if (options.matrixDamageValue) {
					actorData.conditionMonitors.matrix.actual.base += options.matrixDamageValue;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.matrix.actual, 0);
					ui.notifications.info(`${this.name}: ${options.matrixDamageValue} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
				}
				break;
			case "actorAgent":
			case "actorSprite":
			case "actorDevice":
				if (options.matrixDamageValue) {
					actorData.conditionMonitors.matrix.actual.base += options.matrixDamageValue;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.matrix.actual, 0);
					ui.notifications.info(`${this.name}: ${options.matrixDamageValue} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
				}
				break;
		}

		await this.update({system: actorData});

		//Status
		switch (actor.type){
			case "actorPc":
			case "actorSpirit":
				if (actorData.conditionMonitors.physical.actual.value >= actorData.conditionMonitors.physical.value) await this.createDeadEffect();
				else if (actorData.conditionMonitors.stun.actual.value >= actorData.conditionMonitors.stun.value) await this.createKoEffect();
				else if ((damage > (actorData.limits.physicalLimit.value + gelAmmo) || damage >= 10)
				  && actorData.conditionMonitors.stun.actual.value < actorData.conditionMonitors.stun.value
				  && actorData.conditionMonitors.physical.actual.value < actorData.conditionMonitors.physical.value) await this.createProneEffect(damage, actorData, gelAmmo);
				break;
			case "actorGrunt":        
				if (actorData.conditionMonitors.condition.actual.value >= actorData.conditionMonitors.condition.value) await this.createDeadEffect();
				else if (damage > (actorData.limits.physicalLimit.value + gelAmmo) || damage >= 10){ await this.createProneEffect(damage, actorData, gelAmmo);}
			case "actorDrone":
				if (actorData.conditionMonitors.condition.actual.value >= actorData.conditionMonitors.condition.value) await this.createDeadEffect();
				break;
			case "actorSprite":
			case "actorDevice":
				if (actorData.conditionMonitors.matrix.actual.value >= actorData.conditionMonitors.matrix.value) await this.createDeadEffect();
				break;
		}

		//Special Element Damage
		if (options.damageElement === "electricity" && actorData.type !== "actorDrone") await this.electricityDamageEffect();
		if (options.damageElement === "acid") await this.acidDamageEffect(damage, options.damageSource);
		if (options.damageElement === "fire"){
			if (this.system.itemsProperties.armor.value <= 0) await this.fireDamageEffect()
			else await this.checkIfCatchFire(options.fireTreshold, options.damageSource, options.incomingPA);
		}
	}

	//Apply splitted damage to actor
	async takeSplitDamage(messageData) {
		let originalDamage = messageData.damageValue;
		messageData.damageType = "stun";
		messageData.damageValue = messageData.splittedDamageOne;
		await this.takeDamage(messageData);
		if (messageData.splittedDamageTwo){
			messageData.damageType = "physical";
			messageData.damageValue = messageData.splittedDamageTwo;
			await this.takeDamage(messageData);
		} else {
			return ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDVSoNoDamage", {armor: messageData.armor + messageData.incomingPA, damage:originalDamage})}`); 
		}
	}

	//Handle prone effect
	async createProneEffect(damage, actorData, gelAmmo, duration, source){
		for (let e of this.effects){
			if (e.flags.core?.statusId === "prone") return;
		}

		//Currently, if duration is null, prone is comming from Damage
		if (!duration){
			duration = {
				type: "special",
				duration: 0,
			}
			source = "damage"
		}

		let effect = {
			name: `${game.i18n.localize("SR5.STATUSES_Prone")}`,
			type: "itemEffect",
			"system.type": "prone",
			"system.source": source,
			"system.target": game.i18n.localize("SR5.Special"),
			"system.value": 0,
			"system.durationType": duration.type,
			"system.duration": duration.duration,
		}

		let statusEffect = await _getSRStatusEffect("prone");
		await this.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
		await this.createEmbeddedDocuments("Item", [effect]);
		if (damage >= 10) ui.notifications.info(`${this.name}: ${game.i18n.format("SR5.INFO_DamageDropProneTen", {damage: damage})}`);
		else if (gelAmmo < 0) ui.notifications.info(`${this.name}: ${game.i18n.format("SR5.INFO_DamageDropProneGel", {damage: damage, limit: actorData.limits.physicalLimit.value})}`);
		else if (damage > 0) ui.notifications.info(`${this.name}: ${game.i18n.format("SR5.INFO_DamageDropProne", {damage: damage, limit: actorData.limits.physicalLimit.value})}`);
		else ui.notifications.info(`${this.name} ${game.i18n.format("SR5.INFO_DropProne")}`);
	}

	//Handle death effect
	async createDeadEffect(){
		for (let e of this.effects){
			if (e.flags.core?.statusId === "dead") return;
		}
		let effect = await _getSRStatusEffect("dead");
		await this.createEmbeddedDocuments('ActiveEffect', [effect]);
		ui.notifications.info(`${this.name}: ${game.i18n.localize("SR5.INFO_DamageActorDead")}`);
	}

	//Handle ko effect
	async createKoEffect(){
		for (let e of this.effects){
			if (e.flags.core?.statusId === "unconscious") return;
		}
		let effect = await _getSRStatusEffect("unconscious")
		await this.createEmbeddedDocuments('ActiveEffect', [effect]);
		ui.notifications.info(`${this.name}: ${game.i18n.localize("SR5.INFO_DamageActorKo")}`);
	}

	//Handle Elemental Damage : Electricity
	async electricityDamageEffect(){
		let existingEffect = this.items.find((item) => item.type === "itemEffect" && item.system.type === "electricityDamage");
		if (existingEffect){
			let updatedEffect = existingEffect.toObject(false);
			updatedEffect.system.duration += 1;
			await this.updateEmbeddedDocuments("Item", [updatedEffect]);
			ui.notifications.info(`${this.name}: ${existingEffect.name} ${game.i18n.localize("SR5.INFO_DurationExtendOneRound")}.`);
		} else {
			let effect = {
				name: `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageElectricity")})`,
				type: "itemEffect",
				"system.type": "electricityDamage",
				"system.target": game.i18n.localize("SR5.GlobalPenalty"),
				"system.value": -1,
				"system.durationType": "round",
				"system.duration": 1,
				"system.customEffects": {
					"0": {
							"category": "penaltyTypes",
							"target": "system.penalties.special.actual",
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
		let existingEffect = this.items.find((item) => item.type === "itemEffect" && item.system.type === "acidDamage");
		let armor = this.items.find((item) => item.type === "itemArmor" && item.system.isActive && !item.system.isAccessory);
		if (existingEffect){
			return;
		} else {
			if (armor){
				let updatedArmor = armor.toObject(false);
				let armorEffect = {
					"name": `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageAcid")})`,
					"target": "system.armorValue",
					"wifi": false,
					"type": "value",
					"value": -1,
					"multiplier": 1
				}
				updatedArmor.system.itemEffects.push(armorEffect);
				await this.updateEmbeddedDocuments("Item", [updatedArmor]);
				ui.notifications.info(`${this.name}: ${game.i18n.format("SR5.INFO_AcidReduceArmor", {armor: armor.name})}`);
			}
			let duration;
			if (source === "spell") duration = 1;
			else duration = damage;
			let effect = {
				name: `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageAcid")})`,
				type: "itemEffect",
				"system.type": "acidDamage",
				"system.target": `${game.i18n.localize("SR5.Armor")}, ${game.i18n.localize("SR5.Damage")}`,
				"system.value": damage,
				"system.durationType": "round",
				"system.duration": duration,
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
		let existingEffect = this.items.find((item) => item.type === "itemEffect" && item.system.type === "fireDamage");
		if (existingEffect) return;
		let effect = {
			name: `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageFire")})`,
			type: "itemEffect",
			"system.type": "fireDamage",
			"system.target": game.i18n.localize("SR5.PenaltyValuePhysical"),
			"system.value": 3,
			"system.durationType": "special",
			"system.duration": 0,
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
		let updatedItems = duplicate(this.items);

		//Reset le SS à 0
		let actorData = duplicate(this.system);
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
			if (i.system.marks && i.system.marks?.length) {
				for (let m of i.system.marks){
					if (!game.user?.isGM) {
						await SR5_SocketHandler.emitForGM("deleteMarkInfo", {
							actorID: m.ownerId,
							item: i._id,
						});
					} else {
						await SR5Actor.deleteMarkInfo(m.ownerId, i._id);
					}
				}
				i.system.marks = [];
			}
			//Reset Marked items
			if (i.system.markedItems?.length) i.system.markedItems = [];
		}

		dataToUpdate = mergeObject(dataToUpdate, {
			"system": actorData,
			"items": updatedItems,
		});
		await this.update(dataToUpdate);

		//Delete effects from Deck
		for (let i of this.items){
			if (i.type === "itemEffect" && i.system.durationType === "reboot"){
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
				let cleanData = duplicate(itemToClean.system);
				for (let i = 0; i < cleanData.marks.length; i++){
					if (cleanData.marks[i].ownerId === actorID) {
						cleanData.marks.splice(i, 1);
						i--;
					}
				}
				await itemToClean.update({"system" : cleanData});
				//For Host, keep slaved device marks synchro
				if (itemToClean.parent.system.matrix.deviceType === "host") SR5_DiceHelper.markSlavedDevice(itemToClean.parent.id);
			} else {
				SR5_SystemHelpers.srLog(1, `No Item to Clean in deleteMarksOnActor()`);
			}
		}
	}

	//Socket for deletings marks on other actors;
	static async _socketDeleteMarksOnActor(message) {
		await SR5Actor.deleteMarksOnActor(message.system.actorData, message.system.actorID);
	}

	//Delete Mark info on other actors
	static async deleteMarkInfo(actorID, item){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorID);
		if (!actor) return SR5_SystemHelpers.srLog(1, `No Actor in deleteMarkInfo()`);

		let deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive),
				deckData = duplicate(deck.system),
				index=0;

		for (let m of deckData.markedItems){
			if (m.uuid.includes(item)){
				deckData.markedItems.splice(index, 1);
				index--;
			}
			index++;
		}

		await deck.update({"system": deckData});

		//For host, update all unlinked token with same marked items
		if (actor.system.matrix.deviceType === "host" && canvas.scene){
			for (let token of canvas.tokens.placeables){
					if (token.actor.id === actorID) {
							let tokenDeck = token.actor.items.find(i => i.type === "itemDevice" && i.system.isActive);
							let tokenDeckData = duplicate(tokenDeck.system);
							tokenDeckData.markedItems = deckData.markedItems;
							await tokenDeck.update({"system": tokenDeckData});
					}
			}
		}
	}

	//Socket for deletings marks info other actors;
	static async _socketDeleteMarkInfo(message) {
		await SR5Actor.deleteMarkInfo(message.system.actorID, message.system.item);
	}

	//Raise owerwatch score
	static async overwatchIncrease(defenseHits, actorId) {
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let actorData = duplicate(actor.system);

		if (actorData.matrix.overwatchScore === null) actorData.matrix.overwatchScore = 0;
		actorData.matrix.overwatchScore += defenseHits;
		actor.update({system: actorData});
		ui.notifications.info(`${actor.name}, ${game.i18n.localize("SR5.OverwatchScoreActual")} ${actorData.matrix.overwatchScore}`);
	}

	//Socket for increasing overwatch score;
	static async _socketOverwatchIncrease(message) {
		await SR5Actor.overwatchIncrease(message.system.defenseHits, message.system.actorId);
	}

	//Reset Cumulative Recoil
	resetRecoil(){
		this.setFlag("sr5", "cumulativeRecoil", 0);
		ui.notifications.info(`${this.name}: ${game.i18n.localize("SR5.CumulativeRecoilSetTo0")}.`);
	}

	//Reset Cumulative Recoil
	resetCumulativeDefense(){
		this.setFlag("sr5", "cumulativeDefense", 0);
		ui.notifications.info(`${this.name}: ${game.i18n.localize("SR5.CumulativeDefenseSetTo0")}.`);
	}

	//Create a Sidekick
	static async createSidekick(item, userId, actorId){
		let itemData = item.system, permissionPath, petType;
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
		let sideKickData = {
			"name": item.name,
			"type": petType,
			"img": img,
		};

		// Give permission to player
		if (userId) {
			permissionPath = 'permission.' + userId;
			sideKickData = mergeObject(sideKickData, {
				[permissionPath]: 3,
			});
		}

		// Handle specific data for Actor creation
		if (item.type === "itemSpirit") {
			let baseItems = await SR5_CompendiumUtility.getBaseItems("actorSpirit", itemData.type, itemData.itemRating);
			baseItems = await SR5_CompendiumUtility.addOptionalSpiritPowersFromItem(baseItems, itemData.optionalPowers);
			for (let power of baseItems){
				if (power.system.systemEffects.length){
					for (let syseffect of power.system.systemEffects){
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
			sideKickData = mergeObject(sideKickData, {
				"system.type": itemData.type,
				"system.force.base": itemData.itemRating,
				"system.isBounded": itemData.isBounded,
				"system.services.value": itemData.services.value,
				"system.services.max": itemData.services.max,
				"system.summonerMagic": itemData.summonerMagic,
				"system.creatorId": actorId,
				"system.creatorItemId": item._id,
				"system.magic.tradition": itemData.magic.tradition,
				"system.conditionMonitors.physical.actual": itemData.conditionMonitors.physical.actual,
				"system.conditionMonitors.stun.actual": itemData.conditionMonitors.stun.actual,
				"items": baseItems,
			});
		}

		if (item.type === "itemSprite") {
			let baseItems = await SR5_CompendiumUtility.getBaseItems("actorSprite", itemData.type, itemData.itemRating);
			for (let deck of itemData.decks) {
				deck.system.marks = [];
				baseItems.push(deck);
			}

			sideKickData = mergeObject(sideKickData, {
				"system.type": itemData.type,
				"system.level": itemData.itemRating,
				"system.isRegistered": itemData.isRegistered,
				"system.tasks.value": itemData.tasks.value,
				"system.tasks.max": itemData.tasks.max,
				"system.compilerResonance": itemData.compilerResonance,
				"system.creatorId": actorId,
				"system.creatorItemId": item._id,
				"system.conditionMonitors.matrix.actual": itemData.conditionMonitors.matrix.actual,
				"items": baseItems,
			});
		}

		if (item.type === "itemProgram") {
			let baseItems = [];
			let ownerDeck = ownerActor.items.find(i => i.type === "itemDevice" && i.system.isActive);
			if(!ownerDeck) return;
			for (let deck of itemData.decks) {
				deck.system.marks = [];
				baseItems.push(deck);
			}

			let creatorData = SR5_EntityHelpers.getRealActorFromID(actorId);
			creatorData = creatorData.toObject(false);
			sideKickData = mergeObject(sideKickData, {
				"system.creatorId": actorId,
				"system.creatorItemId": item._id,
				"system.creatorData": creatorData,
				"system.conditionMonitors.matrix": ownerDeck.system.conditionMonitors.matrix,
				"system.rating": itemData.itemRating,
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
				deck.system.marks = [];
				baseItems.push(deck);
			}
			let ownerActorObject = ownerActor.toObject(false);
			sideKickData = mergeObject(sideKickData, {
				"system.creatorId": actorId,
				"system.creatorItemId": item._id,
				"system.type": itemData.type,
				"system.model": itemData.model,
				"system.attributes.handling.natural.base": itemData.attributes.handling,
				"system.attributes.handlingOffRoad.natural.base": itemData.attributes.handlingOffRoad,
				"system.attributes.secondaryPropulsionHandling.natural.base": itemData.secondaryPropulsion.handling,
				"system.attributes.secondaryPropulsionHandlingOffRoad.natural.base": itemData.secondaryPropulsion.handlingOffRoad,
				"system.attributes.speed.natural.base": itemData.attributes.speed,
				"system.attributes.speedOffRoad.natural.base": itemData.attributes.speedOffRoad,
				"system.attributes.secondaryPropulsionSpeed.natural.base": itemData.secondaryPropulsion.speed,
				"system.attributes.acceleration.natural.base": itemData.attributes.acceleration,
				"system.attributes.accelerationOffRoad.natural.base": itemData.attributes.accelerationOffRoad,
				"system.attributes.secondaryPropulsionAcceleration.natural.base": itemData.secondaryPropulsion.acceleration,
				"system.attributes.body.natural.base": itemData.attributes.body,
				"system.attributes.armor.natural.base": itemData.attributes.armor,
				"system.attributes.pilot.natural.base": itemData.attributes.pilot,
				"system.attributes.sensor.natural.base": itemData.attributes.sensor,
				"system.attributes.seating.natural.base": itemData.seating,
				"system.modificationSlots.powerTrain.base": itemData.modificationSlots.powerTrain,
				"system.modificationSlots.protection.base": itemData.modificationSlots.protection,
				"system.modificationSlots.weapons.base": itemData.modificationSlots.weapons,
				"system.modificationSlots.extraWeapons": itemData.modificationSlots.extraWeapons,
				"system.modificationSlots.extraBody": itemData.modificationSlots.extraBody,
				"system.modificationSlots.body.base": itemData.modificationSlots.body,
				"system.modificationSlots.electromagnetic.base": itemData.modificationSlots.electromagnetic,
				"system.modificationSlots.cosmetic.base": itemData.modificationSlots.cosmetic,
				"system.conditionMonitors.condition.actual": itemData.conditionMonitors.condition.actual,
				"system.conditionMonitors.matrix.actual": itemData.conditionMonitors.matrix.actual,
				"system.isSecondaryPropulsion": itemData.secondaryPropulsion.isSecondaryPropulsion,
				"system.secondaryPropulsionType": itemData.secondaryPropulsion.type,
				"system.pilotSkill": itemData.pilotSkill,
				"system.riggerInterface": itemData.riggerInterface,
				"system.offRoadMode": itemData.offRoadMode,
				"system.price": itemData.price.base,
				"system.slaved": itemData.slaved,
				"system.isSlavedToPan": itemData.isSlavedToPan,
				"system.panMaster": itemData.panMaster,
				"system.vehicleOwner.id": actorId,
				"system.vehicleOwner.name": ownerActor.name,
				"system.vehicleOwner.system": ownerActorObject.system,
				"system.vehicleOwner.items": ownerActorObject.items,
				"system.controlMode": itemData.controlMode,
				"items": baseItems,
			});
		}

		let originalItem = ownerActor.getEmbeddedDocument("Item", item._id);
		await originalItem.update({"system.isCreated": true,});

		//Create actor
		await Actor.createDocuments([sideKickData]);
	}

	//Socket for creating sidekick;
	static async _socketCreateSidekick(message) {
		await SR5Actor.createSidekick(message.data.item, message.data.userId, message.data.actorId);
	}

	//Dismiss sidekick : update his parent item and then delete actor
	static async dimissSidekick(actor){
		let ownerActor = SR5_EntityHelpers.getRealActorFromID(actor.system.creatorId);
		let item = ownerActor.getEmbeddedDocument("Item", actor.system.creatorItemId);
		let modifiedItem = duplicate(item);

		if (actor.type === "actorSpirit"){
			modifiedItem.img = actor.img;
			modifiedItem.system.services.value = actor.system.services.value;
			modifiedItem.system.services.max = actor.system.services.max;
			modifiedItem.system.conditionMonitors.physical.actual = actor.system.conditionMonitors.physical.actual;
			modifiedItem.system.conditionMonitors.stun.actual = actor.system.conditionMonitors.stun.actual;
			modifiedItem.system.isBounded = actor.system.isBounded;
			modifiedItem.system.isCreated = false;
			await item.update(modifiedItem);
		}

		if (actor.type === "actorSprite"){
			let decks = [];
			for (let a of actor.items){
				if (a.type === "itemDevice") decks.push(a);
			}
			modifiedItem.img = actor.img;
			modifiedItem.system.decks = decks;
			modifiedItem.system.tasks.value = actor.system.tasks.value;
			modifiedItem.system.tasks.max = actor.system.tasks.max;
			modifiedItem.system.conditionMonitors.matrix.actual = actor.system.conditionMonitors.matrix.actual;
			modifiedItem.system.isRegistered = actor.system.isRegistered;
			modifiedItem.system.isCreated = false;
			item.update(modifiedItem);
		}

		if (actor.type === "actorAgent"){
		let decks = [];
			for (let a of actor.items){
				if (a.type === "itemDevice") decks.push(a);
			}
			modifiedItem.img = actor.img;
			modifiedItem.system.decks = decks;
			item.update(modifiedItem);
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
			modifiedItem.system.autosoft = autosoft;
			modifiedItem.system.weapons = weapons;
			modifiedItem.system.ammunitions = ammunitions;
			modifiedItem.system.armors = armors;
			modifiedItem.system.decks = decks;
			modifiedItem.system.vehiclesMod = vehiclesMod;
			modifiedItem.system.model = actor.system.model;
			modifiedItem.system.slaved = actor.system.slaved;
			modifiedItem.system.controlMode = actor.system.controlMode;
			modifiedItem.system.riggerInterface = actor.system.riggerInterface;
			modifiedItem.system.offRoadMode = actor.system.offRoadMode; 
			modifiedItem.system.attributes.handling = actor.system.attributes.handling.natural.base;
			modifiedItem.system.attributes.handlingOffRoad = actor.system.attributes.handlingOffRoad.natural.base;
			modifiedItem.system.secondaryPropulsion.handling = actor.system.attributes.secondaryPropulsionHandling.natural.base;
			modifiedItem.system.secondaryPropulsion.handlingOffRoad = actor.system.attributes.secondaryPropulsionHandlingOffRoad.natural.base;
			modifiedItem.system.attributes.speed = actor.system.attributes.speed.natural.base;
			modifiedItem.system.attributes.speedOffRoad = actor.system.attributes.speedOffRoad.natural.base;
			modifiedItem.system.secondaryPropulsion.speed = actor.system.attributes.secondaryPropulsionSpeed.natural.base;
			modifiedItem.system.attributes.acceleration = actor.system.attributes.acceleration.natural.base;
			modifiedItem.system.attributes.accelerationOffRoad = actor.system.attributes.accelerationOffRoad.natural.base;
			modifiedItem.system.secondaryPropulsion.acceleration = actor.system.attributes.secondaryPropulsionAcceleration.natural.base;
			modifiedItem.system.attributes.body = actor.system.attributes.body.natural.base;
			modifiedItem.system.attributes.armor = actor.system.attributes.armor.natural.base;
			modifiedItem.system.attributes.pilot = actor.system.attributes.pilot.natural.base;
			modifiedItem.system.attributes.sensor = actor.system.attributes.sensor.natural.base;
			modifiedItem.system.seating = actor.system.attributes.seating.natural.base;
			modifiedItem.system.modificationSlots.powerTrain = actor.system.modificationSlots.powerTrain.base;
			modifiedItem.system.modificationSlots.protection = actor.system.modificationSlots.protection.base;
			modifiedItem.system.modificationSlots.weapons = actor.system.modificationSlots.weapons.base;
			modifiedItem.system.modificationSlots.extraWeapons = actor.system.modificationSlots.extraWeapons;
			modifiedItem.system.modificationSlots.extraBody = actor.system.modificationSlots.extraBody;
			modifiedItem.system.modificationSlots.body = actor.system.modificationSlots.body.base;
			modifiedItem.system.modificationSlots.electromagnetic = actor.system.modificationSlots.electromagnetic.base;
			modifiedItem.system.modificationSlots.cosmetic = actor.system.modificationSlots.cosmetic.base;
			modifiedItem.system.conditionMonitors.condition.actual = actor.system.conditionMonitors.condition.actual;
			modifiedItem.system.conditionMonitors.matrix.actual = actor.system.conditionMonitors.matrix.actual;
			modifiedItem.system.secondaryPropulsion.isSecondaryPropulsion = actor.system.isSecondaryPropulsion;
			modifiedItem.system.secondaryPropulsion.type = actor.system.secondaryPropulsionType;
			modifiedItem.system.isCreated = false;
			modifiedItem.img = actor.img;
			item.update(modifiedItem);
		}

		if (canvas.scene){
			for (let token of canvas.tokens.placeables) {
				if (token.document.actorId === actor._id) await token.document.delete();
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
				deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive),
				item = await fromUuid(targetItem),
				itemToAdd = item.toObject(false);

		itemToAdd.system.isSlavedToPan = true;
		itemToAdd.system.panMaster = actorId;
		await item.update({"system": itemToAdd.system});

		let currentPan = duplicate(deck.system.pan);
		let panObject = {
			"name": item.name,
			"uuid": targetItem,
		}
		currentPan.content.push(panObject);
		currentPan.current += 1;
		await deck.update({"system.pan": currentPan,});
	}

	static async _socketAddItemToPan(message){
		await SR5Actor.addItemtoPan(message.data.targetItem, message.data.actorId);
	}

	static async deleteItemFromPan(targetItem, actorId, index){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
				deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive),
				item = await fromUuid(targetItem);

		if (item) {
			let newItem = duplicate(item.system);
			newItem.isSlavedToPan = false;
			newItem.panMaster = "";
			await item.update({"system": newItem,});
		}

		let currentPan = duplicate(deck.system.pan);
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

		await deck.update({"system.pan": currentPan,});
	}

	static async _socketDeleteItemFromPan(message){
		await SR5Actor.deleteItemFromPan(message.data.targetItem, message.data.actorId, message.data.index);
	}

	//Apply an external effect to actor (such spell, complex form). Data is provided by chatMessage
	async applyExternalEffect(data, effectType){
		let item = await fromUuid(data.itemUuid);
		let itemData = item.system;

		for (let e of Object.values(itemData[effectType])){
			if (e.transfer) {
				let value, key, newData;
				if (e.type === "hits") value = Math.floor(data.test.hits * (e.multiplier || 1));
				else if (e.type === "netHits") value = Math.floor(data.netHits * (e.multiplier || 1));
				else if (e.type === "value") value = Math.floor(e.value * (e.multiplier || 1));
				else if (e.type === "rating") value = Math.floor(item.system.itemRating * (e.multiplier || 1));

				//Handle heal effect
				if (e.target.includes("removeDamage")){
					key = e.target.replace('.removeDamage','');
					newData = this.system;
					if(newData.conditionMonitors[key]){
						newData.conditionMonitors[key].actual.base -= value;
						SR5_EntityHelpers.updateValue(newData.conditionMonitors[key].actual, 0);
						await this.update({"system": newData});
						continue;
					} else continue;
				}

				//Handle non resisted damage
				if (e.target.includes("addDamage")){
					key = e.target.replace('.addDamage','');
					newData = this.system;
					if(newData.conditionMonitors[key]){
						newData.conditionMonitors[key].actual.base += value;
						SR5_EntityHelpers.updateValue(newData.conditionMonitors[key].actual, 0);
						await this.update({"system": newData});
						continue;
					} else continue;
				}

				let targetName = SR5_EntityHelpers.getLabelByKey(e.target);

				//Create the itemEffect
				let itemEffect = {
					name: item.name,
					type: "itemEffect",
					"system.target": targetName,
					"system.value": value,
					"system.type": item.type,
					"system.ownerID": data.actorId,
					"system.ownerName": data.speakerActor,
					"system.ownerItem": data.itemUuid,
					"system.duration": 0,
					"system.durationType": "sustained",
				};

				if (effectType === "customEffects"){
					itemEffect = mergeObject(itemEffect, {
						"system.customEffects": {
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
						"system.hasEffectOnItem": true,
					});
				}
				await this.createEmbeddedDocuments("Item", [itemEffect]);

				//Link Effect to source owner
				let effect;
				if (this.isToken) {
					for (let i of this.token.actor.items){
						if (i.system.ownerItem === data.itemUuid){
							if (!Object.keys(itemData.targetOfEffect).length) effect = i;
							else for (let e of Object.values(itemData.targetOfEffect)) if (e !== data.itemUuid) effect = i;
						}
					}
				} else {
					for (let i of this.items){
						if (i.system.ownerItem === data.itemUuid){
							if (!Object.keys(itemData.targetOfEffect).length) effect = i;
							else for (let e of Object.values(itemData.targetOfEffect)) if (e !== data.itemUuid) effect = i;
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
						if (this.isToken) itemToUpdate = this.token.actor.items.find(d => d.type === "itemDevice" && d.system.isActive);
						else itemToUpdate = this.items.find(d => d.type === "itemDevice" && d.system.isActive);
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
						newItem.system.itemEffects.push(effectItem);
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
				newItem = duplicate(item.system);

		if (newItem.duration === "sustained") newItem.isActive = true;
		if (item.type === "itemAdeptPower") newItem.isActive = true;
		newItem.targetOfEffect.push(effectUuid);
		await item.update({"system": newItem});
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
			if (i.system.itemEffects?.length){
				dataToUpdate = duplicate(i.system)
				index = 0;
				for (let e of dataToUpdate.itemEffects){
					if (e.ownerItem === parentItemEffect){
						dataToUpdate.itemEffects.splice(index, 1);
						needUpdate = true;
						index--;
					}
					index++;
				}
				if (needUpdate) await i.update({"system": dataToUpdate,});
			}
		}
	}

	//Delete an itemEffect when the activeEffect is deleted
	static async deleteItemEffectLinkedToActiveEffect(actorId, itemId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		await actor.deleteEmbeddedDocuments("Item", [itemId]);
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
					isStatusEffectOn = this.effects.find(e => e.origin === "toxinEffectNausea");
					if (!isStatusEffectOn){
						status = await _getSRStatusEffect("toxinEffectNausea");
						statusEffects = statusEffects.concat(status);
					}
					if (data.damageValue > this.system.attributes.willpower.augmented.value){
						isStatusEffectOn = this.effects.find(e => e.origin === "noAction");
						if (!isStatusEffectOn){
							status = await _getSRStatusEffect("noAction");
							statusEffects = statusEffects.concat(status);
						}
					}
				}
				//Disorientation Status Effect
				if (key === "disorientation"){
					isStatusEffectOn = this.effects.find(e => e.origin === "toxinEffectDisorientation");
					if (!isStatusEffectOn){
						status = await _getSRStatusEffect("toxinEffectDisorientation");
						statusEffects = statusEffects.concat(status);
					}
				}
				//Paralysis Status Effect
				if (key === "paralysis" && (data.damageValue > this.system.attributes.reaction.augmented.value)){
					let isStatusEffectOn = this.effects.find(e => e.origin === "noAction");
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

	//Apply specific called shots effect
	async applyCalledShotsEffect(data){
		let effects, status, weakSideEffect;
		let cSEffects = [];
		let statusEffects = [];

		if (typeof data.calledShot.effects === "object") data.calledShot.effects = Object.values(data.calledShot.effects);

		for (let key of Object.values(data.calledShot.effects)){
			//Special for stunned, skip
			if (key.name === "stunned") continue;

			//special for called shot linked to weak side effect
			if (data.calledShot.effects.find(e => e.name === "weakSide") && (data.calledShot.effects.find(e => e.name === "oneArmBandit") || data.calledShot.effects.find(e => e.name === "brokenGrip"))) {
				data.calledShot.effects = data.calledShot.effects.filter(e => e.name !== "weakSide");
				weakSideEffect = true;
				if (key.name === "weakSide") continue;
			}

			//Get the itemEffect
			effects = await SR5_DiceHelper.getCalledShotsEffect(key, data, this, weakSideEffect);

			//Skip for "prone" effect as it is already applied by getCalledShotsEffect()
			if (key.name === "buckled" || key.name === "knockdown") continue;
			cSEffects = cSEffects.concat(effects);

			if (!this.effects.find(e => e.origin === key.name)){
				status = await _getSRStatusEffect(key.name);
				statusEffects = statusEffects.concat(status);
				ui.notifications.info(`${this.name}: ${status.label} ${game.i18n.localize("SR5.Applied")}.`);
			}
		}
	
		if (weakSideEffect){
			if (!this.effects.find(e => e.origin === "weakSide")){
				status = await _getSRStatusEffect("weakSide");
				statusEffects = statusEffects.concat(status);
				ui.notifications.info(`${this.name}: ${status.label} ${game.i18n.localize("SR5.Applied")}.`);
			}
		}

		if (cSEffects.length) await this.createEmbeddedDocuments("Item", cSEffects);
		if (statusEffects.length) await this.createEmbeddedDocuments("ActiveEffect", statusEffects);
	}

	//Keep Agent condition Monitor synchro with Owner deck
	static async keepAgentMonitorSynchro(agent){
		if(!agent.system.creatorData) return;
		if(!canvas.scene) return;
		
		let owner = SR5_EntityHelpers.getRealActorFromID(agent.system.creatorId);
		let ownerDeck = owner.items.find(i => i.type === "itemDevice" && i.system.isActive);
		if (ownerDeck.system.conditionMonitors.matrix.actual.value !== agent.system.conditionMonitors.matrix.actual.value){
			let updatedActor = duplicate(agent.system);
			updatedActor.conditionMonitors.matrix = ownerDeck.system.conditionMonitors.matrix;
			await agent.update({"system": updatedActor,});
		}
	}

	//Keep Owner deck condition Monitor synchro with Agent
	static async keepDeckSynchroWithAgent(agent){
		let owner = SR5_EntityHelpers.getRealActorFromID(agent.system.creatorId);
		let ownerDeck = owner.items.find(i => i.type === "itemDevice" && i.system.isActive);

		if (ownerDeck.system.conditionMonitors.matrix.actual.value !== agent.system.conditionMonitors.matrix.actual.value){
			let newDeck = duplicate(ownerDeck.system);
			newDeck.conditionMonitors.matrix = agent.system.conditionMonitors.matrix;
			await ownerDeck.update({"system": newDeck});
		}
	}

	//Manage Regeneration
	async regenerate(data){
		let damageToRemove = data.netHits;
		let actorData = deepClone(this);
		actorData = actorData.toObject(false);

		if (actorData.type === "actorGrunt"){
			if (actorData.system.conditionMonitors.condition.actual.value > 0){
				actorData.system.conditionMonitors.condition.actual.base -= damageToRemove;
				damageToRemove -= actorData.system.conditionMonitors.condition.actual.value;
				await SR5_EntityHelpers.updateValue(actorData.system.conditionMonitors.condition.actual, 0);
			}
		} else {
			if (actorData.system.conditionMonitors.overflow.actual.value > 0){
				actorData.system.conditionMonitors.overflow.actual.base -= damageToRemove;
				damageToRemove -= actorData.system.conditionMonitors.overflow.actual.value;
				await SR5_EntityHelpers.updateValue(actorData.system.conditionMonitors.overflow.actual, 0);
			}
			if (actorData.system.conditionMonitors.physical.actual.value > 0 && damageToRemove > 0){
				actorData.system.conditionMonitors.physical.actual.base -= damageToRemove;
				damageToRemove -= actorData.system.conditionMonitors.physical.actual.value;
				await SR5_EntityHelpers.updateValue(actorData.system.conditionMonitors.physical.actual, 0);
			}
			if (actorData.system.conditionMonitors.stun.actual.value > 0 && damageToRemove > 0){
				actorData.system.conditionMonitors.stun.actual.base -= damageToRemove;
				damageToRemove -= actorData.system.conditionMonitors.stun.actual.value;
				await SR5_EntityHelpers.updateValue(actorData.system.conditionMonitors.stun.actual, 0);
			}
		}

		await this.update({system: actorData.system});
	}

	//Manage Healing
	static async heal(targetActorID, data){
		let damageToRemove = data.test.hits,
				damageType = data.typeSub,
				targetActor = SR5_EntityHelpers.getRealActorFromID(targetActorID),
				actorData = deepClone(targetActor);
				
		actorData = actorData.toObject(false);
		actorData.system.conditionMonitors[damageType].actual.base -= damageToRemove;
		await SR5_EntityHelpers.updateValue(actorData.system.conditionMonitors[damageType].actual, 0);
		await targetActor.update({system: actorData.system});
	}

	//Manage Healing by socket
	static async _socketHeal(message){
		await SR5Actor.heal(message.data.targetActor, message.data.healData);
	}
}

CONFIG.Actor.documentClass = SR5Actor;
