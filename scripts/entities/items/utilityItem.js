import { SR5 } from "../../config.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
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

		if (item.type === "itemKnowledge"){
			itemData.modifiers = [];
		}

		if (item.type === "itemLanguage"){
			itemData.modifiers = [];
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

		if (item.type === "itemPower"){
			itemData.test.modifiers = [];
		}

		if (item.type === "itemAdeptPower"){
			itemData.test.dicePool = 0;
			itemData.test.modifiers = [];
			itemData.drainValue.modifiers = [];
		}

		if (item.type === "itemMartialArt"){
			itemData.test.dicePool = 0;
			itemData.test.modifiers = [];
			itemData.pin = false;
			itemData.entanglement = false;
			itemData.feint = false;
			itemData.disarm = false;
			itemData.breakWeapon = false;
		}

		if (item.type === "itemPreparation"){
			itemData.test.modifiers = [];
		}

		if (typeof itemData.systemEffects === "object") {
			itemData.systemEffects = Object.values(itemData.systemEffects);
		}

		if (typeof itemData.itemEffects === "object") {
			itemData.itemEffects = Object.values(itemData.itemEffects);
		}
	}

	static _handleItemCapacity(item) {
		let valueMultiplier = 0, valueTakenMultiplier = 0;

		//Capacity
		if (item.capacity.multiplier == "rating") {
				valueMultiplier = item.itemRating;
		}
		if (item.capacity.multiplier) {
			let modifierSource = `${game.i18n.localize(SR5.valueMultipliers[item.capacity.propertyMultiplier])} ${game.i18n.localize('SR5.Multiplier')}`;
			SR5_EntityHelpers.updateModifier(item.capacity, modifierSource, `valueMultiplier`, valueMultiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(item.capacity, 0);

		//Capacity taken
		if (item.capacityTaken.multiplier == "rating") {
				valueTakenMultiplier = item.itemRating;
		}
		if (item.capacityTaken.multiplier) {
			let modifierSource = `${game.i18n.localize(SR5.valueMultipliers[item.capacityTaken.propertyMultiplier])} ${game.i18n.localize('SR5.Multiplier')}`;
			SR5_EntityHelpers.updateModifier(item.capacityTaken, modifierSource, `valueMultiplier`, valueTakenMultiplier, true, false);
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
		if (item.price.multiplier) {
			SR5_EntityHelpers.updateModifier(item.price, game.i18n.localize(SR5.valueMultipliersAll[item.price.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
		}
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
		if (item.essenceCost.multiplier) {
			SR5_EntityHelpers.updateModifier(item.essenceCost, game.i18n.localize(SR5.valueMultipliers[item.essenceCost.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
		}
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
		if (item.availability.multiplier) {
			SR5_EntityHelpers.updateModifier(item.availability, game.i18n.localize(SR5.valueMultipliersAll[item.availability.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
		}
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
			SR5_EntityHelpers.updateModifier(itemData.price, item.name, game.i18n.localize('SR5.ItemRating'), ((itemData.price.base * itemData.itemRating) - 100));
			SR5_EntityHelpers.updateModifier(itemData.availability, item.name, game.i18n.localize('SR5.ItemRating'), itemData.itemRating);
			SR5_EntityHelpers.updateModifier(itemData.armorPenetration, item.name, game.i18n.localize('SR5.ItemRating'), -Math.floor(itemData.itemRating / 4));
			let value = Math.min(itemData.itemRating,itemData.ammunition.rating);
			SR5_EntityHelpers.updateModifier(itemData.damageValue, item.name, game.i18n.localize('SR5.ItemRating'), value);
		}
	}

	// Generate Weapon dicepool
	static _generateWeaponDicepool(item, actor) {
		let itemData = item.system;
		if (actor) {
			if (actor.type === "actorDrone") {
				let controlerData;
				if (actor.system.vehicleOwner.id) controlerData = actor.flags.sr5.vehicleControler.system;
				itemData.weaponSkill.base = 0;

				switch (actor.system.controlMode){
					case "autopilot":
						for (let i of actor.items) {
							let iData = i.system;
							if (iData.model === item.name && i.type === "itemProgram" && iData.isActive) {
								SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize('SR5.VehicleStat_PilotShort'), game.i18n.localize('SR5.LinkedAttribute'), actor.system.attributes.pilot.augmented.value);
								SR5_EntityHelpers.updateModifier(itemData.weaponSkill, i.name, game.i18n.localize('SR5.Program'), iData.itemRating);
							}
						}
						if (controlerData){
							for (let i of actor.flags.sr5.vehicleControler.items) {
								if (i.system.model === item.name && i.type === "itemProgram" && i.system.isActive) {
									SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize('SR5.VehicleStat_PilotShort'), game.i18n.localize('SR5.LinkedAttribute'), actor.system.attributes.pilot.augmented.value);
									SR5_EntityHelpers.updateModifier(itemData.weaponSkill, i.name, `${game.i18n.localize('SR5.Program')} (${game.i18n.localize('SR5.Controler')})`, i.system.itemRating);
								}
							}
						}
						if (actor.system.passiveTargeting) itemData.accuracy.base = actor.system.attributes.sensor.augmented.value;
						break;
					case "manual":
						SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills.gunnery.test.dicePool);
						if (actor.system.passiveTargeting) itemData.accuracy.base = actor.system.attributes.sensor.augmented.value;
						break;
					case "remote":
						SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills.gunnery.rating.value, false, true);
						SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.Logic')})`, game.i18n.localize('SR5.ControlMode'), controlerData.attributes.logic.augmented.value, false, true);
						if (actor.system.passiveTargeting) {
							if (actor.system.attributes.sensor.augmented.value > controlerData.matrix.attributes.dataProcessing.value) itemData.accuracy.base = controlerData.matrix.attributes.dataProcessing.value;
							else itemData.accuracy.base = actor.system.attributes.sensor.augmented.value;
						}
						break;
					case "rigging":
						SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills.gunnery.test.dicePool);
						SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize('SR5.ControlRigging'), game.i18n.localize('SR5.ControlMode'), 1, false, true);
						if (controlerData.specialProperties.controlRig.value) {
							SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
							SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
						}
						if (controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize('SR5.VirtualRealityHotSimShort'), game.i18n.localize('SR5.MatrixUserMode'), 1);
						if (actor.system.passiveTargeting) itemData.accuracy.base = actor.system.attributes.sensor.augmented.value;
						SR5_EntityHelpers.updateValue(itemData.accuracy);
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown controle mode '${actor.system.controlMode}' in '_generateWeaponDicepool()'`);
				}
			} else {
				if (itemData.weaponSkill.specialization === true) {
					SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.Specialization')}`, `${game.i18n.localize('SR5.Skill')}`, 2, false, true);
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
						SR5_EntityHelpers.updateModifier(itemData.weaponSkill, `${game.i18n.localize('SR5.WeaponTypeBow')}`, `${game.i18n.localize('SR5.ItemRating')}`, malus, false, true);
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
				if ((actor.system.initiatives.astralInit.isActive || itemData.isUsedAsFocus) && itemData.isLinkedToFocus) SR5_EntityHelpers.updateModifier(itemData.damageValue, `${game.i18n.localize('SR5.Charisma')}`, `${game.i18n.localize('SR5.Attribute')}`, actor.system.attributes.charisma.augmented.value);
				else SR5_EntityHelpers.updateModifier(itemData.damageValue, `${game.i18n.localize('SR5.Strength')}`, `${game.i18n.localize('SR5.Attribute')}`, actor.system.attributes.strength.augmented.value);
			}
			if (actor.system.itemsProperties?.weapon) {
				for (let modifier of actor.system.itemsProperties.weapon.accuracy.modifiers) {
					if (modifier.type === itemData.weaponSkill.category) itemData.accuracy.modifiers = itemData.accuracy.modifiers.concat(modifier);
				}
				for (let modifier of actor.system.itemsProperties.weapon.damageValue.modifiers) {
					if (modifier.type === itemData.weaponSkill.category) itemData.damageValue.modifiers = itemData.damageValue.modifiers.concat(modifier);
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
			default:
				SR5_SystemHelpers.srLog(3, "_handleWeaponAmmunition", `Unknown ammunition type: '${itemData.ammunition.type}'`);
				return;
		}
		if (armorPenetration) SR5_EntityHelpers.updateModifier(itemData.armorPenetration, game.i18n.localize(SR5.allAmmunitionTypes[itemData.ammunition.type]), game.i18n.localize('SR5.Ammunition'), armorPenetration);
		if (damageValue) SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize(SR5.allAmmunitionTypes[itemData.ammunition.type]), game.i18n.localize('SR5.Ammunition'), damageValue);
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
				itemData.damageValue.base = actor.system.specialAttributes.magic.augmented.value * 2;
				itemData.damageType = "stun";
				break;
			case "noxiousBreath":
				if (!actor) return;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = actor.system.specialAttributes.magic.augmented.value;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.nausea = true;
				itemData.damageValue.base = actor.system.specialAttributes.magic.augmented.value;
				itemData.damageType = "stun";
				break;
			case "gamma":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = 12;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.paralysis = true;
				itemData.damageValue.base = 0
				itemData.damageType = null;
				break;
			case "csTearGas":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 8;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.damageValue.base = 8;
				itemData.damageType = "stun";
				break;
			case "pepperPunch":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 11;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.nausea = true;
				itemData.damageValue.base = 11;
				itemData.damageType = "stun";
				break;
			case "nauseaGas":
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 3;
				itemData.toxin.power = 9;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.damageValue.base = 0;
				itemData.damageType = null;
				break;
			case "narcoject":
				itemData.toxin.vector.injection = true;
				itemData.toxin.speed = 0;
				itemData.toxin.power = 15;
				itemData.toxin.penetration = 0;
				itemData.damageValue.base = 15;
				itemData.damageType = "stun";
				break;
			case "neuroStunHeight":
			case "neuroStunNine":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 15;
				itemData.toxin.penetration = 0;
				itemData.toxin.effect.disorientation = true;
				itemData.damageValue.base = 15;
				itemData.damageType = "stun";
				break;
			case "neuroStunTen":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 15;
				itemData.toxin.penetration = -2;
				itemData.toxin.effect.disorientation = true;
				itemData.damageValue.base = 15;
				itemData.damageType = "stun";
				break;
			case "seven":
				itemData.toxin.vector.contact = true;
				itemData.toxin.vector.inhalation = true;
				itemData.toxin.speed = 1;
				itemData.toxin.power = 12;
				itemData.toxin.penetration = -2;
				itemData.toxin.effect.disorientation = true;
				itemData.toxin.effect.nausea = true;
				itemData.damageValue.base = 12;
				itemData.damageType = "physical";
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

				SR5_EntityHelpers.updateModifier(itemData.range.short, 'strength', 'attribute', (actorStrength * itemData.range.short.base) - itemData.range.short.base);
				SR5_EntityHelpers.updateModifier(itemData.range.medium, 'strength', 'attribute', (actorStrength * itemData.range.medium.base) - itemData.range.medium.base);
				if (itemData.aerodynamic){
					SR5_EntityHelpers.updateModifier(itemData.range.long, 'strength', 'attribute', (actorStrength * (itemData.range.long.base +2)) - itemData.range.long.base);
					SR5_EntityHelpers.updateModifier(itemData.range.extreme, 'strength', 'attribute', (actorStrength * (itemData.range.extreme.base +5)) - itemData.range.extreme.base);
				} else {
					SR5_EntityHelpers.updateModifier(itemData.range.long, 'strength', 'attribute', (actorStrength * itemData.range.long.base) - itemData.range.long.base);
					SR5_EntityHelpers.updateModifier(itemData.range.extreme, 'strength', 'attribute', (actorStrength * itemData.range.extreme.base) - itemData.range.extreme.base);
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
						SR5_EntityHelpers.updateModifier(itemData.range.short, 'body', 'attribute', actor.system.attributes.body.augmented.value);
						SR5_EntityHelpers.updateModifier(itemData.range.medium, 'body', 'attribute', actor.system.attributes.body.augmented.value * 2);
						SR5_EntityHelpers.updateModifier(itemData.range.long, 'body', 'attribute', actor.system.attributes.body.augmented.value * 3);
						SR5_EntityHelpers.updateModifier(itemData.range.extreme, 'body', 'attribute', actor.system.attributes.body.augmented.value * 4);
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
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2);
					break;
				case "capBall":
					break;
				case "concealableHolster":
					a.price = 150;
					if (a.isActive) {
						if (itemData.wirelessTurnedOn) SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -2);
						else SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1);
					}
					break;
				case "concealedQDHolster":
					a.price = 275;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1);
					break;
				case "electronicFiring":
					a.price = 1000;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					break;
				case "extendedBarrel":
					a.price = 50;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
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
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					break;
				case "foregrip":
					a.price = 100;
					if (a.isActive) {
						SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
						SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					}
					break;
				case "gasVentSystemOne":
					a.price = 200;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					break;
				case "gasVentSystemTwo":
					a.price = 400;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2);
					break;
				case "gasVentSystemThree":
					a.price = 600;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 3);
					break;
				case "geckoGrip":
					a.price = 100;
					break;
				case "guncam":
					a.price = 350;
					break;
				case "gyroMount":
					a.price = 1400;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 6);
					break;
				case "hiddenArmSlide":
					a.price = 350;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					break;
				case "hipPad":
					a.price = 250;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					break;
				case "imagingScope":
					a.price = 300;
					break;
				case "improvedRangeFinder":
					a.price = 2000;
					break;
				case "laserSight":
					a.price = 150;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
					if (itemData.wirelessTurnedOn) SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
					break;
				case "meleeHardening":
					a.price = 300;
					break;
				case "periscope":
					a.price = 70;
					break;
				case "quickDrawHolster":
					a.price = 175;
					break;
				case "reducedWeight":
					break;
				case "safeTargetSystem":
					a.price = 750;
					break;
				case "safeTargetSystemWithImage":
					a.price = 1100;
					break;
				case "shockPad":
					a.price = 50;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
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
					if (!a.isFree) SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2);
					if (a.isActive) {
						if ((actor !== undefined) && (actor.type !== "actorDrone")) {
							let smartlink = actor.system.specialProperties.smartlink.value;
							if (smartlink) {
								SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
								if (itemData.wirelessTurnedOn) {
									if (smartlink === 2) {
										SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
									} else if (smartlink === 1) {
										SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
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
								SR5_EntityHelpers.updateModifier(itemData.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
								if (itemData.wirelessTurnedOn) {
									if (smartlink === 2) {
										SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
									} else if (smartlink === 1) {
										SR5_EntityHelpers.updateModifier(itemData.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
									}
								}
							}
						}
					}
					break;
				case "speedLoader":
					a.price = 25;
					break;
				case "tracker":
					a.price = 150;
					break;
				case "triggerRemoval":
					a.price = 50;
					break;        
				case "tripod":
					a.price = 500;
					if (a.isActive) SR5_EntityHelpers.updateModifier(itemData.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 6);
					break;
				case "trollAdaptation":
					break; 
				case "underbarrelBolaLauncher":
					a.price = 350;
					break; 
				case "underbarrelChainsaw":
					a.price = 500;
					break; 
				case "underbarrelFlamethrower":
					a.price = 200;
					break; 
				case "underbarrelGrappleGun":
					a.price = 600;
					break; 
				case "underbarrelGrenadeLauncher":
					a.price = 3500;
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
						SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), itemData.price.base);
					} else {
						SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), a.price);
					}
				}
			}

		}
	}

	//Handle if an accessory give environmental modifiers tracer weapon.ammunition.type
	static _handleVisionAccessory(itemData, actor) {
		if (itemData.ammunition.type === "tracer" && itemData.isActive) {
			SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.range, game.i18n.localize('SR5.AmmunitionTypeTracer'), game.i18n.localize('SR5.Ammunition'), -1, false, false);
			SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.wind, game.i18n.localize('SR5.AmmunitionTypeTracer'), game.i18n.localize('SR5.Ammunition'), -1, false, false);
		}

		if (typeof itemData.accessory === "object") itemData.accessory = Object.values(itemData.accessory);

		for (let a of itemData.accessory) {
			switch (a.name) {
				case "flashLightInfrared":
					if (actor.system.visions.thermographic.isActive && a.isActive && itemData.isActive) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.light, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1, false, true);
					break;
				case "flashLightLowLight":
					if (actor.system.visions.lowLight.isActive && a.isActive && itemData.isActive) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.light, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1, false, true);
					break;
				case "imagingScope":
					if (a.isActive && itemData.isActive) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.range, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1, false, false);
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
					if (a.isActive && itemData.isActive && hasSmartlink) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.wind, game.i18n.localize('SR5.Smartlink'), game.i18n.localize('SR5.WeaponAccessory'), -1, false, false);
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
			SR5_EntityHelpers.updateModifier(itemData.availability, 'CustomCyberlimb', 'CustomCyberlimb', cyberlimbsAvailabilityMod);
			SR5_EntityHelpers.updateModifier(itemData.price, 'CustomCyberlimb', 'CustomCyberlimb', cyberlimbsPriceMod);
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
		SR5_EntityHelpers.updateModifier(itemData.availability, modifierSource, game.i18n.localize('SR5.AugmentationGrade'), availabilityModifier, false, false);
		SR5_EntityHelpers.updateModifier(itemData.price, modifierSource, game.i18n.localize('SR5.AugmentationGrade'), priceMultiplier, true, false);

		if (actor){
			for (let i of actor.items){
				let WeakImmuneSystem = i.system.systemEffects?.find(iEffect => iEffect.value === "doubleEssenceCost")
				if (WeakImmuneSystem) SR5_EntityHelpers.updateModifier(itemData.essenceCost, i.name, game.i18n.localize(SR5.itemTypes[i.type]), 2, true, false);
			}
		}

		SR5_EntityHelpers.updateModifier(itemData.essenceCost, modifierSource, game.i18n.localize('SR5.AugmentationGrade'), (itemData.isRatingBased ? essenceMultiplier * itemData.itemRating : essenceMultiplier), true, false);
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
				SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), parseInt(itemData.force || 0), false, true);
				SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize('SR5.DiceHits'), game.i18n.localize('SR5.SkillSpellcasting'), parseInt(itemData.hits || 0), false, true);
				SR5_EntityHelpers.updateValue(itemData.damageValue, 0);
				SR5_EntityHelpers.updateModifier(itemData.armorPenetration, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), -(itemData.force || 0), false, true);
				SR5_EntityHelpers.updateValue(itemData.armorPenetration);
			} else {
				SR5_EntityHelpers.updateModifier(itemData.damageValue, game.i18n.localize('SR5.DiceHits'), game.i18n.localize('SR5.SkillSpellcasting'), (itemData.hits || 0), false, true);
				SR5_EntityHelpers.updateValue(itemData.damageValue, 0);
			}
		}

		//Handle range
		itemData.spellAreaOfEffect.base = 0;
		if (itemData.range === "area" || itemData.category === "detection"){
			SR5_EntityHelpers.updateModifier(itemData.spellAreaOfEffect, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), parseInt(itemData.force || 0), false, true);
		}
		//Range for detection spell
		if (itemData.category === "detection") {
			SR5_EntityHelpers.updateModifier(itemData.spellAreaOfEffect, game.i18n.localize('SR5.SpellRangeShort'), game.i18n.localize('SR5.SpellCategoryDetection'), actor.system.specialAttributes.magic.augmented.value, true, true);
			if (itemData.spellAreaExtended === true) {
				SR5_EntityHelpers.updateModifier(itemData.spellAreaOfEffect, game.i18n.localize('SR5.ExtendedRange'), game.i18n.localize('SR5.SpellCategoryDetection'), 10, true, true);
			} 
		}
		SR5_EntityHelpers.updateValue(itemData.spellAreaOfEffect, 0);

		//Modified drain value
		itemData.drainValue.base = 0;
		SR5_EntityHelpers.updateModifier(itemData.drainValue, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), (itemData.force || 0), false, true);
		SR5_EntityHelpers.updateModifier(itemData.drainValue, game.i18n.localize('SR5.SpellDrain'), game.i18n.localize('SR5.DrainModifier'), itemData.drain.base, false, true);
		if (itemData.fetish){
			SR5_EntityHelpers.updateModifier(itemData.drainValue, game.i18n.localize('SR5.Fetish'), game.i18n.localize('SR5.DrainModifier'), -2, false, true);
			SR5_EntityHelpers.updateModifier(itemData.drain, game.i18n.localize('SR5.Fetish'), game.i18n.localize('SR5.Fetish'), -2, false, true);
		}
		SR5_EntityHelpers.updateValue(itemData.drainValue, 2);
		SR5_EntityHelpers.updateValue(itemData.drain);

		//Check if spell is sustained by a spirit
		for (let item of actor.items){
			if (item.type === "itemSpirit" && item.system.isBounded){
				for (let s of Object.values(item.system.sustainedSpell)){
					if (s.name === item._id) itemData.freeSustain = true;
				}
			}
		}
	}

	//Handle Preparation
	static _handlePreparation(item){
		let itemData = item.system;
		itemData.test.base = 0;
		SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize('SR5.PreparationPotency'), game.i18n.localize('SR5.SkillSpellcasting'), (itemData.potency || 0), false, true);
		SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize('SR5.Force'), game.i18n.localize('SR5.LinkedAttribute'), (itemData.force || 0), false, true);
		SR5_EntityHelpers.updateDicePool(itemData.test);
	}

	//Handle power point cost
	static _handleAdeptPower(itemData, actor) {
		let firstAttribute, secondAttribute;

		if (itemData.powerPointsCost.isRatingBased) {
			itemData.powerPointsCost.value = itemData.powerPointsCost.base * itemData.itemRating;
		} else {
			itemData.powerPointsCost.value = itemData.powerPointsCost.base;
		}

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
			if (firstAttribute) SR5_EntityHelpers.updateModifier(itemData.test, firstLabel, game.i18n.localize('SR5.LinkedAttribute'), firstAttribute, false, true);
			if (secondAttribute) SR5_EntityHelpers.updateModifier(itemData.test, secondLabel, game.i18n.localize('SR5.LinkedAttribute'), secondAttribute, false, true);
			SR5_EntityHelpers.updateDicePool(itemData.test);
		}

		if (itemData.hasDrain){
			itemData.drainValue.base = 0;
			if (itemData.drainType === "rating") SR5_EntityHelpers.updateModifier(itemData.drainValue, game.i18n.localize('SR5.ItemRating'), game.i18n.localize('SR5.AdeptPower'), Math.ceil(itemData.itemRating * (itemData.drainMultiplier || 1)), false, true);
			if (itemData.drainType === "magic") {
				if (actor) SR5_EntityHelpers.updateModifier(itemData.drainValue, game.i18n.localize('SR5.Magic'), game.i18n.localize('SR5.AdeptPower'), Math.ceil(actor.system.specialAttributes.magic.augmented.value * (itemData.drainMultiplier || 1)), false, true);
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
			if (firstAttribute) SR5_EntityHelpers.updateModifier(itemData.test, firstLabel, game.i18n.localize('SR5.LinkedAttribute'), firstAttribute, false, true);
			if (secondAttribute) SR5_EntityHelpers.updateModifier(itemData.test, secondLabel, game.i18n.localize('SR5.LinkedAttribute'), secondAttribute, false, true);
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
	}

	static async _handleWeaponFocus(item, actor){
		let focus = actor.items.find(w => w.system.linkedWeapon === item._id);
		if (focus) {
			if (focus.system.isActive){
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
		}
	}

	////////////////////// DECK & PROGRAMMES ///////////////////////
	static _handleCommlink(itemData) {
		switch (itemData.module){
			case "standard":
				SR5_EntityHelpers.updateModifier(itemData.price, 'standard', 'module', 100);
				break;
			case "hotsim":
				SR5_EntityHelpers.updateModifier(itemData.price, 'hotsim', 'module', 250);
				SR5_EntityHelpers.updateModifier(itemData.availability, 'hotsim', 'module', 4);
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
	// Calcul le loyer des styles de vie
	static _handleLifeStyle(itemData) {
		switch (itemData.type) {
			case "luxury":
				itemData.price.base = 100000;
				break;
			case "high":
				itemData.price.base = 10000;
				break;
			case "middle":
				itemData.price.base = 5000;
				break;
			case "low":
				itemData.price.base = 2000;
				break;
			case "squatter":
				itemData.price.base = 500;
				break;
			case "streets":
				itemData.price.base = 0;
				break;
			default:
				itemData.price.base = 0;
		}

		let priceMultiplier = 1;
		for (let option of itemData.options) {
			switch (option){
				case "specialWorkArea":
					SR5_EntityHelpers.updateModifier(itemData.price, 'specialWorkArea', 'option', 1000);
					break;
				case "cramped":
					priceMultiplier -= 0.1;
					break;
				case "difficultToFind":
					priceMultiplier += 0.1;
					break;
				case "extraSecure":
					priceMultiplier += 0.2;
					break;
				case "dangerousArea":
					priceMultiplier -= 0.2;
					break;
				default:
					SR5_SystemHelpers.srLog(1, `Unknown '${option}' option in _handleLifeStyle()`);
			}
		}

		//TODO
		//SR5_EntityHelpers.updateModifier(itemData.price, 'specialWorkArea', 'option', priceMultiplier);
	}

	////////////////////// VEHICULES  ///////////////////////
	static _handleVehicle(itemData) {
		for (let vehicleMod of itemData.vehiclesMod){
			SR5_EntityHelpers.updateModifier(itemData.price, '${vehicleMod.name}', 'price', vehicleMod.system.price.value);
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
		let itemData = item.data, wm = itemData.weaponMount;
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
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_I'), 2);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_I'), 6);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_I'), 2);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_I'), 1500);
				if (itemData.tools == "kit") itemData.tools = "shop";
				break;
			case "concealed":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_C'), 4);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_C'), 10);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_C'), 4);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_C'), 4000);
				if (itemData.tools == "kit") itemData.tools = "shop";
				break;
			default:
		}

		switch (wm.flexibility) {
			case "fixed":
				break;
			case "flexible":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_Fl'), 1);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_Fl'), 4);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_Fl'), 2);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_Fl'), 2000);
				if (itemData.tools == "kit") itemData.tools = "shop";
				break;
			case "turret":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_T'), 2);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_T'), 12);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_T'), 6);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_T'), 5000);
				itemData.tools = "facility";
				break;
			default:
		}
		switch (wm.control) {
			case "remote":
				itemData.surname = " (" + game.i18n.localize(SR5.WeaponMountSize[wm.size]) + ", " + game.i18n.localize(SR5.WeaponMountVisibility[wm.visibility]) + ", " + game.i18n.localize(SR5.WeaponMountFlexibility[wm.flexibility]) + ", " + game.i18n.localize(SR5.WeaponMountControl[wm.control]) + ")";
				break;
			case "manual":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_M'), 1);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_M'), 4);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_M'), 1);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_M'), 500);
				if (itemData.tools == "kit") itemData.tools = "shop";
				itemData.surname = " (" + game.i18n.localize(SR5.WeaponMountSize[wm.size]) + ", " + game.i18n.localize(SR5.WeaponMountVisibility[wm.visibility]) + ", " + game.i18n.localize(SR5.WeaponMountFlexibility[wm.flexibility]) + ", " + game.i18n.localize(SR5.WeaponMountControl[wm.control]) + ")";
				break;
			case "armoredManual":
				SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_AM'), 2);
				SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_AM'), 6);
				SR5_EntityHelpers.updateModifier(itemData.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_AM'), 4);
				SR5_EntityHelpers.updateModifier(itemData.price, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_AM'), 1500);
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

	static _generateWeaponMountWeaponList(item, actor) {
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
		item.system.weaponChoices = weaponList;
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
			SR5_EntityHelpers.updateModifier(itemData.slots, game.i18n.localize(SR5.valueMultipliers[itemData.slots.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(item.slots, 0);
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
			default:
		}
		if (itemData.threshold.multiplier) {
			SR5_EntityHelpers.updateModifier(itemData.threshold, game.i18n.localize(SR5.valueMultipliers[itemData.threshold.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
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
			case "abomination":
				itemData.attributes.body += 2;
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
			if (itemData.testFirstAttribute === "edge" || itemData.testFirstAttribute === "magic" || itemData.testFirstAttribute === "resonance"){
				firstAttribute = actor.system.specialAttributes[itemData.testFirstAttribute].augmented.value;
			} else {
				firstAttribute = actor.system.attributes[itemData.testFirstAttribute].augmented.value;
			}
		}

		if (itemData.testSecondAttribute){
			if (itemData.testSecondAttribute === "edge" || itemData.testSecondAttribute === "magic" || itemData.testSecondAttribute === "resonance"){
				secondAttribute = actor.system.specialAttributes[itemData.testSecondAttribute].augmented.value;
			} else {
				secondAttribute = actor.system.attributes[itemData.testSecondAttribute].augmented.value;
			}
		}
		itemData.test.base = 0;
		if (firstAttribute) SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize(SR5.allAttributes[itemData.testFirstAttribute]), game.i18n.localize('SR5.LinkedAttribute'), firstAttribute, false, true);
		if (secondAttribute) SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize(SR5.allAttributes[itemData.testSecondAttribute]), game.i18n.localize('SR5.LinkedAttribute'), secondAttribute, false, true);
		SR5_EntityHelpers.updateDicePool(itemData.test);
	}

	static _handleSpritePower(itemData, actor) {
		itemData.test.base = 0;
		let skill = 0;
		if (itemData.testSkill) {
			skill = actor.system.skills[itemData.testSkill].rating.value;
			SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize(SR5.skills[itemData.testSkill]), game.i18n.localize('SR5.Skill'), skill, false, true);
			SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize('SR5.Level'), game.i18n.localize('SR5.LinkedAttribute'), actor.system.level, false, true);
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
				item = item.toObject(false);
				itemData.accessory[index] = item;
			}
		}
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
				setProperty(item, customEffect.target, booleanValue);
				SR5_SystemHelpers.srLog(3, ` customEffect.target ==> '${customEffect.target}' , booleanValue ==> '${booleanValue}', item.system ==> '${JSON.stringify(item.system)}' applyItemEffects()`);
			}

			SR5_SystemHelpers.srLog(3, ` targetObject ==> '${JSON.stringify(targetObject)}' in applyItemEffects()`);

			if (!skipCustomEffect) {    
				if (!customEffect.multiplier) customEffect.multiplier = 1;

				//Modifier type
				switch (customEffect.type) {
					case "rating":
						customEffect.value = (item.system.itemRating || 0);
						SR5_EntityHelpers.updateModifier(targetObject, `${customEffect.name}`, `${game.i18n.localize('SR5.ItemEffect')}`, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
						break;
					case "value":
						customEffect.value = (customEffect.value || 0);
						SR5_EntityHelpers.updateModifier(targetObject, `${customEffect.name}`, `${game.i18n.localize('SR5.ItemEffect')}`, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
						break;
					case "boolean":
						let booleanValue;
						if (customEffect.value === "true") booleanValue = true;
						else booleanValue = false;
						setProperty(item, customEffect.target, booleanValue);
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
