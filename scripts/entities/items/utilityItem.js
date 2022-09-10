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
	static _resetItemModifiers(itemData) {
		let data = itemData.system;

		//Reset accessory
		if (itemData.type === "itemAugmentation" || itemData.type === "itemGear"){
			if (!itemData.isOwned) data.accessory = [];
			data.isMedkit = false;
		}

		//Reset price & availability
		if (data.price) data.price.modifiers = [];
		if (data.availability) data.availability.modifiers = [];
		if (data.essenceCost) data.essenceCost.modifiers = [];

		//Reset weapon modifiers
		if (itemData.type === "itemWeapon") {
			data.firingMode.value = [];
			data.damageValue.modifiers = [];
			data.armorPenetration.modifiers = [];
			data.recoilCompensation.modifiers = [];
			data.weaponSkill.base = 0;
			data.weaponSkill.modifiers = [];
			data.concealment.modifiers = [];
			data.accuracy.modifiers = [];
			data.reach.modifiers = [];
			data.range.short.modifiers = [];
			data.range.medium.modifiers = [];
			data.range.long.modifiers = [];
			data.range.extreme.modifiers = [];
			for (let key of Object.keys(SR5.propagationVectors)) {
				data.toxin.vector[key] = false;
			}
			for (let key of Object.keys(SR5.toxinEffects)) {
				data.toxin.effect[key] = false;
			}
		}

		if (itemData.type === "itemKnowledge"){
			data.modifiers = [];
		}

		if (itemData.type === "itemLanguage"){
			data.modifiers = [];
		}

		if (itemData.type === "itemDrug"){
			data.vector.value = [];
		}

		if (itemData.type === "itemArmor"){
			data.armorValue.value = 0;
			data.armorValue.modifiers = [];
		}

		if (data.isWireless){
			data.conditionMonitors.matrix.value = 0;
			data.conditionMonitors.matrix.modifiers = [];
			data.conditionMonitors.matrix.actual.value = 0;
			data.conditionMonitors.matrix.actual.modifiers = [];
		}

		if (data.conditionMonitors?.condition) {
			data.conditionMonitors.condition.value = 0;
			data.conditionMonitors.condition.modifiers = [];
			data.conditionMonitors.condition.actual.value = 0;
			data.conditionMonitors.condition.actual.modifiers = [];
		}

		if (itemData.type === "itemSpell") {
			data.freeSustain = false;
			data.damageValue.modifiers = [];
			data.armorPenetration.modifiers = [];
			data.drain.modifiers = [];
			data.drainValue.modifiers = [];
			data.spellAreaOfEffect.modifiers = [];
		}

		if (itemData.type === "itemComplexForm") {
			data.freeSustain = false;
		}

		if (itemData.type === "itemPower"){
			data.test.modifiers = [];
		}

		if (itemData.type === "itemAdeptPower"){
			data.test.dicePool = 0;
			data.test.modifiers = [];
			data.drainValue.modifiers = [];
		}

		if (itemData.type === "itemMartialArt"){
			data.test.dicePool = 0;
			data.test.modifiers = [];
			data.pin = false;
			data.entanglement = false;
			data.feint = false;
			data.disarm = false;
			data.breakWeapon = false;
		}

		if (itemData.type === "itemPreparation"){
			data.test.modifiers = [];
		}

		if (typeof data.systemEffects === "object") {
			data.systemEffects = Object.values(data.systemEffects);
		}

		if (typeof data.itemEffects === "object") {
			data.itemEffects = Object.values(data.itemEffects);
		}
	}

	static _handleItemCapacity(item) {
		let valueMultiplier = 0, valueTakenMultiplier = 0, lists = SR5;

		//Capacity
		if (item.capacity.multiplier == "rating") {
				valueMultiplier = item.itemRating;
		}
		if (item.capacity.multiplier) {
			let modifierSource = `${game.i18n.localize(lists.valueMultipliers[item.capacity.propertyMultiplier])} ${game.i18n.localize('SR5.Multiplier')}`;
			SR5_EntityHelpers.updateModifier(item.capacity, modifierSource, `valueMultiplier`, valueMultiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(item.capacity, 0);

		//Capacity taken
		if (item.capacityTaken.multiplier == "rating") {
				valueTakenMultiplier = item.itemRating;
		}
		if (item.capacityTaken.multiplier) {
			let modifierSource = `${game.i18n.localize(lists.valueMultipliers[item.capacityTaken.propertyMultiplier])} ${game.i18n.localize('SR5.Multiplier')}`;
			SR5_EntityHelpers.updateModifier(item.capacityTaken, modifierSource, `valueMultiplier`, valueTakenMultiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(item.capacityTaken, 0);
	}

	static _handleItemPrice(item) {
		let multiplier, lists = SR5;
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
			SR5_EntityHelpers.updateModifier(item.price, game.i18n.localize(lists.valueMultipliersAll[item.price.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(item.price, 0);
	}

	static _handleAmmoPrice(item) {
		let multiplier = item.quantity;
		SR5_EntityHelpers.updateModifier(item.price, game.i18n.localize('SR5.Quantity'), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
		SR5_EntityHelpers.updateValue(item.price, 0);
	}

	static _handleItemEssenceCost(item) {
		let multiplier, lists = SR5;
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
			SR5_EntityHelpers.updateModifier(item.essenceCost, game.i18n.localize(lists.valueMultipliers[item.essenceCost.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(item.essenceCost, 0);
	}

	static _handleItemAvailability(item) {
		let multiplier, lists = SR5;
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
			SR5_EntityHelpers.updateModifier(item.availability, game.i18n.localize(lists.valueMultipliersAll[item.availability.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
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
	static _handleBow(weapon) {
		if (weapon.system.type === "bow") {
			
			SR5_EntityHelpers.updateModifier(weapon.system.price, weapon.name, game.i18n.localize('SR5.ItemRating'), ((weapon.system.price.base * weapon.system.itemRating) - 100));
			SR5_EntityHelpers.updateModifier(weapon.system.availability, weapon.name, game.i18n.localize('SR5.ItemRating'), weapon.system.itemRating);
			SR5_EntityHelpers.updateModifier(weapon.system.armorPenetration, weapon.name, game.i18n.localize('SR5.ItemRating'), -Math.floor(weapon.system.itemRating / 4));
			let value = Math.min(weapon.system.itemRating,weapon.system.ammunition.rating);
			SR5_EntityHelpers.updateModifier(weapon.system.damageValue, weapon.name, game.i18n.localize('SR5.ItemRating'), value);
				}
	}

	// Generate Weapon dicepool
	static _generateWeaponDicepool(item, actorData) {
		let weapon = item.system;
		if (actorData) {
			if (actorData.type === "actorDrone") {
				let controlerData;
				if (actorData.system.vehicleOwner.id) {
					controlerData = actorData.flags.sr5.vehicleControler.system;
				}
				weapon.weaponSkill.base = 0;
				switch (actorData.system.controlMode){
					case "autopilot":
						for (let i of actorData.items) {
							let iData = i.system;
							if (iData.model === item.name && i.type === "itemProgram" && iData.isActive) {
								SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize('SR5.VehicleStat_PilotShort'), game.i18n.localize('SR5.LinkedAttribute'), actorData.system.attributes.pilot.augmented.value);
								SR5_EntityHelpers.updateModifier(weapon.weaponSkill, i.name, game.i18n.localize('SR5.Program'), iData.itemRating);
							}
						}
						if (controlerData){
							for (let i of actorData.flags.sr5.vehicleControler.items) {
								if (i.system.model === item.name && i.type === "itemProgram" && i.system.isActive) {
									SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize('SR5.VehicleStat_PilotShort'), game.i18n.localize('SR5.LinkedAttribute'), actorData.system.attributes.pilot.augmented.value);
									SR5_EntityHelpers.updateModifier(weapon.weaponSkill, i.name, `${game.i18n.localize('SR5.Program')} (${game.i18n.localize('SR5.Controler')})`, i.system.itemRating);
								}
							}
						}
						if (actorData.system.passiveTargeting) weapon.accuracy.base = actorData.system.attributes.sensor.augmented.value;
						break;
					case "manual":
						SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills.gunnery.test.dicePool);
						if (actorData.system.passiveTargeting) weapon.accuracy.base = actorData.system.attributes.sensor.augmented.value;
						break;
					case "remote":
						SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills.gunnery.rating.value, false, true);
						SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.Logic')})`, game.i18n.localize('SR5.ControlMode'), controlerData.attributes.logic.augmented.value, false, true);
						if (actorData.system.passiveTargeting) {
							if (actorData.system.attributes.sensor.augmented.value > controlerData.matrix.attributes.dataProcessing.value) weapon.accuracy.base = controlerData.matrix.attributes.dataProcessing.value;
							else weapon.accuracy.base = actorData.system.attributes.sensor.augmented.value;
						}
						break;
					case "rigging":
						SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills.gunnery.test.dicePool);
						SR5_EntityHelpers.updateModifier(weapon.accuracy, game.i18n.localize('SR5.ControlRigging'), game.i18n.localize('SR5.ControlMode'), 1, false, true);
						if (controlerData.specialProperties.controlRig.value) {
							SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
							SR5_EntityHelpers.updateModifier(weapon.accuracy, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
						}
						if (controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize('SR5.VirtualRealityHotSimShort'), game.i18n.localize('SR5.MatrixUserMode'), 1);
						if (actorData.system.passiveTargeting) weapon.accuracy.base = actorData.system.attributes.sensor.augmented.value;
						SR5_EntityHelpers.updateValue(weapon.accuracy);
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown controle mode '${data.controlMode}' in '_generateWeaponDicepool()'`);
				}
			} else {
				if (weapon.weaponSkill.specialization === true) {
					SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.Specialization')}`, `${game.i18n.localize('SR5.Skill')}`, 2, false, true);
				}
				let actorSkill = weapon.weaponSkill.category;
				if(actorData.system.skills[actorSkill] === undefined){
					SR5_SystemHelpers.srLog(1, `Unknown weapon skill '${actorSkill}' in '_generateWeaponDicepool()'`);
					weapon.weaponSkill.base = 0;
				} else {
					weapon.weaponSkill.base = 0;
					if ((actorData.system.initiatives.astralInit.isActive || weapon.isUsedAsFocus) && weapon.isLinkedToFocus) weapon.weaponSkill.modifiers = weapon.weaponSkill.modifiers.concat(actorData.system.skills.astralCombat.test.modifiers);
					else weapon.weaponSkill.modifiers = weapon.weaponSkill.modifiers.concat(actorData.system.skills[actorSkill].test.modifiers);
					//Special case : bow
					if (weapon.type === "bow" && (actorData.system.attributes.strength.augmented.value < weapon.itemRating)){
						let malus = (actorData.system.attributes.strength.augmented.value - weapon.itemRating) * 3;
						SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.WeaponTypeBow')}`, `${game.i18n.localize('SR5.ItemRating')}`, malus, false, true);
					}
				}
			}
		}  
			SR5_EntityHelpers.updateDicePool(weapon.weaponSkill, 0);
	}

	static _generateWeaponDamage(weapon, actor) {
		if (actor) {
			if (weapon.accuracy.isPhysicalLimitBased) weapon.accuracy.base = actor.system.limits.physicalLimit.value;
			if (weapon.damageValue.isStrengthBased && actor.type !=="actorDrone") {
				if ((actor.system.initiatives.astralInit.isActive || weapon.isUsedAsFocus) && weapon.isLinkedToFocus) SR5_EntityHelpers.updateModifier(weapon.damageValue, `${game.i18n.localize('SR5.Charisma')}`, `${game.i18n.localize('SR5.Attribute')}`, actor.system.attributes.charisma.augmented.value);
				else SR5_EntityHelpers.updateModifier(weapon.damageValue, `${game.i18n.localize('SR5.Strength')}`, `${game.i18n.localize('SR5.Attribute')}`, actor.system.attributes.strength.augmented.value);
			}
			if (actor.system.itemsProperties?.weapon) {
				for (let modifier of actor.system.itemsProperties.weapon.accuracy.modifiers) {
					if (modifier.type === weapon.weaponSkill.category) weapon.accuracy.modifiers = weapon.accuracy.modifiers.concat(modifier);
				}
				for (let modifier of actor.system.itemsProperties.weapon.damageValue.modifiers) {
					if (modifier.type === weapon.weaponSkill.category) weapon.damageValue.modifiers = weapon.damageValue.modifiers.concat(modifier);
				}
			}

			if (actor.type === "actorDrone"){
				if (actor.system.controlMode === "manual" && actor.system.passiveTargeting){
					
				}
			}
		}

		weapon.firingMode.value = [];
		for (let key of Object.keys(SR5.weaponModes)) {
			if (weapon.firingMode[key]) {
				weapon.firingMode.value.push(game.i18n.localize(SR5.weaponModesAbbreviated[key]));
			}
		}

		SR5_EntityHelpers.updateValue(weapon.damageValue, 0);
		SR5_EntityHelpers.updateValue(weapon.armorPenetration);
		SR5_EntityHelpers.updateValue(weapon.recoilCompensation);
		SR5_EntityHelpers.updateValue(weapon.accuracy);
	}

	// Modif des munitions & grenades
	static _handleWeaponAmmunition(weapon) {
		let armorPenetration = 0,
			damageValue = 0,
			damageType = weapon.damageType,
			damageElement = weapon.damageElement,
			blastRadius = 0,
			blastDamageFallOff = 0,
			lists = SR5;
		switch (weapon.ammunition.type) {
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
				armorPenetration = -weapon.armorPenetration.base -5;
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
					damageValue = weapon.ammunition.itemRating;
					break;
			default:
				SR5_SystemHelpers.srLog(3, "_handleWeaponAmmunition", `Unknown ammunition type: '${weapon.ammunition.type}'`);
				return;
		}
		if (armorPenetration) SR5_EntityHelpers.updateModifier(weapon.armorPenetration, game.i18n.localize(lists.allAmmunitionTypes[weapon.ammunition.type]), game.i18n.localize('SR5.Ammunition'), armorPenetration);
		if (damageValue) SR5_EntityHelpers.updateModifier(weapon.damageValue, game.i18n.localize(lists.allAmmunitionTypes[weapon.ammunition.type]), game.i18n.localize('SR5.Ammunition'), damageValue);
		weapon.damageType = damageType;
		weapon.damageElement = damageElement;
		weapon.blast.damageFallOff = blastDamageFallOff;
		weapon.blast.radius = blastRadius;
	}

	// Génére les spec des toxines pour les munitions & grenades
	static _handleWeaponToxin(weapon, actor) {
		switch (weapon.toxin.type) {
			case "airEngulf":
				if (!actor) return;
				weapon.toxin.vector.inhalation = true;
				weapon.toxin.speed = 0;
				weapon.toxin.power = actor.system.specialAttributes.magic.augmented.value * 2;
				weapon.toxin.penetration = -actor.system.specialAttributes.magic.augmented.value;
				weapon.damageValue.base = actor.system.specialAttributes.magic.augmented.value * 2;
				weapon.damageType = "stun";
				break;
			case "noxiousBreath":
				if (!actor) return;
				weapon.toxin.vector.inhalation = true;
				weapon.toxin.speed = 0;
				weapon.toxin.power = actor.system.specialAttributes.magic.augmented.value;
				weapon.toxin.penetration = 0;
				weapon.toxin.effect.nausea = true;
				weapon.damageValue.base = actor.system.specialAttributes.magic.augmented.value;
				weapon.damageType = "stun";
				break;
			case "gamma":
				weapon.toxin.vector.injection = true;
				weapon.toxin.speed = 0;
				weapon.toxin.power = 12;
				weapon.toxin.penetration = 0;
				weapon.toxin.effect.paralysis = true;
				weapon.damageValue.base = 0
				weapon.damageType = null;
				break;
			case "csTearGas":
				weapon.toxin.vector.contact = true;
				weapon.toxin.vector.inhalation = true;
				weapon.toxin.speed = 1;
				weapon.toxin.power = 8;
				weapon.toxin.penetration = 0;
				weapon.toxin.effect.disorientation = true;
				weapon.toxin.effect.nausea = true;
				weapon.damageValue.base = 8;
				weapon.damageType = "stun";
				break;
			case "pepperPunch":
				weapon.toxin.vector.contact = true;
				weapon.toxin.vector.inhalation = true;
				weapon.toxin.speed = 1;
				weapon.toxin.power = 11;
				weapon.toxin.penetration = 0;
				weapon.toxin.effect.nausea = true;
				weapon.damageValue.base = 11;
				weapon.damageType = "stun";
				break;
			case "nauseaGas":
				weapon.toxin.vector.inhalation = true;
				weapon.toxin.speed = 3;
				weapon.toxin.power = 9;
				weapon.toxin.penetration = 0;
				weapon.toxin.effect.disorientation = true;
				weapon.toxin.effect.nausea = true;
				weapon.damageValue.base = 0;
				weapon.damageType = null;
				break;
			case "narcoject":
				weapon.toxin.vector.injection = true;
				weapon.toxin.speed = 0;
				weapon.toxin.power = 15;
				weapon.toxin.penetration = 0;
				weapon.damageValue.base = 15;
				weapon.damageType = "stun";
				break;
			case "neuroStunHeight":
			case "neuroStunNine":
				weapon.toxin.vector.contact = true;
				weapon.toxin.vector.inhalation = true;
				weapon.toxin.speed = 1;
				weapon.toxin.power = 15;
				weapon.toxin.penetration = 0;
				weapon.toxin.effect.disorientation = true;
				weapon.damageValue.base = 15;
				weapon.damageType = "stun";
				break;
			case "neuroStunTen":
				weapon.toxin.vector.contact = true;
				weapon.toxin.vector.inhalation = true;
				weapon.toxin.speed = 1;
				weapon.toxin.power = 15;
				weapon.toxin.penetration = -2;
				weapon.toxin.effect.disorientation = true;
				weapon.damageValue.base = 15;
				weapon.damageType = "stun";
				break;
			case "seven":
				weapon.toxin.vector.contact = true;
				weapon.toxin.vector.inhalation = true;
				weapon.toxin.speed = 1;
				weapon.toxin.power = 12;
				weapon.toxin.penetration = -2;
				weapon.toxin.effect.disorientation = true;
				weapon.toxin.effect.nausea = true;
				weapon.damageValue.base = 12;
				weapon.damageType = "physical";
				break;
			default:
				SR5_SystemHelpers.srLog(3, "_handleWeaponToxin", `Unknown toxin type: '${weapon.toxin.type}'`);
		}

	}

	//Calcule la distance des armes de jet en fonction de la force
	static _generateWeaponRange(weapon, actor) {
		if (weapon.range.isStrengthBased) {
			if (actor !== undefined) {
				let actorStrength = actor.system.attributes.strength.augmented.value;

				SR5_EntityHelpers.updateModifier(weapon.range.short, 'strength', 'attribute', (actorStrength * weapon.range.short.base) - weapon.range.short.base);
				SR5_EntityHelpers.updateModifier(weapon.range.medium, 'strength', 'attribute', (actorStrength * weapon.range.medium.base) - weapon.range.medium.base);
				if (weapon.aerodynamic){
					SR5_EntityHelpers.updateModifier(weapon.range.long, 'strength', 'attribute', (actorStrength * (weapon.range.long.base +2)) - weapon.range.long.base);
					SR5_EntityHelpers.updateModifier(weapon.range.extreme, 'strength', 'attribute', (actorStrength * (weapon.range.extreme.base +5)) - weapon.range.extreme.base);
				} else {
					SR5_EntityHelpers.updateModifier(weapon.range.long, 'strength', 'attribute', (actorStrength * weapon.range.long.base) - weapon.range.long.base);
					SR5_EntityHelpers.updateModifier(weapon.range.extreme, 'strength', 'attribute', (actorStrength * weapon.range.extreme.base) - weapon.range.extreme.base);
				}
			}
		}

		if (actor !== undefined) {
			if (weapon.category === "meleeWeapon" && actor.system.reach) {
				weapon.reach.modifiers = weapon.reach.modifiers.concat(actor.system.reach.modifiers);
			}
			if (weapon.systemEffects.length){
				for (let systemEffect of Object.values(weapon.systemEffects)){
					if (systemEffect.value === "noxiousBreath" || systemEffect.value === "corrosiveSpit"){
						SR5_EntityHelpers.updateModifier(weapon.range.short, 'body', 'attribute', actor.system.attributes.body.augmented.value);
						SR5_EntityHelpers.updateModifier(weapon.range.medium, 'body', 'attribute', actor.system.attributes.body.augmented.value * 2);
						SR5_EntityHelpers.updateModifier(weapon.range.long, 'body', 'attribute', actor.system.attributes.body.augmented.value * 3);
						SR5_EntityHelpers.updateModifier(weapon.range.extreme, 'body', 'attribute', actor.system.attributes.body.augmented.value * 4);
					}
				}
			}
		} 



		for (let key of Object.keys(SR5.weaponRanges)) {
			SR5_EntityHelpers.updateValue(weapon.range[key]);
		}
		SR5_EntityHelpers.updateValue(weapon.reach);
	}

	// Modifie les armes en fonction des accessoires
	static _handleWeaponAccessory(weapon, actor) {
		
		for (let a of weapon.accessory) {   
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
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2);
					break;
				case "capBall":
					break;
				case "concealableHolster":
					a.price = 150;
					if (a.isActive) {
						if (weapon.wirelessTurnedOn) SR5_EntityHelpers.updateModifier(weapon.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -2);
						else SR5_EntityHelpers.updateModifier(weapon.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1);
					}
					break;
				case "concealedQDHolster":
					a.price = 275;
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1);
					break;
				case "electronicFiring":
					a.price = 1000;
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					break;
				case "extendedBarrel":
					a.price = 50;
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
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
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					break;
				case "foregrip":
					a.price = 100;
					if (a.isActive) {
						SR5_EntityHelpers.updateModifier(weapon.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
						SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					}
					break;
				case "gasVentSystemOne":
					a.price = 200;
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					break;
				case "gasVentSystemTwo":
					a.price = 400;
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2);
					break;
				case "gasVentSystemThree":
					a.price = 600;
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 3);
					break;
				case "geckoGrip":
					a.price = 100;
					break;
				case "guncam":
					a.price = 350;
					break;
				case "gyroMount":
					a.price = 1400;
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 6);
					break;
				case "hiddenArmSlide":
					a.price = 350;
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					break;
				case "hipPad":
					a.price = 250;
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
					break;
				case "imagingScope":
					a.price = 300;
					break;
				case "improvedRangeFinder":
					a.price = 2000;
					break;
				case "laserSight":
					a.price = 150;
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
					if (weapon.wirelessTurnedOn) SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
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
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
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
					if (!a.isFree) SR5_EntityHelpers.updateModifier(weapon.availability, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2);
					if (a.isActive) {
						if ((actor !== undefined) && (actor.type !== "actorDrone")) {
							let smartlink = actor.system.specialProperties.smartlink.value;
							if (smartlink) {
								SR5_EntityHelpers.updateModifier(weapon.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
								if (weapon.wirelessTurnedOn) {
									if (smartlink === 2) {
										SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
									} else if (smartlink === 1) {
										SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
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
								SR5_EntityHelpers.updateModifier(weapon.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
								if (weapon.wirelessTurnedOn) {
									if (smartlink === 2) {
										SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
									} else if (smartlink === 1) {
										SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
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
					if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 6);
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
						SR5_EntityHelpers.updateModifier(weapon.price, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), weapon.price.base);
					} else {
						SR5_EntityHelpers.updateModifier(weapon.price, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), a.price);
					}
				}
			}

		}
	}

	//Handle if an accessory give environmental modifiers tracer weapon.ammunition.type
	static _handleVisionAccessory(weapon, actor) {
		if (weapon.ammunition.type === "tracer" && weapon.isActive) {
			SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.range, game.i18n.localize('SR5.AmmunitionTypeTracer'), game.i18n.localize('SR5.Ammunition'), -1, false, false);
			SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.wind, game.i18n.localize('SR5.AmmunitionTypeTracer'), game.i18n.localize('SR5.Ammunition'), -1, false, false);
		}

		if (typeof weapon.accessory === "object") weapon.accessory = Object.values(weapon.accessory);

		for (let a of weapon.accessory) {
			switch (a.name) {
				case "flashLightInfrared":
					if (actor.system.visions.thermographic.isActive && a.isActive && weapon.isActive) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.light, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1, false, true);
					break;
				case "flashLightLowLight":
					if (actor.system.visions.lowLight.isActive && a.isActive && weapon.isActive) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.light, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1, false, true);
					break;
				case "imagingScope":
					if (a.isActive && weapon.isActive) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.range, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1, false, false);
					break;
				case "smartgunSystemInternal":
				case "smartgunSystemExternal":
					let hasSmartlink = false;
					for (let i of actor.items){
						if ((i.type === "itemAugmentation" || i.type === "itemGear") && i.system.isActive && Object.keys(i.system.customEffects).length){
							for (let [key, data] of Object.entries(i.system.customEffects)){
								if (data.target === 'system.specialProperties.smartlink' && (data.value > 0)) hasSmartlink = true;
							}
						}
					}
					if (a.isActive && weapon.isActive && hasSmartlink) SR5_EntityHelpers.updateModifier(actor.system.itemsProperties.environmentalMod.wind, game.i18n.localize('SR5.Smartlink'), game.i18n.localize('SR5.WeaponAccessory'), -1, false, false);
					break;
			}
		}
	}

	////////////////////// AUGMENTATIONS ///////////////////////
	static _handleAugmentation(augmentation, actor) {
		let lists = SR5;
		let modifierSource, essenceMultiplier, deviceRating, availabilityModifier, priceMultiplier;

		if (augmentation.category === "cyberlimbs"){
			let cyberlimbs = augmentation.cyberlimbs;
			cyberlimbs.agility.value = cyberlimbs.agility.base + cyberlimbs.agility.customization;
			cyberlimbs.strength.value = cyberlimbs.strength.base + cyberlimbs.strength.customization;
			let cyberlimbsPriceMod = (cyberlimbs.agility.customization + cyberlimbs.strength.customization) * 5000;
			let cyberlimbsAvailabilityMod = (cyberlimbs.agility.customization + cyberlimbs.strength.customization);
			SR5_EntityHelpers.updateModifier(augmentation.availability, 'CustomCyberlimb', 'CustomCyberlimb', cyberlimbsAvailabilityMod);
			SR5_EntityHelpers.updateModifier(augmentation.price, 'CustomCyberlimb', 'CustomCyberlimb', cyberlimbsPriceMod);
		}

		switch (augmentation.grade){
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
				SR5_SystemHelpers.srLog(1, `Unknown '${augmentation.grade}' grade in _handleAugmentation()`);
				return;
		}
		augmentation.deviceRating = deviceRating;
		modifierSource = `${game.i18n.localize(lists.augmentationGrades[augmentation.grade])}`;
		SR5_EntityHelpers.updateModifier(augmentation.availability, modifierSource, game.i18n.localize('SR5.AugmentationGrade'), availabilityModifier, false, false);
		SR5_EntityHelpers.updateModifier(augmentation.price, modifierSource, game.i18n.localize('SR5.AugmentationGrade'), priceMultiplier, true, false);

		if (actor){
			for (let i of actor.items){
				let WeakImmuneSystem = i.system.systemEffects?.find(iEffect => iEffect.value === "doubleEssenceCost")
				if (WeakImmuneSystem) SR5_EntityHelpers.updateModifier(augmentation.essenceCost, i.name, game.i18n.localize(lists.itemTypes[i.type]), 2, true, false);
			}
		}

		SR5_EntityHelpers.updateModifier(augmentation.essenceCost, modifierSource, game.i18n.localize('SR5.AugmentationGrade'), (augmentation.isRatingBased ? essenceMultiplier * augmentation.itemRating : essenceMultiplier), true, false);
		this._handleItemCapacity(augmentation);
		this._handleItemPrice(augmentation);
		this._handleItemAvailability(augmentation);
		this._handleItemEssenceCost(augmentation);
	}

	////////////////// SORTS ////////////////////

	//Handle spell
	static _handleSpell(i, actorData) {
		
		//Damage based on spell type
		if (i.system.category === "combat") {
			i.system.damageValue.base = 0;
			if (i.system.subCategory === "indirect") {
				SR5_EntityHelpers.updateModifier(i.system.damageValue, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), parseInt(i.system.force || 0), false, true);
				SR5_EntityHelpers.updateModifier(i.system.damageValue, game.i18n.localize('SR5.DiceHits'), game.i18n.localize('SR5.SkillSpellcasting'), parseInt(i.system.hits || 0), false, true);
				SR5_EntityHelpers.updateValue(i.system.damageValue, 0);
				SR5_EntityHelpers.updateModifier(i.system.armorPenetration, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), -(i.system.force || 0), false, true);
				SR5_EntityHelpers.updateValue(i.system.armorPenetration);
			} else {
				SR5_EntityHelpers.updateModifier(i.system.damageValue, game.i18n.localize('SR5.DiceHits'), game.i18n.localize('SR5.SkillSpellcasting'), (i.system.hits || 0), false, true);
				SR5_EntityHelpers.updateValue(i.system.damageValue, 0);
			}
		}

		//Handle range
		i.system.spellAreaOfEffect.base = 0;
		if (i.system.range === "area" || i.system.category === "detection"){
			SR5_EntityHelpers.updateModifier(i.system.spellAreaOfEffect, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), parseInt(i.system.force || 0), false, true);
		}
		//Range for detection spell
		if (i.system.category === "detection") {
			SR5_EntityHelpers.updateModifier(i.system.spellAreaOfEffect, game.i18n.localize('SR5.SpellRangeShort'), game.i18n.localize('SR5.SpellCategoryDetection'), actorData.system.specialAttributes.magic.augmented.value, true, true);
			if (i.system.spellAreaExtended === true) {
				SR5_EntityHelpers.updateModifier(i.system.spellAreaOfEffect, game.i18n.localize('SR5.ExtendedRange'), game.i18n.localize('SR5.SpellCategoryDetection'), 10, true, true);
			} 
		}
		SR5_EntityHelpers.updateValue(i.system.spellAreaOfEffect, 0);

		//Modified drain value
		i.system.drainValue.base = 0;
		SR5_EntityHelpers.updateModifier(i.system.drainValue, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), (i.system.force || 0), false, true);
		SR5_EntityHelpers.updateModifier(i.system.drainValue, game.i18n.localize('SR5.SpellDrain'), game.i18n.localize('SR5.DrainModifier'), i.system.drain.base, false, true);
		if (i.system.fetish){
			SR5_EntityHelpers.updateModifier(i.system.drainValue, game.i18n.localize('SR5.Fetish'), game.i18n.localize('SR5.DrainModifier'), -2, false, true);
			SR5_EntityHelpers.updateModifier(i.system.drain, game.i18n.localize('SR5.Fetish'), game.i18n.localize('SR5.Fetish'), -2, false, true);
		}
		SR5_EntityHelpers.updateValue(i.system.drainValue, 2);
		SR5_EntityHelpers.updateValue(i.system.drain);

		//Check if spell is sustained by a spirit
		for (let item of actorData.items){
			if (item.type === "itemSpirit" && item.system.isBounded){
				for (let s of Object.values(item.system.sustainedSpell)){
					if (s.name === i._id) i.system.freeSustain = true;
				}
			}
		}
	}

	//Handle Preparation
	static _handlePreparation(i){
		i.system.test.base = 0;
		SR5_EntityHelpers.updateModifier(i.system.test, game.i18n.localize('SR5.PreparationPotency'), game.i18n.localize('SR5.SkillSpellcasting'), (i.system.potency || 0), false, true);
		SR5_EntityHelpers.updateModifier(i.system.test, game.i18n.localize('SR5.Force'), game.i18n.localize('SR5.LinkedAttribute'), (i.system.force || 0), false, true);
		SR5_EntityHelpers.updateDicePool(i.system.test);
	}

	//Handle power point cost
	static _handleAdeptPower(power, actor) {
		let firstAttribute, secondAttribute;

		if (power.powerPointsCost.isRatingBased) {
			power.powerPointsCost.value = power.powerPointsCost.base * power.itemRating;
		} else {
			power.powerPointsCost.value = power.powerPointsCost.base;
		}

		if (power.needRoll && actor) {
			let firstLabel = game.i18n.localize(SR5.allAttributes[power.testFirstAttribute]);
			if (power.testFirstAttribute){
				if (power.testFirstAttribute === "edge" || power.testFirstAttribute === "magic" || power.testFirstAttribute === "resonance"){
					firstAttribute = actor.system.specialAttributes[power.testFirstAttribute].augmented.value;
				} else if (power.testFirstAttribute === "rating") {
					firstAttribute = power.itemRating;
					firstLabel = game.i18n.localize("SR5.ItemRating");
				} else if (power.testFirstAttribute === "running") {
					firstAttribute = actor.system.skills.running.rating.value;
					firstLabel = game.i18n.localize("SR5.Skill");
				} else if (power.testFirstAttribute === "leadership") {
					firstAttribute = actor.system.skills.leadership.rating.value;
					firstLabel = game.i18n.localize("SR5.Skill");
				} else firstAttribute = actor.system.attributes[power.testFirstAttribute].augmented.value;
			}
	
			let secondLabel = game.i18n.localize(SR5.allAttributes[power.testSecondAttribute]);
			if (power.testSecondAttribute){
				if (power.testSecondAttribute === "edge" || power.testSecondAttribute === "magic" || power.testSecondAttribute === "resonance"){
					secondAttribute = actor.system.specialAttributes[power.testSecondAttribute].augmented.value;
				} else if (power.testSecondAttribute === "rating") {
					secondAttribute = power.itemRating;
					secondLabel = game.i18n.localize("SR5.ItemRating");
				} else if (power.testSecondAttribute === "running") {
					secondAttribute = actor.system.skills.running.rating.value;
					secondLabel = game.i18n.localize("SR5.Skill");
				} else if (power.testSecondAttribute === "leadership") {
					secondAttribute = actor.system.skills.leadership.rating.value;
					secondLabel = game.i18n.localize("SR5.Skill");
				} else secondAttribute = actor.system.attributes[power.testSecondAttribute].augmented.value;
			}

			power.test.base = 0;
			if (firstAttribute) SR5_EntityHelpers.updateModifier(power.test, firstLabel, game.i18n.localize('SR5.LinkedAttribute'), firstAttribute, false, true);
			if (secondAttribute) SR5_EntityHelpers.updateModifier(power.test, secondLabel, game.i18n.localize('SR5.LinkedAttribute'), secondAttribute, false, true);
			SR5_EntityHelpers.updateDicePool(power.test);
		}

		if (power.hasDrain){
			power.drainValue.base = 0;
			if (power.drainType === "rating") SR5_EntityHelpers.updateModifier(power.drainValue, game.i18n.localize('SR5.ItemRating'), game.i18n.localize('SR5.AdeptPower'), Math.ceil(power.itemRating * (power.drainMultiplier || 1)), false, true);
			if (power.drainType === "magic") {
				if (actor) SR5_EntityHelpers.updateModifier(power.drainValue, game.i18n.localize('SR5.Magic'), game.i18n.localize('SR5.AdeptPower'), Math.ceil(actor.system.specialAttributes.magic.augmented.value * (power.drainMultiplier || 1)), false, true);
			}
			SR5_EntityHelpers.updateValue(power.drainValue);
		}
	}

	//Handle Martial Art test
	static _handleMartialArt(martialArt, actor) {
		let firstAttribute, secondAttribute;

		if (martialArt.needRoll && actor) {
			let firstLabel = game.i18n.localize(SR5.allAttributes[martialArt.testFirstAttribute]);
			if (martialArt.testFirstAttribute){
				if (martialArt.testFirstAttribute === "edge" || martialArt.testFirstAttribute === "magic" || martialArt.testFirstAttribute === "resonance"){
					firstAttribute = actor.system.specialAttributes[martialArt.testFirstAttribute].augmented.value;
				} else if (martialArt.testFirstAttribute === "body" || martialArt.testFirstAttribute === "agility" || martialArt.testFirstAttribute === "reaction" || martialArt.testFirstAttribute === "strength" || martialArt.testFirstAttribute === "willpower" || martialArt.testFirstAttribute === "logic" || martialArt.testFirstAttribute === "intuition" || martialArt.testFirstAttribute === "charisma") {
					firstAttribute = actor.system.attributes[martialArt.testFirstAttribute].augmented.value;
				} else {
					firstAttribute = actor.system.skills[martialArt.testFirstAttribute].rating.value;
					firstLabel = game.i18n.localize(SR5.skills[martialArt.testFirstAttribute]);
				}
			}
	
			let secondLabel = game.i18n.localize(SR5.allAttributes[martialArt.testSecondAttribute]);
			if (martialArt.testSecondAttribute){
				if (martialArt.testSecondAttribute === "edge" || martialArt.testSecondAttribute === "magic" || martialArt.testSecondAttribute === "resonance"){
					secondAttribute = actor.system.specialAttributes[martialArt.testSecondAttribute].augmented.value;
				} else if (martialArt.testSecondAttribute === "body" || martialArt.testSecondAttribute === "agility" || martialArt.testSecondAttribute === "reaction" || martialArt.testSecondAttribute === "strength" || martialArt.testSecondAttribute === "willpower" || martialArt.testSecondAttribute === "logic" || martialArt.testSecondAttribute === "intuition" || martialArt.testSecondAttribute === "charisma") {
					secondAttribute = actor.system.attributes[martialArt.testSecondAttribute].augmented.value;
				} else {
					secondAttribute = actor.system.skills[martialArt.testSecondAttribute].rating.value;
					secondLabel = game.i18n.localize(SR5.skills[martialArt.testSecondAttribute]);
				}
			}

			martialArt.test.base = 0;
			if (firstAttribute) SR5_EntityHelpers.updateModifier(martialArt.test, firstLabel, game.i18n.localize('SR5.LinkedAttribute'), firstAttribute, false, true);
			if (secondAttribute) SR5_EntityHelpers.updateModifier(martialArt.test, secondLabel, game.i18n.localize('SR5.LinkedAttribute'), secondAttribute, false, true);
			SR5_EntityHelpers.updateDicePool(martialArt.test);

			

		}
	}

	////////////////////// RITUALS ///////////////////////
	static _generateSpellList(ritual, actor) {
		let spellList = [];
		for (let i of actor.items) {
			if (i.type === "itemSpell" && !i.system.preparation) {
				spellList.push(i);
			}
		}
		return spellList;
	}

	static _handleRitual(i, actorData){
		if (i.system.spellLinked){
			let spellLinked = actorData.items.find(s => s.id === i.system.spellLinked);
			i.system.spellLinkedType = spellLinked.system.category;
			i.system.spellLinkedName = spellLinked.name;
		}
		if (i.system.durationMultiplier === "force") {
			if (i.system.force > 0) i.system.durationValue = i.system.force;
			else i.system.durationValue = `(${game.i18n.localize('SR5.SpellForceShort')})`;
		}
		if (i.system.durationMultiplier === "netHits") {
			if (i.system.netHits > 0) i.system.durationValue = i.system.netHits;
			else i.system.durationValue = `(${game.i18n.localize('SR5.NetHits')})`;
		}
	}

	////////////////////// FOCUS ///////////////////////
	static _handleFocus(focus) {
		this._handleItemPrice(focus);
		this._handleItemAvailability(focus);
	}

	static _generateSustainFocusSpellList(focus, actor) {
		let spellList = [];
		for (let i of actor.items) {
			if (i.type === "itemSpell" && i.system.category === focus.subType && !i.system.preparation) {
				spellList.push(i.name);
			}
		}
		return spellList;
	}

	static _generateWeaponFocusWeaponList(focus, actor) {
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

	static async _checkIfWeaponIsFocus(i, actor){
		let focus = actor.items.find(w => w.system.linkedWeapon === i.id);
		if (focus) i.system.isLinkedToFocus = true;
		else i.system.isLinkedToFocus = false;
	}

	static async _handleWeaponFocus(i, actor){
		let focus = actor.items.find(w => w.system.linkedWeapon === i._id);
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
				i.system.itemEffects.push(effect);
			} 
		}
	}

	////////////////////// DECK & PROGRAMMES ///////////////////////
	static _handleCommlink(commlink) {
		switch (commlink.module){
			case "standard":
				SR5_EntityHelpers.updateModifier(commlink.price, 'standard', 'module', 100);
				break;
			case "hotsim":
				SR5_EntityHelpers.updateModifier(commlink.price, 'hotsim', 'module', 250);
				SR5_EntityHelpers.updateModifier(commlink.availability, 'hotsim', 'module', 4);
				break;
			default:
				SR5_SystemHelpers.srLog(3,"_handleCommlink",`Unknown module : '${commlink.module}'`);
		}
	}

	//Handle complex form
	static _handleComplexForm(complexForm, actor) {
		// Fading calculation
		complexForm.system.fadingValue = complexForm.system.fadingModifier + (complexForm.system.level || 0);
		if (complexForm.system.fadingValue < 2) complexForm.system.fadingValue = 2;

		//Check if complex form is sustained by a sprite
		for (let i of actor.items){
			if (i.type === "itemSprite" && i.system.isRegistered){
				for (let c of Object.values(i.system.sustainedComplexForm)){
					if (c.name === complexForm.id) complexForm.system.freeSustain = true;
				}
			}
		}
	}

	////////////////////// SIN /////////////////////////////////
	static _handleSinLicense(item) {
		item.price.base = 2500 * item.itemRating;
		item.availability.base = 3 * item.itemRating;
		item.legality = "F";
		for (let l of item.license) {
			l.price = l.rating * 200;
			l.availability = l.rating * 3;
			l.legality = "F";
		}
	}

	////////////////////// STYLE DE VIE  ///////////////////////
	// Calcul le loyer des styles de vie
	static _handleLifeStyle(lifeStyle) {
		switch (lifeStyle.type) {
			case "luxury":
				lifeStyle.price.base = 100000;
				break;
			case "high":
				lifeStyle.price.base = 10000;
				break;
			case "middle":
				lifeStyle.price.base = 5000;
				break;
			case "low":
				lifeStyle.price.base = 2000;
				break;
			case "squatter":
				lifeStyle.price.base = 500;
				break;
			case "streets":
				lifeStyle.price.base = 0;
				break;
			default:
				lifeStyle.price.base = 0;
		}

		let priceMultiplier = 1;
		for (let option of lifeStyle.options) {
			switch (option){
				case "specialWorkArea":
					SR5_EntityHelpers.updateModifier(lifeStyle.price, 'specialWorkArea', 'option', 1000);
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
		//SR5_EntityHelpers.updateModifier(lifeStyle.price, 'specialWorkArea', 'option', priceMultiplier);
	}

	////////////////////// VEHICULES  ///////////////////////
	static _handleVehicle(vehicle) {

		for (let vehicleMod of vehicle.vehiclesMod){
			SR5_EntityHelpers.updateModifier(vehicle.price, '${vehicleMod.name}', 'price', vehicleMod.system.price.value);
		}

		if (vehicle.type === "drone") vehicle.deviceRating = vehicle.attributes.pilot;
		else vehicle.deviceRating = 2;

	}

	static _handleVehicleSlots(vehicle) {
		let slots = vehicle.attributes.body ;
		vehicle.modificationSlots.powerTrain = slots ;
		vehicle.modificationSlots.protection = slots ;
		vehicle.modificationSlots.weapons = slots ;
		vehicle.modificationSlots.body = slots ;
		vehicle.modificationSlots.electromagnetic = slots ;
		vehicle.modificationSlots.cosmetic = slots ;
	}

	static _handleWeaponMounted(item) {
		let lists = SR5, data = item.data, wm = data.weaponMount;
		switch (wm.size) {
			case "light":
				data.slots.base = 1;
				data.threshold.base = 4;
				data.tools = "kit";
				data.skill = "armorer";
				data.availability.base = 6;
				data.legality = "F";
				data.price.base = 750;
				break;
			case "standard":
				data.slots.base = 2;
				data.threshold.base = 6;
				data.tools = "shop";
				data.skill = "armorer";
				data.availability.base = 8;
				data.legality = "F";
				data.price.base = 1500;
				break;
			case "heavy":
				data.slots.base = 4;
				data.threshold.base = 10;
				data.tools = "shop";
				data.skill = "armorer";
				data.availability.base = 12;
				data.legality = "F";
				data.price.base = 4000;
				break;
			default:
		}
		switch (wm.visibility) {
			case "external":
			break;
			case "internal":
				SR5_EntityHelpers.updateModifier(data.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_I'), 2);
				SR5_EntityHelpers.updateModifier(data.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_I'), 6);
				SR5_EntityHelpers.updateModifier(data.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_I'), 2);
				SR5_EntityHelpers.updateModifier(data.price, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_I'), 1500);
				if (data.tools == "kit") {
					data.tools = "shop";
				}
				break;
			case "concealed":
				SR5_EntityHelpers.updateModifier(data.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_C'), 4);
				SR5_EntityHelpers.updateModifier(data.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_C'), 10);
				SR5_EntityHelpers.updateModifier(data.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_C'), 4);
				SR5_EntityHelpers.updateModifier(data.price, game.i18n.localize('SR5.VEHICLE_WeaponMountVisibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountVis_C'), 4000);
				if (data.tools == "kit") {
					data.tools = "shop";
				}
				break;
			default:
		}
		switch (wm.flexibility) {
			case "fixed":
				break;
			case "flexible":
				SR5_EntityHelpers.updateModifier(data.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_Fl'), 1);
				SR5_EntityHelpers.updateModifier(data.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_Fl'), 4);
				SR5_EntityHelpers.updateModifier(data.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_Fl'), 2);
				SR5_EntityHelpers.updateModifier(data.price, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_Fl'), 2000);
				if (data.tools == "kit") {
					data.tools = "shop";
				}
				break;
			case "turret":
				SR5_EntityHelpers.updateModifier(data.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_T'), 2);
				SR5_EntityHelpers.updateModifier(data.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_T'), 12);
				SR5_EntityHelpers.updateModifier(data.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_T'), 6);
				SR5_EntityHelpers.updateModifier(data.price, game.i18n.localize('SR5.VEHICLE_WeaponMountFlexibility'), game.i18n.localize('SR5.VEHICLE_WeaponMountFlex_T'), 5000);
				data.tools = "facility";
				break;
			default:
		}
		switch (wm.control) {
			case "remote":
				data.surname = " (" + game.i18n.localize(lists.WeaponMountSize[wm.size]) + ", " + game.i18n.localize(lists.WeaponMountVisibility[wm.visibility]) + ", " + game.i18n.localize(lists.WeaponMountFlexibility[wm.flexibility]) + ", " + game.i18n.localize(lists.WeaponMountControl[wm.control]) + ")";
				break;
			case "manual":
				SR5_EntityHelpers.updateModifier(data.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_M'), 1);
				SR5_EntityHelpers.updateModifier(data.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_M'), 4);
				SR5_EntityHelpers.updateModifier(data.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_M'), 1);
				SR5_EntityHelpers.updateModifier(data.price, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_M'), 500);
				if (data.tools == "kit") {
					data.tools = "shop";
				}
				data.surname = " (" + game.i18n.localize(lists.WeaponMountSize[wm.size]) + ", " + game.i18n.localize(lists.WeaponMountVisibility[wm.visibility]) + ", " + game.i18n.localize(lists.WeaponMountFlexibility[wm.flexibility]) + ", " + game.i18n.localize(lists.WeaponMountControl[wm.control]) + ")";
				break;
			case "armoredManual":
				SR5_EntityHelpers.updateModifier(data.slots, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_AM'), 2);
				SR5_EntityHelpers.updateModifier(data.threshold, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_AM'), 6);
				SR5_EntityHelpers.updateModifier(data.availability, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_AM'), 4);
				SR5_EntityHelpers.updateModifier(data.price, game.i18n.localize('SR5.VEHICLE_WeaponMountControl'), game.i18n.localize('SR5.VEHICLE_WeaponMountCon_AM'), 1500);
				if (data.tools == "kit") {
					data.tools = "shop";
				}
				data.surname = " (" + game.i18n.localize(lists.WeaponMountSize[wm.size]) + ", " + game.i18n.localize(lists.WeaponMountVisibility[wm.visibility]) + ", " + game.i18n.localize(lists.WeaponMountFlexibility[wm.flexibility]) + ", " + game.i18n.localize(lists.WeaponMountControl[wm.control]) + ")";
				break;
			default:
		}

		SR5_EntityHelpers.updateValue(data.slots, 0);
		SR5_EntityHelpers.updateValue(data.threshold, 0);
		SR5_EntityHelpers.updateValue(data.availability, 0);
		SR5_EntityHelpers.updateValue(data.price, 0);
	}

	static  _resetWeaponMounted(data) {
		data.weaponMount.size = "";
		data.weaponMount.visibility = "";
		data.weaponMount.flexibility = "";
		data.weaponMount.control = "";
		data.mountedWeapon = "";
		data.mountedWeaponName = "";
	}

	static _generateWeaponMountWeaponList(data, actor) {
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
		data.system.weaponChoices = weaponList;
		return weaponList;
	}

	static async _checkIfWeaponIsMount(i, actor){
		let mount = actor.items.find(m => m.system.mountedWeapon === i.id);
		if (mount) i.system.isLinkedToMount = true;
		else i.system.isLinkedToMount = false;
	}

	static async _handleWeaponMount(i, actor){
		let mount = actor.items.find(m => m.system.mountedWeapon === i._id);
		if (mount) {
			if (mount.system.isActive){
				i.system.isUsedAsMount = true; 
				}
			}
		} 

	static _handleSlotsMultiplier(item) {
		let multiplier, lists = SR5;
		switch (item.slots.multiplier) {
			case "rating":
				multiplier = item.itemRating;
				break;
			case "capacity":
				multiplier = item.capacity.value;
				break;
			default:
		}
		if (item.slots.multiplier) {
			SR5_EntityHelpers.updateModifier(item.slots, game.i18n.localize(lists.valueMultipliers[item.slots.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(item.slots, 0);
	}

	static _handleThresholdMultiplier(item) {
		let multiplier, lists = SR5;
		switch (item.threshold.multiplier) {
			case "rating":
				multiplier = item.itemRating;
				break;
			case "capacity":
				multiplier = item.capacity.value;
				break;
			default:
		}
		if (item.threshold.multiplier) {
			SR5_EntityHelpers.updateModifier(item.threshold, game.i18n.localize(lists.valueMultipliers[item.threshold.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
		}
		SR5_EntityHelpers.updateValue(item.threshold, 0);
	}

	////////////////////// ESPRITS  //////s////////////////
	static _handleSpirit(spirit) {
		for (let att of Object.keys(spirit.attributes)) {
			spirit.attributes[att] = spirit.itemRating;
		}
		switch (spirit.type) {
			case "air":
			case "noxious":
				spirit.attributes.body += -2;
				spirit.attributes.agility += 3;
				spirit.attributes.reaction += 4;
				spirit.attributes.strength += -3;
				spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "running", "flight");
				break;
			case "abomination":
				spirit.attributes.body += 2;
				spirit.attributes.agility += 1;
				spirit.attributes.strength += 2;
				spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "running", "gymnastics");
				break;
			case "beasts":
				spirit.attributes.body += 2;
				spirit.attributes.agility += 1;
				spirit.attributes.strength += 2;
				spirit.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
				break;
			case "blood":
				spirit.attributes.body += 2;
				spirit.attributes.agility += 2;
				spirit.attributes.strength += 2;
				spirit.attributes.logic += -1;
				spirit.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
				break;
			case "earth":
			case "barren":
				spirit.attributes.body += 4;
				spirit.attributes.agility += -2;
				spirit.attributes.reaction += -1;
				spirit.attributes.strength += 4;
				spirit.attributes.logic += -1;
				spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat");
				break;
			case "fire":
			case "nuclear":
				spirit.attributes.body += 1;
				spirit.attributes.agility += 2;
				spirit.attributes.reaction += 3;
				spirit.attributes.strength += -2;
				spirit.attributes.intuition += 1;
				spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "flight");
				break;
			case "guardian":
				spirit.attributes.body += 1;
				spirit.attributes.agility += 2;
				spirit.attributes.reaction += 3;
				spirit.attributes.strength += 2;
				spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "clubs", "blades");
				break;
			case "guidance":
				spirit.attributes.body += 3;
				spirit.attributes.agility += -1;
				spirit.attributes.reaction += 2;
				spirit.attributes.strength += 1;
				spirit.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
				break;
			case "insectCaretaker":
				spirit.attributes.agility += 1;
				spirit.attributes.reaction += 1;
				spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "spellcasting", "leadership");
				break;
			case "insectNymph":
				spirit.attributes.body += -1;
				spirit.attributes.reaction += 3;
				spirit.attributes.strength += -1;
				spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "spellcasting", "gymnastics");
				break;
			case "insectQueen":
				spirit.attributes.body += 5;
				spirit.attributes.agility += 3;
				spirit.attributes.reaction += 4;
				spirit.attributes.strength += 5;
				spirit.attributes.willpower += 1;
				spirit.attributes.logic += 1;
				spirit.attributes.intuition += 1;
				spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "counterspelling", "con", "gymnastics", "spellcasting", "leadership", "negociation");
				break;
			case "insectScout":
				spirit.attributes.agility += 2;
				spirit.attributes.reaction += 2;
				spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "sneaking", "gymnastics");
				break;
			case "insectSoldier":
				spirit.attributes.body += 3;
				spirit.attributes.agility += 1;
				spirit.attributes.reaction += 1;
				spirit.attributes.strength += 3;
				spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "exoticRangedWeapon", "counterspelling", "gymnastics");
				break;
			case "insectWorker":
				spirit.attributes.strength += 1;
				spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat");
				break;
			case "man":
				spirit.attributes.body += 1;
				spirit.attributes.reaction += 2;
				spirit.attributes.strength += -2;
				spirit.attributes.intuition += 1;
				spirit.skill.push("astralCombat", "assensing", "perception", "running", "unarmedCombat", "spellcasting", "swimming");
				break;
			case "plague":
				spirit.attributes.reaction += 2;
				spirit.attributes.intuition += -1;
				spirit.attributes.strength += -2;
				spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "spellcasting");
				break;
			case "plant":
				spirit.attributes.body += 2;
				spirit.attributes.agility += -1;
				spirit.attributes.strength += 1;
				spirit.attributes.logic += -1;
				spirit.skill.push("astralCombat", "assensing", "perception", "artisan", "unarmedCombat");
				break;
			case "shadowMuse":
			case "shadowNightmare":
			case "shadowShade":
			case "shadowSuccubus":
			case "shadowWraith":
				spirit.attributes.agility += 3;
				spirit.attributes.reaction += 2;
				spirit.attributes.willpower += 1;
				spirit.attributes.intuition += 1;
				spirit.attributes.charisma += 2;
				spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "con", "gymnastics", "intimidation");
				break;
			case "shedim":
				spirit.attributes.reaction += 2;
				spirit.attributes.strength += 1;
				spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat");
				break;
			case "shedimMaster":
				spirit.attributes.reaction += 2;
				spirit.attributes.strength += 1;
				spirit.attributes.willpower += 1;
				spirit.attributes.logic += 1;
				spirit.attributes.intuition += 1;
				spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "counterspelling", "gymnastics", "spellcasting");
				break;
			case "sludge":
				spirit.attributes.body += 1;
				spirit.attributes.agility += 1;
				spirit.attributes.reaction += 2;
				spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat");
				break;
			case "task":
				spirit.attributes.reaction += 2;
				spirit.attributes.strength += 2;
				spirit.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
				break;
			case "water":
				spirit.attributes.agility += 1;
				spirit.attributes.reaction += 2;
				spirit.attributes.charisma += 1;
				spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "swimming");
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${spirit.type}' type in _handleSpirit()`);
		}

		for (let att of Object.keys(spirit.attributes)) {
			if (spirit.attributes[att] < 1) spirit.attributes[att] = 1;
		}
	}

	static _handlePower(power, actor) {
		let lists = SR5;
		let firstAttribute, secondAttribute;
		if (power.testFirstAttribute){
			if (power.testFirstAttribute === "edge" || power.testFirstAttribute === "magic" || power.testFirstAttribute === "resonance"){
				firstAttribute = actor.system.specialAttributes[power.testFirstAttribute].augmented.value;
			} else {
				firstAttribute = actor.system.attributes[power.testFirstAttribute].augmented.value;
			}
		}

		if (power.testSecondAttribute){
			if (power.testSecondAttribute === "edge" || power.testSecondAttribute === "magic" || power.testSecondAttribute === "resonance"){
				secondAttribute = actor.system.specialAttributes[power.testSecondAttribute].augmented.value;
			} else {
				secondAttribute = actor.system.attributes[power.testSecondAttribute].augmented.value;
			}
		}
		power.test.base = 0;
		if (firstAttribute) SR5_EntityHelpers.updateModifier(power.test, game.i18n.localize(lists.allAttributes[power.testFirstAttribute]), game.i18n.localize('SR5.LinkedAttribute'), firstAttribute, false, true);
		if (secondAttribute) SR5_EntityHelpers.updateModifier(power.test, game.i18n.localize(lists.allAttributes[power.testSecondAttribute]), game.i18n.localize('SR5.LinkedAttribute'), secondAttribute, false, true);
		SR5_EntityHelpers.updateDicePool(power.test);
	}

	static _handleSpritePower(power, actor) {
		power.test.base = 0;
		let skill = 0;
		if (power.testSkill) {
			skill = actor.system.skills[power.testSkill].rating.value;
			SR5_EntityHelpers.updateModifier(power.test, game.i18n.localize(SR5.skills[power.testSkill]), game.i18n.localize('SR5.Skill'), skill, false, true);
			SR5_EntityHelpers.updateModifier(power.test, game.i18n.localize('SR5.Level'), game.i18n.localize('SR5.LinkedAttribute'), actor.system.level, false, true);
		}
		SR5_EntityHelpers.updateDicePool(power.test);
	}

	static async _checkIfAccessoryIsPlugged (gear, actor){
		for (let i of actor.items){
			if (i.type === "itemGear" || i.type === "itemArmor" || i.type === "itemAugmentation") {
				if (Object.keys(i.system.accessory).length){
					if (typeof i.system.accessory === "object") i.system.accessory = Object.values(i.system.accessory);
					let accessory = i.system.accessory.find(a => a._id === gear._id)
					if (accessory){
						gear.system.wirelessTurnedOn = i.system.wirelessTurnedOn;
						gear.system.isPlugged = true;
						return;
					}      
				} else {
					gear.system.isPlugged = false;
				}
			}
		}
	}

	static _updatePluggedAccessory(gear, actor){
		for (let a of gear.accessory){
			if (a != ''){
				let item = actor.items.find(i => i.id === a._id);
				let index = gear.accessory.findIndex(b => b._id === a._id);
				item = item.toObject(false);
				gear.accessory[index] = item;
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
			if (customEffect.wifi && !item.system.wirelessTurnedOn){ 
				skipCustomEffect = true;
			}



			SR5_SystemHelpers.srLog(3, ` item ==> '${JSON.stringify(item)}' in applyItemEffects()`);

			let targetObject = SR5_EntityHelpers.resolveObjectPath(customEffect.target, item);
			if (targetObject === null) skipCustomEffect = true;

			SR5_SystemHelpers.srLog(3, ` item.type ==> '${item.type}' , customEffect ==> '${JSON.stringify(customEffect)}' applyItemEffects()`);

			if (item.type === "itemMartialArt" && customEffect.type === "boolean") {
				let booleanValue;
						if (customEffect.value === "true") booleanValue = true;
						else booleanValue = false;
						setProperty(item, customEffect.target, booleanValue);
						SR5_SystemHelpers.srLog(3, ` customEffect.target ==> '${customEffect.target}' , booleanValue ==> '${booleanValue}', item.data ==> '${JSON.stringify(item.data)}' applyItemEffects()`);
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
