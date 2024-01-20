import { SR5 } from "../../config.js";
import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5_UtilityItem } from "../items/utilityItem.js";
import { SR5_CharacterUtility } from "./utilityActor.js";
import { SR5_CompendiumUtility } from "./utilityCompendium.js";
import { SR5_PrepareRollTest } from "../../rolls/roll-prepare.js";
import { _getSRStatusEffect } from "../../system/effectsList.js"
import { SR5_SocketHandler } from "../../socket.js";
import { SR5_ActorHelper } from "./entityActor-helpers.js";
import { SR5Combat } from "../../system/srcombat.js";

/**
 * Extend the base Actor class to implement additional logic specialized for Shadowrun 5.
 */

export class SR5Actor extends Actor {

	/** Overide Actor's create Dialog to hide certain type and sort them alphabetically*/
	static async createDialog(data={}, {parent=null, pack=null, ...options}={}) {

		// Collect data
		const documentName = this.metadata.name;
		const hiddenTypes = ["actorAgent", "base"];
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
		data.effects = []

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
				let effect = await _getSRStatusEffect("matrixInit");
				let initiativeEffect = new CONFIG.ActiveEffect.documentClass(effect);
				const effects = data.effects.map(e => e.toObject());
				effects.push(initiativeEffect.toObject());
				mergeObject(data, {"effects": effects });
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
			"prototypeToken.sight.enabled": true,
			"prototypeToken.sight.range": 0,
			"prototypeToken.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER,
			"prototypeToken.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER,
			"prototypeToken.name": this.name,
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
					"prototypeToken.texture.src": this.img,
				});
				break;
			case "actorDrone":
				mergeObject(createData, {
					"prototypeToken.lockRotation": true,
					"prototypeToken.actorLink": actorLink,
					"prototypeToken.bar1": {attribute: "statusBars.condition",},
					"prototypeToken.bar2": {attribute: "statusBars.matrix",},
					"prototypeToken.texture.src": this.img,
				});
				break;
			case "actorDevice":
			case "actorSprite":
			case "actorAgent": 
				mergeObject(createData, {
					"prototypeToken.lockRotation": true,
					"prototypeToken.actorLink": actorLink,
					"prototypeToken.bar2": {attribute: "statusBars.matrix",},
					"prototypeToken.texture.src": this.img,
				});
				break;
			default :
				SR5_SystemHelpers.srLog(1, `Unknown '${this.type}' type in 'base _preCreate()'`);
		}

		if (this.system.sideKickPrototypeToken) {
			mergeObject(createData, {
				"prototypeToken": this.system.sideKickPrototypeToken,
			});
		};

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
				SR5_CharacterUtility.updateConditionMonitors(actor);        
				SR5_CharacterUtility.updatePenalties(actor);  
				SR5_CharacterUtility.updateDefenses(actor);
				SR5_CharacterUtility.updateRecoil(actor);      
				SR5_CharacterUtility.updateInitiativePhysical(actor);
				SR5_CharacterUtility.generateVehicleSkills(actor);
				SR5_CharacterUtility.generateVehicleTest(actor);        
				SR5_CharacterUtility.generateRammingTest(actor);
				SR5_CharacterUtility.updateVehicleSlots(actor);
				SR5_CharacterUtility.updateActions(actor);
				break;
			case "actorSpirit":
				SR5_CharacterUtility.updateBackgroundCount(actor);
				SR5_CharacterUtility.updateSpiritValues(actor);
				SR5_CharacterUtility.updateSpiritAttributes(actor);
				SR5_CharacterUtility.updateAttributes(actor);
				SR5_CharacterUtility.updateEssence(actor);
				SR5_CharacterUtility.updateSpecialAttributes(actor);
				SR5_CharacterUtility.updateConditionMonitors(actor);
				SR5_CharacterUtility.updatePenalties(actor);
				SR5_CharacterUtility.updateInitiativePhysical(actor);
				SR5_CharacterUtility.updateInitiativeAstral(actor);
				SR5_CharacterUtility.updateLimits(actor);
				SR5_CharacterUtility.generateSpiritSkills(actor);
				SR5_CharacterUtility.updateSkills(actor);
				SR5_CharacterUtility.updateSpecialProperties(actor);
				SR5_CharacterUtility.updateArmor(actor);
				SR5_CharacterUtility.updateResistances(actor);
				SR5_CharacterUtility.updateDefenses(actor);
				SR5_CharacterUtility.updateDerivedAttributes(actor);
				SR5_CharacterUtility.updateMovements(actor);
				SR5_CharacterUtility.updateAstralValues(actor);
				SR5_CharacterUtility.updateEncumbrance(actor);
				SR5_CharacterUtility.handleVision(actor);
				SR5_CharacterUtility.updateActions(actor);
				break;
			case "actorSprite":
				SR5_CharacterUtility.updateSpriteValues(actor);
				SR5_CharacterUtility.updateAttributes(actor);
				SR5_CharacterUtility.updateSpecialAttributes(actor);
				SR5_CharacterUtility.updateLimits(actor);
				SR5_CharacterUtility.generateSpriteSkills(actor);
				SR5_CharacterUtility.updateSkills(actor);
				SR5_CharacterUtility.updateConditionMonitors(actor);
				SR5_CharacterUtility.updateActions(actor);
				break;
			case "actorDevice":
				SR5_CharacterUtility.updateConditionMonitors(actor);
				SR5_CharacterUtility.updateActions(actor);
				SR5_CharacterUtility.updateMatrixEffect(actor);
				break;
			case "actorAgent":
				SR5_CharacterUtility.applyProgramToAgent(actor);
				SR5_CharacterUtility.updateActions(actor);
				break;
			case "actorPc":
			case "actorGrunt":
				SR5_CharacterUtility.updateAttributes(actor);
				SR5_CharacterUtility.updateEssence(actor);
				SR5_CharacterUtility.updateSpecialAttributes(actor);
				SR5_CharacterUtility.updateBackgroundCount(actor);
				SR5_CharacterUtility.updateConditionMonitors(actor);
				SR5_CharacterUtility.updatePenalties(actor);
				SR5_CharacterUtility.updateLimits(actor);
				SR5_CharacterUtility.updateInitiativePhysical(actor);
				SR5_CharacterUtility.updateInitiativeAstral(actor);
				SR5_CharacterUtility.updateSkills(actor);
				SR5_CharacterUtility.updateSpecialProperties(actor);
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
				SR5_CharacterUtility.updateActions(actor);
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
					if (iData.isActive && iData.wirelessTurnedOn) actor.system.matrix.connectedObject.gears[i.uuid] = i.name;
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
					if (Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
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
						if (iData.isCumulative) modifierType = "armorAccessory";
						else modifierType = "armor";
						if (!iData.isAccessory) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.armor, `${i.name}`, modifierType, iData.armorValue.value);
						if (!iData.isAccessory && actor.system.resistances.fall) SR5_EntityHelpers.updateModifier(actor.system.resistances.fall, `${i.name}`, modifierType, iData.armorValue.value);
						if (Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					}
					if (iData.isActive && iData.wirelessTurnedOn) actor.system.matrix.connectedObject.armors[i.uuid] = i.name;
					if (!iData.isSlavedToPan) actor.system.matrix.potentialPanObject.armors[i.uuid] = i.name;
					break;

				case "itemAugmentation":
					i.prepareData();
					SR5_UtilityItem._handleAugmentation(iData, actor);
					if (!iData.isAccessory) SR5_EntityHelpers.updateModifier(actor.system.essence, `${i.name}`, `itemAugmentation`, -iData.essenceCost.value);
					if (iData.isActive && Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					if (iData.isActive && iData.wirelessTurnedOn) actor.system.matrix.connectedObject.augmentations[i.uuid] = i.name;
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
					SR5_UtilityItem._handleItemConcealment(iData);
					if(actor.system.matrix){
						if (iData.isActive && iData.wirelessTurnedOn) actor.system.matrix.connectedObject.weapons[i.uuid] = i.name;
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
									if (linkedWeapon) iData.linkedWeaponName = linkedWeapon.name;
									else iData.linkedWeaponName = "";
								}
							break;
						case "sustaining":
							iData.spellChoices = SR5_UtilityItem._generateSustainFocusSpellList(iData, actor);
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
					if (Object.keys(iData.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
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
					actor.system.matrix.connectedObject.vehicles[i.uuid] = i.name;
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
						SR5_CharacterUtility.generateDeviceMatrixActions(actor);
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
				case "itemPreparation":
					i.prepareData();
					break;
				case "itemProgram":
					if (actor.items.find(item => item.system.type === "agent")) SR5_CharacterUtility.updateProgramAgent(actor);
					break;
			}
		}
	}

	//Roll a test
	rollTest(rollType, rollKey, chatData){
		SR5_PrepareRollTest.rollTest(this, rollType, rollKey, chatData);
	}

	static _socketRollTest(message){
		let actor = SR5_EntityHelpers.getRealActorFromID(message.data.actorId);
		SR5_PrepareRollTest.rollTest(actor, message.data.rollType, message.data.rollKey, message.data.chatData);
	}

	//Apply Damage to actor
	async takeDamage(options){
		let actorId = (this.isToken ? this.token.id : this.id);
		if (game.user.isGM || this.testUserPermission(game.user, 3)) await SR5_ActorHelper.takeDamage(actorId, options);
		else {
			SR5_SocketHandler.emitForGM("takeDamage", {
				actorId: actorId,
				options: options,
			});
		}
	}
	

	//Apply splitted damage to actor
	async takeSplitDamage(messageData) {
		let originalDamage = messageData.damage.value;
		messageData.damage.type = "stun";
		messageData.damage.value = messageData.damage.splittedOne;
		await this.takeDamage(messageData);
		if (messageData.damage.splittedTwo){
			messageData.damage.type = "physical";
			messageData.damage.value = messageData.damage.splittedTwo;
			await this.takeDamage(messageData);
		} else {
			return ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDVSoNoDamage", {armor: this.itemsProperties.armor.value + messageData.combat.armorPenetration, damage:originalDamage})}`); 
		}
	}


	//Reboot deck = reset Overwatch score and delete any marks on or from the actor
	async rebootDeck() {
		let actorId = (this.isToken ? this.token.id : this.id);
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
					actorId: actorId,
				});
			} else {
				await SR5_ActorHelper.deleteMarksOnActor(actorData, actorId);
			}
		}

		//Delete marks from owned items
		for (let i of updatedItems){
			if (i.system.marks && i.system.marks?.length) {
				for (let m of i.system.marks){
					if (!game.user?.isGM) {
						await SR5_SocketHandler.emitForGM("deleteMarkInfo", {
							actorId: m.ownerId,
							item: i._id,
						});
					} else {
						await SR5_ActorHelper.deleteMarkInfo(m.ownerId, i._id);
					}
				}
				i.system.marks = [];
			}
			//Reset Marked items
			if (i.system.markedItems?.length) i.system.markedItems = [];
		}

		//Manage actions
		actorData.specialProperties.actions.complex.current -=1;

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

		//Manage action in combat
		if(game.combat){
			SR5Combat.changeActionInCombat(actorId, [{type: "complex", value: 1, source: "rebootDeck"}], false);
		}
	}

	//Reset Cumulative Recoil
	resetRecoil(){
		this.setFlag("sr5", "cumulativeRecoil", 0);
		ui.notifications.info(`${this.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.CumulativeRecoilSetTo0")}.`);
	}

	//Reset Addiction
	async resetAddiction(){
		let actorId = (this.isToken ? this.token.id : this.id);
		let dataToUpdate = {};
		let updatedItems = duplicate(this.items);

		//Reset le SS à 0
		let actorData = duplicate(this.system);
		actorData.addictions = [];

		dataToUpdate = mergeObject(dataToUpdate, {
			"system": actorData,
		});
		await this.update(dataToUpdate);

		ui.notifications.info(`${this.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.AddictionsSettoNone")}.`);
	}

	//Reset Cumulative Defense
	resetCumulativeDefense(){
		this.setFlag("sr5", "cumulativeDefense", 0);
		ui.notifications.info(`${this.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.CumulativeDefenseSetTo0")}.`);
	}

	//Apply an external effect to actor (such spell, complex form). Data is provided by chatMessage
	async applyExternalEffect(data, effectType){
		let actorId = (this.isToken ? this.token.id : this.id);
		SR5_ActorHelper.applyExternalEffect(actorId, data, effectType);
	}

	//Apply specific toxin effect
	async applyToxinEffect(data){
		let actorId = (this.isToken ? this.token.id : this.id);
		SR5_ActorHelper.applyToxinEffect(actorId, data);
	} 

	//Apply specific called shots effect
	async applyCalledShotsEffect(data){
		let actorId = (this.isToken ? this.token.id : this.id);
		SR5_ActorHelper.applyCalledShotsEffect(actorId, data);
	}

}

CONFIG.Actor.documentClass = SR5Actor;
