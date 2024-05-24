import { SR5 } from "../../config.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5_CharacterUtility } from "../actors/utilityActor.js";
import { SR5_EntityHelpers } from "../helpers.js";

export class SR5_UtilityItem extends Actor {
	//************************************************//
	//                     ITEMS                      //
	//************************************************//

	// Returns the display name of item types
	static findDisplayName(type) {
		var displayName = "";
		switch (type) {
			case "itemKnowledge":
				displayName = game.i18n.localize("SR5.KnowledgeSkillNew");
				break;
			case "itemLanguage":
				displayName = game.i18n.localize("SR5.LanguageNew");
				break;
			case "itemDevice":
				displayName = game.i18n.localize("SR5.DeviceNew");
				break;
			case "itemWeapon":
				displayName = game.i18n.localize("SR5.WeaponNew");
				break;
			case "itemArmor":
				displayName = game.i18n.localize("SR5.ArmorNew");
				break;
			case "itemMark":
				displayName = game.i18n.localize("SR5.MarkNew");
				break;
			case "itemProgram":
				displayName = game.i18n.localize("SR5.ProgramNew");
				break;
			case "itemGear":
				displayName = game.i18n.localize("SR5.GearNew");
				break;
			case "itemVehicle":
				displayName = game.i18n.localize("SR5.VehicleNew");
				break;
			case "itemVehicleMod":
				displayName = game.i18n.localize("SR5.VehicleModNew");
				break;
			case "itemAugmentation":
				displayName = game.i18n.localize("SR5.AugmentationNew");
				break;
			case "itemSpell":
				displayName = game.i18n.localize("SR5.SpellNew");
				break;
			case "itemPower":
				displayName = game.i18n.localize("SR5.PowerNew");
				break;
			case "itemAdeptPower":
				displayName = game.i18n.localize("SR5.AdeptPowerNew");
				break;
			case "itemFocus":
				displayName = game.i18n.localize("SR5.FocusNew");
				break;
			case "itemSpirit":
				displayName = game.i18n.localize("SR5.SpiritNew");
				break;
			case "itemMetamagic":
				displayName = game.i18n.localize("SR5.MetamagicNew");
				break;
			case "itemMartialArt":
				displayName = game.i18n.localize("SR5.MartialArtNew");
			break;
			case "itemContact":
				displayName = game.i18n.localize("SR5.ContactNew");
				break;
			case "itemSin":
				displayName = game.i18n.localize("SR5.SystemIdentificationNumberNew");
				break;
			case "itemLifestyle":
				displayName = game.i18n.localize("SR5.LifestyleNew");
				break;
			case "itemQuality":
				displayName = game.i18n.localize("SR5.QualityNew");
				break;
			case "itemKarmaLoss":
				displayName = game.i18n.localize("SR5.KarmaNewLoss");
				break;
			case "itemKarma":
				displayName = game.i18n.localize("SR5.KarmaNew");
				break;
			case "itemNuyen":
				displayName = game.i18n.localize("SR5.NuyenNew");
				break;
			case "itemPreparation":
				displayName = game.i18n.localize("SR5.PreparationNew");
				break;
			case "itemComplexForm":
				displayName = game.i18n.localize("SR5.ComplexFormNew");
				break;
			case "itemAmmunition":
				displayName = game.i18n.localize("SR5.AmmunitionNew");
				break;
			case "itemSprite":
				displayName = game.i18n.localize("SR5.SpriteNew");
				break;
			case "itemSpritePower":
				displayName = game.i18n.localize("SR5.SpritePowerNew");
				break;
			case "itemEcho":
				displayName = game.i18n.localize("SR5.EchoNew");
				break;
			case "itemTradition":
				displayName = game.i18n.localize("SR5.TraditionNew");
				break;
			case "itemRitual":
				displayName = game.i18n.localize("SR5.RitualNew");
				break;
			case "itemEffect":
				displayName = game.i18n.localize("SR5.EffectNew");
				break;
			default:
				displayName = false;
				SR5_SystemHelpers.srLog(1, `Unknown '${type}' item type`);
		}
		return displayName;
	}

	// Reset les modifs de prix et de dispo des items
	static _resetItemModifiers(item) {
		let itemData = item.system;

		//Reset accessory
		if (item.type === "itemAugmentation" || item.type === "itemGear"){
			if (!item.isOwned) itemData.accessory = [];
			itemData.isMedkit = false;
		}

		//Reset price & availability
		if (itemData.price) itemData.price.modifiers = [];
		if (itemData.availability) itemData.availability.modifiers = [];
		if (itemData.essenceCost) itemData.essenceCost.modifiers = [];

		//Rest test dicepool
		if (itemData.test){
			itemData.test.modifiers = [];
			itemData.test.dicePool = 0;
		}

		//Rest rating value
		if (item.type === "itemKnowledge" || item.type === "itemLanguage"){
			itemData.rating.value = 0;
			itemData.rating.modifiers = [];
		}

		//Reset weapon modifiers
		if (item.type === "itemWeapon") {
			itemData.firingMode.value = [];
			itemData.damageValue.modifiers = [];
			itemData.armorPenetration.modifiers = [];
			itemData.recoilCompensation.modifiers = [];
			itemData.weaponSkill.base = 0;
			itemData.weaponSkill.modifiers = [];
			itemData.concealment.modifiers = [];
			itemData.accuracy.modifiers = [];
			itemData.reach.modifiers = [];
			itemData.range.short.modifiers = [];
			itemData.range.medium.modifiers = [];
			itemData.range.long.modifiers = [];
			itemData.range.extreme.modifiers = [];
			for (let key of Object.keys(SR5.propagationVectors)) {
				itemData.toxin.vector[key] = false;
			}
			for (let key of Object.keys(SR5.toxinEffects)) {
				itemData.toxin.effect[key] = false;
			}
		}

		if (item.type === "itemDrug"){
			itemData.vector.value = [];
		}

		if (item.type === "itemArmor"){
			itemData.armorValue.value = 0;
			itemData.armorValue.modifiers = [];
		}

		if (itemData.isWireless){
			itemData.conditionMonitors.matrix.value = 0;
			itemData.conditionMonitors.matrix.modifiers = [];
			itemData.conditionMonitors.matrix.actual.value = 0;
			itemData.conditionMonitors.matrix.actual.modifiers = [];
		}

		if (itemData.conditionMonitors?.condition) {
			itemData.conditionMonitors.condition.value = 0;
			itemData.conditionMonitors.condition.modifiers = [];
			itemData.conditionMonitors.condition.actual.value = 0;
			itemData.conditionMonitors.condition.actual.modifiers = [];
		}

		if (item.type === "itemSpell") {
			itemData.freeSustain = false;
			itemData.damageValue.modifiers = [];
			itemData.armorPenetration.modifiers = [];
			itemData.drain.modifiers = [];
			itemData.drainValue.modifiers = [];
			itemData.spellAreaOfEffect.modifiers = [];
		}

		if (item.type === "itemComplexForm") {
			itemData.freeSustain = false;
		}

		if (item.type === "itemAdeptPower"){
			itemData.drainValue.modifiers = [];
		}

		if (item.type === "itemMartialArt"){
			itemData.pin = false;
			itemData.entanglement = false;
			itemData.feint = false;
			itemData.disarm = false;
			itemData.breakWeapon = false;
		}

		if (typeof itemData.systemEffects === "object") {
			itemData.systemEffects = Object.values(itemData.systemEffects);
		}

		if (typeof itemData.itemEffects === "object") {
			itemData.itemEffects = Object.values(itemData.itemEffects);
		}

		//Debugger for PAN's problem
		if (itemData.isSlavedToPan && itemData.panMaster === "") itemData.isSlavedToPan = false;
	}

	static _handleItemCapacity(item) {
		let valueMultiplier = 0, valueTakenMultiplier = 0;

		//Capacity
		if (item.capacity.multiplier == "rating") valueMultiplier = item.itemRating;
		if (item.capacity.multiplier) {
			let modifierSource = `${game.i18n.localize(SR5.valueMultipliers[item.capacity.propertyMultiplier])} ${game.i18n.localize('SR5.Multiplier')}`;
			SR5_EntityHelpers.updateModifier(item.capacity, modifierSource, "multiplier", valueMultiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(item.capacity, 0);

		//Capacity taken
		if (item.capacityTaken.multiplier == "rating") valueTakenMultiplier = item.itemRating;
		if (item.capacityTaken.multiplier) {
			let modifierSource = `${game.i18n.localize(SR5.valueMultipliers[item.capacityTaken.propertyMultiplier])} ${game.i18n.localize('SR5.Multiplier')}`;
			SR5_EntityHelpers.updateModifier(item.capacityTaken, modifierSource, "multiplier", valueTakenMultiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(item.capacityTaken, 0);
	}

	static _handleItemPrice(item) {
		let multiplier;
		switch (item.price.multiplier) {
			case "rating":
				multiplier = item.itemRating;
				break;
			case "capacity":
				multiplier = item.capacity.value;
				break;
			case "acceleration":
				multiplier = item.vehiclePriceMultiplier.acceleration;
				break;
			case "handling":
				multiplier = item.vehiclePriceMultiplier.handling;
				break;
			case "speed":
				multiplier = item.vehiclePriceMultiplier.speed;
				break;
			case "body":
				multiplier = item.vehiclePriceMultiplier.body;
				break;
			case "seating":
				multiplier = item.vehiclePriceMultiplier.seating;
				break;
			case "vehicle":
					multiplier = item.vehiclePriceMultiplier.vehicle;
				break;
			default:
		}
		if (item.price.multiplier) SR5_EntityHelpers.updateModifier(item.price, game.i18n.localize(SR5.valueMultipliersAll[item.price.multiplier]), "multiplier", multiplier, true, false);
		SR5_EntityHelpers.updateValue(item.price, 0);
	}

	static _handleAmmoPrice(item) {
		let multiplier = item.quantity;
		SR5_EntityHelpers.updateModifier(item.price, game.i18n.localize('SR5.Quantity'), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
		SR5_EntityHelpers.updateValue(item.price, 0);
	}

	static _handleItemEssenceCost(item) {
		let multiplier;
		switch (item.essenceCost.multiplier) {
			case "rating":
				multiplier = item.itemRating;
				break;
			case "capacity":
				multiplier = item.capacity.value;
				break;
			default:
		}
		if (item.essenceCost.multiplier) SR5_EntityHelpers.updateModifier(item.essenceCost, game.i18n.localize(SR5.valueMultipliers[item.essenceCost.multiplier]), "multiplier", multiplier, true, false);
		SR5_EntityHelpers.updateValue(item.essenceCost, 0);
	}

	static _handleItemAvailability(item) {
		let multiplier;
		switch (item.availability.multiplier) {
			case "rating":
				multiplier = item.itemRating;
				break;
			case "capacity":
				multiplier = item.capacity.value;
				break;
			case "acceleration":
				multiplier = item.vehiclePriceMultiplier.acceleration;
				break;
			case "handling":
				multiplier = item.vehiclePriceMultiplier.handling;
				break;
			case "speed":
				multiplier = item.vehiclePriceMultiplier.speed;
				break;
			case "body":
				multiplier = item.vehiclePriceMultiplier.body;
				break;
			case "seating":
				multiplier = item.vehiclePriceMultiplier.seating;
				break;
			case "vehicle":
				multiplier = item.vehiclePriceMultiplier.vehicle;
				break;
			default:
		}
		if (item.availability.multiplier) SR5_EntityHelpers.updateModifier(item.availability, game.i18n.localize(SR5.valueMultipliersAll[item.availability.multiplier]), "multiplier", multiplier, true, false);
		SR5_EntityHelpers.updateValue(item.availability, 0);
	}

	static _handleItemConcealment(item) {
		SR5_EntityHelpers.updateValue(item.concealment, 0);
	}

	static _handleArmorValue(item) {
		SR5_EntityHelpers.updateValue(item.armorValue, 0);
	}

	static _handleMatrixMonitor(item){
		switch (item.type){
			case "itemSprite":
				item.system.conditionMonitors.matrix.base = Math.ceil(item.system.itemRating/ 2) + 8;
				break;
			case "itemVehicle":
				item.system.conditionMonitors.matrix.base = Math.ceil(item.system.attributes.pilot / 2) + 8;
				break;
			default: item.system.conditionMonitors.matrix.base = Math.ceil(item.system.deviceRating / 2) + 8;
		}
		
		SR5_EntityHelpers.updateValue(item.system.conditionMonitors.matrix.actual, 0);
		SR5_EntityHelpers.updateValue(item.system.conditionMonitors.matrix, 0);
	}

	////////////////////// ARMES ///////////////////////
	// Manage bow specific
	static _handleBow(item) {
		let itemData = item.system;
		if (itemData.type === "bow") {
			SR5_EntityHelpers.updateModifier(itemData.price, item.name, "itemRating", ((itemData.price.base * itemData.itemRating) - 100));
			SR5_EntityHelpers.updateModifier(itemData.availability, item.name, "itemRating", itemData.itemRating);
			SR5_EntityHelpers.updateModifier(itemData.armorPenetration, item.name, "itemRating", -Math.floor(itemData.itemRating / 4));
			let value = Math.min(itemData.itemRating,itemData.ammunition.rating);
			SR5_EntityHelpers.updateModifier(itemData.damageValue, item.name, "itemRating", value);
		}
	}

	// Generate Weapon dicepool
	static _generateWeaponDicepool(item, actor) {
		let itemData = item.system;
		if (actor) {
			if (actor.type === "actorDrone") {
				let controlerData;
				if (actor.system.vehicleOwner.id) controlerData = actor.system.vehicleOwner.system;
				itemData.weaponSkill.base = 0;

				switch (actor.system.controlMode){
					case "autopilot":
						for (let i of actor.items) {
							let iData = i.system;
							if (iData.model === item.name && i.type === "itemProgram" && iData.isActive) {
								SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize('SR5.VehicleStat_PilotShort'), "linkedAttribute", actor.system.attributes.pilot.augmented.value);
								SR5_EntityHelpers.updateModifier(itemData.weaponSkill, i.name, "program", iData.itemRating);
							}
						}
						if (controlerData){
							for (let i of actor.system.vehicleOwner.items) {
								if (i.system.model === item.name && i.type === "itemProgram" && i.system.isActive) {
									SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize('SR5.VehicleStat_PilotShort'), "linkedAttribute", actor.system.attributes.pilot.augmented.value);
									SR5_EntityHelpers.updateModifier(itemData.weaponSkill, i.name, "controlerProgram", i.system.itemRating);
								}
							}
						}
						itemData.weaponSkill.modifiers = itemData.weaponSkill.modifiers.concat(actor.system.penalties.special.actual.modifiers);
						if (actor.system.passiveTargeting) itemData.accuracy.base = actor.system.attributes.sensor.augmented.value;
						break;
					case "manual":
						SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, "controleMode", controlerData.skills.gunnery.test.dicePool);
						if (actor.system.passiveTargeting) itemData.accuracy.base = actor.system.attributes.sensor.augmented.value;
						break;
					case "remote":
						SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, "controleMode", controlerData.skills.gunnery.rating.value, false, true);
						SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.Logic')})`, "controleMode", controlerData.attributes.logic.augmented.value, false, true);
						if (actor.system.passiveTargeting) {
							if (actor.system.attributes.sensor.augmented.value > controlerData.matrix.attributes.dataProcessing.value) itemData.accuracy.base = controlerData.matrix.attributes.dataProcessing.value;
							else itemData.accuracy.base = actor.system.attributes.sensor.augmented.value;
						}
						break;
					case "rigging":
						SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, "controleMode", controlerData.skills.gunnery.test.dicePool);
						SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize('SR5.ControlRigging'), "controleMode", 1, false, true);
						if (controlerData.specialProperties.controlRig.value) {
							SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize('SR5.ControlRig'), "augmentations", controlerData.specialProperties.controlRig.value);
							SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize('SR5.ControlRig'), "augmentations", controlerData.specialProperties.controlRig.value);
						}
						if (controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize('SR5.VirtualRealityHotSimShort'), "matrixUserMode", 1);
						if (actor.system.passiveTargeting) itemData.accuracy.base = actor.system.attributes.sensor.augmented.value;
						SR5_EntityHelpers.updateValue(itemData.accuracy);
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown controle mode '${actor.system.controlMode}' in '_generateWeaponDicepool()'`);
				}
			} else {
				if (itemData.weaponSkill.specialization === true) {
					SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.Specialization')}`, "specialization", 2, false, true);
				}
				let actorSkill = itemData.weaponSkill.category;
				if(actor.system.skills[actorSkill] === undefined){
					SR5_SystemHelpers.srLog(1, `Unknown weapon skill '${actorSkill}' in '_generateWeaponDicepool()'`);
					itemData.weaponSkill.base = 0;
				} else {
					itemData.weaponSkill.base = 0;
					if ((actor.system.initiatives.astralInit.isActive || itemData.isUsedAsFocus) && itemData.isLinkedToFocus) itemData.weaponSkill.modifiers = itemData.weaponSkill.modifiers.concat(actor.system.skills.astralCombat.test.modifiers);
					else itemData.weaponSkill.modifiers = itemData.weaponSkill.modifiers.concat(actor.system.skills[actorSkill].test.modifiers);
					//Special case : bow
					if (itemData.type === "bow" && (actor.system.attributes.strength.augmented.value < itemData.itemRating)){
						let malus = (actor.system.attributes.strength.augmented.value - itemData.itemRating) * 3;
						SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.WeaponTypeBow')}`, "itemRating", malus, false, true);
					}
				}
			}
		}  
			SR5_EntityHelpers.updateDicePool(itemData.weaponSkill, 0);
	}

	static _generateWeaponDamage(itemData, actor) {
		if (actor) {
			if (itemData.accuracy.isPhysicalLimitBased) itemData.accuracy.base = actor.system.limits.physicalLimit.value;
			if (itemData.damageValue.isStrengthBased && actor.type !=="actorDrone") {
				if ((actor.system.initiatives.astralInit.isActive || itemData.isUsedAsFocus) && itemData.isLinkedToFocus) SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize('SR5.Charisma'), "linkedAttribute", actor.system.attributes.charisma.augmented.value);
				else SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize('SR5.Strength'), "linkedAttribute", actor.system.attributes.strength.augmented.value);
			}
			if (actor.system.itemsProperties?.weapon) {
				for (let modifier of actor.system.itemsProperties.weapon.accuracy.modifiers) {
					if (modifier.details === itemData.weaponSkill.category) itemData.accuracy.modifiers = itemData.accuracy.modifiers.concat(modifier);
				}
				for (let modifier of actor.system.itemsProperties.weapon.damageValue.modifiers) {
					if (modifier.details === itemData.weaponSkill.category) itemData.damageValue.modifiers = itemData.damageValue.modifiers.concat(modifier);
				}
			}

			if (actor.type === "actorDrone"){
				if (actor.system.controlMode === "manual" && actor.system.passiveTargeting){
					
				}
			}
		}

		itemData.firingMode.value = [];
		for (let key of Object.keys(SR5.weaponModes)) {
			if (itemData.firingMode[key]) {
				itemData.firingMode.value.push(game.i18n.localize(SR5.weaponModesAbbreviated[key]));
			}
		}

		itemData.choke.value = [];
		for (let key of Object.keys(SR5.chokeSettings)) {
			if (itemData.choke[key]) {
				itemData.choke.value.push(game.i18n.localize(SR5.chokeSettings[key]));
			}
		}

		SR5_EntityHelpers.updateValue(itemData.damageValue, 0);
		SR5_EntityHelpers.updateValue(itemData.armorPenetration);
		SR5_EntityHelpers.updateValue(itemData.recoilCompensation);
		SR5_EntityHelpers.updateValue(itemData.accuracy);
	}

	// Modif des munitions & grenades
	static _handleWeaponAmmunition(itemData) {
		let armorPenetration = 0,
			damageValue = 0,
			damageType = itemData.damageType,
			damageElement = itemData.damageElement,
			blastRadius = 0,
			blastDamageFallOff = 0;
		switch (itemData.ammunition.type) {
			case "regular":
			case "assaultCannon":
			case "taserDart":
			case "injection":
			case "tracer":
			case "flashPack":
			case "gyrojet":
			case "gauss":
				// No modification
				break;
			case "av":
				armorPenetration = -1;
				break;
			case "apds":
				armorPenetration = -4;
				break;
			case "capsule":
				armorPenetration = 4;
				damageValue = -4;
				break;
			case "explosive":
				armorPenetration = 1;
				damageValue = -1;
				break;
			case "exExplosive":
				armorPenetration = -1;
				damageValue = 2;
				break;
			case "flechette":
				armorPenetration = 5;
				damageValue = 2;
				break;
			case "frangible":
				armorPenetration = 4;
				damageValue = -1;
				break;
			case "gel":
				armorPenetration = 1;
				damageType = "stun";
				break;
			case "hollowPoint":
				armorPenetration = 2;
				damageValue = 1;
				break;
			case "gyrojetTaser":
				armorPenetration = -5;
				damageValue = -2;
				damageType = "stun";
				damageElement = "electricity";
				break;
			case "stickNShock":
				armorPenetration = -itemData.armorPenetration.base -5;
				damageValue = -2;
				damageType = "stun";
				damageElement = "electricity";
				break;
			case "tracker":
				armorPenetration = 2;
				damageValue = -2;
				break;
			case "flare":
				armorPenetration = 2;
				damageValue = -2;        
				damageElement = "fire";
				break;
			case "flashBang":
			case "flashBangMini":
				armorPenetration = -4;
				damageValue = 10;
				damageType = "stun";
				blastRadius = 10;
				break;
			case "fragmentation":
			case "fragmentationMini":
				armorPenetration = 5;
				damageValue = 18;
				damageType = "stun";
				blastDamageFallOff = -1;
				blastRadius = 18;
				break;
			case "fragmentationRocket":
			case "fragmentationMissile":
				armorPenetration = 5;
				damageValue = 23;
				damageType = "physical";
				blastDamageFallOff = -1;
				blastRadius = 23;
				break;
			case "smoke":
			case "smokeMini":
			case "smokeThermal":
			case "smokeThermalMini":
			case "gas":
			case "gasMini":
				damageType = "";
				blastRadius = 10;
				break;
			case "highlyExplosiveRocket":
			case "highlyExplosiveMissile":
				armorPenetration = -2;
				damageValue = 21;
				blastDamageFallOff = -2;
				blastRadius = 10;
				break;
			case "highlyExplosiveMini":
			case "highlyExplosive":
				armorPenetration = -2;
				damageValue = 16;
				blastDamageFallOff = -2;
				blastRadius = 8;
				break;
			case "antivehicleRocket":
			case "antivehicleMissile":
				armorPenetration = -4;
				damageValue = 24;
				blastDamageFallOff = -4;
				blastRadius = 6;
				break;
			case "arrow":
			case "arrowInjection":
				damageValue = itemData.ammunition.itemRating;
				break;
			case "arrowBarbedHead":
				damageValue = itemData.ammunition.itemRating + 1;					
				break;
			case "arrowExplosiveHead":
				damageValue = itemData.ammunition.itemRating + 2;
				armorPenetration = -1;
				SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize('SR5AmmunitionTypeArrowExplosiveHead'), "ammunitionType", -1);
				break;
			case "arrowHammerhead":
				damageValue = itemData.ammunition.itemRating + 1;
				damageType = "stun";
				armorPenetration = +2;	
				SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize('SR5.AmmunitionTypeArrowHammerhead'), "ammunitionType", -1);					break;
			case "arrowIncendiaryHead":
				SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize('SR5.AmmunitionTypeArrowIncendiaryHead'), "ammunitionType", -1);
				// phosphorous fire not coded
				break;
			case "arrowScreamerHead":
				SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize('SR5.AmmunitionTypeArrowScreamerHead'), "ammunitionType", -2);
				armorPenetration = +6;	
				break;
			case "arrowStickNShock":
				SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize('SR5.AmmunitionTypeArrowStickNShock'), "ammunitionType", -1);
				damageValue = 8;
				damageType = "stun";
				damageElement = "electricity";
				armorPenetration = -5;	
				break;
			case "arrowStaticShaft":
				damageValue = itemData.ammunition.itemRating + 4;
				damageType = "stun";
				damageElement = "electricity";
				break;
			default:
				SR5_SystemHelpers.srLog(3, "_handleWeaponAmmunition", `Unknown ammunition type: '${itemData.ammunition.type}'`);
				return;
		}
		if (armorPenetration) SR5_EntityHelpers.updateModifier(itemData.armorPenetration, game.i18n.localize(SR5.allAmmunitionTypes[itemData.ammunition.type]), "ammunitionType", armorPenetration);
		if (damageValue) SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize(SR5.allAmmunitionTypes[itemData.ammunition.type]), "ammunitionType", damageValue);
		itemData.damageType = damageType;
		itemData.damageElement = damageElement;
		itemData.blast.damageFallOff = blastDamageFallOff;
		itemData.blast.radius = blastRadius;
	}

	// Génére les spec des toxines pour les munitions & grenades
	static _handleWeaponToxin(itemData, actor) {
		switch (itemData.toxin.type) {
			case "airEngulf":
				if (!actor) return;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = actor.system.specialAttributes.magic.augmented.value * 2;
				itemData.toxin.penetration = -actor.system.specialAttributes.magic.augmented.value;
				itemData.toxin.damageType = "stun";
				break;
			case "noxiousBreath":
				if (!actor) return;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = actor.system.specialAttributes.magic.augmented.value;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.damageType = "stun";
				break;
			case "gamma":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = 12;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.paralysis = true;
				itemData.toxin.damageType = null;
				break;
			case "csTearGas":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 8;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.damageType = "stun";
				break;
			case "pepperPunch":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 11;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.damageType = "stun";
				break;
			case "nauseaGas":
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 3;
				itemData.toxin.power = 9;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.damageType = null;
				break;
			case "narcoject":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = 15;
				itemData.toxin.penetration = 0;
				itemData.toxin.damageType = "stun";
				break;
			case "neuroStunHeight":
			case "neuroStunNine":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 15;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.damageType = "stun";
				break;
			case "neuroStunTen":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 15;
				itemData.toxin.penetration = -2;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.damageType = "stun";
				break;
			case "seven":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 12;
				itemData.toxin.penetration = -2;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.damageType = "physical";
				break;
			case "deathrattleVenom":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 10;
				itemData.toxin.penetration = -3;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.effect.agony = true;
				itemData.toxin.damageType = "physical";
				break;
			case "nagaVenom":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = 8;
				itemData.toxin.penetration = 0;
				itemData.toxin.damageType = "physical";
				break;
			case "novaScorpionVenom":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 12;
				itemData.toxin.penetration = -2;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.damageType = "physical";
				break;
			case "martichorasVenom":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 9;
				itemData.toxin.penetration = -2;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.damageType = "physical";
				break;
			case "snakeVenom":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 8;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.damageType = "physical";
				break;
			case "snowSnakeVenom":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 8;
				itemData.toxin.penetration = -1;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.damageType = "physical";
				break;
			case "spiderBeastVenom":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = 6;
				itemData.toxin.penetration = -4;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.paralysis = true;
				itemData.toxin.damageType = "physical";
				break;
			case "glowRatVenom":
				itemData.toxin.vector.contact = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = 10;
				itemData.toxin.penetration = -6;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.effect.agony = true;
				itemData.toxin.damageType = "stun";
				break;
			case "flatwormViperVenom":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 2;
				itemData.toxin.power = 12;
				itemData.toxin.penetration = 0;
				itemData.toxin.damageType = "physical";
				break;
			case "iridescentOwlVenom":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = 8;
				itemData.toxin.penetration = -6;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.effect.agony = true;
				itemData.toxin.damageType = "stun";
				break;
			case "kokoroCobraVenom":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = 12;
				itemData.toxin.penetration = -6;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.effect.agony = true;
				itemData.toxin.damageType = "physical";
				break;
			case "montaukVenom":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 6;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.nausea = true;
				itemData.toxin.damageType = "physical";
				break;
			case "voidWaspVenom":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 3;
				itemData.toxin.power = 10;
				itemData.toxin.penetration = -4;
				itemData.toxin.effect.arcaneInhibitor = true;
				itemData.toxin.damageType = "stun";
				break;
			default:
				SR5_SystemHelpers.srLog(3, "_handleWeaponToxin", `Unknown toxin type: '${itemData.toxin.type}'`);
		}
	}

	//Calcule la distance des armes de jet en fonction de la force
	static _generateWeaponRange(itemData, actor) {
		if (itemData.range.isStrengthBased) {
			if (actor !== undefined) {
				let actorStrength = actor.system.attributes.strength.augmented.value;

				SR5_EntityHelpers.updateModifier(itemData.range.short, game.i18n.localize('SR5.Strength'), "linkedAttribute", (actorStrength * itemData.range.short.base) - itemData.range.short.base);
				SR5_EntityHelpers.updateModifier(itemData.range.medium, game.i18n.localize('SR5.Strength'), "linkedAttribute", (actorStrength * itemData.range.medium.base) - itemData.range.medium.base);
				if (itemData.aerodynamic){
					SR5_EntityHelpers.updateModifier(itemData.range.long, game.i18n.localize('SR5.Strength'), "linkedAttribute", (actorStrength * (itemData.range.long.base +2)) - itemData.range.long.base);
					SR5_EntityHelpers.updateModifier(itemData.range.extreme, game.i18n.localize('SR5.Strength'), "linkedAttribute", (actorStrength * (itemData.range.extreme.base +5)) - itemData.range.extreme.base);
				} else {
					SR5_EntityHelpers.updateModifier(itemData.range.long, game.i18n.localize('SR5.Strength'), "linkedAttribute", (actorStrength * itemData.range.long.base) - itemData.range.long.base);
					SR5_EntityHelpers.updateModifier(itemData.range.extreme, game.i18n.localize('SR5.Strength'), "linkedAttribute", (actorStrength * itemData.range.extreme.base) - itemData.range.extreme.base);
				}
			}
		}

		if (actor !== undefined) {
			if (itemData.category === "meleeWeapon" && actor.system.reach) {
				itemData.reach.modifiers = itemData.reach.modifiers.concat(actor.system.reach.modifiers);
			}
			if (itemData.systemEffects.length){
				for (let systemEffect of Object.values(itemData.systemEffects)){
					if (systemEffect.value === "noxiousBreath" || systemEffect.value === "corrosiveSpit"){
						SR5_EntityHelpers.updateModifier(itemData.range.short, game.i18n.localize('SR5.Body'), "linkedAttribute", actor.system.attributes.body.augmented.value);
						SR5_EntityHelpers.updateModifier(itemData.range.medium, game.i18n.localize('SR5.Body'), "linkedAttribute", actor.system.attributes.body.augmented.value * 2);
						SR5_EntityHelpers.updateModifier(itemData.range.long, game.i18n.localize('SR5.Body'), "linkedAttribute", actor.system.attributes.body.augmented.value * 3);
						SR5_EntityHelpers.updateModifier(itemData.range.extreme, game.i18n.localize('SR5.Body'), "linkedAttribute", actor.system.attributes.body.augmented.value * 4);
					}
				}
			}
		} 

		for (let key of Object.keys(SR5.weaponRanges)) {
			SR5_EntityHelpers.updateValue(itemData.range[key]);
		}
		SR5_EntityHelpers.updateValue(itemData.reach);
	}

	// Modifie les armes en fonction des accessoires
	static _handleWeaponAccessory(itemData, actor) {
		for (let a of itemData.accessory) {   
			a.price = 0;
			switch (a.name) {
				case "additionalClipMagazine":
					a.price = itemData.price.base;
					a.slot = "side";
					break;
				case "advancedSafetySystem":
					a.price = 600;
					break;
				case "advancedSafetySystemElec":
					a.price = 950;
					break;
				case "advancedSafetySystemExSD":
					a.price = 1000;
					break;
				case "advancedSafetySystemImmo":
					a.price = 700;
					break;
				case "advancedSafetySystemSelfD":
					a.price = 800;
					break;
				case "airburstLink":
					a.price = 600;
					break;
				case "ammoSkipSystem":
					a.price = 250;
					a.slot = "underneath";
					break;
				case "batteryBackPack":
					a.price = 2500;
					break;
				case "batteryClip":
					a.price = 400;
					break;
				case "batteryPack":
					a.price = 900;
					break;
				case "bayonet":
					a.price = 50;
					break;
				case "bipod":
					a.price = 200;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 2);
					break;
				case "capBall":
					break;
				case "ceramicPlasteelCompo1":
					a.price = itemData.price.base;
					break;
				case "ceramicPlasteelCompo2":
					a.price = 2 * itemData.price.base;
					break;
				case "ceramicPlasteelCompo3":
					a.price = 3 * itemData.price.base;
					break;
				case "ceramicPlasteelCompo4":
					a.price = 4 * itemData.price.base;
					break;
				case "ceramicPlasteelCompo5":
					a.price = 5 * itemData.price.base;
					break;
				case "ceramicPlasteelCompo6":
					a.price = 6 * itemData.price.base;
					break;
				case "chameleonCoating":
					a.price = 1000;
					a.slot = "side";					
					if (a.isActive && itemData.requiredHands == 1) SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -2);					
					if (a.isActive && itemData.requiredHands == 2) SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -1);
					break;
				case "concealableHolster":
					a.price = 150;
					if (a.isActive) {
						if (itemData.wirelessTurnedOn) SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -2);
						else SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -1);
					}
					break;
				case "concealedQDHolster":
					a.price = 275;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -1);
					break;
				case "customLook":
					a.price = 300;
					break;
				case "easyBreakdownManual":
					a.price = 750;
					a.slot = "side";
					break;
				case "easyBreakdownPowered":
					a.price = 1250;
					a.slot = "side";
					break;
				case "electronicFiring":
					a.price = 1000;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1);
					break;
				case "explosiveClip":
					a.price = 20;
					break;
				case "extendedBarrel":
					a.price = 50;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1);
					break;
				case "extendedClip1":
					a.price = 35;
					break;
				case "extendedClip2":
					a.price = 35;
					break;
				case "extremeEnvironment":
					a.price = 1500;
					break;
				case "flashLight":
					a.price = 50;
					break;
				case "flashLightInfrared":
					a.price = 400;
					break;
				case "flashLightLowLight":
					a.price = 200;
					break;
				case "foldingStock":
					a.price = 30;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1);
					break;
				case "foregrip":
					a.price = 100;
					if (a.isActive) {
						SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1);
						SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1);
					}
					break;
				case "gasVentSystemOne":
					a.price = 200;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1);
					break;
				case "gasVentSystemTwo":
					a.price = 400;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 2);
					break;
				case "gasVentSystemThree":
					a.price = 600;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 3);
					break;
				case "geckoGrip":
					a.price = 100;
					break;
				case "guncam":
					a.price = 350;
					break;
				case "gyroMount":
					a.price = 1400;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 6);
					break;
				case "holographicSight":
					a.price = 125;
					a.slot = "top";
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1, false, false);
					if (itemData.wirelessTurnedOn) SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1, false, false);
					break;
				case "hiddenArmSlide":
					a.price = 350;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1);
					break;
				case "hipPad":
					a.price = 250;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1);
					break;
				case "imagingScope":
					a.price = 300;
					break;
				case "improvedRangeFinder":
					a.price = 2000;
					break;
				case "krimePack":
					a.price = 500;
					break;
				case "krimeStunONet":
					a.price = 800;
					a.slot = "underneath";
					break;
				case "laserSight":
					a.price = 150;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1, false, false);
					if (itemData.wirelessTurnedOn) SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1, false, false);
					break;
				case "longbarrel":
					a.price = itemData.price.base;
					a.slot = "barrel"
					break;
				case "meleeHardening":
					a.price = 300;
					break;
				case "mountedCrossbow":
					a.price = 1000;
					break;
				case "narcojectDazzler":
					a.price = 1000;
					a.slot = "top";
					break;
				case "overcloked":
					a.price = 200;
					if (a.isActive && itemData.damageType == "stun") {
						itemData.damageType = "physical";
						SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -2, false, false);
					}
					break;
				case "periscope":
					a.price = 70;
					break;
				case "personalizedGrip":
					a.price = 100;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1, false, false);
					break;
				case "quickDrawHolster":
					a.price = 175;
					break;
				case "reducedWeight":
					break;
				case "redDotSight":
					a.price = 75;
					a.slot = "top";
					break;
				case "retractibleBayonet":
					a.price = 200;
					break;
				case "sawedoffShortbarrel":
					a.price = 20;
					a.slot = "barrel";
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -1, false, false);
					break;
				case "safeTargetSystem":
					a.price = 750;
					break;
				case "safeTargetSystemWithImage":
					a.price = 1100;
					break;
				case "shockPad":
					a.price = 50;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1);
					break;
				case "silencerSuppressor":
					a.price = 500;
					break;
				case "slideMount":
					a.price = 500;
					break;
				case "sling":
					a.price = 15;
					break;
				case "smartFiringPlatform":
					a.price = 2500;
					break;
				case "smartgunSystemInternal":
					a.price = "x2";
					if (!a.isFree) SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 2);
					if (a.isActive) {
						if ((actor !== undefined) && (actor.type !== "actorDrone")) {
							let smartlink = actor.system.specialProperties.smartlink.value;
							if (smartlink) {
								SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 2, false, false);
								if (itemData.wirelessTurnedOn) {
									if (smartlink === 2) {
										SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 2, false, false);
									} else if (smartlink === 1) {
										SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1, false, false);
									}
								}
							}
						}
					}
					break;
				case "smartgunSystemExternal":
					a.price = 200;
					if (a.isActive) {
						if ((actor !== undefined) && (actor.type !== "actorDrone")) {
							let smartlink = actor.system.specialProperties.smartlink.value;
							if (smartlink) {
								SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 2, false, false);
								if (itemData.wirelessTurnedOn) {
									if (smartlink === 2) {
										SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 2, false, false);
									} else if (smartlink === 1) {
										SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 1, false, false);
									}
								}
							}
						}
					}
					break;
				case "speedLoader":
					a.price = 25;
					break;
				case "stockRemoval":
					a.price = 20;
					a.slot = "stock";
					if (a.isActive) {
						SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -1);
						SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -1);
					}
					break;
				case "tracker":
					a.price = 150;
					break;
				case "triggerRemoval":
					a.price = 50;
					break;        
				case "tripod":
					a.price = 500;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", 6);
					break;
				case "trollAdaptation":
					break; 
				case "underbarrelBolaLauncher":
					a.price = 350;
					break; 
				case "underbarrelChainsaw":
					a.price = 500;
					break;  
				case "underbarrelLaser":
					a.price = 22000;
					break; 
				case "underbarrelFlamethrower":
					a.price = 200;
					break; 
				case "underbarrelGrappleGun":
					a.price = 600;
					break; 
				case "underbarrelGrenadeLauncher":
					a.price = 3500; 
				case "underbarrelShotgun":
					a.price = 600;
					a.slot = "underneath"
					break; 
				case "vintage":
					break; 
				case "weaponCommlink":
					a.price = 200;
					break; 
				case "weaponPersonality":
					a.price = 250;
					break; 
				default:
					SR5_SystemHelpers.srLog(1, `Unknown '${a}' accessory in _handleWeaponAccessory()`);
			}

			//If accessory is correctly selected
			if (a.name){
				//Get the game info and put it in the array
				let nameString = a.name.charAt(0).toUpperCase() + a.name.slice(1);
				let gameEffectString = 'SR5.Accessory'+ `${nameString}` + '_GE';
				a.gameEffects = game.i18n.localize(gameEffectString);
				//Add price modifier to weapon
				if (!a.isFree){
					if (a.name === "smartgunSystemInternal") {
						SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", itemData.price.base);
					} else {
						SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", a.price);
					}
				}
			}

		}
	}

	//Handle if an accessory give environmental modifiers tracer weapon.ammunition.type
	static _handleVisionAccessory(itemData, actor) {
		if (itemData.ammunition.type === "tracer" && itemData.isActive) {
			SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.range, game.i18n.localize('SR5.AmmunitionTypeTracer'), "ammunitionType", -1, false, false);
			SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.wind, game.i18n.localize('SR5.AmmunitionTypeTracer'), "ammunitionType", -1, false, false);
		}

		if (typeof itemData.accessory === "object") itemData.accessory = Object.values(itemData.accessory);

		for (let a of itemData.accessory) {
			switch (a.name) {
				case "flashLightInfrared":
					if (actor.system.visions.thermographic.isActive && a.isActive && itemData.isActive) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.light, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -1, false, true);
					break;
				case "flashLightLowLight":
					if (actor.system.visions.lowLight.isActive && a.isActive && itemData.isActive) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.light, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -1, false, true);
					break;
				case "imagingScope":
					if (a.isActive && itemData.isActive) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.range, game.i18n.localize(SR5.weaponAccessories[a.name]), "weaponAccessory", -1, false, false);
					break;
				case "smartgunSystemInternal":
				case "smartgunSystemExternal":
					let hasSmartlink = false;
					for (let i of actor.items){
						if ((i.type === "itemAugmentation" || i.type === "itemGear") && i.system.isActive && Object.keys(i.system.customEffects).length){
							for (let [key, value] of Object.entries(i.system.customEffects)){
								if (value.target === 'system.specialProperties.smartlink' && (value.value > 0)) hasSmartlink = true;
							}
						}
					}
					if (a.isActive && itemData.isActive && hasSmartlink) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.wind, game.i18n.localize('SR5.Smartlink'), "weaponAccessory", -1, false, false);
					break;
			}
		}
	}

	////////////////////// AUGMENTATIONS ///////////////////////
	static _handleAugmentation(itemData, actor) {
		let modifierSource, essenceMultiplier, deviceRating, availabilityModifier, priceMultiplier;

		if (itemData.category === "cyberlimbs"){
			let cyberlimbs = itemData.cyberlimbs;
			cyberlimbs.agility.value = cyberlimbs.agility.base + cyberlimbs.agility.customization;
			cyberlimbs.strength.value = cyberlimbs.strength.base + cyberlimbs.strength.customization;
			let cyberlimbsPriceMod = (cyberlimbs.agility.customization + cyberlimbs.strength.customization) * 5000;
			let cyberlimbsAvailabilityMod = (cyberlimbs.agility.customization + cyberlimbs.strength.customization);
			SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.AugmentationCyberlimbs'), 'CustomCyberlimb', cyberlimbsAvailabilityMod);
			SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.AugmentationCyberlimbs'), 'CustomCyberlimb', cyberlimbsPriceMod);
		}

		switch (itemData.grade){
			case "standard":
				essenceMultiplier = 1;
				deviceRating = 2;
				availabilityModifier = 0;
				priceMultiplier = 1;
				break;
			case "alphaware":
				essenceMultiplier = 0.8;
				deviceRating = 3;
				availabilityModifier = 2;
				priceMultiplier = 1.2;
				break;
			case "betaware":
				essenceMultiplier = 0.7;
				deviceRating = 4;
				availabilityModifier = 4;
				priceMultiplier = 1.5;
				break;
			case "deltaware":
				essenceMultiplier = 0.5;
				deviceRating = 5;
				availabilityModifier = 8;
				priceMultiplier = 2.5;
				break;
			case "used":
				essenceMultiplier = 1.25;
				deviceRating = 2;
				availabilityModifier = -4;
				priceMultiplier = 0.75;
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${itemData.grade}' grade in _handleAugmentation()`);
				return;
		}
		itemData.deviceRating = deviceRating;
		modifierSource = `${game.i18n.localize(SR5.augmentationGrades[itemData.grade])}`;
		SR5_EntityHelpers.updateModifier(itemData.availability, modifierSource, "augmentationGrade", availabilityModifier, false, false);
		SR5_EntityHelpers.updateModifier(itemData.price, modifierSource, "augmentationGrade", priceMultiplier, true, false);

		if (actor){
			for (let i of actor.items){
				if (i.system.systemEffects?.length){
					let WeakImmuneSystem = i.system.systemEffects?.find(iEffect => iEffect.value === "doubleEssenceCost")
					if (WeakImmuneSystem) {
						if (i.system.isActive) SR5_EntityHelpers.updateModifier(itemData.essenceCost, i.name, i.type, 2, true, false);
					}
				}
			}
		}

		SR5_EntityHelpers.updateModifier(itemData.essenceCost, modifierSource, "augmentationGrade", (itemData.isRatingBased ? essenceMultiplier * itemData.itemRating : essenceMultiplier), true, false);
		this._handleItemCapacity(itemData);
		this._handleItemPrice(itemData);
		this._handleItemAvailability(itemData);
		this._handleItemEssenceCost(itemData);
	}

	////////////////// SORTS ////////////////////

	//Handle spell
	static _handleSpell(item, actor) {
		let itemData = item.system;
		//Damage based on spell type
		if (itemData.category === "combat") {
			itemData.damageValue.base = 0;
			if (itemData.subCategory === "indirect") {
				SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize('SR5.SpellForce'), "spell", parseInt(itemData.force || 0), false, true);
				SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize('SR5.DiceHits'), "spell", parseInt(itemData.hits || 0), false, true);
				SR5_EntityHelpers.updateValue(itemData.damageValue, 0);
				SR5_EntityHelpers.updateModifier(itemData.armorPenetration, game.i18n.localize('SR5.SpellForce'), "spell", -(itemData.force || 0), false, true);
				SR5_EntityHelpers.updateValue(itemData.armorPenetration);
			} else {
				SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize('SR5.DiceHits'), "spell", (itemData.hits || 0), false, true);
				SR5_EntityHelpers.updateValue(itemData.damageValue, 0);
			}
		}

		//Handle range
		itemData.spellAreaOfEffect.base = 0;
		if (itemData.range === "area" || itemData.category === "detection"){
			SR5_EntityHelpers.updateModifier(itemData.spellAreaOfEffect, game.i18n.localize('SR5.SpellForce'), "spell", parseInt(itemData.force || 0), false, true);
		}
		//Range for detection spell
		if (itemData.category === "detection") {
			SR5_EntityHelpers.updateModifier(itemData.spellAreaOfEffect, game.i18n.localize('SR5.SpellRangeShort'), "spell", actor.system.specialAttributes.magic.augmented.value, true, true);
			if (itemData.spellAreaExtended === true) {
				SR5_EntityHelpers.updateModifier(itemData.spellAreaOfEffect, game.i18n.localize('SR5.ExtendedRange'), "spell", 10, true, true);
			} 
		}
		SR5_EntityHelpers.updateValue(itemData.spellAreaOfEffect, 0);

		//Modified drain value
		itemData.drainValue.base = 0;
		SR5_EntityHelpers.updateModifier(itemData.drainValue, game.i18n.localize('SR5.SpellForce'), "spell", (itemData.force || 0), false, true);
		SR5_EntityHelpers.updateModifier(itemData.drainValue, game.i18n.localize('SR5.SpellDrain'), "drainModifier", itemData.drain.base, false, true);
		if (itemData.fetish){
			SR5_EntityHelpers.updateModifier(itemData.drainValue, game.i18n.localize('SR5.Fetish'), "drainModifier", -2, false, true);
			SR5_EntityHelpers.updateModifier(itemData.drain, game.i18n.localize('SR5.Fetish'), "spell", -2, false, true);
		}
		SR5_EntityHelpers.updateValue(itemData.drainValue, 2);
		SR5_EntityHelpers.updateValue(itemData.drain);

		//Check if spell is sustained by a spirit
		for (let itemSpirit of actor.items){
			if (itemSpirit.type === "itemSpirit" && itemSpirit.system.isBounded){
				for (let s of Object.values(itemSpirit.system.sustainedSpell)){
					if (s.name === item._id) itemData.freeSustain = true;
				}
			}
		}

		//Check if spell is sustrained by a focus
		for (let itemFocus of actor.items){
			if (itemFocus.type === "itemFocus" && itemFocus.system.type === "sustaining"){
				let focusData = itemFocus.system;
				if (focusData.sustainedSpell === item.name && (focusData.itemRating >= itemData.force)) itemData.freeSustain = true;
			}
		}
	}

	//Handle Preparation
	static _handlePreparation(item, actor){
		let itemData = item.system;
		itemData.test.base = 0;
		SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize('SR5.PreparationPotency'), "spell", (itemData.potency || 0), false, true);
		SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize('SR5.Force'), "linkedAttribute", (itemData.force || 0), false, true);
		//Background count modifier
		if (actor.system.magic.bgCount.value < 0) itemData.test.modifiers = itemData.test.modifiers.concat(actor.system.magic.bgCount.modifiers);
		SR5_EntityHelpers.updateDicePool(itemData.test);
	}

	//Handle power point cost
	static _handleAdeptPower(itemData, actor) {
		let firstAttribute, secondAttribute;

		if (itemData.powerPointsCost.isRatingBased) itemData.powerPointsCost.value = itemData.powerPointsCost.base * itemData.itemRating;
		else itemData.powerPointsCost.value = itemData.powerPointsCost.base;

		if (itemData.needRoll && actor) {
			let firstLabel = game.i18n.localize(SR5.allAttributes[itemData.testFirstAttribute]);
			if (itemData.testFirstAttribute){
				if (itemData.testFirstAttribute === "edge" || itemData.testFirstAttribute === "magic" || itemData.testFirstAttribute === "resonance"){
					firstAttribute = actor.system.specialAttributes[itemData.testFirstAttribute].augmented.value;
				} else if (itemData.testFirstAttribute === "rating") {
					firstAttribute = itemData.itemRating;
					firstLabel = game.i18n.localize("SR5.ItemRating");
				} else if (itemData.testFirstAttribute === "running") {
					firstAttribute = actor.system.skills.running.rating.value;
					firstLabel = game.i18n.localize("SR5.Skill");
				} else if (itemData.testFirstAttribute === "leadership") {
					firstAttribute = actor.system.skills.leadership.rating.value;
					firstLabel = game.i18n.localize("SR5.Skill");
				} else firstAttribute = actor.system.attributes[itemData.testFirstAttribute].augmented.value;
			}
	
			let secondLabel = game.i18n.localize(SR5.allAttributes[itemData.testSecondAttribute]);
			if (itemData.testSecondAttribute){
				if (itemData.testSecondAttribute === "edge" || itemData.testSecondAttribute === "magic" || itemData.testSecondAttribute === "resonance"){
					secondAttribute = actor.system.specialAttributes[itemData.testSecondAttribute].augmented.value;
				} else if (itemData.testSecondAttribute === "rating") {
					secondAttribute = itemData.itemRating;
					secondLabel = game.i18n.localize("SR5.ItemRating");
				} else if (itemData.testSecondAttribute === "running") {
					secondAttribute = actor.system.skills.running.rating.value;
					secondLabel = game.i18n.localize("SR5.Skill");
				} else if (itemData.testSecondAttribute === "leadership") {
					secondAttribute = actor.system.skills.leadership.rating.value;
					secondLabel = game.i18n.localize("SR5.Skill");
				} else secondAttribute = actor.system.attributes[itemData.testSecondAttribute].augmented.value;
			}

			itemData.test.base = 0;
			if (firstAttribute) SR5_EntityHelpers.updateModifier(itemData.test, firstLabel, "linkedAttribute", firstAttribute, false, true);
			if (secondAttribute) SR5_EntityHelpers.updateModifier(itemData.test, secondLabel, "linkedAttribute", secondAttribute, false, true);
			//Background count modifier
			if (actor.system.magic.bgCount.value < 0) itemData.test.modifiers = itemData.test.modifiers.concat(actor.system.magic.bgCount.modifiers);
			SR5_EntityHelpers.updateDicePool(itemData.test);
		}

		if (itemData.hasDrain){
			itemData.drainValue.base = 0;
			if (itemData.drainType === "rating") SR5_EntityHelpers.updateModifier(itemData.drainValue, game.i18n.localize('SR5.ItemRating'), "adeptPower", Math.ceil(itemData.itemRating * (itemData.drainMultiplier || 1)), false, true);
			if (itemData.drainType === "magic") {
				if (actor) SR5_EntityHelpers.updateModifier(itemData.drainValue, game.i18n.localize('SR5.Magic'), "adeptPower", Math.ceil(actor.system.specialAttributes.magic.augmented.value * (itemData.drainMultiplier || 1)), false, true);
			}
			SR5_EntityHelpers.updateValue(itemData.drainValue);
		}
	}

	//Handle Martial Art test
	static _handleMartialArt(itemData, actor) {
		let firstAttribute, secondAttribute;

		if (itemData.needRoll && actor) {
			let firstLabel = game.i18n.localize(SR5.allAttributes[itemData.testFirstAttribute]);
			if (itemData.testFirstAttribute){
				if (itemData.testFirstAttribute === "edge" || itemData.testFirstAttribute === "magic" || itemData.testFirstAttribute === "resonance"){
					firstAttribute = actor.system.specialAttributes[itemData.testFirstAttribute].augmented.value;
				} else if (itemData.testFirstAttribute === "body" || itemData.testFirstAttribute === "agility" || itemData.testFirstAttribute === "reaction" || itemData.testFirstAttribute === "strength" || itemData.testFirstAttribute === "willpower" || itemData.testFirstAttribute === "logic" || itemData.testFirstAttribute === "intuition" || itemData.testFirstAttribute === "charisma") {
					firstAttribute = actor.system.attributes[itemData.testFirstAttribute].augmented.value;
				} else {
					firstAttribute = actor.system.skills[itemData.testFirstAttribute].rating.value;
					firstLabel = game.i18n.localize(SR5.skills[itemData.testFirstAttribute]);
				}
			}
	
			let secondLabel = game.i18n.localize(SR5.allAttributes[itemData.testSecondAttribute]);
			if (itemData.testSecondAttribute){
				if (itemData.testSecondAttribute === "edge" || itemData.testSecondAttribute === "magic" || itemData.testSecondAttribute === "resonance"){
					secondAttribute = actor.system.specialAttributes[itemData.testSecondAttribute].augmented.value;
				} else if (itemData.testSecondAttribute === "body" || itemData.testSecondAttribute === "agility" || itemData.testSecondAttribute === "reaction" || itemData.testSecondAttribute === "strength" || itemData.testSecondAttribute === "willpower" || itemData.testSecondAttribute === "logic" || itemData.testSecondAttribute === "intuition" || itemData.testSecondAttribute === "charisma") {
					secondAttribute = actor.system.attributes[itemData.testSecondAttribute].augmented.value;
				} else {
					secondAttribute = actor.system.skills[itemData.testSecondAttribute].rating.value;
					secondLabel = game.i18n.localize(SR5.skills[itemData.testSecondAttribute]);
				}
			}

			itemData.test.base = 0;
			if (firstAttribute) SR5_EntityHelpers.updateModifier(itemData.test, firstLabel, "linkedAttribute", firstAttribute, false, true);
			if (secondAttribute) SR5_EntityHelpers.updateModifier(itemData.test, secondLabel, "linkedAttribute", secondAttribute, false, true);
			SR5_EntityHelpers.updateDicePool(itemData.test);
		}
	}

	////////////////////// RITUALS ///////////////////////
	static _generateSpellList(actor) {
		let spellList = [];
		for (let i of actor.items) {
			if (i.type === "itemSpell" && !i.system.preparation) {
				spellList.push(i);
			}
		}
		return spellList;
	}

	static _handleRitual(item, actor){
		if (item.system.spellLinked){
			let spellLinked = actor.items.find(s => s.id === item.system.spellLinked);
			item.system.spellLinkedType = spellLinked.system.category;
			item.system.spellLinkedName = spellLinked.name;
		}
		if (item.system.durationMultiplier === "force") {
			if (item.system.force > 0) item.system.durationValue = item.system.force;
			else item.system.durationValue = `(${game.i18n.localize('SR5.SpellForceShort')})`;
		}
		if (item.system.durationMultiplier === "netHits") {
			if (item.system.netHits > 0) item.system.durationValue = item.system.netHits;
			else item.system.durationValue = `(${game.i18n.localize('SR5.NetHits')})`;
		}
	}

	////////////////////// FOCUS ///////////////////////
	static _handleFocus(focus) {
		this._handleItemPrice(focus);
		this._handleItemAvailability(focus);
	}

	static _generateSustainFocusSpellList(itemData, actor) {
		let spellList = [];
		for (let i of actor.items) {
			if (i.type === "itemSpell" && i.system.category === itemData.subType && !i.system.preparation) {
				spellList.push(i.name);
			}
		}
		return spellList;
	}

	static _generateWeaponFocusWeaponList(actor) {
		let weaponList = [];
		for (let i of actor.items) {
			if (i.type === "itemWeapon" && i.system.category === "meleeWeapon") {
				if (i.system.systemEffects.length) continue;
				let weapon = {
					"name": i.name,
					"id": i.id,
				}
				weaponList.push(weapon);
			}
		}
		return weaponList;
	}

	static async _checkIfWeaponIsFocus(item, actor){
		let focus = actor.items.find(w => w.system.linkedWeapon === item.id);
		if (focus) item.system.isLinkedToFocus = true;
		else item.system.isLinkedToFocus = false;

		//Remove old effect if still present
		if (!item.system.isLinkedToFocus){
			let focusEffect = item.system.itemEffects.find(e => e.target === "system.weaponSkill");
			if (focusEffect){
				let arrayEffects = foundry.utils.duplicate(item.system.itemEffects);
				arrayEffects= arrayEffects.filter(e => e.target !== "system.weaponSkill");
				item.system.itemEffects = arrayEffects;
				item.system.isMagical= false;
			}
		}
	}

	static async _handleWeaponFocus(item, actor){
		let focus = actor.items.find(w => w.system.linkedWeapon === item._id);
		if (!focus) return;

		//check if focus effect is present. Add it if not.
		let focusEffect = item.system.itemEffects.find(e => e.ownerItem === focus.id);
		if (focus.system.isActive) item.system.isMagical = true;
		if (focus.system.isActive && !focusEffect){
			let effect = {
				"name": `${focus.name}`,
				"target": "system.weaponSkill",
				"wifi": false,
				"transfer": false,
				"ownerItem": focus.id,
				"type": "value",
				"value": focus.system.itemRating,
				"multiplier": 1
			}
			item.system.itemEffects.push(effect);
		}
		//remove effect if focus is off
		if (!focus.system.isActive && focusEffect){
			let arrayEffects = foundry.utils.duplicate(item.system.itemEffects);
			arrayEffects= arrayEffects.filter(e => e.ownerItem !== focus.id);
			item.system.itemEffects = arrayEffects;
			item.system.isMagical = false;
		}
	}

	////////////////////// DECK & PROGRAMMES ///////////////////////
	static _handleCommlink(itemData) {
		switch (itemData.module){
			case "standard":
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.ModuleStandardSim'), 'module', 100);
				break;
			case "hotsim":
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.ModuleHotSim'), 'module', 250);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.ModuleHotSim'), 'module', 4);
				break;
			default:
				SR5_SystemHelpers.srLog(3,"_handleCommlink",`Unknown module : '${itemData.module}'`);
		}
	}

	//Handle complex form
	static _handleComplexForm(item, actor) {
		// Fading calculation
		item.system.fadingValue = item.system.fadingModifier + (item.system.level || 0);
		if (item.system.fadingValue < 2) item.system.fadingValue = 2;

		//Check if complex form is sustained by a sprite
		for (let i of actor.items){
			if (i.type === "itemSprite" && i.system.isRegistered){
				for (let c of Object.values(i.system.sustainedComplexForm)){
					if (c.name === item.id) item.system.freeSustain = true;
				}
			}
		}
	}

	//handle PAN
	static _handlePan(item){
		item.system.pan.current = 0;
		for (let d of item.system.pan.content) item.system.pan.current ++; 
	}

	////////////////////// SIN /////////////////////////////////
	static _handleSinLicense(itemData) {
		itemData.price.base = 2500 * itemData.itemRating;
		itemData.availability.base = 3 * itemData.itemRating;
		itemData.legality = "F";
		for (let l of itemData.license) {
			l.price = l.rating * 200;
			l.availability = l.rating * 3;
			l.legality = "F";
		}
	}

////////////////////// STYLE DE VIE  ///////////////////////
  // Calcul le loyer et les attributs des styles de vie
  static _handleLifeStyle(itemData) {
    switch (itemData.type) {
      case "luxury":
        itemData.price.base = 100000;
        itemData.comforts.base = 5;
        itemData.comforts.max = 7;
        itemData.security.base = 5;
        itemData.security.max = 8;
        itemData.neighborhood.base = 5;
        itemData.neighborhood.max = 7;
        itemData.point.base = 12;
        itemData.level = 6;
        break;
      case "high":
        itemData.price.base = 10000;
        itemData.comforts.base = 4;
        itemData.comforts.max = 6;
        itemData.security.base = 4;
        itemData.security.max = 6;
        itemData.neighborhood.base = 5;
        itemData.neighborhood.max = 6;
        itemData.point.base = 6;
        itemData.level = 5;
        break;
      case "medium":
        itemData.price.base = 5000;
        itemData.comforts.base = 3;
        itemData.comforts.max = 4;
        itemData.security.base = 3;
        itemData.security.max = 4;
        itemData.neighborhood.base = 4;
        itemData.neighborhood.max = 5;
        itemData.point.base = 4;
        itemData.level = 4;
        break;
      case "low":
        itemData.price.base = 2000;
        itemData.comforts.base = 2;
        itemData.comforts.max = 3;
        itemData.security.base = 2;
        itemData.security.max = 3;
        itemData.neighborhood.base = 2;
        itemData.neighborhood.max = 3;
        itemData.point.base = 3;
        itemData.level = 3;
        break;
      case "squatter":
        itemData.price.base = 500;
        itemData.comforts.base = 1;
        itemData.comforts.max = 2;
        itemData.security.base = 1;
        itemData.security.max = 2;
        itemData.neighborhood.base = 1;
        itemData.neighborhood.max = 2;
        itemData.point.base = 2;
        itemData.level = 2;
        break;
      case "streets":
        itemData.price.base = 0;
        itemData.comforts.base = 0;
        itemData.comforts.max = 1;
        itemData.security.base = 0;
        itemData.security.max = 1;
        itemData.neighborhood.base = 0;
        itemData.neighborhood.max = 1;
        itemData.point.base = 2;
        itemData.level = 1;
        break;
      case "boltHole":
          itemData.price.base = 1000;
          itemData.comforts.base = 1;
          itemData.comforts.max = 2;
          itemData.security.base = 1;
          itemData.security.max = 4;
          itemData.neighborhood.base = 1;
          itemData.neighborhood.max = 4;
          itemData.point.base = 4;
          itemData.level = 0;
          if (itemData.options.map(c => c.name).indexOf("notAHome") == -1) itemData.options.push({name: "notAHome"});
        break;
      case "traveler":
          itemData.price.base = 3000;
          itemData.comforts.base = 2;
          itemData.comforts.max = 4;
          itemData.security.base = 2;
          itemData.security.max = 4;
          itemData.neighborhood.base = 2;
          itemData.neighborhood.max = 4;
          itemData.level = 0;
      break;
      case "commercial":
          itemData.price.base = 8000;
          itemData.comforts.base = 3;
          itemData.comforts.max = 4;
          itemData.security.base = 2;
          itemData.security.max = 4;
          itemData.neighborhood.base = 4;
          itemData.neighborhood.max = 6;
          itemData.point.base = 4;
          itemData.level = 7;
      break;
      default:
        itemData.price.base = 0;
        itemData.level = 0;
    }

    let priceMultiplier = 1, lists = SR5;
    for (let option of itemData.options) {
      switch (option.name){
        case "specialWorkArea":
          option.type = 'positiveOption';
          option.price = 1000;
          SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
          break;
        case "cramped":          
          option.type = 'negativeOption';
          option.price = -itemData.price.base * 0.1;
          SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
          break;
        case "difficultToFind":          
          option.type = 'negativeOption';
          option.price = itemData.price.base * 0.1;
          option.point = 1;
          SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
          SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.point);
          break;
        case "extraSecure":
          option.price = itemData.price.base * 0.2;
          option.type = 'positiveOption';
          SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
          break;
        case "dangerousArea":
          priceMultiplier -= 0.2;
          option.price = -itemData.price.base * 0.2;
          option.type = 'negativeOption';
          SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
          break;
        case "armory":
            option.type = 'asset';
            option.level = 'high';
            option.point = -2;
            if (itemData.level < 5) {
              option.price = 1000;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "cleaningServiceStandard":
            option.level = 'high';
            option.point = -1;
            option.type = 'service';
            if (itemData.level < 5) {              
              option.price = 1000;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "cleaningServiceMage":
          option.level = 'high';
          option.type = 'service';
          option.point = -1;
          if (itemData.level < 5) {              
            option.price = 1000;
            SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
          }
          SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "cleaningServicePollution":
          option.level = 'high';
          option.point = -1;
          option.type = 'service';
          if (itemData.level < 5) {              
            option.price = 1000;
            SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
          }
          SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "discreetCleaningService":
          option.level = 'high';
          option.point = -4;
          option.type = 'service';
          if (itemData.level < 5) {              
            option.price = 10000;
            SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
          }
          SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "discreetDeliveryman":
            option.price = 100;
            option.type = 'service';
            option.point = -3;
            SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "garageAirplane":
            option.level = 'luxury';
            option.type = 'asset';
            option.point = -4;
            if (itemData.level < 6) {
              option.price = 20000;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, -4);
          break;
        case "garageBoat":
            option.level = 'high';
            option.point = -3;
            option.type = 'asset';
            if (itemData.level < 5) {
              option.price = 5000;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "garageSmallCar":
            option.level = 'medium';
            option.type = 'asset';
            option.point = -1;
            if (itemData.level < 4) {              
              option.price = 50;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "garageLargeCar":
            option.level = 'medium';
            option.point = -2;
            option.type = 'asset';
            if (itemData.level < 4) {
              option.price = 100;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "garageHelicopter":
            option.level = 'luxury';
            option.point = -4;
            option.type = 'asset';
            if (itemData.level < 6) {
              option.price = 10000;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "greenHouse":
            option.level = 'high';
            option.point = -2;
            option.type = 'asset';
            if (itemData.level < 5) {              
              option.price = 500;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "gridSubscription":
            option.level = 'medium';
            option.point = -1;
            option.type = 'asset';
            if (itemData.level < 4) {
              option.price = 50;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "gym":
            option.level = 'medium';
            option.point = -2;
            option.type = 'asset';
            if (itemData.level < 4) {
              option.price = 300;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "indoorArboretum":
            option.level = 'high';
            option.point = -2;
            option.type = 'asset';
            if (itemData.level < 5) {
              option.price = 500;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "localBarPatron":
            option.level = 'low';
            option.point = -1;
            option.type = 'outing';
            if (itemData.level < 3) {              
              option.price = 25;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "merchandiseGoods":
            option.level = 'commercial';
            option.point = -1;
            option.type = 'service';
            if (itemData.level < 7) {              
              option.price = 10000;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "merchandisePawnShop":
            option.level = 'commercial';
            option.point = -2;
            option.type = 'service';
            if (itemData.level < 7) {              
              option.price = 10000;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "merchandiseUsedGoods":
            option.level = 'commercial';
            option.point = -2;
            option.type = 'service';
            if (itemData.level < 7) {              
              option.price = 10000;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "panicRoom":
            option.level = 'high';
            option.point = -2;
            option.type = 'asset';
            if (itemData.level < 5) {
              option.price = 1000;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "patronConcerts":
            option.level = 'medium';
            option.point = -1;
            option.type = 'outing';
            if (itemData.level < 4) {              
              option.price = 100;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "patronPrivateClub":
            option.level = 'high';
            option.point = -1;
            option.type = 'outing';
            if (itemData.level < 5) {
              option.price = 200;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "patronPublicEntertainment":
            option.level = 'low';
            option.point = -1;
            option.type = 'outing';
            if (itemData.level < 3) {              
              option.price = 75;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "patronThemeParks":
            option.level = 'medium';
            option.point = -1;
            option.type = 'outing';
            if (itemData.level < 4) {              
              option.price = 100;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "privateRoom":
            option.level = 'squatter';
            option.point = -1;
            option.type = 'asset';
            if (itemData.level < 2) {
              option.price = 20;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "publicTransportation":
            option.level = 'low';
            option.point = -1;
            option.type = 'service';
            if (itemData.level < 3) {
              option.price = 50;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "railwayPass":
            option.level = 'medium';
            option.point = -1;
            option.type = 'service';
            if (itemData.level < 4) {
              option.price = 75;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "shootingRange":
            option.level = 'high';
            option.point = -2;
            option.type = 'asset';
            if (itemData.level < 5) {
              option.price = 500;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "soyProcessingUnit":
            option.level = 'medium';
            option.point = -1;
            option.type = 'asset';
            if (itemData.level < 4) {
              option.price = 20;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "sportsCourt":
            option.level = 'high';
            option.point = -2;
            option.type = 'asset';
            if (itemData.level < 5) {
              option.price = 300;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "swimmingPool":
            option.level = 'medium';
            option.point = -1;
            option.type = 'asset';
            if (itemData.level < 4) {
              option.price = 100;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "walkinFreezer":
            option.level = 'commercial';
            option.point = -1;
            option.type = 'asset';
            if (itemData.level < 7) {
              option.price = 1000;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "workshopFacility":
            option.level = 'medium';
            option.point = -2;
            option.type = 'asset';
            if (itemData.level < 4) {
              option.price = 2500;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);x
          break;
        case "yard":
            option.level = 'low';
            option.point = -2;
            option.type = 'asset';
            if (itemData.level < 3) {
              option.price = 50;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "zenDenBatCave":
            option.level = 'medium';
            option.point = -2;
            option.type = 'asset';
            if (itemData.level < 4) {
              option.price = 100;
              SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            }
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
          case "angryDrunkReputation":
            option.point = 1;
            option.type = 'negativeOption';
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "corporateOwned":
            option.point = -3;
            itemData.comforts.max += 1;
            itemData.security.max += 1;
            option.type = 'positiveOption';
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "hotelCalifornia":
            option.point = 1;
            option.type = 'negativeOption';
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "maidIsOut":
            option.point = 1;
            option.type = 'negativeOption';
            itemData.comforts.max -= 1;
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "notAHome":
            option.point = 1;
            itemData.comforts.max -= 1;
            option.type = 'negativeOption';
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "onlyGoodThingAbout":
            option.type = 'positiveOption';
          break;
        case "safehouse":
            option.price = 500;
            option.type = 'positiveOption';
            SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            break;
        case "safetyThird":
            option.point = 1;
            option.type = 'negativeOption';
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "thrifty":
            option.price = -1000;
            option.point = -2;
            option.type = 'negativeOption';
            SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "wZone":
            option.point = 1;
            option.type = 'negativeOption';
            SR5_EntityHelpers.updateModifier(itemData.neighborhood, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, -1);
            SR5_EntityHelpers.updateModifier(itemData.point, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "addComforts":
            option.price = itemData.price.base * 0.1;
            option.point = -1;
            option.type = 'modification';
            if (itemData.type == "streets") {
              option.price = 50;
            }
            SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            SR5_EntityHelpers.updateModifier(itemData.comforts, 'addComforts', `${game.i18n.localize('SR5.LifeStyleOptions')}`, 1);
            SR5_EntityHelpers.updateModifier(itemData.point, 'addComforts', `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "addSecurity":
          option.price = itemData.price.base * 0.1;
          option.point = -1;
          option.type = 'modification';
          if (itemData.type == "streets") {
              option.price = 50;
            }
            SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            SR5_EntityHelpers.updateModifier(itemData.security, 'addSecurity', `${game.i18n.localize('SR5.LifeStyleOptions')}`, 1);
            SR5_EntityHelpers.updateModifier(itemData.point, 'addSecurity', `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        case "addNeighborhood":
            ooption.price = itemData.price.base * 0.1;
            option.point = -1;
            option.type = 'modification';
            if (itemData.type == "streets") {
              option.price = 50;
            }
            SR5_EntityHelpers.updateModifier(itemData.price, `${game.i18n.localize(lists.lifestyleOptions[option.name])}`, `${game.i18n.localize('SR5.LifeStyleOptions')} (${game.i18n.localize(lists.lifestyleOptionsTypes[option.type])})`, option.price);
            SR5_EntityHelpers.updateModifier(itemData.neighborhood, 'addNeighborhood', `${game.i18n.localize('SR5.LifeStyleOptions')}`, 1);
            SR5_EntityHelpers.updateModifier(itemData.point, 'addNeighborhood', `${game.i18n.localize('SR5.LifeStyleOptions')}`, option.point);
          break;
        default:

          SR5_SystemHelpers.srLog(1, `Unknown '${option.name}' option in _handleLifeStyle()`);
        }

      if (option.name){
        //Get the game info and put it in the array
        let nameString = option.name.charAt(0).toUpperCase() + option.name.slice(1);
        let gameEffectString = 'SR5.LifeStyleOption'+ `${nameString}` + '_GE';
        option.gameEffects = game.i18n.localize(gameEffectString);
        }

      }

      SR5_EntityHelpers.updateValue(itemData.comforts,0,itemData.comforts.max);
      SR5_EntityHelpers.updateValue(itemData.security,0,itemData.comforts.max);
      SR5_EntityHelpers.updateValue(itemData.neighborhood,0,itemData.comforts.max);
      SR5_EntityHelpers.updateValue(itemData.point);

      if (itemData.neighborhood.value == "0") {
        itemData.neighborhood.zone = "Z";
        itemData.neighborhood.gameEffects = game.i18n.localize('SR5.LifeStyleZone_Z');
      }    
      if (itemData.neighborhood.value == "1") {
        itemData.neighborhood.zone = "E";
        itemData.neighborhood.gameEffects = game.i18n.localize('SR5.LifeStyleZone_E');
      }    
      if (itemData.neighborhood.value == "2") {
        itemData.neighborhood.zone = "D";
        itemData.neighborhood.gameEffects = game.i18n.localize('SR5.LifeStyleZone_D');
      }    
      if (itemData.neighborhood.value == "3") {
        itemData.neighborhood.zone = "C";
        itemData.neighborhood.gameEffects = game.i18n.localize('SR5.LifeStyleZone_C');
      }    
      if (itemData.neighborhood.value == "4") {
        itemData.neighborhood.zone = "B";
        itemData.neighborhood.gameEffects = game.i18n.localize('SR5.LifeStyleZone_B');
      }    
      if (itemData.neighborhood.value == "5") {
        itemData.neighborhood.zone = "A";
        itemData.neighborhood.gameEffects = game.i18n.localize('SR5.LifeStyleZone_A');
      }    
      if (itemData.neighborhood.value == "6") {
        itemData.neighborhood.zone = "AA";
        itemData.neighborhood.gameEffects = game.i18n.localize('SR5.LifeStyleZone_AA');
      }    
      if (itemData.neighborhood.value == "7") {
        itemData.neighborhood.zone = "AAA";
        itemData.neighborhood.gameEffects = game.i18n.localize('SR5.LifeStyleZone_AAA');
      }    

      itemData.comforts.gameEffects = game.i18n.localize('SR5.LifestyleComforts_GE');
      itemData.security.gameEffects = game.i18n.localize('SR5.LifestyleSecurity_GE');

  }

	////////////////////// VEHICULES  ///////////////////////
	static _handleVehicle(itemData) {
		for (let vehicleMod of itemData.vehiclesMod){
			SR5_EntityHelpers.updateModifier(itemData.price, `${vehicleMod.name}`, 'vehicleMod', vehicleMod.system.price.value);
		}

		if (itemData.type === "drone") itemData.deviceRating = itemData.attributes.pilot;
		else itemData.deviceRating = 2;
	}

	static _handleVehicleSlots(itemData) {
		let slots = itemData.attributes.body ;
		itemData.modificationSlots.powerTrain = slots ;
		itemData.modificationSlots.protection = slots ;
		itemData.modificationSlots.weapons = slots ;
		itemData.modificationSlots.body = slots ;
		itemData.modificationSlots.electromagnetic = slots ;
		itemData.modificationSlots.cosmetic = slots ;
	}

	static _handleWeaponMounted(item) {
		let itemData = item.system, wm = itemData.weaponMount;
		switch (wm.size) {
			case "light":
				itemData.slots.base = 1;
				itemData.threshold.base = 4;
				itemData.tools = "kit";
				itemData.skill = "armorer";
				itemData.availability.base = 6;
				itemData.legality = "F";
				itemData.price.base = 750;
				break;
			case "standard":
				itemData.slots.base = 2;
				itemData.threshold.base = 6;
				itemData.tools = "shop";
				itemData.skill = "armorer";
				itemData.availability.base = 8;
				itemData.legality = "F";
				itemData.price.base = 1500;
				break;
			case "heavy":
				itemData.slots.base = 4;
				itemData.threshold.base = 10;
				itemData.tools = "shop";
				itemData.skill = "armorer";
				itemData.availability.base = 12;
				itemData.legality = "F";
				itemData.price.base = 4000;
				break;
			default:
		}

		switch (wm.visibility) {
			case "external":
			break;
			case "internal":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), "vehicleMod", 2);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), "vehicleMod", 6);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), "vehicleMod", 2);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), "vehicleMod", 1500);
				if (itemData.tools == "kit") itemData.tools = "shop";
				break;
			case "concealed":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), "vehicleMod", 4);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), "vehicleMod", 10);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), "vehicleMod", 4);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), "vehicleMod", 4000);
				if (itemData.tools == "kit") itemData.tools = "shop";
				break;
			default:
		}

		switch (wm.flexibility) {
			case "fixed":
				break;
			case "flexible":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), "vehicleMod", 1);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), "vehicleMod", 4);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), "vehicleMod", 2);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), "vehicleMod", 2000);
				if (itemData.tools == "kit") itemData.tools = "shop";
				break;
			case "turret":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), "vehicleMod", 2);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), "vehicleMod", 12);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), "vehicleMod", 6);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), "vehicleMod", 5000);
				itemData.tools = "facility";
				break;
			default:
		}
		switch (wm.control) {
			case "remote":
				itemData.surname = " (" + game.i18n.localize(SR5.WeaponMountSize[wm.size]) + ", " + game.i18n.localize(SR5.WeaponMountVisibility[wm.visibility]) + ", " + game.i18n.localize(SR5.WeaponMountFlexibility[wm.flexibility]) + ", " + game.i18n.localize(SR5.WeaponMountControl[wm.control]) + ")";
				break;
			case "manual":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), "vehicleMod", 1);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), "vehicleMod", 4);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), "vehicleMod", 1);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), "vehicleMod", 500);
				if (itemData.tools == "kit") itemData.tools = "shop";
				itemData.surname = " (" + game.i18n.localize(SR5.WeaponMountSize[wm.size]) + ", " + game.i18n.localize(SR5.WeaponMountVisibility[wm.visibility]) + ", " + game.i18n.localize(SR5.WeaponMountFlexibility[wm.flexibility]) + ", " + game.i18n.localize(SR5.WeaponMountControl[wm.control]) + ")";
				break;
			case "armoredManual":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), "vehicleMod", 2);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), "vehicleMod", 6);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), "vehicleMod", 4);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), "vehicleMod", 1500);
				if (itemData.tools == "kit") itemData.tools = "shop";
				itemData.surname = " (" + game.i18n.localize(SR5.WeaponMountSize[wm.size]) + ", " + game.i18n.localize(SR5.WeaponMountVisibility[wm.visibility]) + ", " + game.i18n.localize(SR5.WeaponMountFlexibility[wm.flexibility]) + ", " + game.i18n.localize(SR5.WeaponMountControl[wm.control]) + ")";
				break;
			default:
		}

		SR5_EntityHelpers.updateValue(itemData.slots, 0);
		SR5_EntityHelpers.updateValue(itemData.threshold, 0);
		SR5_EntityHelpers.updateValue(itemData.availability, 0);
		SR5_EntityHelpers.updateValue(itemData.price, 0);
	}

	static _resetWeaponMounted(itemData) {
		itemData.weaponMount.size = "";
		itemData.weaponMount.visibility = "";
		itemData.weaponMount.flexibility = "";
		itemData.weaponMount.control = "";
		itemData.mountedWeapon = "";
		itemData.mountedWeaponName = "";
	}

	static _generateWeaponMountWeaponList(itemData, actor) {
		let weaponList = [];
		for (let i of actor.items) {
			if (i.type === "itemWeapon" && i.system.category === "rangedWeapon") { 
				if (i.system.systemEffects.length) continue;
				let weapon = {
					"name": i.name,
					"id": i.id,
				}
				weaponList.push(weapon);  
			}
		}
		itemData.weaponChoices = weaponList;
		return weaponList;
	}

	static async _checkIfWeaponIsMount(item, actor){
		let mount = actor.items.find(m => m.system.mountedWeapon === item.id);
		if (mount) item.system.isLinkedToMount = true;
		else item.system.isLinkedToMount = false;
	}

	static async _handleWeaponMount(item, actor){
		let mount = actor.items.find(m => m.system.mountedWeapon === item._id);
		if (mount) {
			if (mount.system.isActive) item.system.isUsedAsMount = true; 
		}
	} 

	static _handleSlotsMultiplier(itemData) {
		let multiplier;
		switch (itemData.slots.multiplier) {
			case "rating":
				multiplier = itemData.itemRating;
				break;
			case "capacity":
				multiplier = itemData.capacity.value;
				break;
			default:
		}
		if (itemData.slots.multiplier) {
			SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize(SR5.valueMultipliers[itemData.slots.multiplier]), "multiplier", multiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(itemData.slots, 0);
	}

	static _handleThresholdMultiplier(itemData) {
		let multiplier;
		switch (itemData.threshold.multiplier) {
			case "rating":
				multiplier = itemData.itemRating;
				break;
			case "capacity":
				multiplier = itemData.capacity.value;
				break;
		}
		if (itemData.threshold.multiplier) {
			SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize(SR5.valueMultipliers[itemData.threshold.multiplier]), "multiplier", multiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(itemData.threshold, 0);
	}

	////////////////////// SPIRITS  //////s////////////////
	static _handleSpirit(itemData) {
		for (let att of Object.keys(itemData.attributes)) {
			itemData.attributes[att] = itemData.itemRating;
		}
		switch (itemData.type) {
			case "air":
			case "noxious":
				itemData.attributes.body += -2;
				itemData.attributes.agility += 3;
				itemData.attributes.reaction += 4;
				itemData.attributes.strength += -3;
				itemData.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "running", "flight");
				break;
			case "anarch":
				itemData.attributes.body += 2;
				itemData.attributes.agility += -1;
				itemData.attributes.reaction += +1;
				itemData.attributes.strength += -1;
				itemData.skill.push("assensing", "automatics", "blades", "clubs", "con", "demolitions", "disguise", "forgery", "gymnastics", "impersonation", "locksmith", "palming", "perception", "pistols", "sneaking", "throwingWeapons", "unarmedCombat");
				break;
			case "abomination":
				itemData.attributes.body += -1;
				itemData.attributes.agility += 1;
				itemData.attributes.strength += 2;
				itemData.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "running", "gymnastics");
				break;
			case "beasts":
				itemData.attributes.body += 2;
				itemData.attributes.agility += 1;
				itemData.attributes.strength += 2;
				itemData.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
				break;
			case "blood":
				itemData.attributes.body += 2;
				itemData.attributes.agility += 2;
				itemData.attributes.strength += 2;
				itemData.attributes.logic += -1;
				itemData.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
				break;
			case "earth":
			case "barren":
				itemData.attributes.body += 4;
				itemData.attributes.agility += -2;
				itemData.attributes.reaction += -1;
				itemData.attributes.strength += 4;
				itemData.attributes.logic += -1;
				itemData.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat");
				break;
			case "fire":
			case "nuclear":
				itemData.attributes.body += 1;
				itemData.attributes.agility += 2;
				itemData.attributes.reaction += 3;
				itemData.attributes.strength += -2;
				itemData.attributes.intuition += 1;
				itemData.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "flight");
				break;
			case "guardian":
				itemData.attributes.body += 1;
				itemData.attributes.agility += 2;
				itemData.attributes.reaction += 3;
				itemData.attributes.strength += 2;
				itemData.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "clubs", "blades");
				break;
			case "guidance":
				itemData.attributes.body += 3;
				itemData.attributes.agility += -1;
				itemData.attributes.reaction += 2;
				itemData.attributes.strength += 1;
				itemData.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
				break;
			case "insectCaretaker":
				itemData.attributes.agility += 1;
				itemData.attributes.reaction += 1;
				itemData.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "spellcasting", "leadership");
				break;
			case "insectNymph":
				itemData.attributes.body += -1;
				itemData.attributes.reaction += 3;
				itemData.attributes.strength += -1;
				itemData.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "spellcasting", "gymnastics");
				break;
			case "insectQueen":
				itemData.attributes.body += 5;
				itemData.attributes.agility += 3;
				itemData.attributes.reaction += 4;
				itemData.attributes.strength += 5;
				itemData.attributes.willpower += 1;
				itemData.attributes.logic += 1;
				itemData.attributes.intuition += 1;
				itemData.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "counterspelling", "con", "gymnastics", "spellcasting", "leadership", "negociation");
				break;
			case "insectScout":
				itemData.attributes.agility += 2;
				itemData.attributes.reaction += 2;
				itemData.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "sneaking", "gymnastics");
				break;
			case "insectSoldier":
				itemData.attributes.body += 3;
				itemData.attributes.agility += 1;
				itemData.attributes.reaction += 1;
				itemData.attributes.strength += 3;
				itemData.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "exoticRangedWeapon", "counterspelling", "gymnastics");
				break;
			case "insectWorker":
				itemData.attributes.strength += 1;
				itemData.skill.push("astralCombat", "assensing", "perception", "unarmedCombat");
				break;
			case "man":
				itemData.attributes.body += 1;
				itemData.attributes.reaction += 2;
				itemData.attributes.strength += -2;
				itemData.attributes.intuition += 1;
				itemData.skill.push("astralCombat", "assensing", "perception", "running", "unarmedCombat", "spellcasting", "swimming");
				break;
			case "plague":
				itemData.attributes.reaction += 2;
				itemData.attributes.intuition += -1;
				itemData.attributes.strength += -2;
				itemData.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "spellcasting");
				break;
			case "plant":
				itemData.attributes.body += 2;
				itemData.attributes.agility += -1;
				itemData.attributes.strength += 1;
				itemData.attributes.logic += -1;
				itemData.skill.push("astralCombat", "assensing", "perception", "artisan", "unarmedCombat");
				break;
			case "shadowMuse":
			case "shadowNightmare":
			case "shadowShade":
			case "shadowSuccubus":
			case "shadowWraith":
				itemData.attributes.agility += 3;
				itemData.attributes.reaction += 2;
				itemData.attributes.willpower += 1;
				itemData.attributes.intuition += 1;
				itemData.attributes.charisma += 2;
				itemData.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "con", "gymnastics", "intimidation");
				break;
			case "shedim":
				itemData.attributes.reaction += 2;
				itemData.attributes.strength += 1;
				itemData.skill.push("astralCombat", "assensing", "perception", "unarmedCombat");
				break;
			case "shedimMaster":
				itemData.attributes.reaction += 2;
				itemData.attributes.strength += 1;
				itemData.attributes.willpower += 1;
				itemData.attributes.logic += 1;
				itemData.attributes.intuition += 1;
				itemData.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "counterspelling", "gymnastics", "spellcasting");
				break;
			case "sludge":
				itemData.attributes.body += 1;
				itemData.attributes.agility += 1;
				itemData.attributes.reaction += 2;
				itemData.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat");
				break;
			case "task":
				itemData.attributes.reaction += 2;
				itemData.attributes.strength += 2;
				itemData.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
				break;
			case "water":
				itemData.attributes.agility += 1;
				itemData.attributes.reaction += 2;
				itemData.attributes.charisma += 1;
				itemData.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "swimming");
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${itemData.type}' type in _handleSpirit()`);
		}

		for (let att of Object.keys(itemData.attributes)) {
			if (itemData.attributes[att] < 1) itemData.attributes[att] = 1;
		}
	}

	static _handlePower(itemData, actor) {
		let firstAttribute, secondAttribute;
		if (itemData.testFirstAttribute){
			if (actor.type === "actorSpirit" && itemData.testFirstAttribute === "edge"){
				itemData.testFirstAttribute = "magic"; 				
			}
			if (itemData.testFirstAttribute === "edge" || itemData.testFirstAttribute === "magic" || itemData.testFirstAttribute === "resonance"){
				firstAttribute = actor.system.specialAttributes[itemData.testFirstAttribute].augmented.value;
			} else {
				firstAttribute = actor.system.attributes[itemData.testFirstAttribute].augmented.value;
			}
		}

		if (itemData.testSecondAttribute){
			if (actor.type === "actorSpirit" && itemData.testSecondAttribute === "edge"){
				itemData.testSecondAttribute = "magic"; 				
			}
			if (itemData.testSecondAttribute === "edge" || itemData.testSecondAttribute === "magic" || itemData.testSecondAttribute === "resonance"){
				secondAttribute = actor.system.specialAttributes[itemData.testSecondAttribute].augmented.value;
			} else {
				secondAttribute = actor.system.attributes[itemData.testSecondAttribute].augmented.value;
			}
		}
		itemData.test.base = 0;
		if (firstAttribute) SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize(SR5.allAttributes[itemData.testFirstAttribute]), "linkedAttribute", firstAttribute, false, true);
		if (secondAttribute) SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize(SR5.allAttributes[itemData.testSecondAttribute]), "linkedAttribute", secondAttribute, false, true);
		//Background count modifier
		if (actor.system.magic.bgCount.value < 0) itemData.test.modifiers = itemData.test.modifiers.concat(actor.system.magic.bgCount.modifiers);
		SR5_EntityHelpers.updateDicePool(itemData.test);
	}

	static _handleSpritePower(itemData, actor) {
		itemData.test.base = 0;
		let skill = 0;
		if (itemData.testSkill) {
			skill = actor.system.skills[itemData.testSkill].rating.value;
			SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize(SR5.skills[itemData.testSkill]), "skillRating", skill, false, true);
			SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize('SR5.Level'), "linkedAttribute", actor.system.level, false, true);
		}
		SR5_EntityHelpers.updateDicePool(itemData.test);
	}

	static async _checkIfAccessoryIsPlugged (item, actor){
		for (let i of actor.items){
			if (i.type === "itemGear" || i.type === "itemArmor" || i.type === "itemAugmentation") {
				if (Object.keys(i.system.accessory).length){
					if (typeof i.system.accessory === "object") i.system.accessory = Object.values(i.system.accessory);
					let accessory = i.system.accessory.find(a => a._id === item._id)
					if (accessory){
						item.system.wirelessTurnedOn = i.system.wirelessTurnedOn;
						item.system.isPlugged = true;
						return;
					}      
				} else {
					item.system.isPlugged = false;
				}
			}
		}
	}

	static _updatePluggedAccessory(itemData, actor){
		for (let a of itemData.accessory){
			if (a != ''){
				let item = actor.items.find(i => i.id === a._id);
				let index = itemData.accessory.findIndex(b => b._id === a._id);
				if (!item) continue;
				item = item.toObject(false);
				itemData.accessory[index] = item;
			}
		}
	}

	static generateTestDicepool(itemData){
		itemData.test.base = 0;
		SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize("SR5.ItemRating"), "linkedAttribute", itemData.itemRating, false, true);
		if (itemData.test.type === "ratingX2") SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize("SR5.ItemRating"), "linkedAttribute", itemData.itemRating, false, true);
		SR5_EntityHelpers.updateDicePool(itemData.test);
	}

	static applyItemEffects(item){
		for (let customEffect of Object.values(item.system.itemEffects)) {
			let skipCustomEffect = false,
				cumulative = customEffect.cumulative,
				isMultiplier = false;

			if (!customEffect.target || !customEffect.type) {
				SR5_SystemHelpers.srLog(3, `Empty custom effect target or type in applyItemEffects()`, customEffect);
				skipCustomEffect = true;
			}

			// For effect depending on wifi
			if (customEffect.wifi && !item.system.wirelessTurnedOn) skipCustomEffect = true;

			SR5_SystemHelpers.srLog(3, ` item ==> '${JSON.stringify(item)}' in applyItemEffects()`);

			let targetObject = SR5_EntityHelpers.resolveObjectPath(customEffect.target, item);
			if (targetObject === null) skipCustomEffect = true;

			SR5_SystemHelpers.srLog(3, ` item.type ==> '${item.type}' , customEffect ==> '${JSON.stringify(customEffect)}' applyItemEffects()`);

			if (item.type === "itemMartialArt" && customEffect.type === "boolean") {
				let booleanValue;
				if (customEffect.value === "true") booleanValue = true;
				else booleanValue = false;
				foundry.utils.setProperty(item, customEffect.target, booleanValue);
				SR5_SystemHelpers.srLog(3, ` customEffect.target ==> '${customEffect.target}' , booleanValue ==> '${booleanValue}', item.system ==> '${JSON.stringify(item.system)}' applyItemEffects()`);
			}

			SR5_SystemHelpers.srLog(3, ` targetObject ==> '${JSON.stringify(targetObject)}' in applyItemEffects()`);

			if (!skipCustomEffect) {    
				if (!customEffect.multiplier) customEffect.multiplier = 1;

				//Modifier type
				switch (customEffect.type) {
					case "rating":
						customEffect.value = (item.system.itemRating || 0);
						SR5_EntityHelpers.updateModifier(targetObject, `${customEffect.name}`, item.type, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
						break;
					case "value":
						customEffect.value = (customEffect.value || 0);
						SR5_EntityHelpers.updateModifier(targetObject, `${customEffect.name}`, item.type, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
						break;
					case "boolean":
						let booleanValue;
						if (customEffect.value === "true") booleanValue = true;
						else booleanValue = false;
						foundry.utils.setProperty(item, customEffect.target, booleanValue);
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown '${customEffect.type}' item effect type in applyItemEffects()`, item.name);
				}
			}
		}

		for (let systemEffect of Object.values(item.system.systemEffects)){
			//Special for Medkit
			if (systemEffect.value === "medkit") item.system.isMedkit = true;
		}

	}

}
