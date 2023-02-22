import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5Combat } from "../../system/srcombat.js";
import { SR5 } from "../../config.js";
import { _getSRStatusEffect } from "../../system/effectsList.js";


export class SR5_CharacterUtility extends Actor {
	//************************************************//
	//                     ACTORS                     //
	//************************************************//

	// Reset Actors Properties
	static resetCalculatedValues(actor) {
		let actorData = actor.system, list;

		// Reset Attributes
		switch (actor.type) {
			case "actorDrone":
					list = SR5.vehicleAttributes;
				break;
			case "actorPc":
			case "actorGrunt":
			case "actorSpirit":
			case "actorSprite":
				list = SR5.characterAttributes;
		}

		if (list){
			for (let key of Object.keys(list)) {
				actorData.attributes[key].natural.value = 0;
				actorData.attributes[key].natural.modifiers = [];
				actorData.attributes[key].augmented.value = 0;
				actorData.attributes[key].augmented.modifiers = [];
			}
		}

		// Reset Special Attributes
		if (actorData.specialAttributes) {
			for (let key of Object.keys(SR5.characterSpecialAttributes)) {
				if (actorData.specialAttributes[key]) {
					actorData.specialAttributes[key].natural.value = 0;
					actorData.specialAttributes[key].natural.modifiers = [];
					actorData.specialAttributes[key].augmented.value = 0;
					actorData.specialAttributes[key].augmented.modifiers = [];
				}
			}
		}

		// Reset Initiatives
		for (let key of Object.keys(SR5.characterInitiatives)) {
			if (actorData.initiatives[key]) {
				actorData.initiatives[key].value = 0;
				actorData.initiatives[key].modifiers = [];
				if (!actorData.initiatives[key].dice) { actorData.initiatives[key].dice = {value: 0, base: 1, modifiers: []}; }
				actorData.initiatives[key].dice.value = 0;
				actorData.initiatives[key].dice.modifiers = [];
			}
		}
		if (!this.findActiveInitiative(actorData)) {
			switch (actor.type) {
				case "actorPc":
				case "actorGrunt":
					actorData.initiatives.physicalInit.isActive = true;
					break;
				case "actorSpirit":
					if (actorData.initiatives.astralInit)
						actorData.initiatives.astralInit.isActive = true;
					else
						actorData.initiatives.physicalInit.isActive = true;
					break;
				case "actorDevice":
					actorData.initiatives.matrixInit.isActive = true;
					break;
				case "actorDrone":
					actorData.initiatives.physicalInit.isActive = true;
					break;
			}
		}

		// Reset Limits
		if (actorData.limits) {
			for (let key of Object.keys(SR5.characterLimits)) {
				if (actorData.limits[key]){
					actorData.limits[key].value = 0;
					actorData.limits[key].modifiers = [];
				}
			}
		}

		// Reset Defenses
		if (actorData.defenses){
			for (let key of Object.keys(SR5.characterDefenses)) {
				if (actorData.defenses[key]) {
					actorData.defenses[key].dicePool = 0;
					actorData.defenses[key].modifiers = [];
					actorData.defenses[key].limit.value = 0;
					actorData.defenses[key].limit.modifiers = [];
				}
			}
		}

		// Reset Resistances
		if (actorData.resistances){
			for (let key of Object.keys(SR5.characterResistances)) {
				if (actorData.resistances[key]) {
					let subkey = "";
					switch (key) {
						case "disease":
						case "toxin":
							for (subkey of Object.keys(SR5.propagationVectors)) {
								actorData.resistances[key][subkey].dicePool = 0;
								actorData.resistances[key][subkey].modifiers = [];
							}
							break;
						case "specialDamage":
							for (subkey of Object.keys(SR5.specialDamageTypes)) {
								actorData.resistances[key][subkey].dicePool = 0;
								actorData.resistances[key][subkey].modifiers = [];
							}
							break;
						case "astralDamage":
						case "physicalDamage":
						case "directSpellMana":
						case "directSpellPhysical":
						case "crashDamage":
							actorData.resistances[key].dicePool = 0;
							actorData.resistances[key].modifiers = [];
							break;
					}
				}
			}
		}

		// Reset itemsProperties
		if (actorData.itemsProperties?.armor){
			actorData.itemsProperties.armor.value = 0;
			actorData.itemsProperties.armor.modifiers = [];
			actorData.itemsProperties.armor.padded = false;
			for (let key of Object.keys(SR5.specialDamageTypes)){
				actorData.itemsProperties.armor.specialDamage[key].modifiers = [];
				actorData.itemsProperties.armor.specialDamage[key].value = 0;
			}
			for (let key of Object.keys(SR5.propagationVectors)){
				actorData.itemsProperties.armor.toxin[key].modifiers = [];
				actorData.itemsProperties.armor.toxin[key].value = 0;
			}
		}

		if (actorData.itemsProperties?.weapon){
			actorData.itemsProperties.weapon.accuracy.value = 0;
			actorData.itemsProperties.weapon.accuracy.modifiers = [];
			actorData.itemsProperties.weapon.damageValue.value = 0;
			actorData.itemsProperties.weapon.damageValue.modifiers = [];
		}

		if (actorData.itemsProperties?.environmentalMod){
			for (let key of Object.keys(SR5.environmentalModifiers)){
				actorData.itemsProperties.environmentalMod[key].value = 0;
				actorData.itemsProperties.environmentalMod[key].modifiers = [];
			}
		}

		if (actorData.itemsProperties?.martialArts){
			for (let key of Object.keys(SR5.calledShotsMartialArts)){
				actorData.itemsProperties.martialArts[key].isActive = false;
			}
		}

		// Reset Essence
		if (actorData.essence) {
			actorData.essence.value = 0;
			actorData.essence.modifiers = [];
		}

		// Reset Derived Attributes
		if (actorData.derivedAttributes) {
			for (let key of Object.keys(SR5.characterDerivedAttributes)) {
				actorData.derivedAttributes[key].dicePool = 0;
				actorData.derivedAttributes[key].modifiers = [];
			}
		}

		// Reset Recoil Compensation
		if (actorData.recoilCompensation){
			actorData.recoilCompensation.value = 0;
			actorData.recoilCompensation.modifiers = [];
		}

		// Reset Penalties
		if (actorData.penalties) {
			for (let key of Object.keys(SR5.penaltyTypes)) {
				actorData.penalties[key].actual.value = 0;
				actorData.penalties[key].actual.modifiers = [];
				if (actorData.penalties[key].boxReduction){
					actorData.penalties[key].boxReduction.value = 0;
					actorData.penalties[key].boxReduction.modifiers = [];
				}
				if (actorData.penalties[key].step){
					actorData.penalties[key].step.base = 3;
					actorData.penalties[key].step.value = 0;
					actorData.penalties[key].step.modifiers = [];
				}
			}
		}

		// Reset Movements
		if (actorData.movements) {
			for (let key of Object.keys(SR5.movements)) {
				actorData.movements[key].movement.value = 0;
				actorData.movements[key].movement.modifiers = [];
				actorData.movements[key].extraMovement.value = 0;
				actorData.movements[key].extraMovement.modifiers = [];
				actorData.movements[key].test.dicePool = 0;
				actorData.movements[key].test.modifiers = [];
				actorData.movements[key].maximum.value = 0;
				actorData.movements[key].maximum.modifiers = [];
				actorData.movements[key].limit.value = 0;
				actorData.movements[key].limit.modifiers = [];
				if (key === "walk" || key === "run"){
					actorData.movements[key].multiplier.value = 0;
					actorData.movements[key].multiplier.modifiers = [];
				}
			}
		}

		// Reset Weight Actions
		if (actorData.weightActions) {
			for (let key of Object.keys(SR5.weightActions)) {
				actorData.weightActions[key].baseWeight.value = 0;
				actorData.weightActions[key].baseWeight.modifiers = [];
				actorData.weightActions[key].extraWeight.value = 0;
				actorData.weightActions[key].extraWeight.modifiers = [];
				actorData.weightActions[key].test.dicePool = 0;
				actorData.weightActions[key].test.modifiers = [];
			}
		}

		// Reset Reach
		if (actorData.reach) {
			actorData.reach.value = 0;
			actorData.reach.modifiers = [];
		}

		// Reset Skill Groups
		if (actorData.skillGroups) {
			for (let key of Object.keys(SR5.skillGroups)) {
				actorData.skillGroups[key].value = 0;
				actorData.skillGroups[key].modifiers = [];
			}
		}

		// Reset Skills
		if (actorData.skills) {
			for (let key of Object.keys(SR5.skills)) {
				if (actorData.skills[key]) {
					actorData.skills[key].rating.value = 0;
					actorData.skills[key].rating.modifiers = [];
					actorData.skills[key].test.base = 0;
					actorData.skills[key].test.dicePool = 0;
					actorData.skills[key].test.modifiers = [];
					actorData.skills[key].limit.value = 0;
					actorData.skills[key].limit.modifiers = [];
					switch (key) {
						case "spellcasting":
						case "counterspelling":
						case "ritualSpellcasting":
						case "alchemy":
							for (let category of Object.keys(SR5.spellCategories)) {
								if (actorData.skills[key].spellCategory[category]) {
									actorData.skills[key].spellCategory[category].base = 0;
									actorData.skills[key].spellCategory[category].dicePool = 0;
									actorData.skills[key].spellCategory[category].modifiers = [];
								} else {
									actorData.skills[key].spellCategory[category] = {
										"base": 0,
										"value": 0,
										"modifiers": []
									};
								}
							}
							break;
						case "binding":
						case "banishing":
						case "summoning":
							for (let type of Object.keys(SR5.spiritTypes)) {
								if (actorData.skills[key].spiritType[type]) {
									actorData.skills[key].spiritType[type].base = 0;
									actorData.skills[key].spiritType[type].dicePool = 0;
									actorData.skills[key].spiritType[type].modifiers = [];
								} else {
									actorData.skills[key].spiritType[type] = {
										"base": 0,
										"value": 0,
										"modifiers": []
									};
								}
							}
							break;
						case "perception":
							for (let type of Object.keys(SR5.perceptionTypes)){
								if (actorData.skills[key].perceptionType[type]) {
									actorData.skills[key].perceptionType[type].test.value = 0;
									actorData.skills[key].perceptionType[type].test.modifiers = [];
									actorData.skills[key].perceptionType[type].limit.base = 0;
									actorData.skills[key].perceptionType[type].limit.value = 0;
									actorData.skills[key].perceptionType[type].limit.modifiers = [];
								}
							}
					}
				}
			}
		}

		// Reset Language Skills
		if (actorData.languageSkills) {
			actorData.languageSkills.value = 0;
			actorData.languageSkills.modifiers = [];
		}

		// Reset Knowledge Skills
		if (actorData.knowledgeSkills) {
			actorData.knowledgeSkills.value = 0;
			actorData.knowledgeSkills.modifiers = [];
		}

		// Reset Vision
		if (actorData.visions) {
			for (let key of Object.keys(SR5.visionTypes)) {
				actorData.visions[key].hasVision = false;
				actorData.visions[key].natural = false;
				actorData.visions[key].augmented = false;
			}
		}

		// Reset Special properties
		if (actorData.specialProperties) {
			for (let key of Object.keys(SR5.specialProperties)) {
				actorData.specialProperties[key].value = 0;
				actorData.specialProperties[key].modifiers = [];
			}
			for (let key of Object.keys(SR5.hardenedArmorTypes)) {
				actorData.specialProperties.hardenedArmors[key].value = 0;
				actorData.specialProperties.hardenedArmors[key].modifiers = [];
				actorData.specialProperties.hardenedArmors[key].type = "";
			}
			for (let key of Object.keys(SR5.actionTypes)) {
				if (actorData.specialProperties.actions[key]){
					actorData.specialProperties.actions[key].value = 0;
					actorData.specialProperties.actions[key].modifiers = [];
				}
			}
			actorData.specialProperties.doublePenalties = false;
			actorData.specialProperties.energyAura = "";
			actorData.specialProperties.regeneration = "";
			actorData.specialProperties.anticoagulant = "";
			actorData.specialProperties.essenceDrain = "";
			actorData.specialProperties.fullDefenseAttribute = "willpower";
			actorData.specialProperties.fullDefenseValue = 0;
		}

		// Reset Vehicule Test
		if (actorData.vehicleTest) {
			actorData.vehicleTest.test.base = 0;
			actorData.vehicleTest.test.modifiers = [];
			actorData.vehicleTest.limit.base = 0;
			actorData.vehicleTest.limit.modifiers = [];
		}

		// Reset Ramming Test
		if (actorData.rammingTest) {
			actorData.rammingTest.test.base = 0;
			actorData.rammingTest.test.modifiers = [];
			actorData.rammingTest.limit.base = 0;
			actorData.rammingTest.limit.modifiers = [];
		}

		 // Reset Vehicule Mods
		 if (actorData.vehiclesMod) {
			actorData.modificationSlots.powerTrain.modifiers = [];
			actorData.modificationSlots.protection.base = 0;
			actorData.modificationSlots.protection.modifiers = [];
			actorData.modificationSlots.body.base = 0;
			actorData.modificationSlots.body.modifiers = [];
			actorData.modificationSlots.weapons.base = 0;
			actorData.modificationSlots.weapons.modifiers = [];
			actorData.modificationSlots.electromagnetic.base = 0;
			actorData.modificationSlots.electromagnetic.modifiers = [];
			actorData.modificationSlots.cosmetic.base = 0;
			actorData.modificationSlots.cosmetic.modifiers = [];
		}

		// Reset Vehicule Secondary Propulsion
		if (actorData.isSecondaryPropulsion) {
			actorData.isSecondaryPropulsion = false;
			actorData.secondaryPropulsionType = "";
			actorData.isSecondaryPropulsionActivate = false;
		}

		if (actorData.matrix) {
			//Reset general data
			if (actor.type === "actorPc" ||actor.type === "actorGrunt"){
				actorData.matrix.deviceType = "";
				actorData.matrix.deviceName = "";
			}

			// Reset Matrix Attributes
			if (actorData.matrix.attributes) {
				for (let key of Object.keys(SR5.matrixAttributes)) {
					actorData.matrix.attributes[key].value = 0;
					actorData.matrix.attributes[key].modifiers = [];
				}
			}

			//Reset Link Lock
			if (actorData.matrix.isLinkLocked) actorData.matrix.isLinkLocked = false;
			//Reset Jamming
			if (actorData.matrix.isJamming) actorData.matrix.isJamming = false;

			// Reset Matrix Programs
			if (actorData.matrix.programsCurrentActive) {
				actorData.matrix.programsCurrentActive.value = 0;
				actorData.matrix.programsCurrentActive.modifiers = [];
			}
			if (actorData.matrix.programsMaximumActive) {
				actorData.matrix.programsMaximumActive.value = 0;
				actorData.matrix.programsMaximumActive.modifiers = [];
			}
			if (actorData.matrix.programs) {
				for (let key of Object.keys(SR5.programs)) {
					actorData.matrix.programs[key].isActive = false;
				}
			}

			// Reset Matrix Resistances
			for (let key of Object.keys(SR5.matrixResistances)) {
				actorData.matrix.resistances[key].dicePool = 0;
				actorData.matrix.resistances[key].modifiers = [];
			}

			// Reset Matrix Noise
			if (actorData.matrix.noise) {
				actorData.matrix.noise.value = 0;
				actorData.matrix.noise.modifiers = [];
			}

			// Reset Matrix Marks
			if (actorData.matrix.marks) actorData.matrix.marks = [];

			// Reset Matrix Actions
			if (actorData.matrix.actions) {
				for (let key of Object.keys(SR5.matrixRolledActions)) {
					actorData.matrix.actions[key].test.base = 0;
					actorData.matrix.actions[key].test.dicePool = 0;
					actorData.matrix.actions[key].test.modifiers = [];
					actorData.matrix.actions[key].limit.value = 0;
					actorData.matrix.actions[key].limit.modifiers = [];
					actorData.matrix.actions[key].defense.base = 0;
					actorData.matrix.actions[key].defense.dicePool = 0;
					actorData.matrix.actions[key].defense.modifiers = [];
				}
			}

			// Reset Resonance Actions
			if (actorData.matrix.resonanceActions) {
				for (let key of Object.keys(SR5.resonanceActions)) {
					if (actorData.matrix.resonanceActions[key].test){
						actorData.matrix.resonanceActions[key].test.dicePool = 0;
						actorData.matrix.resonanceActions[key].test.modifiers = [];
					}
					if (actorData.matrix.resonanceActions[key].limit){
						actorData.matrix.resonanceActions[key].limit.value = 0;
						actorData.matrix.resonanceActions[key].limit.modifiers = [];
					}
				}
			}

			// Reset Concentration
			actorData.matrix.concentration = false;
			actorData.matrix.complexFormList = {};

			//Reset public grid if Grid rules are not active
			if (!game.settings.get("sr5", "sr5MatrixGridRules")){
				actorData.matrix.userGrid = "local";
			}

			//Reset connected Objects
			if (actorData.matrix.connectedObject){
				actorData.matrix.connectedObject.augmentations = {};
				actorData.matrix.connectedObject.weapons = {};
				actorData.matrix.connectedObject.armors = {};
				actorData.matrix.connectedObject.gears = {};
				actorData.matrix.connectedObject.vehicles = {};
			}

			//Reset potential PanO Objects
			if (actorData.matrix.potentialPanObject){
				actorData.matrix.potentialPanObject.augmentations = {};
				actorData.matrix.potentialPanObject.weapons = {};
				actorData.matrix.potentialPanObject.armors = {};
				actorData.matrix.potentialPanObject.gears = {};
				actorData.matrix.potentialPanObject.vehicles = {};
			}

			//Reset regiseterd sprite
			actorData.matrix.registeredSprite.current = 0;
		}

		if (actorData.magic) {

			// Reset Concentration
			actorData.magic.concentration = false;
			actorData.magic.spellList = {};

			// Reset Elements
			for (let key of Object.keys(SR5.spellCategories)) {
				actorData.magic.elements[key] = "";
			}

			// Reset Astral Damage
			actorData.magic.astralDamage.value = 0;
			actorData.magic.astralDamage.modifiers = [];

			// Reset Astral Defense
			actorData.magic.astralDefense.dicePool = 0;
			actorData.magic.astralDefense.modifiers = [];

			// Reset Astral Tracking
			actorData.magic.astralTracking.dicePool = 0;
			actorData.magic.astralTracking.modifiers = [];

			// Reset Magic Barrier Traversal
			actorData.magic.passThroughBarrier.dicePool = 0;
			actorData.magic.passThroughBarrier.modifiers = [];

			// Reset Power Points
			actorData.magic.powerPoints.value = 0;
			actorData.magic.powerPoints.modifiers = [];
			actorData.magic.powerPoints.maximum.value = 0;
			actorData.magic.powerPoints.maximum.modifiers = [];

			// Reset Drain Resistance
			actorData.magic.drainResistance.dicePool = 0;
			actorData.magic.drainResistance.modifiers = [];
			actorData.magic.drainResistance.linkedAttribute = "";

			// Reset Possession
			actorData.magic.possession = false;

			// Reset counterspelling
			actorData.magic.counterSpellPool.value = 0;
			actorData.magic.counterSpellPool.modifiers = [];

			//Reset bounded spirit
			actorData.magic.boundedSpirit.current = 0;

			//Reset metamagic
			actorData.magic.metamagics.centering = false;
			actorData.magic.metamagics.quickening = false;
			actorData.magic.metamagics.shielding = false;
			actorData.magic.metamagics.spellShaping = false;
			actorData.magic.metamagics.centeringValue.value = 0;
			actorData.magic.metamagics.centeringValue.modifiers = [];
			actorData.magic.metamagics.spellShapingValue.value = 0;
			actorData.magic.metamagics.spellShapingValue.modifiers = [];

			//Reset background count
			actorData.magic.bgCount.value = 0;
			actorData.magic.bgCount.modifiers = [];
		}

		// Reset Monitors
		if (actorData.conditionMonitors) {
			for (let key of Object.keys(SR5.monitorTypes)) {
				if (actorData.conditionMonitors[key]) {
					actorData.conditionMonitors[key].value = 0;
					actorData.conditionMonitors[key].modifiers = [];
					actorData.conditionMonitors[key].actual.value = 0;
					actorData.conditionMonitors[key].actual.modifiers = [];
					if (actorData.conditionMonitors[key].actual.base < 0) actorData.conditionMonitors[key].actual.base = 0;
				}
			}
		}

		// Reset Karma
		if (actorData.karma) {
			actorData.karma.value = 0;
			actorData.karma.modifiers = [];
		}

		// Reset Reputation
		if (actorData.notoriety) {
			actorData.notoriety.value = 0;
			actorData.notoriety.modifiers = [];
		}

		if (actorData.streetCred) {
			actorData.streetCred.value = 0;
			actorData.streetCred.modifiers = [];
		}

		if (actorData.publicAwareness) {
			actorData.publicAwareness.value = 0;
			actorData.publicAwareness.modifiers = [];
		}

		// Reset Nuyen
		if (actorData.nuyen) {
			actorData.nuyen.value = 0;
			actorData.nuyen.modifiers = [];
		}
	}

	///////////////////////////////////////

	static updateActions(actor) {
		for (let key of Object.keys(SR5.actionTypes)) {
			if (actor.system.specialProperties.actions[key]) SR5_EntityHelpers.updateValue(actor.system.specialProperties.actions[key]);
		}
		
	}

	static updateNuyens(actor) {
		SR5_EntityHelpers.updateValue(actor.system.nuyen);
	}

	static updateKarmas(actor) {
		SR5_EntityHelpers.updateValue(actor.system.karma);
		let karmaGained = SR5_EntityHelpers.modifiersOnlyPositivesSum(actor.system.karma.modifiers);
		if (karmaGained > 9) SR5_EntityHelpers.updateModifier(actor.system.streetCred, `${game.i18n.localize('SR5.KarmaGained')}`, "karma", Math.floor(karmaGained/10), false, true);
	}

	static updateNotoriety(actor) {
		SR5_EntityHelpers.updateValue(actor.system.notoriety);
		if (actor.system.notoriety.value < 0) {
			SR5_EntityHelpers.updateModifier(actor.system.streetCred, `${game.i18n.localize('SR5.ReputationNotorietyNegative')}`, "notoriety", -actor.system.notoriety.value, false, true);
			SR5_CharacterUtility.updateStreetCred(actor);
			actor.system.notoriety.value = 0;
		}
	}

	static updateStreetCred(actor) {
		SR5_EntityHelpers.updateValue(actor.system.streetCred);
	}

	static updatePublicAwareness(actor) {
		SR5_EntityHelpers.updateValue(actor.system.publicAwareness);
	}

	static updatePenalties(actor) {
		if (!actor) { SR5_SystemHelpers.srLog(1, `Missing or invalid actor in call to 'updatePenalties()'`); return; }
		if (!actor.system.penalties) { SR5_SystemHelpers.srLog(1, `No penalties properties for '${actor.name}' actor in call to 'updatePenalties()'`); return; }
		let actorData = actor.system;

		for (let key of Object.keys(SR5.penaltyTypes)) {
				switch (key) {
					case "physical":
					case "stun":
					case "condition":
						if (actorData.conditionMonitors[key]) {
							SR5_EntityHelpers.updateValue(actorData.penalties[key].step);
							SR5_EntityHelpers.updateValue(actorData.penalties[key].boxReduction);
							actorData.penalties[key].actual.base = -Math.floor( (actorData.conditionMonitors[key].actual.value - actorData.penalties[key].boxReduction.value) / actorData.penalties[key].step.value);
							if (actorData.specialProperties.doublePenalties) actorData.penalties[key].actual.base = actorData.penalties[key].actual.base * 2;
							if (actorData.penalties[key].actual.base > 0) actorData.penalties[key].actual.base = 0;
						}
						break;
					case "matrix":
						actorData.penalties[key].actual.base = 0;
						SR5_CharacterUtility.handleSustaining(actor, "itemComplexForm", key)
						break;
					case "magic":
						actorData.penalties[key].actual.base = 0;
						SR5_CharacterUtility.handleSustaining(actor, "itemSpell", key);
						break;
					case "special":
						actorData.penalties[key].actual.base = 0;
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown '${key}' penalty type in 'updatePenalties()'`);
				}

				SR5_EntityHelpers.updateValue(actorData.penalties[key].actual);
				// Assure penalty is not a positive number
				if (actorData.penalties[key].actual.value > 0) actorData.penalties[key].actual.value = 0;
		}

		if (actor.type === "actorPc" || actor.type === "actorSpirit") {
			actorData.penalties.condition.actual.base = actorData.penalties.physical.actual.base + actorData.penalties.stun.actual.base;
			SR5_EntityHelpers.updateValue(actorData.penalties.condition.actual);
		}

		if (actor.type === "actorDrone") {      
			SR5_EntityHelpers.updateModifier(actorData.attributes.handling.augmented, game.i18n.localize('SR5.Penalty'), "penaltyDamage", actorData.penalties.condition.actual.value);
			SR5_EntityHelpers.updateModifier(actorData.attributes.handlingOffRoad.augmented, game.i18n.localize('SR5.Penalty'), "penaltyDamage", actorData.penalties.condition.actual.value);
			SR5_EntityHelpers.updateModifier(actorData.attributes.speed.augmented, game.i18n.localize('SR5.Penalty'), "penaltyDamage", actorData.penalties.condition.actual.value);
			SR5_EntityHelpers.updateModifier(actorData.attributes.speedOffRoad.augmented, game.i18n.localize('SR5.Penalty'), "penaltyDamage", actorData.penalties.condition.actual.value);
			SR5_EntityHelpers.updateValue(actorData.attributes.handling.augmented,0);
			SR5_EntityHelpers.updateValue(actorData.attributes.handlingOffRoad.augmented,0);
			SR5_EntityHelpers.updateValue(actorData.attributes.speed.augmented,0);
			SR5_EntityHelpers.updateValue(actorData.attributes.speedOffRoad.augmented,0);
		}

	}

	static applyPenalty(penalty, property, actor) {
		if (actor.type === "actorDrone") {return;}
		if (!penalty || !property || !actor) { SR5_SystemHelpers.srLog(1, `Missing or invalid parameter in call to 'applyPenalty()'`); return; }
		if (!actor.system.penalties) { SR5_SystemHelpers.srLog(3, `No existing penalties on '${actor.name}' actor in call to 'applyPenalty()'`); return; }
		let actorData = actor.system;
		let details = [];

		switch (penalty) {
			case "condition":
			case "matrix":
			case "magic":
				if (actorData.penalties[penalty].actual.value) {
					SR5_EntityHelpers.updateModifier(property, `${game.i18n.localize(SR5.modifiersTypes[`penalty${penalty}`])}`, `penalty${penalty}`, actorData.penalties[penalty].actual.value);
				}
				break;
			case "special":
				if (actorData.penalties[penalty].actual.value) {
					for (let mod of actorData.penalties.special.actual.modifiers){
						let detail = {
							source: mod.source,
							type: mod.type,
							value: mod.value,
						}
						details.push(detail);
					}
					SR5_EntityHelpers.updateModifier(property, `${game.i18n.localize(SR5.modifiersTypes[`penalty${penalty}`])}`, `penalty${penalty}`, actorData.penalties[penalty].actual.value, false, true, details);
				}
				break;
			default:
				SR5_SystemHelpers.srLog(3, `Unknown penalty type '${penalty}' in 'applyPenalty()'`);
				return;
		}
	}

	// Handle sustaining modifiers
	static handleSustaining(actor, itemType, concentrationType) {
		let sustainedMod = 2;

		//Check sustaining mod.
		for (let i of actor.items){
			 if (i.system.systemEffects){
				for (let is of Object.values(i.system.systemEffects)){
					if (is.value === "sustainingMod1" && i.system.isActive) sustainedMod = 1;
				}
			}
		}

		//Apply sustaining malus.
		for (let i of actor.items) {
			if (i.system.isActive && i.type === itemType && !i.system.freeSustain) SR5_EntityHelpers.updateModifier(actor.system.penalties[concentrationType].actual, `${i.name}`, i.type, -sustainedMod);

			//Except if concentration is active.
			if (i.system.isActive && i.type === itemType
			  && !i.system.freeSustain && !actor.system[concentrationType].concentration
			  && (i.system.force <= actor.system.specialProperties.concentration.value || i.system.level <= actor.system.specialProperties.concentration.value)){
				SR5_EntityHelpers.updateModifier(actor.system.penalties[concentrationType].actual, `${game.i18n.localize('SR5.QualityTypePositive')}`, "concentration", sustainedMod);
				actor.system[concentrationType].concentration = true;
				i.system.freeSustain = true;
			}
		}
	}

	//Handle vision types and environmental modifiers
	static async handleVision(actor){
		let actorData = actor.system;

		if (actor.type === "actorSpirit") {
			actorData.visions.astral.natural = true;
			actorData.visions.astral.hasVision = true;
			actorData.visions.astral.isActive = true;
		}
		if (actorData.initiatives.astralInit.isActive) actorData.visions.augmented = true;
		if (actorData.visions.astral.natural || actorData.visions.augmented) actorData.visions.astral.hasVision = true;
		if (actorData.visions.astral.isActive) actorData.visions.astral.hasVision = true;

		if (actorData.visions.astral.isActive){
			SR5_EntityHelpers.updateModifier(actorData.itemsProperties.environmentalMod.visibility, game.i18n.localize('SR5.AstralPerception'), "visionType", -4, false, false);
			SR5_EntityHelpers.updateModifier(actorData.itemsProperties.environmentalMod.light, game.i18n.localize('SR5.AstralPerception'), "visionType", -4, false, false);
			SR5_EntityHelpers.updateModifier(actorData.itemsProperties.environmentalMod.glare, game.i18n.localize('SR5.AstralPerception'), "visionType", -4, false, false);
			SR5_EntityHelpers.updateModifier(actorData.itemsProperties.environmentalMod.wind, game.i18n.localize('SR5.AstralPerception'), "visionType", -4, false, false);
		}

		if (actorData.visions.lowLight.natural || actorData.visions.lowLight.augmented) {
			actorData.visions.lowLight.hasVision = true;
			if (actorData.visions.lowLight.isActive){
				SR5_EntityHelpers.updateModifier(actorData.itemsProperties.environmentalMod.light, game.i18n.localize('SR5.LowLightVision'), "visionType", -2, false, false);
			}
		}
		if (actorData.visions.thermographic.natural || actorData.visions.thermographic.augmented){
			actorData.visions.thermographic.hasVision = true;
			if (actorData.visions.thermographic.isActive){
				SR5_EntityHelpers.updateModifier(actorData.itemsProperties.environmentalMod.light, game.i18n.localize('SR5.ThermographicVision'), "visionType", -1, false, false);
				SR5_EntityHelpers.updateModifier(actorData.itemsProperties.environmentalMod.visibility, game.i18n.localize('SR5.ThermographicVision'), "visionType", -1, false, false);
			}
		}
		if (actorData.visions.ultrasound.natural || actorData.visions.ultrasound.augmented){
			actorData.visions.ultrasound.hasVision = true;
			if (actorData.visions.ultrasound.isActive){
				SR5_EntityHelpers.updateModifier(actorData.itemsProperties.environmentalMod.visibility, `${game.i18n.localize('SR5.ThermographicVision')}`,  "visionType", -1, false, false);
				SR5_EntityHelpers.updateModifier(actorData.itemsProperties.environmentalMod.light, `${game.i18n.localize('SR5.UltrasoundVision')}`,  "visionType", -3, false, false);
			}
		}
		//environmental modifiers
		if (actorData.itemsProperties?.environmentalMod){
			for (let key of Object.keys(SR5.environmentalModifiers)){
				SR5_EntityHelpers.updateValue(actorData.itemsProperties.environmentalMod[key]);
			}
		}
	}

	//Handle astral vision
	static async handleAstralVision(actor){
		let actorData = actor.system;
		let token, tokenData;

		if (actor.token) {
			token = canvas.scene?.tokens.find((t) => t.id === actor.token.id);
		} else {
			token = canvas.scene?.tokens.find((t) => t.actorId === actor.id);
		}

		if (token) tokenData = duplicate(token);
		if (actorData.visions.astral.isActive){
			await SR5_EntityHelpers.addEffectToActor(actor, "astralVision");
			if (canvas.scene && token) {
				if (tokenData.sight.visionMode === 'astralvision') return;
				tokenData = await SR5_EntityHelpers.getAstralVisionData(tokenData);
				await token.update(tokenData);
			}
		} else {
			await SR5_EntityHelpers.deleteEffectOnActor(actor, "astralVision");
			if (canvas.scene && token){
				tokenData = await SR5_EntityHelpers.getBasicVisionData(tokenData);
				await token.update(tokenData);
			}
		}
	}

	static async switchVision(actor, vision){
		let actorData = duplicate(actor.system),
			currentVision;

		for (let key of Object.keys(SR5.visionActive)){
			if (actorData.visions[key].isActive) currentVision = key;
		}

		for (let key of Object.keys(SR5.visionActive)){
			if (key === vision && key === currentVision) actorData.visions[key].isActive = false;
			else if (key === vision) actorData.visions[key].isActive = true;
			else actorData.visions[key].isActive = false;
		}

		await actor.update({ 'system': actorData });
		if (vision === "astral" || currentVision === "astral") {
			if (actor.isToken) SR5Combat.changeActionInCombat(actor.token.id, [{type: "simple", value: 1, source: "switchPerception"}]);
			else SR5Combat.changeActionInCombat(actor.id, [{type: "simple", value: 1, source: "switchPerception"}]);
			this.handleAstralVision(actor);
		}
	}

	static applyRacialModifers(actor) {
		let actorData = actor.system;
		let label = `${game.i18n.localize(SR5.metatypes[actorData.biography.characterMetatype])}`;

		switch (actorData.biography.characterMetatype) {
			case "human":
				break;
			case "elf":
				actorData.visions.lowLight.natural = true;
				if (actor.type === "actorGrunt") {
					SR5_EntityHelpers.updateModifier(actorData.attributes.agility.natural, label, "metatype", 1);
					SR5_EntityHelpers.updateModifier(actorData.attributes.charisma.natural, label, "metatype", 2);
				}
				break;
			case "dwarf":
				// TODO : lifestyle cost * 1.2
				actorData.visions.thermographic.natural = true;
				for (let vector of Object.keys(SR5.propagationVectors)) {
					SR5_EntityHelpers.updateModifier(actorData.resistances.disease[vector], label, "metatype", 2);
					SR5_EntityHelpers.updateModifier(actorData.resistances.toxin[vector], label, "metatype", 2);
				}
				if (actor.type === "actorGrunt") {
					SR5_EntityHelpers.updateModifier(actorData.attributes.body.natural, label, "metatype", 2);
					SR5_EntityHelpers.updateModifier(actorData.attributes.reaction.natural, label, "metatype", -1);
					SR5_EntityHelpers.updateModifier(actorData.attributes.strength.natural, label, "metatype", 2);
					SR5_EntityHelpers.updateModifier(actorData.attributes.willpower.natural, label, "metatype", 1);
				}
				break;
			case "ork":
				actorData.visions.lowLight.natural = true;
				if (actor.type === "actorGrunt") {
					SR5_EntityHelpers.updateModifier(actorData.attributes.body.natural, label, "metatype", 3);
					SR5_EntityHelpers.updateModifier(actorData.attributes.strength.natural, label, "metatype", 2);
					SR5_EntityHelpers.updateModifier(actorData.attributes.logic.natural, label, "metatype", -1);
					SR5_EntityHelpers.updateModifier(actorData.attributes.charisma.natural, label, "metatype", -1);
				}
				break;
			case "troll":
				// TODO : lifestyle cost * 2
				actorData.visions.thermographic.natural = true;
				SR5_EntityHelpers.updateModifier(actorData.reach, label, "metatype", 1);
				SR5_EntityHelpers.updateModifier(actorData.resistances.physicalDamage, label, "metatype", 1);
				if (actor.type === "actorGrunt") {
					SR5_EntityHelpers.updateModifier(actorData.attributes.body.natural, label, "metatype", 4);
					SR5_EntityHelpers.updateModifier(actorData.attributes.agility.natural, label, "metatype", -1);
					SR5_EntityHelpers.updateModifier(actorData.attributes.strength.natural, label, "metatype", 4);
					SR5_EntityHelpers.updateModifier(actorData.attributes.logic.natural, label, "metatype", -1);
					SR5_EntityHelpers.updateModifier(actorData.attributes.charisma.natural, label, "metatype", -2);
				}
				break;
			default:
				SR5_SystemHelpers.srLog(3, `Unknown metatype '${actorData.biography.characterMetatype}' in 'applyRacialModifers()'`);
				return;
		}
	}

	// Update Attributes
	static updateAttributes(actor) {
		let actorData = actor.system, list;

		if (actor.type == "actorDrone") {
			list = SR5.vehicleAttributes;
		} else {
			list = SR5.characterAttributes;
		}

		for (let key of Object.keys(list)) {
			SR5_EntityHelpers.updateValue(actorData.attributes[key].natural, 0);
			actorData.attributes[key].augmented.base = actorData.attributes[key].natural.value;
			SR5_EntityHelpers.updateValue(actorData.attributes[key].augmented, 0);
		}

		if (actorData.initiatives.astralInit?.isActive && (actor.type == "actorPc" || actor.type == "actorGrunt")){
			actorData.attributes.agility.augmented = actorData.attributes.logic.augmented;
			actorData.attributes.body.augmented = actorData.attributes.willpower.augmented;
			actorData.attributes.reaction.augmented = actorData.attributes.intuition.augmented;
			actorData.attributes.strength.augmented = actorData.attributes.charisma.augmented;
		}

	}

	static updateSpiritAttributes(actor) {
		let actorData = actor.system, attributes = actorData.attributes, specialAttributes = actorData.specialAttributes, essence = actorData.essence;

		//Valeur de base des attributs
		for (let key of Object.keys(SR5.characterAttributes)) {
			attributes[key].natural.base = actorData.force.value;
		}
		actorData.activeSpecialAttribute = "magic";
		specialAttributes.magic.natural.base = actorData.force.value;
		SR5_EntityHelpers.updateValue(specialAttributes.magic.natural);
		essence.base = actorData.force.value;
		SR5_EntityHelpers.updateValue(essence);
		let label = `${game.i18n.localize('SR5.SpiritType')} (${actorData.type})`;

		switch (actorData.type) {
			case "watcher":
				attributes.body.natural.base = 0;
				attributes.agility.natural.base = 0;
				attributes.reaction.natural.base = 0;
				attributes.strength.natural.base = 0;
				SR5_EntityHelpers.updateModifier(attributes.willpower.natural, label, 'spiritType', -2);
				SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', -2);
				SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', -2);
				SR5_EntityHelpers.updateModifier(attributes.charisma.natural, label, 'spiritType', -2);
				break;
			case "homunculus":
				attributes.body.natural.base = 0;
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', -2);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', -2);
				attributes.willpower.natural.base = 3;
				break;
			case "air":
			case "noxious":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', -2);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +3);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +4);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -3);
				break;
			case "water":
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.charisma.natural, label, 'spiritType', +1);
				break;
			case "sludge":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
				break;
			case "man":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -2);
				SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
				break;
			case "plague":
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -2);
				SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
				break;
			case "earth":
			case "barren":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +4);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', -2);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', -1);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +4);
				SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', -1);
				break;
			case "fire":
			case "nuclear":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +3);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -2);
				SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
				break;
			case "beasts":
			case "abomination":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +2);
				break;
			case "shadowMuse":
			case "shadowNightmare":
			case "shadowShade":
			case "shadowSuccubus":
			case "shadowWraith":
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +3);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.willpower.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.charisma.natural, label, 'spiritType', +2);
				break;
			case "blood":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', -1);
				break;
			case "shedim":
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +1);
				break;
			case "shedimMaster":
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.willpower.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
				break;
			case "insectCaretaker":
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +1);
				break;
			case "insectNymph":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', -1);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +3);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -1);
				break;
			case "insectScout":
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
				break;
			case "insectSoldier":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +3);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +3);
				break;
			case "insectWorker":
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +1);
				break;
			case "insectQueen":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +5);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +3);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +4);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +5);
				SR5_EntityHelpers.updateModifier(attributes.willpower.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
				break;
			case "guardian":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +3);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +2);
				break;
			case "guidance":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +3);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', -1);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +1);
				break;
			case "plant":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', -1);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', -1);
				break;
			case "task":
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +2);
				break;
			case "anarch":
				SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', -1);
				SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', -1);
				SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +1);
				SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -1);
				break;
			default:
				SR5_SystemHelpers.srLog(3, `Unknown ${actorData.type} spirit type in 'updateSpiritAttributes()'`);
				return false;
		}
	}

	static updateSpriteValues(actor) {
		let actorData = actor.system, attributes = actorData.attributes, specialAttributes = actorData.specialAttributes, matrixAttributes = actorData.matrix.attributes;

		//Base value of attributes. Hidden but needed for rolls.
		for (let key of Object.keys(SR5.characterAttributes)) {
			attributes[key].natural.base = actorData.level;
		}
		specialAttributes.resonance.natural.base = actorData.level;

		//Base Matrix Attributes
		for (let key of Object.keys(SR5.matrixAttributes)) {
			matrixAttributes[key].base = actorData.level;
		}
		actorData.matrix.deviceRating = actorData.level;
	}

	// Update Actors Special Attributes
	static updateSpecialAttributes(actor) {
		let actorData = actor.system;

		for (let key of Object.keys(SR5.characterSpecialAttributes)) {
			if (actorData.specialAttributes[key]) {
				SR5_EntityHelpers.updateValue(actorData.specialAttributes[key].natural, 0);

				actorData.specialAttributes[key].augmented.base = actorData.specialAttributes[key].natural.value;
				if (key == 'magic' || key == 'resonance') {
					if (actorData.essence?.base - actorData.essence?.value) {
						SR5_EntityHelpers.updateModifier(actorData.specialAttributes[key].augmented, game.i18n.localize('SR5.EssenceLoss'), "augmentations", -1 * Math.ceil(actorData.essence.base - actorData.essence.value));
					}
				}
				SR5_EntityHelpers.updateValue(actorData.specialAttributes[key].augmented, 0);
			}
		}

		if (actor.type === "actorPc" || actor.type === "actorGrunt") {
			// Check Magic/Resonance Actor Sheet Display (and Default to Magic)
			if (!actorData.activeSpecialAttribute) actorData.activeSpecialAttribute = "magic";

			// Update encumbrance
			let armorAccessoriesModifiers = actorData.itemsProperties.armor.modifiers.filter(m => m.type == "armorAccessory");
			if (armorAccessoriesModifiers) {
				let totalArmorAccessoriesValue = SR5_EntityHelpers.modifiersSum(armorAccessoriesModifiers);
				if (totalArmorAccessoriesValue > actorData.attributes.strength.augmented.value + 1) {
					let armorPenalty = Math.floor((totalArmorAccessoriesValue - actorData.attributes.strength.augmented.value) / 2);
					SR5_EntityHelpers.updateModifier(actorData.attributes.agility.augmented, game.i18n.localize('SR5.ArmorEncumbrance'), 'armorEncumbrance', -1 * armorPenalty);
					SR5_EntityHelpers.updateModifier(actorData.attributes.reaction.augmented, game.i18n.localize('SR5.ArmorEncumbrance'), 'armorEncumbrance', -1 * armorPenalty);
					this.updateAttributes(actor);
				}
			}
		}
	}

	// Generate Essence
	static updateEssence(actor) {
		SR5_EntityHelpers.updateValue(actor.system.essence);
	}

	// Generate spirit values
	static updateSpiritValues(actor) {
		SR5_EntityHelpers.updateValue(actor.system.force);
		if (actor.system.type == "homunculus") {
			actor.system.isMaterializing = true;
		}
	}

	// Generate Special Properties
	static updateSpecialProperties(actor) {
		let actorData = actor.system, armor = 0;
		let hardenedArmors = actorData.specialProperties.hardenedArmors;

		//Hardened Armors
		for (let key of Object.keys(SR5.hardenedArmorTypes)){
			//Special = for hardened armor values linked to an attributes
			for (let m of hardenedArmors[key].modifiers){
				if (m.details){
					switch(m.details.type){
						case "essence":
							m.value = actorData.essence.value;
							break;
						case "essenceX2":
							m.value = actorData.essence.value * 2;
							break;
						case "willpower":
							m.value = actorData.attributes.willpower.augmented.value;
							break;
						case "body":
							m.value = actorData.attributes.body.augmented.value;
							break;
					}
				}
			}

			//Updates hardened armors values
			SR5_EntityHelpers.updateValue(hardenedArmors[key]);

			//Update resistance linked to hardened armor
			switch(key){
				case "normalWeapon":
					actorData.itemsProperties.armor.modifiers = actorData.itemsProperties.armor.modifiers.concat(hardenedArmors[key].modifiers);
					break;
				case "astral":
					actorData.resistances.astralDamage.modifiers = actorData.resistances.astralDamage.modifiers.concat(hardenedArmors[key].modifiers);
					break;
				case "fire":
				case "cold" :
					actorData.resistances.specialDamage[key].modifiers = actorData.resistances.specialDamage[key].modifiers.concat(hardenedArmors[key].modifiers);
					break;
				case "toxins":
					actorData.resistances.toxin.contact.modifiers = actorData.resistances.toxin.contact.modifiers.concat(hardenedArmors[key].modifiers);
					actorData.resistances.toxin.ingestion.modifiers = actorData.resistances.toxin.ingestion.modifiers.concat(hardenedArmors[key].modifiers);
					actorData.resistances.toxin.inhalation.modifiers = actorData.resistances.toxin.inhalation.modifiers.concat(hardenedArmors[key].modifiers);
					actorData.resistances.toxin.injection.modifiers = actorData.resistances.toxin.injection.modifiers.concat(hardenedArmors[key].modifiers);
					break;
			}
		}

		if (actorData.specialProperties.fullDefenseAttribute) {
			if (actorData.specialProperties.fullDefenseAttribute === "perception" || actorData.specialProperties.fullDefenseAttribute === "gymnastics"){
				actorData.specialProperties.fullDefenseValue = actorData.skills[actorData.specialProperties.fullDefenseAttribute].rating.value;
			} else actorData.specialProperties.fullDefenseValue = actorData.attributes[actorData.specialProperties.fullDefenseAttribute].augmented.value;
		}

		for (let key of Object.keys(SR5.specialProperties)) {
			if (actorData.specialProperties[key]) {
				SR5_EntityHelpers.updateValue(actorData.specialProperties[key]);
			}
		}
	}

	// Generate Actor Derived Attributes
	static updateDerivedAttributes(actor) {
		let derivedAttributes = actor.system.derivedAttributes,
			attributes = actor.system.attributes;

		for (let key of Object.keys(SR5.characterDerivedAttributes)) {
			derivedAttributes[key].base = 0
			switch (key) {
				case "composure":
					SR5_EntityHelpers.updateModifier(derivedAttributes[key], game.i18n.localize('SR5.Charisma'), "linkedAttribute", attributes.charisma.augmented.value);
					SR5_EntityHelpers.updateModifier(derivedAttributes[key], game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
					break;
				case "judgeIntentions":
					SR5_EntityHelpers.updateModifier(derivedAttributes[key], game.i18n.localize('SR5.Charisma'), "linkedAttribute", attributes.charisma.augmented.value);
					SR5_EntityHelpers.updateModifier(derivedAttributes[key], game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
					break;
				case "memory":
					SR5_EntityHelpers.updateModifier(derivedAttributes[key], game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
					SR5_EntityHelpers.updateModifier(derivedAttributes[key], game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
					break;
				case "surprise":
					SR5_EntityHelpers.updateModifier(derivedAttributes[key], game.i18n.localize('SR5.Reaction'), "linkedAttribute", attributes.reaction.augmented.value);
					SR5_EntityHelpers.updateModifier(derivedAttributes[key], game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
					break;
				default:
					SR5_SystemHelpers.srLog(1, `Unknown derived attribute '${key}' in 'updateDerivedAttributes()'`);
			}
			this.applyPenalty("condition", derivedAttributes[key], actor);
			this.applyPenalty("matrix", derivedAttributes[key], actor);
			this.applyPenalty("magic", derivedAttributes[key], actor);
			this.applyPenalty("special", derivedAttributes[key], actor);
			SR5_EntityHelpers.updateDicePool(derivedAttributes[key], 0);
		}
	}

	// Generate Actors Recoil Compensation
	static updateRecoil(actor) {
		if (actor.type === "actorDrone") actor.system.recoilCompensation.base = actor.system.attributes.body.augmented.value;
		else actor.system.recoilCompensation.base = parseInt(1 + Math.ceil(actor.system.attributes.strength.augmented.value / 3));

		SR5_EntityHelpers.updateValue(actor.system.recoilCompensation);
	}

	// Generate  Actors Weights Actions
	static updateEncumbrance(actor) {
		let attributes = actor.system.attributes,
			weightActions = actor.system.weightActions;

		for (let key of Object.keys(SR5.weightActions)) {
			switch (key) {
				case "carry":
					weightActions[key].baseWeight.base = attributes.strength.augmented.value * 10;
					weightActions[key].extraWeight.base = 10;
					break;
				case "lift":
					weightActions[key].baseWeight.base = attributes.strength.augmented.value * 15;
					weightActions[key].extraWeight.base = 15;
					break;
				case "liftAboveHead":
					weightActions[key].baseWeight.base = attributes.strength.augmented.value * 5;
					weightActions[key].extraWeight.base = 5;
					break;
				default:
					SR5_SystemHelpers.srLog(1, `Unknown weights action '${key}' in 'updateEncumbrance()'`);
			}
			SR5_EntityHelpers.updateValue(weightActions[key].baseWeight);
			SR5_EntityHelpers.updateValue(weightActions[key].extraWeight);
			weightActions[key].test.base = 0;
			SR5_EntityHelpers.updateModifier(weightActions[key].test, game.i18n.localize('SR5.Strength'), "linkedAttribute", attributes.strength.augmented.value);
			SR5_EntityHelpers.updateModifier(weightActions[key].test, game.i18n.localize('SR5.Body'), "linkedAttribute", attributes.body.augmented.value );
			this.applyPenalty("condition", weightActions[key].test, actor);
			this.applyPenalty("matrix", weightActions[key].test, actor);
			this.applyPenalty("magic", weightActions[key].test, actor);
			this.applyPenalty("special", weightActions[key].test, actor);
			SR5_EntityHelpers.updateDicePool(weightActions[key].test, 0);
		}
	}

	// Handle Actors Movement
	// TODO : Add toggle for running modifiers p.162
	static updateMovements(actor) {
		let movements = actor.system.movements,
			attributes = actor.system.attributes,
			skills = actor.system.skills,
			biography = actor.system.biography;

		//Manage walk and run multiplier
		SR5_EntityHelpers.updateValue(movements.walk.multiplier);
		SR5_EntityHelpers.updateValue(movements.run.multiplier);

		for (let key of Object.keys(SR5.movements)) {
			movements[key].movement.base = 0;
			switch (key) {
				case "fly":
					if (actor.type == "actorSpirit") {
						movements[key].extraMovement.base = 5;
					}
					if (skills.flight?.rating?.value > 0) {
						SR5_EntityHelpers.updateModifier(movements[key].movement, game.i18n.localize('SR5.Agility'), "linkedAttribute", attributes.agility.augmented.value * movements.run.multiplier.value);
						SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.Strength'), "linkedAttribute", attributes.strength.augmented.value);
						SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.SkillFly'), "skillRating", skills.flight.rating.value);
						movements[key].extraMovement.base = 2;
					}
					break;
				case "verticalJump":
					let height = (biography && biography.characterHeight ? biography.characterHeight / 100 : 1);
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.Agility'), "linkedAttribute", attributes.agility.augmented.value);
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.SkillGymnastics'), "skillRating", skills.gymnastics.rating.value);
					movements[key].extraMovement.base = 0.5;
					movements[key].max = SR5_EntityHelpers.roundDecimal(1.5 * height, 2);
					break;
				case "horizontalJumpStanding":
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.Agility'), "linkedAttribute", attributes.agility.augmented.value);
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.SkillGymnastics'), "skillRating", skills.gymnastics.rating.value);
					movements[key].extraMovement.base = 1;
					movements[key].maximum.base = Math.ceil(1.5 * attributes.agility.augmented.value);
				break;
				case "horizontalJumpRunning":
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.Agility'), "linkedAttribute", attributes.agility.augmented.value);
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.SkillGymnastics'), "skillRating", skills.gymnastics.rating.value);
					movements[key].extraMovement.base = 2;
					movements[key].maximum.base = Math.ceil(1.5 * attributes.agility.augmented.value);
					break;
				case "holdBreath":
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.SkillSwimming'), "skillRating", skills.swimming.rating.value);
					movements[key].movement.base = 60;
					movements[key].extraMovement.base = 15;
					break;
				case "run":
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.Strength'), "linkedAttribute", attributes.strength.augmented.value);
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.SkillRunning'), "skillRating", skills.running.rating.value);
					movements[key].movement.base = attributes.agility.augmented.value * movements[key].multiplier.value;
					if (biography && (biography.characterMetatype === "dwarf" || biography.characterMetatype === "troll"))
						movements[key].extraMovement.base = 1;
					else {
						if (actor.type == "actorSpirit") {
							movements[key].extraMovement.base = 5;
						} else {
							movements[key].extraMovement.base = 2;
						}
					}
					break;
				case "swim":
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.Strength'), "linkedAttribute", attributes.strength.augmented.value);
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.SkillSwimming'), "skillRating", skills.swimming.rating.value);
					movements[key].movement.base = Math.ceil((attributes.strength.augmented.value + attributes.agility.augmented.value) / 2);
					if (biography && (biography.characterMetatype === "elf" || biography.characterMetatype === "troll"))
						movements[key].extraMovement.base = 2;
					else {
						if (actor.type == "actorSpirit") {
							movements[key].extraMovement.base = 5;
						} else {
							movements[key].extraMovement.base = 1;
						}
					}
					break;
				case "treadWater":
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.Strength'), "linkedAttribute", attributes.strength.augmented.value);
					SR5_EntityHelpers.updateModifier(movements[key].test, game.i18n.localize('SR5.SkillSwimming'), "skillRating", skills.swimming.rating.value);
					movements[key].movement.base = attributes.strength.augmented.value;
					movements[key].extraMovement.base = attributes.strength.augmented.value;
					break;
				case "walk":
					SR5_EntityHelpers.updateModifier(movements[key].movement, game.i18n.localize('SR5.Agility'), "linkedAttribute", attributes.agility.augmented.value * movements[key].multiplier.value);
					break;
				default:
					SR5_SystemHelpers.srLog(1, `Unknown movement '${key}' in 'updateMovements()'`);
			}
			SR5_EntityHelpers.updateValue(movements[key].movement);
			SR5_EntityHelpers.updateValue(movements[key].extraMovement);
			SR5_EntityHelpers.updateValue(movements[key].maximum);
			this.applyPenalty("condition", movements[key].test, actor);
			this.applyPenalty("matrix", movements[key].test, actor);
			this.applyPenalty("magic", movements[key].test, actor);
			this.applyPenalty("special", movements[key].test, actor);
			SR5_EntityHelpers.updateDicePool(movements[key].test, 0);
		}
	}

	// Handle Actors Condition Monitors
	static updateConditionMonitors(actor) {
		let actorData = actor.system, 
			conditionMonitors = actorData.conditionMonitors, 
			attributes = actorData.attributes, 
			specialAttributes = actorData.specialAttributes;
			
		if (actor.type == "actorSpirit") {
			if (actorData.type == "homunculus" || actorData.type == "watcher") {
				delete actorData.conditionMonitors.physical;
				delete actorData.conditionMonitors.stun;
				delete actorData.statusBars.physical;
				delete actorData.statusBars.stun;
				if (!actorData.conditionMonitors.condition){
					actorData.conditionMonitors.condition = {
						"value": 0,
						"base": 0,
						"modifiers": [],
						"actual": {
							"value": 0,
							"base": 0,
							"modifiers": [],
						},
						"boxes": []
					};
				}
				actorData.statusBars.condition = {
					"value": 0,
					"max": 0
				};
			}
		}

		for (let key of Object.keys(SR5.monitorTypes)) {
			if (conditionMonitors[key]) {
				switch (key) {
					case "stun":
						conditionMonitors[key].base = Math.ceil((attributes.willpower.augmented.value / 2) + 8);
						break;
					case "physical":
						conditionMonitors[key].base = Math.ceil((attributes.body.augmented.value / 2) + 8);
						break;
					case "condition":
						if (actor.type == "actorDrone") {
							if (actorData.type === "drone") conditionMonitors[key].base = Math.ceil((attributes.body.augmented.value / 2) + 6);
							else conditionMonitors[key].base = Math.ceil((attributes.body.augmented.value / 2) + 12);
						} else {
							conditionMonitors[key].base = Math.max(Math.ceil((attributes.willpower.augmented.value / 2) + 8), Math.ceil((attributes.body.augmented.value / 2) + 8));
						}
						break;
					case "overflow":
						conditionMonitors[key].base = attributes.body.augmented.value;
						if (conditionMonitors.physical.actual.value < conditionMonitors.physical.value) conditionMonitors[key].actual.base = 0;
						break;
					case "matrix":
						conditionMonitors[key].base = Math.ceil((actorData.matrix.deviceRating / 2) + 8);
						break;
					case "edge":
						conditionMonitors[key].base = specialAttributes.edge.augmented.value;
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown '${key}' condition monitor type in 'updateConditionMonitors()'`);
						return;
				}
				SR5_EntityHelpers.updateValue(conditionMonitors[key], 1);
				if (conditionMonitors[key].actual.value > conditionMonitors[key].value) conditionMonitors[key].actual.base = conditionMonitors[key].value;
				SR5_EntityHelpers.updateValue(conditionMonitors[key].actual, 0);
				SR5_EntityHelpers.GenerateMonitorBoxes(actorData, key);
				SR5_EntityHelpers.updateStatusBars(actor, key);
			}
		}
	}

	// Generate physical initiative
	static updateInitiativePhysical(actor) {
		let actorData = actor.system, initiatives = actorData.initiatives,
			attributes = actorData.attributes, initPhy = initiatives.physicalInit;

		initPhy.base = 0;
		initPhy.dice.base = 0;

		switch (actor.type) {
			case "actorDrone":
				let controlerData;
				if (actorData.vehicleOwner.id) {
					controlerData = actorData.vehicleOwner.system;
				}
				switch (actorData.controlMode){
					case "autopilot":
						SR5_EntityHelpers.updateModifier(initPhy, game.i18n.localize('SR5.VehicleStat_PilotShort'), "linkedAttribute", attributes.pilot.augmented.value);
						SR5_EntityHelpers.updateModifier(initPhy, game.i18n.localize('SR5.VehicleStat_PilotShort'), "linkedAttribute", attributes.pilot.augmented.value);
						initPhy.dice.base = 4;
						break;
					case "manual":
						SR5_EntityHelpers.updateModifier(initPhy, game.i18n.localize('SR5.InitiativePhysical'), "controler", controlerData.initiatives.physicalInit.value);
						SR5_EntityHelpers.updateModifier(initPhy.dice, game.i18n.localize('SR5.InitiativePhysical'), "controler", controlerData.initiatives.physicalInit.dice.value);
						break;
					case "remote":
					case "rigging":
						SR5_EntityHelpers.updateModifier(initPhy, game.i18n.localize('SR5.InitiativeMatrix'), "controler", controlerData.initiatives.matrixInit.value);
						SR5_EntityHelpers.updateModifier(initPhy.dice, game.i18n.localize('SR5.InitiativeMatrix'), "controler", controlerData.initiatives.matrixInit.dice.value);
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown controle mode '${actorData.controlMode}' in 'updateInitiatives() for drone/vehicle' ('${actorData.model}')`);
				}
				break;
			case "actorSpirit":
				SR5_EntityHelpers.updateModifier(initPhy, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
				SR5_EntityHelpers.updateModifier(initPhy, game.i18n.localize('SR5.Reaction'), "linkedAttribute", attributes.reaction.augmented.value);
				initPhy.dice.base = 1;
				if (actorData.type !== "homunculus")  SR5_EntityHelpers.updateModifier(initPhy.dice, game.i18n.localize(SR5.spiritTypes[actorData.type]), "spiritType", 1);
				break;
			default:
				SR5_EntityHelpers.updateModifier(initPhy, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
				SR5_EntityHelpers.updateModifier(initPhy, game.i18n.localize('SR5.Reaction'), "linkedAttribute", attributes.reaction.augmented.value);
				initPhy.dice.base = 1;
		}

		this.applyPenalty("condition", initPhy, actor);
		this.applyPenalty("matrix", initPhy, actor);
		this.applyPenalty("magic", initPhy, actor);
		SR5_EntityHelpers.updateValue(initPhy, 0);
		SR5_EntityHelpers.updateValue(initPhy.dice, 0, 5);
		initPhy.dice.value = Math.floor(initPhy.dice.value);
	}

	// Generate astral initiative
	static updateInitiativeAstral(actor) {
		let actorData = actor.system, initiatives = actorData.initiatives, attributes = actorData.attributes, initAst = initiatives.astralInit;

		initAst.base = 0;
		initAst.dice.base = 0;

		if (actor.type === "actorSpirit") {
			SR5_EntityHelpers.updateModifier(initAst, game.i18n.localize('SR5.SpiritForce'), "linkedAttribute", actorData.force.value);
			switch (actorData.type) {
				case "watcher":
					SR5_EntityHelpers.updateModifier(initAst, game.i18n.localize('SR5.SpiritForce'), "linkedAttribute", actorData.force.value);
					SR5_EntityHelpers.updateModifier(initAst.dice, game.i18n.localize(SR5.spiritTypes[actorData.type]), "spiritType", 1);
					break;
				case "shadowMuse":
				case "shadowNightmare":
				case "shadowShade":
				case "shadowSuccubus":
				case "shadowWraith":
					SR5_EntityHelpers.updateModifier(initAst, game.i18n.localize('SR5.SpiritForce'), "linkedAttribute", actorData.force.value);
					SR5_EntityHelpers.updateModifier(initAst, game.i18n.localize(SR5.spiritTypes[actorData.type]), "spiritType", 1);
					SR5_EntityHelpers.updateModifier(initAst.dice, game.i18n.localize(SR5.spiritTypes[actorData.type]), "spiritType", 3);
					break;
				default:
					SR5_EntityHelpers.updateModifier(initAst, game.i18n.localize('SR5.SpiritForce'), "linkedAttribute", actorData.force.value);
					SR5_EntityHelpers.updateModifier(initAst.dice, game.i18n.localize(SR5.spiritTypes[actorData.type]), "spiritType", 3);
			}
		} else {
			SR5_EntityHelpers.updateModifier(initAst, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
			SR5_EntityHelpers.updateModifier(initAst, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
			SR5_EntityHelpers.updateModifier(initAst.dice, game.i18n.localize('SR5.AstralProjection'), "astralPlane", 3);
		}
		this.applyPenalty("condition", initAst, actor);
		this.applyPenalty("matrix", initAst, actor);
		this.applyPenalty("magic", initAst, actor);
		SR5_EntityHelpers.updateValue(initAst, 0);
		SR5_EntityHelpers.updateValue(initAst.dice, 0, 5);
		initAst.dice.value = Math.floor(initAst.dice.value);
	}

	// Generate matrix initiative
	static updateInitiativeMatrix(actor) {
		let actorData = actor.system, initiatives = actorData.initiatives, attributes = actorData.attributes, initMat = initiatives.matrixInit,
			matrixAttributes = actorData.matrix.attributes;
		initMat.base = 0;
		initMat.dice.base = 0;

		switch (actor.type){
			case "actorPc":
			case "actorGrunt":
				switch (actorData.matrix.userMode) {
					case "ar":
						initMat.modifiers = initMat.modifiers.concat(initiatives.physicalInit.modifiers);
						initMat.dice.base = 1;
						initMat.dice.modifiers = initMat.dice.modifiers.concat(initiatives.physicalInit.dice.modifiers);
						break;
					case "coldsim":
						SR5_EntityHelpers.updateModifier(initMat, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
						SR5_EntityHelpers.updateModifier(initMat, actorData.matrix.deviceName, "device", matrixAttributes.dataProcessing.value);
						SR5_EntityHelpers.updateModifier(initMat.dice, game.i18n.localize('SR5.VirtualRealityColdSimShort'), "matrixUserMode", 3);
						break;
					case "hotsim":
						SR5_EntityHelpers.updateModifier(initMat, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
						SR5_EntityHelpers.updateModifier(initMat, actorData.matrix.deviceName, "device", matrixAttributes.dataProcessing.value);
						SR5_EntityHelpers.updateModifier(initMat.dice, game.i18n.localize('SR5.VirtualRealityColdSimShort'), "matrixUserMode", 4);
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown matrix userMode '${actorData.matrix.userMode}' in 'updateInitiativeMatrix()'`);
				}
			break;
			case "actorSprite":
				SR5_EntityHelpers.updateModifier(initMat, game.i18n.localize('SR5.Level'), "linkedAttribute", actorData.level);
				SR5_EntityHelpers.updateModifier(initMat, game.i18n.localize('SR5.DataProcessing'), "linkedAttribute", matrixAttributes.dataProcessing.value);
				SR5_EntityHelpers.updateModifier(initMat.dice, game.i18n.localize(SR5.spriteTypes[actorData.type]), `${game.i18n.localize('ACTOR.TypeActorsprite')}`, 4);
				break;
			case "actorAgent":
				SR5_EntityHelpers.updateModifier(initMat,`${game.i18n.localize('SR5.Rating')}`, "linkedAttribute", actorData.rating);
				SR5_EntityHelpers.updateModifier(initMat, `${game.i18n.localize('SR5.DataProcessing')}`, "linkedAttribute", matrixAttributes.dataProcessing.value);
				SR5_EntityHelpers.updateModifier(initMat.dice, game.i18n.localize(SR5.spriteTypes[actorData.type]), `${game.i18n.localize('ACTOR.TypeActoragent')}`, 4);
				break;
			case "actorDevice":
				SR5_EntityHelpers.updateModifier(initMat,`${game.i18n.localize('SR5.DeviceRating')}`, "linkedAttribute", actorData.matrix.deviceRating);
				SR5_EntityHelpers.updateModifier(initMat,`${game.i18n.localize('SR5.DataProcessing')}`, "linkedAttribute", matrixAttributes.dataProcessing.value);
				SR5_EntityHelpers.updateModifier(initMat.dice, `${game.i18n.localize(SR5.deviceTypes[actorData.matrix.deviceType])}`, `${game.i18n.localize('ACTOR.TypeActordevice')}`, 4);
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown actor type '${actor.type}' in 'updateInitiativeMatrix()'`);
		}

		if (actorData.matrix.userMode !== "ar") this.applyPenalty("condition", initMat, actor);
		this.applyPenalty("matrix", initMat, actor);
		this.applyPenalty("magic", initMat, actor);
		SR5_EntityHelpers.updateValue(initMat, 0);
		SR5_EntityHelpers.updateValue(initMat.dice, 0, 5);
		initMat.dice.value = Math.floor(initMat.dice.value);
	}

	// Find Actor Active Initiative
	static findActiveInitiative(actor) {
		for (let [key, value] of Object.entries(actor.initiatives)) {
			if (value.isActive) return key;
		}
		return false;
	}

	// Switch Actor To New Initiative
	static async switchToInitiative(entity, initiative) {
		let actor;
		if (entity.token) actor = entity.token.getActor();
		else actor = entity;

		let actorData = duplicate(actor.system),
			initiatives = actorData.initiatives,
			currentInitiative = this.findActiveInitiative(actor.system),
			actorId = (actor.isToken ? actor.token.id : actor.id);

		if (currentInitiative) initiatives[currentInitiative].isActive = false;
		if (currentInitiative === "astralInit") actorData.visions.astral.isActive = false;
		initiatives[initiative].isActive = true;
		if (initiative === "astralInit") actorData.visions.astral.isActive = true;

		await actor.update({ 'system': actorData });
		//check if previous effect is on
		let previousInitiativeEffect = actor.effects.find(effect => effect.origin === "initiativeMode");
		//generate effect
		let initiativeEffect;
		if (initiative !== "physicalInit") initiativeEffect = await _getSRStatusEffect(initiative);

		// if initiative is physical remove effect, else add or update active effect
		if (initiative === "physicalInit"){
			if(previousInitiativeEffect) await actor.deleteEmbeddedDocuments('ActiveEffect', [previousInitiativeEffect.id]);
			if (currentInitiative === "astralInit" && game.combat) SR5Combat.changeActionInCombat(actorId, [{type: "complex", value: 1, source: "switchInitToPhysical"}]);
			else if (currentInitiative === "matrixInit" && game.combat && actorData.matrix.userMode !== "ar") SR5Combat.changeActionInCombat(actorId, [{type: "simple", value: 1, source: "switchInitToPhysical"}]);
		} else {
			if(previousInitiativeEffect) await previousInitiativeEffect.update(initiativeEffect);
			else await actor.createEmbeddedDocuments('ActiveEffect', [initiativeEffect]);
			//Manage actions
			if (initiative === "astralInit" && game.combat) SR5Combat.changeActionInCombat(actorId, [{type: "complex", value: 1, source: "switchInitToAstral"}]);
			else if (initiative === "matrixInit" && game.combat && actorData.matrix.userMode !== "ar") SR5Combat.changeActionInCombat(actorId, [{type: "simple", value: 1, source: "switchInitToMatrix"}]);
		}

		if (initiative === "astralInit" || currentInitiative === "astralInit") this.handleAstralVision(entity);
	}

	// Generate Actor defense
	static updateDefenses(actor) {
		let actorData = actor.system, attributes = actorData.attributes, skills = actorData.skills, defenses = actorData.defenses;

		for (let key of Object.keys(SR5.characterDefenses)) {
			if (defenses[key]) {
				defenses[key].base = 0;
				switch (key) {
					case "block":
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Reaction'), "linkedAttribute", attributes.reaction.augmented.value);
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
						SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.SkillUnarmedCombat')}`, "skillRating", skills.unarmedCombat.rating.value);
						break;
					case "defend":
						if (actor.type == "actorDrone") {
							let controlerData;
							if (actorData.vehicleOwner.id) controlerData = actorData.vehicleOwner.system;
							switch (actorData.controlMode){
								case "autopilot":
									SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.VehicleStat_PilotShort')}`, "linkedAttribute", attributes.pilot.augmented.value);
									defenses[key].modifiers = defenses[key].modifiers.concat(actor.system.penalties.special.actual.modifiers);
									break;
								case "remote":
								case "manual":
									SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Reaction'), "controler", controlerData.attributes.reaction.augmented.value);
									SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Intuition'), "controler", controlerData.attributes.intuition.augmented.value);
									break;
								case "rigging":
									SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Reaction'), "controler", controlerData.attributes.reaction.augmented.value);
									SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Intuition'), "controler", controlerData.attributes.intuition.augmented.value);
									if (controlerData.specialProperties.controlRig.value) SR5_EntityHelpers.updateModifier(defenses[key], `${game.i18n.localize('SR5.ControlRig')}`, `${game.i18n.localize('SR5.Augmentation')}`, controlerData.specialProperties.controlRig.value);
									if (controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(defenses[key], `${game.i18n.localize('SR5.VirtualRealityHotSimShort')}`, "matrixUserMode", 1);
									break;
								default:
									SR5_SystemHelpers.srLog(1, `Unknown controle mode '${actorData.controlMode}' in 'updateDefenses() for drone/vehicle'`);
							}

						} else {
							SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Reaction'), "linkedAttribute", attributes.reaction.augmented.value);
							SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
						}
						break;
					case "dodge":
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Reaction'), "linkedAttribute", attributes.reaction.augmented.value);
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.SkillGymnastics'), "skillRating", skills.gymnastics.rating.value);
						break;
					case "parryClubs":
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Reaction'), "linkedAttribute", attributes.reaction.augmented.value);
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.SkillClubs'), "skillRating", skills.clubs.rating.value);
						break;
					case "parryBlades":
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Reaction'), "linkedAttribute", attributes.reaction.augmented.value);
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
						SR5_EntityHelpers.updateModifier(defenses[key], game.i18n.localize('SR5.SkillBlades'), "skillRating", skills.blades.rating.value);
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown '${key}' defense in 'updateDefenses()'`);
				}
				this.applyPenalty("condition", defenses[key], actor);
				this.applyPenalty("matrix", defenses[key], actor);
				this.applyPenalty("magic", defenses[key], actor);
				this.applyPenalty("special", defenses[key], actor);
				SR5_EntityHelpers.updateDicePool(defenses[key], 0);
			}
		}
	}

	// Generate Actors Armor
	static updateArmor(actor) {
		SR5_EntityHelpers.updateValue(actor.system.itemsProperties.armor, 0);
		for (let key of Object.keys(SR5.specialDamageTypes)){
			SR5_EntityHelpers.updateValue(actor.system.itemsProperties.armor.specialDamage[key], 0);
		}
		for (let key of Object.keys(SR5.propagationVectors)){
			SR5_EntityHelpers.updateValue(actor.system.itemsProperties.armor.toxin[key], 0);
		}
	}
	
	// Generate Actors Resistances
	static updateResistances(actor) {
		let actorData = actor.system, resistances = actorData.resistances, attributes = actorData.attributes;

		for (let key of Object.keys(SR5.characterResistances)) {
			if (resistances[key]) {
				switch (key) {
					case "fatigue":
						resistances[key].base = 0;
						SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.Body'), "linkedAttribute", attributes.body.augmented.value);
						SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
						SR5_EntityHelpers.updateDicePool(resistances[key], 0);
						break;
					case "specialDamage":
						for (let specialDamage of Object.keys(SR5.specialDamageTypes)) {
							if (actor.type == "actorDrone") {
								resistances[key][specialDamage].base = 0;
								SR5_EntityHelpers.updateModifier(resistances[key][specialDamage], game.i18n.localize('SR5.Body'), "linkedAttribute", attributes.body.augmented.value);
								SR5_EntityHelpers.updateModifier(resistances[key][specialDamage],`${game.i18n.localize('SR5.VehicleStat_ArmorShort')}`, "linkedAttribute", attributes.armor.augmented.value);
							} else {
								resistances[key][specialDamage].base = 0;
								SR5_EntityHelpers.updateModifier(resistances[key][specialDamage], game.i18n.localize('SR5.Body'), "linkedAttribute", attributes.body.augmented.value);
								if (actorData.itemsProperties) {
									resistances.specialDamage[specialDamage].modifiers = resistances.specialDamage[specialDamage].modifiers.concat(actorData.itemsProperties.armor.modifiers);
									resistances.specialDamage[specialDamage].modifiers = resistances.specialDamage[specialDamage].modifiers.concat(actorData.itemsProperties.armor.specialDamage[specialDamage].modifiers);
								}
							}
							SR5_EntityHelpers.updateDicePool(resistances[key][specialDamage], 0);
						}
						break;
					case "disease":
					case "toxin":
						for (let vector of Object.keys(SR5.propagationVectors)) {
							resistances[key][vector].base = 0;
							SR5_EntityHelpers.updateModifier(resistances[key][vector], game.i18n.localize('SR5.Body'), "linkedAttribute", attributes.body.augmented.value);
							SR5_EntityHelpers.updateModifier(resistances[key][vector], game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
							if (actorData.itemsProperties && key === "toxin") {
								resistances.toxin[vector].modifiers = resistances.toxin[vector].modifiers.concat(actorData.itemsProperties.armor.toxin[vector].modifiers);
							}
							SR5_EntityHelpers.updateDicePool(resistances[key][vector], 0);
						}
						break;
					case "directSpellMana":
						resistances[key].base = 0;
						SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
						SR5_EntityHelpers.updateDicePool(resistances[key], 0);
						break;
					case "directSpellPhysical":
						if (actor.type == "actorDrone") {
							resistances[key].base = 0;
							SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.Body'), "linkedAttribute", attributes.body.augmented.value);
							SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.VehicleStat_ArmorShort'), "linkedAttribute", attributes.armor.augmented.value);
						} else {
							resistances[key].base = 0;
							SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.Body'), "linkedAttribute", attributes.body.augmented.value);
						}
						SR5_EntityHelpers.updateDicePool(resistances[key], 0);
						break;
					case "physicalDamage":
					case "fall":
						if (actor.type == "actorDrone") {
							resistances[key].base = 0;
							SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.Body'), "linkedAttribute", attributes.body.augmented.value);
							SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.VehicleStat_ArmorShort'), "linkedAttribute", attributes.armor.augmented.value);
						} else {
							resistances[key].base = 0;
							SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.Body'), "linkedAttribute", attributes.body.augmented.value);
						}
						if (actorData.itemsProperties) resistances[key].modifiers = resistances[key].modifiers.concat(actorData.itemsProperties.armor.modifiers);
						SR5_EntityHelpers.updateDicePool(resistances[key], 0);
						break;
					case "crashDamage":
						if (actor.type == "actorDrone"){
							resistances[key].base = 0;
							SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.Body'), "linkedAttribute", attributes.body.augmented.value);
							SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.VehicleStat_ArmorShort'), "linkedAttribute", attributes.armor.augmented.value);
							SR5_EntityHelpers.updateDicePool(resistances[key], 0);
						}
						break;
					case "astralDamage":
						SR5_EntityHelpers.updateModifier(resistances[key], game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
						SR5_EntityHelpers.updateDicePool(resistances[key], 0);
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown resistance '${key}' in 'updateResistances()'`);
				}
			}
		}
	}

	// // Generate Actors Limits
	static updateLimits(actor) {
		let actorData = actor.system, limits = actorData.limits, attributes = actorData.attributes;

		for (let key of Object.keys(SR5.characterLimits)) {
			switch (key) {
				case "astralLimit":
					if (limits[key]){
						limits[key].base = Math.max(
							Math.ceil((attributes.logic.augmented.value * 2 + attributes.intuition.augmented.value + attributes.willpower.augmented.value) / 3),
							Math.ceil((attributes.charisma.augmented.value * 2 + attributes.willpower.augmented.value + actorData.essence.value) / 3)
						);
					}
					break;
				case "mentalLimit":
					if (limits[key]){
						limits[key].base = Math.ceil((attributes.logic.augmented.value * 2 + attributes.intuition.augmented.value + attributes.willpower.augmented.value) / 3);
					}
					break;
				case "physicalLimit":
					if (limits[key]){
						limits[key].base = Math.ceil((attributes.strength.augmented.value * 2 + attributes.body.augmented.value + attributes.reaction.augmented.value) / 3);
					}
					break;
				case "socialLimit":
					if (limits[key]){
						limits[key].base = Math.ceil((attributes.charisma.augmented.value * 2 + attributes.willpower.augmented.value + actorData.essence.value) / 3);
					}
					break;
				default:
					SR5_SystemHelpers.srLog(1, `Unknown limit '${key}' in 'updateLimits()'`);
			}
			if (limits[key]) SR5_EntityHelpers.updateValue(limits[key], 0);
		}
	}

	// Vehicle Skills Calculations
	static generateVehicleSkills(actor) {
		let actorData = actor.system, skills = actorData.skills, attributes = actorData.attributes, handlingMode = attributes.handling.augmented.value, handlingName = game.i18n.localize('SR5.VehicleStat_HandlingShort');
		let controlerData, controlerName;
		if (actorData.vehicleOwner.id) {
			controlerData = actorData.vehicleOwner.system;
			controlerName = actorData.vehicleOwner.name;
		}

		if (actorData.offRoadMode) {
			if (actorData.isSecondaryPropulsionActivate) {
					handlingMode = attributes.secondaryPropulsionHandlingOffRoad.augmented.value;
					handlingName = game.i18n.localize('SR5.VehicleStat_SecondaryHandlingORShort');
			} else {
				handlingMode = attributes.handlingOffRoad.augmented.value;
				handlingName = game.i18n.localize('SR5.VehicleStat_HandlingORShort');
			}
		}

		skills.sneaking.rating.base = 0;
		skills.sneaking.limit.base = 0;
		skills.perception.rating.base = 0;
		skills.perception.limit.base = 0;

		switch (actorData.controlMode){
			case "autopilot":
				SR5_EntityHelpers.updateModifier(skills.sneaking.rating, game.i18n.localize('SR5.VehicleStat_PilotShort'), "linkedAttribute", attributes.pilot.augmented.value);
				SR5_EntityHelpers.updateModifier(skills.sneaking.limit, handlingName, "linkedAttribute", handlingMode);
				SR5_EntityHelpers.updateModifier(skills.perception.rating, game.i18n.localize('SR5.VehicleStat_PilotShort'), "linkedAttribute", attributes.pilot.augmented.value);
				SR5_EntityHelpers.updateModifier(skills.perception.limit, game.i18n.localize('SR5.VehicleStat_SensorShort'), "linkedAttribute", attributes.sensor.augmented.value);
				break;
			case "remote":
				SR5_EntityHelpers.updateModifier(skills.perception.test, game.i18n.localize('SR5.ControlMode'), actorData.controlMode, controlerData.skills.perception.test.dicePool);
				SR5_EntityHelpers.updateModifier(skills.perception.limit, game.i18n.localize('SR5.VehicleStat_SensorShort'), "linkedAttribute", attributes.sensor.augmented.value);
				if (controlerData.matrix.attributes.dataProcessing.value < attributes.sensor.augmented.value){
					let mod = controlerData.matrix.attributes.dataProcessing.value - attributes.sensor.augmented.value;
					SR5_EntityHelpers.updateModifier(skills.perception.limit, game.i18n.localize('SR5.DataProcessingLimit'), actorData.controlMode, mod);
				}
				//TODO : sneaking is equal to lesser value between pilotSkill and Sneaking(pilotSkill)
				if (actorData.pilotSkill){
					SR5_EntityHelpers.updateModifier(skills.sneaking.test, `${game.i18n.localize('SR5.Controler')}${game.i18n.localize('SR5.Colons')} ${controlerName}`, actorData.controlMode, controlerData.skills[actorData.pilotSkill].test.dicePool);
				}
				SR5_EntityHelpers.updateModifier(skills.sneaking.limit, handlingName, "linkedAttribute", handlingMode);
				if (controlerData.matrix.attributes.dataProcessing.value < handlingMode){
					let mod = controlerData.matrix.attributes.dataProcessing.value - handlingMode;
					SR5_EntityHelpers.updateModifier(skills.sneaking.limit, game.i18n.localize('SR5.DataProcessingLimit'), actorData.controlMode, mod);
				}
				break;
			case "manual":
				SR5_EntityHelpers.updateModifier(skills.perception.test, `${game.i18n.localize('SR5.Controler')}${game.i18n.localize('SR5.Colons')} ${controlerName}`, actorData.controlMode, controlerData.skills.perception.test.dicePool);
				SR5_EntityHelpers.updateModifier(skills.perception.limit, game.i18n.localize('SR5.VehicleStat_SensorShort'), "linkedAttribute", attributes.sensor.augmented.value);
				//TODO : sneaking is equal to lesser value between pilotSkill and Sneaking(pilotSkill)
				if (actorData.pilotSkill){
					SR5_EntityHelpers.updateModifier(skills.sneaking.test, `${game.i18n.localize('SR5.Controler')}${game.i18n.localize('SR5.Colons')} ${controlerName}`, actorData.controlMode, controlerData.skills[actorData.pilotSkill].test.dicePool);
				}
				SR5_EntityHelpers.updateModifier(skills.sneaking.limit, handlingName, "linkedAttribute", handlingMode);
				break;
			case "rigging":
				if (controlerData.specialProperties.controlRig.value) {
					SR5_EntityHelpers.updateModifier(skills.perception.test, game.i18n.localize('SR5.ControlRig'), "augmentations", controlerData.specialProperties.controlRig.value);
					SR5_EntityHelpers.updateModifier(skills.sneaking.test, game.i18n.localize('SR5.ControlRig'), "augmentations", controlerData.specialProperties.controlRig.value);
					SR5_EntityHelpers.updateModifier(skills.sneaking.limit, game.i18n.localize('SR5.ControlRig'), "augmentations", controlerData.specialProperties.controlRig.value);
				}
				SR5_EntityHelpers.updateModifier(skills.perception.test, game.i18n.localize('SR5.Controler'), actorData.controlMode, controlerData.skills.perception.test.dicePool);
				SR5_EntityHelpers.updateModifier(skills.perception.limit, game.i18n.localize('SR5.VehicleStat_SensorShort'), "linkedAttribute", attributes.sensor.augmented.value);
				//TODO : sneaking is equal to lesser value between pilotSkill and Sneaking(pilotSkill)
				if (actorData.pilotSkill){
					SR5_EntityHelpers.updateModifier(skills.sneaking.test, `${game.i18n.localize('SR5.Controler')}${game.i18n.localize('SR5.Colons')} ${controlerName}`, actorData.controlMode, controlerData.skills[actorData.pilotSkill].test.dicePool);
				}
				SR5_EntityHelpers.updateModifier(skills.sneaking.limit, handlingName, "linkedAttribute", handlingMode);
				SR5_EntityHelpers.updateModifier(skills.sneaking.limit, game.i18n.localize('SR5.ControlRigging'), actorData.controlMode, 1);
				if (controlerData.matrix.userMode === "hotsim") {
					SR5_EntityHelpers.updateModifier(skills.perception.test, game.i18n.localize('SR5.VirtualRealityHotSimShort'), "matrixUserMode", 1);
					SR5_EntityHelpers.updateModifier(skills.sneaking.test, game.i18n.localize('SR5.VirtualRealityHotSimShort'), "matrixUserMode", 1);
				}
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown controle mode '${actorData.controlMode}' in 'generateVehicleSkills()'`);
		}

		//Update Values
		SR5_EntityHelpers.updateValue(skills.sneaking.rating, 0);
		SR5_EntityHelpers.updateValue(skills.perception.rating, 0);
		//Update DicePools
		skills.sneaking.test.base = 0;
		skills.sneaking.test.modifiers = skills.sneaking.test.modifiers.concat(skills.sneaking.rating.modifiers);
		skills.perception.test.base = 0;
		skills.perception.test.modifiers = skills.perception.test.modifiers.concat(skills.perception.rating.modifiers);
		//Special for autopilot drone
		if (actorData.controlMode === "autopilot"){
			skills.sneaking.test.modifiers = skills.sneaking.test.modifiers.concat(actor.system.penalties.special.actual.modifiers);
			skills.perception.test.modifiers = skills.perception.test.modifiers.concat(actor.system.penalties.special.actual.modifiers);
		}
		SR5_EntityHelpers.updateDicePool(skills.sneaking.test, 0);
		SR5_EntityHelpers.updateDicePool(skills.perception.test, 0);
		//Update Limits
		SR5_EntityHelpers.updateValue(skills.sneaking.limit, 0);
		SR5_EntityHelpers.updateValue(skills.perception.limit, 0);
	}

	//
	static generateVehicleTest(actor){
		let actorData = actor.system, vehicleTest = actorData.vehicleTest, attributes = actorData.attributes;
		if (actorData.offRoadMode) {
			if (actorData.isSecondaryPropulsionActivate) vehicleTest.limit.base = attributes.secondaryPropulsionHandlingOffRoad.augmented.value;
			else vehicleTest.limit.base = attributes.handlingOffRoad.augmented.value;
		} else {
			if (actorData.isSecondaryPropulsionActivate) vehicleTest.limit.base = attributes.secondaryPropulsionHandling.augmented.value;
			else vehicleTest.limit.base = attributes.handling.augmented.value;
		}
		vehicleTest.test.base = 0;
		let controlerData, controlerName;
		if (actorData.vehicleOwner.id) {
			controlerData = actorData.vehicleOwner.system;
			controlerName = actorData.vehicleOwner.name;
		}

		switch (actorData.controlMode){
			case "autopilot":
				SR5_EntityHelpers.updateModifier(vehicleTest.test, game.i18n.localize('SR5.VehicleStat_PilotShort'), "linkedAttribute", attributes.pilot.augmented.value);
				vehicleTest.test.modifiers = vehicleTest.test.modifiers.concat(actor.system.penalties.special.actual.modifiers);
				break;
			case "remote":
				if (actorData.pilotSkill) SR5_EntityHelpers.updateModifier(vehicleTest.test, `${game.i18n.localize('SR5.Controler')}${game.i18n.localize('SR5.Colons')} ${controlerName} (${game.i18n.localize(SR5.pilotSkills[actorData.pilotSkill])})`, actorData.controlMode, controlerData.skills[actorData.pilotSkill].test.dicePool);
				if (controlerData.matrix.userMode === "ar") SR5_EntityHelpers.updateModifier(vehicleTest.limit, game.i18n.localize('SR5.AugmentedReality'), "matrixUserMode", 1);
				else if (controlerData.matrix.userMode === "coldsim" || controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(vehicleTest.limit, game.i18n.localize('SR5.VirtualReality'), "matrixUserMode", 2);
				break;
			case "manual":
				if (actorData.pilotSkill) SR5_EntityHelpers.updateModifier(vehicleTest.test, `${game.i18n.localize('SR5.Controler')}${game.i18n.localize('SR5.Colons')} ${controlerName} (${game.i18n.localize(SR5.pilotSkills[actorData.pilotSkill])})`, actorData.controlMode, controlerData.skills[actorData.pilotSkill].test.dicePool);
				if (controlerData.matrix.userMode === "ar") SR5_EntityHelpers.updateModifier(vehicleTest.limit,  game.i18n.localize('SR5.AugmentedReality'), "matrixUserMode", 1);
				else if (controlerData.matrix.userMode === "coldsim" || controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(vehicleTest.limit, game.i18n.localize('SR5.VirtualReality'), "matrixUserMode", 2);
				break;
			case "rigging":
				if (actorData.pilotSkill) SR5_EntityHelpers.updateModifier(vehicleTest.test, `${game.i18n.localize('SR5.Controler')}${game.i18n.localize('SR5.Colons')} ${controlerName} (${game.i18n.localize(SR5.pilotSkills[actorData.pilotSkill])})`, actorData.controlMode, controlerData.skills[actorData.pilotSkill].test.dicePool);
				SR5_EntityHelpers.updateModifier(vehicleTest.limit, game.i18n.localize('SR5.ControlRigging'), game.i18n.localize('SR5.ControlMode'), 3);
				if (controlerData.specialProperties.controlRig.value){
					SR5_EntityHelpers.updateModifier(vehicleTest.test, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
					SR5_EntityHelpers.updateModifier(vehicleTest.limit, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
				}
				if (controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(vehicleTest.test, game.i18n.localize('SR5.VirtualRealityHotSimShort'), "matrixUserMode", 1);
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown controle mode '${actorData.controlMode}' in 'generateVehicleTest()'`);
		}

		//update vehicle Actions Value
		SR5_EntityHelpers.updateDicePool(vehicleTest.test, 0);
		SR5_EntityHelpers.updateValue(vehicleTest.limit, 0);
	}

	//
	static generateRammingTest(actor){
		let actorData = actor.system, rammingTest = actorData.rammingTest, attributes = actorData.attributes;
		if (actorData.offRoadMode) {
			if (actorData.isSecondaryPropulsionActivate) rammingTest.limit.base = attributes.secondaryPropulsionHandlingOffRoad.augmented.value;
			else rammingTest.limit.base = attributes.handlingOffRoad.augmented.value;
		} else {
			if (actorData.isSecondaryPropulsionActivate) rammingTest.limit.base = attributes.secondaryPropulsionHandling.augmented.value;
			else rammingTest.limit.base = attributes.handling.augmented.value;
		}
		rammingTest.test.base = 0;
		let controlerData, controlerName;
		if (actorData.vehicleOwner.id) {
			controlerData = actorData.vehicleOwner.system;
			controlerName = actorData.vehicleOwner.name;
		}

		switch (actorData.controlMode){
			case "autopilot":
				SR5_EntityHelpers.updateModifier(rammingTest.test, game.i18n.localize('SR5.VehicleStat_PilotShort'), "linkedAttribute", attributes.pilot.augmented.value);
				rammingTest.test.modifiers = rammingTest.test.modifiers.concat(actor.system.penalties.special.actual.modifiers);
				break;
			case "remote":
				if (actorData.pilotSkill) SR5_EntityHelpers.updateModifier(rammingTest.test, `${game.i18n.localize('SR5.Controler')}${game.i18n.localize('SR5.Colons')} ${controlerName} (${game.i18n.localize(SR5.pilotSkills[actorData.pilotSkill])})`, actorData.controlMode, controlerData.skills[actorData.pilotSkill].test.dicePool);
				if (controlerData.matrix.userMode === "ar") SR5_EntityHelpers.updateModifier(rammingTest.limit, game.i18n.localize('SR5.AugmentedReality'), "matrixUserMode", 1);
				else if (controlerData.matrix.userMode === "coldsim" || controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(rammingTest.limit, game.i18n.localize('SR5.VirtualReality'), "matrixUserMode", 2);
				break;
			case "manual":
				if (actorData.pilotSkill) SR5_EntityHelpers.updateModifier(rammingTest.test, `${game.i18n.localize('SR5.Controler')}${game.i18n.localize('SR5.Colons')} ${controlerName} (${game.i18n.localize(SR5.pilotSkills[actorData.pilotSkill])})`, actorData.controlMode, controlerData.skills[actorData.pilotSkill].test.dicePool);
				if (controlerData.matrix.userMode === "ar") SR5_EntityHelpers.updateModifier(rammingTest.limit,  game.i18n.localize('SR5.AugmentedReality'), "matrixUserMode", 1);
				else if (controlerData.matrix.userMode === "coldsim" || controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(rammingTest.limit, game.i18n.localize('SR5.VirtualReality'), "matrixUserMode", 2);
				break;
			case "rigging":
				if (actorData.pilotSkill) SR5_EntityHelpers.updateModifier(rammingTest.test, `${game.i18n.localize('SR5.Controler')}${game.i18n.localize('SR5.Colons')} ${controlerName} (${game.i18n.localize(SR5.pilotSkills[actorData.pilotSkill])})`, actorData.controlMode, controlerData.skills[actorData.pilotSkill].test.dicePool);
				SR5_EntityHelpers.updateModifier(rammingTest.limit, game.i18n.localize('SR5.ControlRigging'), game.i18n.localize('SR5.ControlMode'), 3);
				if (controlerData.specialProperties.controlRig.value){
					SR5_EntityHelpers.updateModifier(rammingTest.test, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
					SR5_EntityHelpers.updateModifier(rammingTest.limit, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
				}
				if (controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(rammingTest.test, game.i18n.localize('SR5.VirtualRealityHotSimShort'), "matrixUserMode", 1);
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown controle mode '${actorData.controlMode}' in 'generateRammingTest()'`);
		}

		//update vehicle Actions Value
		SR5_EntityHelpers.updateDicePool(rammingTest.test, 0);
		SR5_EntityHelpers.updateValue(rammingTest.limit, 0);
	}

	// Vehicle Slots Calculations
	static updateModificationsSlots(actor, itemData){
		let actorData = actor.system;
		
		if (itemData.isActive){
			switch (itemData.type){
				case "powerTrain":
					SR5_EntityHelpers.updateModifier(actorData.modificationSlots.powerTrain, itemData.name, itemData.type, -itemData.slots.value);
					break;
				case "protection":
					SR5_EntityHelpers.updateModifier(actorData.modificationSlots.protection, itemData.name, itemData.type, -itemData.slots.value);
					break;
				case "body":
					SR5_EntityHelpers.updateModifier(actorData.modificationSlots.body, itemData.name, itemData.type, -itemData.slots.value);
					break;
				case "weapons":
					SR5_EntityHelpers.updateModifier(actorData.modificationSlots.weapons, itemData.name, itemData.type, -itemData.slots.value);
					break;
				case "electromagnetic":
					SR5_EntityHelpers.updateModifier(actorData.modificationSlots.electromagnetic, itemData.name, itemData.type, -itemData.slots.value);
					break;
				case "cosmetic":
					SR5_EntityHelpers.updateModifier(actorData.modificationSlots.cosmetic, itemData.name, itemData.type, -itemData.slots.value);
					break;
			}
		}
	}


	// Handle Price Multiplier for itemVehicleMod
	static handleVehiclePriceMultiplier(actor, itemData){
		let actorData = actor.system;
		itemData.vehiclePriceMultiplier.acceleration = actorData.attributes.acceleration.natural.base;
		itemData.vehiclePriceMultiplier.handling = actorData.attributes.handling.natural.base;
		itemData.vehiclePriceMultiplier.speed = actorData.attributes.speed.natural.base;
		itemData.vehiclePriceMultiplier.body = actorData.attributes.body.natural.base;
		itemData.vehiclePriceMultiplier.seating = actorData.attributes.seating.natural.base;
		itemData.vehiclePriceMultiplier.vehicle = actorData.price;
	}

	// Handle secondary Vehicle attributes for secondary propulsion
	static handleSecondaryAttributes(actor, itemData){
		let actorData = actor.system, attributes = actorData.attributes;

		actorData.isSecondaryPropulsion = itemData.secondaryPropulsion.isSecondaryPropulsion ;
		actorData.secondaryPropulsionType = itemData.secondaryPropulsion.type ;

		switch (actorData.secondaryPropulsionType) {
			case "amphibiousSurface":
				attributes.secondaryPropulsionHandling.natural.base = 2;
				attributes.secondaryPropulsionHandlingOffRoad.natural.base = 2;
				attributes.secondaryPropulsionSpeed.natural.base = 2;
				attributes.secondaryPropulsionAcceleration.natural.base = 1;
				break;
			case "amphibiousSubmersible":
				attributes.secondaryPropulsionHandling.natural.base = 2;
				attributes.secondaryPropulsionHandlingOffRoad.natural.base = 2;
				attributes.secondaryPropulsionSpeed.natural.base = 2;
				attributes.secondaryPropulsionAcceleration.natural.base = 2;
				break;
			case "hovercraft":
				attributes.secondaryPropulsionHandling.natural.base = 2;
				attributes.secondaryPropulsionHandlingOffRoad.natural.base = 2;
				attributes.secondaryPropulsionSpeed.natural.base = 3;
				attributes.secondaryPropulsionAcceleration.natural.base = 2;
				break;
			case "rotor":
				attributes.secondaryPropulsionHandling.natural.base = 2;
				attributes.secondaryPropulsionHandlingOffRoad.natural.base = 2;
				attributes.secondaryPropulsionSpeed.natural.base = 3;
				attributes.secondaryPropulsionAcceleration.natural.base = 2;
				break;
			case "tracked":
				attributes.secondaryPropulsionHandling.natural.base = 2;
				attributes.secondaryPropulsionHandlingOffRoad.natural.base = 4;
				attributes.secondaryPropulsionSpeed.natural.base = 2;
				attributes.secondaryPropulsionAcceleration.natural.base = 1;
				break;
			case "walker":
				attributes.secondaryPropulsionHandling.natural.base = 5;
				attributes.secondaryPropulsionHandlingOffRoad.natural.base = 5;
				attributes.secondaryPropulsionSpeed.natural.base = 1;
				attributes.secondaryPropulsionAcceleration.natural.base = 1;
				break;
			default:
		}

	}

	// Vehicle slots Update
	static updateVehicleSlots(actor){
		let actorData = actor.system, slots = actorData.attributes.body.augmented.value;

		actorData.modificationSlots.powerTrain.base = slots ;
		actorData.modificationSlots.protection.base = slots ;
		actorData.modificationSlots.weapons.base = slots + actorData.modificationSlots.extraWeapons;
		actorData.modificationSlots.body.base = slots + actorData.modificationSlots.extraBody;
		actorData.modificationSlots.electromagnetic.base = slots ;
		actorData.modificationSlots.cosmetic.base = slots ;

		SR5_EntityHelpers.updateValue(actorData.modificationSlots.powerTrain);
		SR5_EntityHelpers.updateValue(actorData.modificationSlots.protection);
		SR5_EntityHelpers.updateValue(actorData.modificationSlots.body);
		SR5_EntityHelpers.updateValue(actorData.modificationSlots.weapons);
		SR5_EntityHelpers.updateValue(actorData.modificationSlots.electromagnetic);
		SR5_EntityHelpers.updateValue(actorData.modificationSlots.cosmetic);
	}

	// Spirit Skills Calculations
	static generateSpiritSkills(actor) {
		let actorData = actor.system, skills = actorData.skills;

		skills.astralCombat.rating.base = actorData.force.value;
		skills.assensing.rating.base = actorData.force.value;
		skills.perception.rating.base = actorData.force.value;
		actorData.magic.tradition = actor.system.magic.tradition;

		switch (actorData.type) {
			case "watcher":
				skills.astralCombat.rating.base = Math.ceil(actorData.force.value/2);
				skills.assensing.rating.base = Math.ceil(actorData.force.value/2);
				skills.perception.rating.base = Math.ceil(actorData.force.value/2);
				break;
			case "homunculus":
				skills.astralCombat.rating.base = Math.ceil(actorData.force.value/2);
				skills.assensing.rating.base = Math.ceil(actorData.force.value/2);
				skills.perception.rating.base = Math.ceil(actorData.force.value/2);
				skills.unarmedCombat.rating.base = Math.ceil(actorData.force.value/2);
				break;
			case "air":
			case "noxious":
				skills.exoticRangedWeapon.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.running.rating.base = actorData.force.value;
				skills.flight.rating.base = actorData.force.value;
				break;
			case "water":
				skills.exoticRangedWeapon.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.swimming.rating.base = actorData.force.value;
				break;
			case "man":
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.running.rating.base = actorData.force.value;
				skills.spellcasting.rating.base = actorData.force.value;
				skills.swimming.rating.base = actorData.force.value;
				break;
			case "earth":
			case "sludge":
			case "barren":
				skills.exoticRangedWeapon.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				break;
			case "fire":
			case "nuclear":
				skills.exoticRangedWeapon.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.flight.rating.base = actorData.force.value;
				break;
			case "beasts":
			case "blood":
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.running.rating.base = actorData.force.value;
				break;
			case "abomination":
				skills.exoticRangedWeapon.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.running.rating.base = actorData.force.value;
				skills.gymnastics.rating.base = actorData.force.value;
				break;
			case "plague":
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.spellcasting.rating.base = actorData.force.value;
				break;
			case "shadowMuse":
			case "shadowNightmare":
			case "shadowShade":
			case "shadowSuccubus":
			case "shadowWraith":
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.con.rating.base = actorData.force.value;
				skills.gymnastics.rating.base = actorData.force.value;
				skills.intimidation.rating.base = actorData.force.value;
				break;
			case "shedim":
				skills.unarmedCombat.rating.base = actorData.force.value;
				break;
			case "shedimMaster":
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.counterspelling.rating.base = actorData.force.value;
				skills.gymnastics.rating.base = actorData.force.value;
				skills.spellcasting.rating.base = actorData.force.value;
				break;
			case "insectScout":
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.sneaking.rating.base = actorData.force.value;
				skills.gymnastics.rating.base = actorData.force.value;
				break;
			case "insectCaretaker":
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.spellcasting.rating.base = actorData.force.value;
				skills.leadership.rating.base = actorData.force.value;
				break;
			case "insectNymph":
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.gymnastics.rating.base = actorData.force.value;
				skills.spellcasting.rating.base = actorData.force.value;
				break;
			case "insectWorker":
				skills.unarmedCombat.rating.base = actorData.force.value;
				break;
			case "insectSoldier":
				skills.exoticRangedWeapon.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.counterspelling.rating.base = actorData.force.value;
				skills.gymnastics.rating.base = actorData.force.value;
				break;
			case "insectQueen":
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.counterspelling.rating.base = actorData.force.value;
				skills.con.rating.base = actorData.force.value;
				skills.gymnastics.rating.base = actorData.force.value;
				skills.spellcasting.rating.base = actorData.force.value;
				skills.leadership.rating.base = actorData.force.value;
				skills.negociation.rating.base = actorData.force.value;
				break;
			case "guardian":
				skills.exoticRangedWeapon.rating.base = actorData.force.value;
				skills.clubs.rating.base = actorData.force.value;
				skills.blades.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				break;
			case "guidance":
				skills.arcana.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.counterspelling.rating.base = actorData.force.value;
				break;
			case "plant":
				skills.exoticRangedWeapon.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				skills.counterspelling.rating.base = actorData.force.value;
				break;
			case "task":
				skills.artisan.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				break;
			case "anarch":
				skills.assensing.rating.base = actorData.force.value;
				skills.automatics.rating.base = actorData.force.value;
				skills.blades.rating.base = actorData.force.value;
				skills.clubs.rating.base = actorData.force.value;
				skills.con.rating.base = actorData.force.value;
				skills.demolitions.rating.base = actorData.force.value;
				skills.disguise.rating.base = actorData.force.value;
				skills.forgery.rating.base = actorData.force.value;
				skills.gymnastics.rating.base = actorData.force.value;
				skills.impersonation.rating.base = actorData.force.value;
				skills.locksmith.rating.base = actorData.force.value;
				skills.palming.rating.base = actorData.force.value;
				skills.perception.rating.base = actorData.force.value;
				skills.pistols.rating.base = actorData.force.value;
				skills.sneaking.rating.base = actorData.force.value;
				skills.throwingWeapons.rating.base = actorData.force.value;
				skills.unarmedCombat.rating.base = actorData.force.value;
				break;
		}

		for (let key of Object.keys(SR5.skills)) {
			if (skills[key] && skills[key].rating.base) {
				SR5_EntityHelpers.updateValue(skills[key].rating, 0);
				if (skills[key].rating.value) {
					skills[key].test.base = skills[key].rating.value;
					this.applyPenalty("condition", skills[key].test, actor);
					this.applyPenalty("matrix", skills[key].test, actor);
					this.applyPenalty("magic", skills[key].test, actor);
					this.applyPenalty("special", skills[key].test, actor);
					SR5_EntityHelpers.updateDicePool(skills[key].test, 0);
				}
			}
		}
	}

	// Sprite Skills Calculations
	static generateSpriteSkills(actor) {
		let actorData = actor.system, skills = actorData.skills;

		switch (actorData.type) {
			case "courier":
				skills.computer.rating.base = actorData.level;
				skills.hacking.rating.base = actorData.level;
				break;
			case "crack":
				skills.computer.rating.base = actorData.level;
				skills.hacking.rating.base = actorData.level;
				skills.electronicWarfare.rating.base = actorData.level;
				break;
			case "data":
				skills.computer.rating.base = actorData.level;
				skills.electronicWarfare.rating.base = actorData.level;
				break;
			case "fault":
				skills.computer.rating.base = actorData.level;
				skills.cybercombat.rating.base = actorData.level;
				skills.hacking.rating.base = actorData.level;
				break;
			case "machine":
				skills.computer.rating.base = actorData.level;
				skills.electronicWarfare.rating.base = actorData.level;
				skills.hardware.rating.base = actorData.level;
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${actorData.type}' sprite type in '_generateSpriteSkills()'`);
				return;
		}

		for (let key of Object.keys(SR5.skills)) {
			if (skills[key] && skills[key].rating.base) {
				SR5_EntityHelpers.updateValue(skills[key].rating, 0);
				if (skills[key].rating.value) {
					skills[key].test.base = skills[key].rating.value;
					SR5_EntityHelpers.updateDicePool(skills[key].test, 0);
				}
			}
		}
	}

	// Skills and Skill Groups Calculations
	static updateSkills(actor) {
		let actorData = actor.system;

		for (let skillGroup of Object.keys(SR5.skillGroups)) {
			if (actorData.skillGroups) SR5_EntityHelpers.updateValue(actorData.skillGroups[skillGroup], 0);
		}

		for (let key of Object.keys(SR5.skills)) {
			if (actorData.skills[key]) {
				if (actorData.skills[key].skillGroup) {
					let linkedGroup = actorData.skills[key].skillGroup;
					if (actorData.skillGroups[linkedGroup].value) {
						if (actorData.skills[key].base === 0) {
							SR5_EntityHelpers.updateModifier(actorData.skills[key].rating, `${game.i18n.localize(SR5.skillGroups[linkedGroup])}`, "skillGroup", actorData.skillGroups[linkedGroup].value);
						} else if (actorData.skillGroups[linkedGroup].value > actorData.skills[key].rating.base){
							let mod = actorData.skillGroups[linkedGroup].value - actorData.skills[key].rating.base;
							SR5_EntityHelpers.updateModifier(actorData.skills[key].rating, `${game.i18n.localize(SR5.skillGroups[linkedGroup])}`, "skillGroup", mod);
						}
					}
				}
				let linkedAttribute = actorData.skills[key].linkedAttribute;
				if (linkedAttribute == 'magic' || linkedAttribute == 'resonance' || linkedAttribute == 'edge') {
					let label = `${game.i18n.localize(SR5.characterSpecialAttributes[linkedAttribute])}`;
					SR5_EntityHelpers.updateModifier(actorData.skills[key].test, label, "linkedAttribute", actorData.specialAttributes[linkedAttribute].augmented.value);
				} else {
					let label = `${game.i18n.localize(SR5.characterAttributes[linkedAttribute])}`;
					SR5_EntityHelpers.updateModifier(actorData.skills[key].test, label, "linkedAttribute", actorData.attributes[linkedAttribute].augmented.value);
				}
				SR5_EntityHelpers.updateValue(actorData.skills[key].rating, 0);
				if (actorData.skills[key].rating.value) {
					actorData.skills[key].test.base = 0;
					if (actorData.skills[key].rating.base > 0) SR5_EntityHelpers.updateModifier(actorData.skills[key].test, `${game.i18n.localize(SR5.skills[key])}`, "skillRating", actorData.skills[key].rating.base);
					actorData.skills[key].test.modifiers = actorData.skills[key].test.modifiers.concat(actorData.skills[key].rating.modifiers);
				} else {
					if (actorData.skills[key].canDefault) {
						actorData.skills[key].test.base = 0;
						SR5_EntityHelpers.updateModifier(actorData.skills[key].test, game.i18n.localize('SR5.Defaulting'), "skillRating", -1);
					} else {
						actorData.skills[key].test.modifiers = [];
					}
				}
				//BackgroundCount
				if ((linkedAttribute == 'magic' && actorData.magic.bgCount.value !== 0)
					|| key === "astralCombat" || key === "assensing"){
					if (actorData.magic.bgCount.value < 0) actorData.skills[key].test.modifiers = actorData.skills[key].test.modifiers.concat(actorData.magic.bgCount.modifiers);
					else actorData.skills[key].limit.modifiers = actorData.skills[key].limit.modifiers.concat(actorData.magic.bgCount.modifiers);
				}
				this.applyPenalty("condition", actorData.skills[key].test, actor);
				this.applyPenalty("matrix", actorData.skills[key].test, actor);
				this.applyPenalty("magic", actorData.skills[key].test, actor);
				this.applyPenalty("special", actorData.skills[key].test, actor);
				SR5_EntityHelpers.updateDicePool(actorData.skills[key].test, 0);

				// limit calculation
				let linkedLimit = actorData.skills[key].limit.base;
				if (actorData.limits[linkedLimit]) {
					actorData.skills[key].limit.value = actorData.limits[linkedLimit].value + SR5_EntityHelpers.modifiersSum(actorData.skills[key].limit.modifiers);
				}
			}
		}

		if (actor.type !== "actorSprite"){
			for (let key of Object.keys(SR5.spellCategories)) {
				if (actorData.skills.spellcasting.rating.value > 0) actorData.skills.spellcasting.spellCategory[key].modifiers = actorData.skills.spellcasting.spellCategory[key].modifiers.concat(actorData.skills.spellcasting.test.modifiers);
				if (actorData.skills.counterspelling.rating.value > 0) actorData.skills.counterspelling.spellCategory[key].modifiers = actorData.skills.counterspelling.spellCategory[key].modifiers.concat(actorData.skills.counterspelling.test.modifiers);
				if (actorData.skills.ritualSpellcasting.rating.value > 0) actorData.skills.ritualSpellcasting.spellCategory[key].modifiers = actorData.skills.ritualSpellcasting.spellCategory[key].modifiers.concat(actorData.skills.ritualSpellcasting.test.modifiers);
				if (actorData.skills.alchemy.rating.value > 0) actorData.skills.alchemy.spellCategory[key].modifiers = actorData.skills.alchemy.spellCategory[key].modifiers.concat(actorData.skills.alchemy.test.modifiers);
				SR5_EntityHelpers.updateDicePool(actorData.skills.spellcasting.spellCategory[key], 0);
				SR5_EntityHelpers.updateDicePool(actorData.skills.counterspelling.spellCategory[key], 0);
				SR5_EntityHelpers.updateDicePool(actorData.skills.ritualSpellcasting.spellCategory[key], 0);
				SR5_EntityHelpers.updateDicePool(actorData.skills.alchemy.spellCategory[key], 0);
			}

			for (let key of Object.keys(SR5.spiritTypes)) {
				actorData.skills.summoning.spiritType[key].modifiers = actorData.skills.summoning.spiritType[key].modifiers.concat(actorData.skills.summoning.test.modifiers);
				actorData.skills.binding.spiritType[key].modifiers = actorData.skills.binding.spiritType[key].modifiers.concat(actorData.skills.binding.test.modifiers);
				actorData.skills.banishing.spiritType[key].modifiers = actorData.skills.banishing.spiritType[key].modifiers.concat(actorData.skills.banishing.test.modifiers);
				SR5_EntityHelpers.updateDicePool(actorData.skills.summoning.spiritType[key], 0);
				SR5_EntityHelpers.updateDicePool(actorData.skills.binding.spiritType[key], 0);
				SR5_EntityHelpers.updateDicePool(actorData.skills.banishing.spiritType[key], 0);
			}

			for (let key of Object.keys(SR5.perceptionTypes)){
				SR5_EntityHelpers.updateValue(actorData.skills.perception.perceptionType[key].test);
				SR5_EntityHelpers.updateValue(actorData.skills.perception.perceptionType[key].limit);
			}
		}
	}

	// Knowledge Dice Pools Calculations
	static _generateKnowledgeSkills(item, actor) {
		let itemData = item.system;
		let actorData = actor.system, attributes = actorData.attributes;
		SR5_EntityHelpers.updateValue(itemData.rating);

		switch (itemData.type) {
			case "academic":
			case "professional":
				itemData.linkedAttribute = "logic";
				break;
			case "interests":
			case "street":
			case "tactics":
				itemData.linkedAttribute = "intuition";
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${itemData.type}' knowledge type in '_generateKnowledgeSkills()'`);
				return;
		}

		let label = `${game.i18n.localize(SR5.characterAttributes[itemData.linkedAttribute])}`;
		SR5_EntityHelpers.updateModifier(itemData.test, item.name, "skillRating", itemData.rating.value);
		SR5_EntityHelpers.updateModifier(itemData.test, label, "linkedAttribute", attributes[itemData.linkedAttribute].augmented.value);
		if (actor.system.knowledgeSkills.modifiers) {
			itemData.test.modifiers = itemData.test.modifiers.concat(actor.system.knowledgeSkills.modifiers);
		}
		this.applyPenalty("condition", itemData.test, actor);
		this.applyPenalty("matrix", itemData.test, actor);
		this.applyPenalty("magic", itemData.test, actor);
		this.applyPenalty("special", itemData.test, actor);
		SR5_EntityHelpers.updateDicePool(itemData.test);
	}

	// Language Skills Calculations
	static _generateLanguageSkills(item, actor) {
		let itemData = item.system;
		let attributes = actor.system.attributes;
		SR5_EntityHelpers.updateValue(itemData.rating);

		if (!itemData.isNative) {
			SR5_EntityHelpers.updateModifier(itemData.test, item.name, "skillRating", itemData.rating.value);
			SR5_EntityHelpers.updateModifier(itemData.test, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
			if (actor.system.languageSkills.modifiers) itemData.test.modifiers = itemData.test.modifiers.concat(actor.system.languageSkills.modifiers);
			this.applyPenalty("condition", itemData.test, actor);
			this.applyPenalty("matrix", itemData.test, actor);
			this.applyPenalty("magic", itemData.test, actor);
			this.applyPenalty("special", itemData.test, actor);
			SR5_EntityHelpers.updateDicePool(itemData.test, 0);
		}
	}

	// Update adept power point
	static updatePowerPoints(actor) {
		let actorData = actor.system, magic = actorData.magic, specialAttributes = actorData.specialAttributes;
		magic.powerPoints.base = 0;
		magic.powerPoints.maximum.base = 0;

		if (!magic.magicType) return SR5_SystemHelpers.srLog(3, `Actor has no magic type selected or no magic capabilities for ${this.name}`);

		if (magic.magicType === "adept"){
			for (let category of Object.keys(SR5.spellCategories)) {
				magic.elements[category] = "";
			}
			magic.powerPoints.maximum.base = specialAttributes.magic.augmented.value;
		}

		SR5_EntityHelpers.updateValue(magic.powerPoints);
		SR5_EntityHelpers.updateValue(magic.powerPoints.maximum);
	}

	// Magical Traditions Calculations
	static updateTradition(actor, itemData) {
		let magic = actor.system.magic;

		if (!magic.magicType) return SR5_SystemHelpers.srLog(3, `Actor has no magic type selected or no magic capabilities for ${this.name}`);
		magic.possession = false;

		if (itemData){
			magic.drainResistance.linkedAttribute = itemData.drainAttribute;
			magic.elements.combat = itemData.spiritCombat;
			magic.elements.detection = itemData.spiritDetection;
			magic.elements.illusion = itemData.spiritIllusion;
			magic.elements.manipulation = itemData.spiritManipulation;
			magic.elements.health = itemData.spiritHealth;
			magic.possession = itemData.possession;
			if (itemData.systemEffects.length){
				let traditionType = itemData.systemEffects.find(i => i.category = "tradition");
				magic.tradition = traditionType.value;
			}
		}
	}

	// Magic and Astral Calculations
	static updateAstralValues(actor) {
		let actorData = actor.system, magic = actorData.magic, attributes = actorData.attributes, specialAttributes = actorData.specialAttributes, skills = actorData.skills;

		if (!magic.magicType) return SR5_SystemHelpers.srLog(3, `Actor has no magic type selected or no magic capabilities for ${this.name}`);

		//Pass through barrier and astral defense
		if (magic.magicType == 'magician' || magic.magicType == 'aspectedMagician' || magic.magicType == 'mysticalAdept' || magic.magicType == 'spirit') {
			magic.passThroughBarrier.base = 0;
			SR5_EntityHelpers.updateModifier(magic.passThroughBarrier, `${game.i18n.localize('SR5.Charisma')}`, "linkedAttribute", attributes.charisma.augmented.value);
			SR5_EntityHelpers.updateModifier(magic.passThroughBarrier, `${game.i18n.localize('SR5.Magic')}`, "linkedAttribute", specialAttributes.magic.augmented.value);
			magic.astralDefense.base = 0;
			SR5_EntityHelpers.updateModifier(magic.astralDefense,  game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
			SR5_EntityHelpers.updateModifier(magic.astralDefense, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		}
		this.applyPenalty("condition", magic.passThroughBarrier, actor);
		this.applyPenalty("matrix", magic.passThroughBarrier, actor);
		this.applyPenalty("magic", magic.passThroughBarrier, actor);
		this.applyPenalty("special", magic.passThroughBarrier, actor);
		SR5_EntityHelpers.updateDicePool(magic.passThroughBarrier, 0);
		this.applyPenalty("condition", magic.astralDefense, actor);
		this.applyPenalty("matrix", magic.astralDefense, actor);
		this.applyPenalty("magic", magic.astralDefense, actor);
		this.applyPenalty("special", magic.astralDefense, actor);
		SR5_EntityHelpers.updateDicePool(magic.astralDefense, 0);

		//Drain Resistance
		magic.drainResistance.base = 0;
		SR5_EntityHelpers.updateModifier(magic.drainResistance,  game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
		if (magic.magicType === "adept") magic.drainResistance.linkedAttribute = "body";
		if (magic.drainResistance.linkedAttribute) {
			let label = `${game.i18n.localize(SR5.characterAttributes[magic.drainResistance.linkedAttribute])}`;
			SR5_EntityHelpers.updateModifier(magic.drainResistance, label, "linkedAttribute", attributes[magic.drainResistance.linkedAttribute].augmented.value);
		}
		if (magic.magicType === "spirit") SR5_EntityHelpers.updateModifier(magic.drainResistance, `${game.i18n.localize('SR5.Charisma')}`, "linkedAttribute", attributes.charisma.augmented.value);
		SR5_EntityHelpers.updateDicePool(magic.drainResistance, 0);

		//Astral damage
		magic.astralDamage.base = 0;
		if ((actor.type === "actorPc") || (actor.type === "actorGrunt")) SR5_EntityHelpers.updateModifier(magic.astralDamage, `${game.i18n.localize('SR5.Charisma')}`, "linkedAttribute", attributes.charisma.augmented.value);
		if (actor.type === "actorSpirit"){
			if ((actorData.type === "homunculus") || (actorData.type === "watcher")){
				SR5_EntityHelpers.updateModifier(magic.astralDamage, `${game.i18n.localize(SR5.spiritTypes[actorData.type])}`, "actorSpirit", 1);
			} else {
				SR5_EntityHelpers.updateModifier(magic.astralDamage, `${game.i18n.localize('SR5.SpiritForceShort')}`, "linkedAttribute", actorData.force.value);
			}
		}
		SR5_EntityHelpers.updateValue(magic.astralDamage, 0);

		//Astral tracking
		magic.astralTracking.base = 0;
		SR5_EntityHelpers.updateModifier(magic.astralTracking,  game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
		if (skills.assensing.rating.value) {
			SR5_EntityHelpers.updateModifier(magic.astralTracking, `${game.i18n.localize('SR5.SkillAssensing')}`, "skillRating", skills.assensing.rating.value);
		}
		this.applyPenalty("condition", magic.astralTracking, actor);
		this.applyPenalty("matrix", magic.astralTracking, actor);
		this.applyPenalty("magic", magic.astralTracking, actor);
		this.applyPenalty("special", magic.astralTracking, actor);
		SR5_EntityHelpers.updateDicePool(magic.astralTracking, 0);

		//Max bounded spirit
		magic.boundedSpirit.max = specialAttributes.magic.augmented.value;

		//Metamagic stuff
		magic.metamagics.centeringValue.base = magic.initiationGrade;
		magic.metamagics.spellShapingValue.base = specialAttributes.magic.augmented.value;
		SR5_EntityHelpers.updateValue(magic.metamagics.centeringValue, 0);
		SR5_EntityHelpers.updateValue(magic.metamagics.spellShapingValue, 0);
	}

	// Counterspell pool
	static updateCounterSpellPool(actor){
		let actorData = actor.system, magic = actorData.magic, skills = actorData.skills;
		magic.counterSpellPool.base = skills.counterspelling.rating.value;
		if (magic.metamagics.shielding) SR5_EntityHelpers.updateModifier(magic.counterSpellPool, `${game.i18n.localize('SR5.MetamagicShielding')}`, "metamagic", magic.initiationGrade);
		SR5_EntityHelpers.updateValue(magic.counterSpellPool);
	}

	// Background count calcultations
	static updateBackgroundCount(actor){
		let actorData = actor.system;
		let scene = game.scenes.active;
		if (scene){
			let token = scene.tokens.find((t) => t.actorId === actor.id);
			//check if actor already has a modifier on background count to avoid scene modifiers and prefer template modifier
			if (token && !actorData.magic.bgCount.modifiers.length){
				let sceneData = scene.flags.sr5;
				if (sceneData.backgroundCountValue !== 0) {
					if (sceneData.backgroundCountAlignement === actorData.magic.tradition) SR5_EntityHelpers.updateModifier(actorData.magic.bgCount, game.i18n.localize("SR5.SceneBackgroundCount"), sceneData.backgroundCountAlignement, sceneData.backgroundCountValue, false, true);
					else SR5_EntityHelpers.updateModifier(actorData.magic.bgCount, game.i18n.localize("SR5.SceneBackgroundCount"), sceneData.backgroundCountAlignement, -sceneData.backgroundCountValue, false, true);
				}
			}
		}
		SR5_EntityHelpers.updateValue(actor.system.magic.bgCount);	
	}

	// Generate Matrix attributes
	static generateMatrixAttributes(item, actor) {
		let actorData = actor.system, attributes = actorData.attributes;
		let matrix = actorData.matrix, matrixAttributes = matrix.attributes;

		matrix.deviceType = item.system.type;
		matrix.deviceName = item.name;

		switch (item.system.type) {
			case "cyberdeck":
				matrix.attributesCollection.value1 = item.system.attributesCollection.value1;
				matrix.attributesCollection.value2 = item.system.attributesCollection.value2;
				matrix.attributesCollection.value3 = item.system.attributesCollection.value3;
				matrix.attributesCollection.value4 = item.system.attributesCollection.value4;
				matrix.programsMaximumActive.base = 0;
				SR5_EntityHelpers.updateModifier(matrix.programsMaximumActive, item.name, "device", item.system.program.max, false, false);
				matrix.deviceRating = item.system.deviceRating;
				break;
			case "riggerCommandConsole":
				matrix.attributes.attack.base = 0;
				matrix.attributes.sleaze.base = 0;
				matrix.attributes.dataProcessing.base = item.system.attributesCollection.value3;
				matrix.attributes.firewall.base = item.system.attributesCollection.value4;
				matrix.programsMaximumActive.base = 0;
				SR5_EntityHelpers.updateModifier(matrix.programsMaximumActive, item.name, "deviceRating", item.system.deviceRating, false, false);
				matrix.deviceRating = item.system.deviceRating;
				break;
			case "commlink":
				matrix.attributes.attack.base = 0;
				matrix.attributes.sleaze.base = 0;
				matrix.attributes.dataProcessing.base = item.system.deviceRating;
				matrix.attributes.firewall.base = item.system.deviceRating;
				matrix.programsMaximumActive.base = 0;
				SR5_EntityHelpers.updateModifier(matrix.programsMaximumActive, item.name, "deviceRating", item.system.deviceRating, false, false);
				matrix.deviceRating = item.system.deviceRating;
				break;
			case "livingPersona":
				matrix.attributes.attack.base = attributes.charisma.augmented.value;
				matrix.attributes.sleaze.base = attributes.intuition.augmented.value;
				matrix.attributes.dataProcessing.base = attributes.logic.augmented.value;
				matrix.attributes.firewall.base = attributes.willpower.augmented.value;
				matrix.deviceRating = actorData.specialAttributes.resonance.augmented.value;
				break;
			case "headcase":
				matrix.attributes.attack.base = attributes.charisma.augmented.value + actorData.specialAttributes.resonance.augmented.value;
				matrix.attributes.sleaze.base = attributes.intuition.augmented.value + actorData.specialAttributes.resonance.augmented.value;
				matrix.attributes.dataProcessing.base = attributes.logic.augmented.value + actorData.specialAttributes.resonance.augmented.value;
				matrix.attributes.firewall.base = attributes.willpower.augmented.value + actorData.specialAttributes.resonance.augmented.value;
				matrix.deviceRating = actorData.specialAttributes.resonance.augmented.value;
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${item.system.type}' deck type in generateMatrixAttributes()`);
				return;
		}

		matrix.pan = item.system.pan;
		matrix.marks = item.system.marks;
		matrix.markedItems = item.system.markedItems;
		SR5_EntityHelpers.updateValue(matrix.noise);
		SR5_EntityHelpers.updateValue(matrix.programsMaximumActive, 0);
		SR5_EntityHelpers.updateValue(matrix.programsCurrentActive, 0);

		for (let key of Object.keys(SR5.matrixAttributes)) {
			SR5_EntityHelpers.updateValue(matrixAttributes[key], 0);
		}
	}

	// Generate Resonance actions
	static generateResonanceMatrix(actor) {
		let actorData = actor.system, specialAttributes = actorData.specialAttributes, skills = actorData.skills;
		let matrix = actorData.matrix, resonanceActions = matrix.resonanceActions;

		matrix.registeredSprite.max = specialAttributes.resonance.augmented.value;

		resonanceActions.compileSprite.test.base = 0;
		SR5_EntityHelpers.updateModifier(resonanceActions.compileSprite.test, `${game.i18n.localize('SR5.Resonance')}`, "linkedAttribute", specialAttributes.resonance.augmented.value);
		SR5_EntityHelpers.updateModifier(resonanceActions.compileSprite.test,`${game.i18n.localize('SR5.MatrixActionCompileSprite')}`, "skillRating", skills.compiling.rating.value);
		resonanceActions.decompileSprite.test.base = 0;
		SR5_EntityHelpers.updateModifier(resonanceActions.decompileSprite.test, `${game.i18n.localize('SR5.Resonance')}`, "linkedAttribute", specialAttributes.resonance.augmented.value);
		SR5_EntityHelpers.updateModifier(resonanceActions.decompileSprite.test,`${game.i18n.localize('SR5.MatrixActionDecompileSprite')}`, "skillRating", skills.decompiling.rating.value);
		resonanceActions.eraseResonanceSignature.test.base = 0;
		SR5_EntityHelpers.updateModifier(resonanceActions.eraseResonanceSignature.test, `${game.i18n.localize('SR5.Resonance')}`, "linkedAttribute", specialAttributes.resonance.augmented.value);
		SR5_EntityHelpers.updateModifier(resonanceActions.eraseResonanceSignature.test,`${game.i18n.localize('SR5.SkillComputer')}`, "skillRating", skills.computer.rating.value);
		resonanceActions.killComplexForm.test.base = 0;
		SR5_EntityHelpers.updateModifier(resonanceActions.killComplexForm.test, `${game.i18n.localize('SR5.Resonance')}`, "linkedAttribute", specialAttributes.resonance.augmented.value);
		SR5_EntityHelpers.updateModifier(resonanceActions.killComplexForm.test,`${game.i18n.localize('SR5.SkillSoftware')}`, "skillRating", skills.software.rating.value);
		resonanceActions.registerSprite.test.base = 0;
		SR5_EntityHelpers.updateModifier(resonanceActions.registerSprite.test, `${game.i18n.localize('SR5.Resonance')}`, "linkedAttribute", specialAttributes.resonance.augmented.value);
		SR5_EntityHelpers.updateModifier(resonanceActions.registerSprite.test,`${game.i18n.localize('SR5.SkillRegistering')}`, "skillRating", skills.registering.rating.value);
		resonanceActions.threadComplexForm.test.base = 0;
		SR5_EntityHelpers.updateModifier(resonanceActions.threadComplexForm.test, `${game.i18n.localize('SR5.Resonance')}`, "linkedAttribute", specialAttributes.resonance.augmented.value);
		SR5_EntityHelpers.updateModifier(resonanceActions.threadComplexForm.test,`${game.i18n.localize('SR5.SkillSoftware')}`, "skillRating", skills.software.rating.value);

		// handle resonance final calculation
		for (let key of Object.keys(SR5.resonanceActions)) {
			if (resonanceActions[key].test){
				this.applyPenalty("condition", resonanceActions[key].test, actor);
				this.applyPenalty("matrix", resonanceActions[key].test, actor);
				this.applyPenalty("magic", resonanceActions[key].test, actor);
				this.applyPenalty("special", resonanceActions[key].test, actor);
				if (matrix.userMode === "hotsim" && key === "eraseResonanceSignature") {
					SR5_EntityHelpers.updateModifier(resonanceActions[key].test, game.i18n.localize('SR5.VirtualRealityHotSimShort'), "matrixUserMode", 2);
				}
				//test
				SR5_EntityHelpers.updateDicePool(resonanceActions[key].test);
				if (resonanceActions[key].test.dicePool < 0) resonanceActions[key].test.dicePool = 0;
				// limit calculation
				if (resonanceActions[key].limit){
					let linkedLimit = resonanceActions[key].limit.base;
					if (actorData.limits[linkedLimit]) {
						resonanceActions[key].limit.value = actorData.limits[linkedLimit].value + SR5_EntityHelpers.modifiersSum(resonanceActions[key].limit.modifiers);
					}
				}
			}
		}
	}

	static generateMatrixActions(actor){
		let actorData = actor.system, attributes = actorData.attributes, skills = actorData.skills,
			matrix = actorData.matrix, matrixAttributes = matrix.attributes, matrixActions = matrix.actions;

		SR5_EntityHelpers.updateModifier(matrixActions.jamSignals.test, game.i18n.localize('SR5.SkillElectronicWarfare'), "skillRating", skills.electronicWarfare.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.jamSignals.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.controlDevice.test, game.i18n.localize('SR5.SkillElectronicWarfare'), "skillRating", skills.electronicWarfare.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.controlDevice.test, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.disarmDataBomb.test, game.i18n.localize('SR5.SkillSoftware'), "skillRating", skills.software.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.disarmDataBomb.test, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.editFile.test, game.i18n.localize('SR5.SkillComputer'), "skillRating", skills.computer.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.editFile.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.eraseMark.test, game.i18n.localize('SR5.SkillComputer'), "skillRating", skills.computer.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.eraseMark.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.formatDevice.test, game.i18n.localize('SR5.SkillComputer'), "skillRating", skills.computer.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.formatDevice.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.snoop.test, game.i18n.localize('SR5.SkillElectronicWarfare'), "skillRating", skills.electronicWarfare.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.snoop.test, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.hackOnTheFly.test, game.i18n.localize('SR5.SkillHacking'), "skillRating", skills.hacking.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.hackOnTheFly.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.spoofCommand.test, game.i18n.localize('SR5.SkillHacking'), "skillRating", skills.hacking.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.spoofCommand.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.garbageInGarbageOut.test, game.i18n.localize('SR5.SkillComputer'), "skillRating", skills.computer.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.garbageInGarbageOut.test, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.bruteForce.test, game.i18n.localize('SR5.SkillCybercombat'), "skillRating", skills.cybercombat.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.bruteForce.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.matrixPerception.test, game.i18n.localize('SR5.SkillComputer'), "skillRating", skills.computer.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.matrixPerception.test, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.dataSpike.test, game.i18n.localize('SR5.SkillCybercombat'), "skillRating", skills.cybercombat.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.dataSpike.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.crackFile.test, game.i18n.localize('SR5.SkillHacking'), "skillRating", skills.hacking.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.crackFile.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.crashProgram.test, game.i18n.localize('SR5.SkillCybercombat'), "skillRating", skills.cybercombat.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.crashProgram.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.setDataBomb.test, game.i18n.localize('SR5.SkillSoftware'), "skillRating", skills.software.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.setDataBomb.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.jumpIntoRiggedDevice.test, game.i18n.localize('SR5.SkillElectronicWarfare'), "skillRating", skills.electronicWarfare.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.jumpIntoRiggedDevice.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.rebootDevice.test, game.i18n.localize('SR5.SkillComputer'), "skillRating", skills.computer.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.rebootDevice.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.trackback.test, game.i18n.localize('SR5.SkillComputer'), "skillRating", skills.computer.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.trackback.test, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.matrixSearch.test, game.i18n.localize('SR5.SkillComputer'), "skillRating", skills.computer.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.matrixSearch.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.hide.test, game.i18n.localize('SR5.SkillElectronicWarfare'), "skillRating", skills.electronicWarfare.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.hide.test, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.jackOut.test, game.i18n.localize('SR5.SkillHardware'), "skillRating", skills.hardware.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.jackOut.test, game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.traceIcon.test, game.i18n.localize('SR5.SkillComputer'), "skillRating", skills.computer.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.traceIcon.test, game.i18n.localize('SR5.Intuition'), "linkedAttribute", attributes.intuition.augmented.value);
		SR5_EntityHelpers.updateModifier(matrixActions.checkOverwatchScore.test, game.i18n.localize('SR5.SkillElectronicWarfare'), "skillRating", skills.electronicWarfare.rating.value);
		SR5_EntityHelpers.updateModifier(matrixActions.checkOverwatchScore.test, game.i18n.localize('SR5.Logic'), "linkedAttribute", attributes.logic.augmented.value);

		for (let key of Object.keys(SR5.matrixActions)) {
			if (matrixActions[key].test !== undefined) {
				// test
				if (matrix.runningSilent) {
					SR5_EntityHelpers.updateModifier(matrixActions[key].test, game.i18n.localize('SR5.RunningSilent'), "silentMode", -2);
				}
				if (matrix.userMode === "hotsim") {
					SR5_EntityHelpers.updateModifier(matrixActions[key].test, game.i18n.localize('SR5.VirtualRealityHotSimShort'), "matrixUserMode", 2);
				}
				if (matrixActions[key].specialization){
					SR5_EntityHelpers.updateModifier(matrixActions[key].test, `${game.i18n.localize('SR5.Specialization')}`, "specialization", 2, false, true);
				}
				this.applyPenalty("condition", matrixActions[key].test, actor);
				this.applyPenalty("matrix", matrixActions[key].test, actor);
				this.applyPenalty("magic", matrixActions[key].test, actor);
				this.applyPenalty("special", matrixActions[key].test, actor);
				SR5_EntityHelpers.updateDicePool(matrixActions[key].test, 0);
				// limits
				let linkedAttribute = matrixActions[key].limit.linkedAttribute;
				matrixActions[key].limit.base = 0;
				SR5_EntityHelpers.updateModifier(matrixActions[key].limit, game.i18n.localize(SR5.matrixAttributes[linkedAttribute]), "linkedAttribute", matrixAttributes[linkedAttribute].value);
				SR5_EntityHelpers.updateValue(matrixActions[key].limit, 0);
			}
		}
	}

	static generateMatrixActionsDefenses(actor) {
		let actorData = actor.system, matrix = actorData.matrix, matrixAttributes = matrix.attributes, matrixActions = matrix.actions;
		let intuitionValue, willpowerValue, logicValue, firewallValue, sleazeValue, dataProcessingValue, attackValue;
		let modifierTypeIntuition = "linkedAttribute";
		let modifierTypeWillpower = "linkedAttribute";
		let modifierTypeLogic = "linkedAttribute";
		let modifierTypeFirewall = "matrixAttribute";
		let modifierTypeSleaze = "matrixAttribute";
		let modifierTypeDataProcessing = "matrixAttribute";
		let modifierTypeAttack = "matrixAttribute";

		if (actor.type === "actorPc" || actor.type === "actorGrunt" || actor.type === "actorAgent"){
			intuitionValue = actorData.attributes.intuition.augmented.value;
			willpowerValue = actorData.attributes.willpower.augmented.value;
			logicValue = actorData.attributes.logic.augmented.value;
			firewallValue = matrixAttributes.firewall.value;
			sleazeValue = matrixAttributes.sleaze.value;
			dataProcessingValue = matrixAttributes.dataProcessing.value;
			attackValue = matrixAttributes.attack.value;
		} else if (actor.type === "actorSprite" || (actor.type === "actorDevice" && matrix.deviceType !== "slavedDevice")){
			intuitionValue = matrix.deviceRating;
			willpowerValue = matrix.deviceRating;
			logicValue = matrix.deviceRating;
			firewallValue = matrixAttributes.firewall.value;
			sleazeValue = matrixAttributes.sleaze.value;
			dataProcessingValue = matrixAttributes.dataProcessing.value;
			attackValue = matrixAttributes.attack.value;
		} else if (actor.type === "actorDrone" && actorData.vehicleOwner.id && actorData.slaved) {
			let controler = actorData.vehicleOwner.system;
			if (controler.attributes.intuition.augmented.value > matrix.deviceRating){
				intuitionValue = controler.attributes.intuition.augmented.value;
				modifierTypeIntuition = "controler";
			} else intuitionValue = matrix.deviceRating;

			if (controler.attributes.willpower.augmented.value > matrix.deviceRating){
				willpowerValue = controler.attributes.willpower.augmented.value;
				modifierTypeWillpower = "controler";
			} else willpowerValue = matrix.deviceRating;

			if (controler.attributes.logic.augmented.value > matrix.deviceRating){
				logicValue = controler.attributes.logic.augmented.value;
				modifierTypeLogic = "controler";
			} else logicValue = matrix.deviceRating;

			if (controler.matrix.attributes.firewall.value > matrix.deviceRating){
				firewallValue = controler.matrix.attributes.firewall.value;
				modifierTypeFirewall = "controler";
			} else firewallValue = matrix.deviceRating;

			if (controler.matrix.attributes.sleaze.value > matrix.deviceRating){
				sleazeValue = controler.matrix.attributes.sleaze.value;
				modifierTypeSleaze = "controler";
			} else sleazeValue = matrix.deviceRating;

			if (controler.matrix.attributes.dataProcessing.value > matrix.deviceRating){
				dataProcessingValue = controler.matrix.attributes.dataProcessing.value;
				modifierTypeDataProcessing = "controler";
			} else dataProcessingValue = matrix.deviceRating;

			if (controler.matrix.attributes.attack.value > matrix.deviceRating){
				attackValue = controler.matrix.attributes.attack.value;
				modifierTypeAttack = "controler";
			} else attackValue = matrix.deviceRating;
		} else {
			intuitionValue = matrix.deviceRating;
			willpowerValue = matrix.deviceRating;
			logicValue = matrix.deviceRating;
			firewallValue = matrix.deviceRating;
			sleazeValue = matrix.deviceRating;
			dataProcessingValue = matrix.deviceRating;
			attackValue = matrix.deviceRating;
		}

		SR5_EntityHelpers.updateModifier(matrixActions.editFile.defense, game.i18n.localize('SR5.Intuition'), modifierTypeIntuition, intuitionValue);
		SR5_EntityHelpers.updateModifier(matrixActions.editFile.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );
		SR5_EntityHelpers.updateModifier(matrixActions.eraseMark.defense, game.i18n.localize('SR5.Willpower'), modifierTypeWillpower, willpowerValue);
		SR5_EntityHelpers.updateModifier(matrixActions.eraseMark.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );
		SR5_EntityHelpers.updateModifier(matrixActions.formatDevice.defense, game.i18n.localize('SR5.Willpower'), modifierTypeWillpower, willpowerValue);
		SR5_EntityHelpers.updateModifier(matrixActions.formatDevice.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue);
		SR5_EntityHelpers.updateModifier(matrixActions.snoop.defense, game.i18n.localize('SR5.Logic'), modifierTypeLogic, logicValue);
		SR5_EntityHelpers.updateModifier(matrixActions.snoop.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );
		SR5_EntityHelpers.updateModifier(matrixActions.hackOnTheFly.defense, game.i18n.localize('SR5.Intuition'), modifierTypeIntuition, intuitionValue);
		SR5_EntityHelpers.updateModifier(matrixActions.hackOnTheFly.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue);
		SR5_EntityHelpers.updateModifier(matrixActions.spoofCommand.defense, game.i18n.localize('SR5.Logic'), modifierTypeLogic, logicValue);
		SR5_EntityHelpers.updateModifier(matrixActions.spoofCommand.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );
		SR5_EntityHelpers.updateModifier(matrixActions.garbageInGarbageOut.defense, game.i18n.localize('SR5.Logic'), modifierTypeLogic, logicValue);
		SR5_EntityHelpers.updateModifier(matrixActions.garbageInGarbageOut.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );
		SR5_EntityHelpers.updateModifier(matrixActions.bruteForce.defense, game.i18n.localize('SR5.Willpower'), modifierTypeWillpower, willpowerValue);
		SR5_EntityHelpers.updateModifier(matrixActions.bruteForce.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );
		SR5_EntityHelpers.updateModifier(matrixActions.matrixPerception.defense, game.i18n.localize('SR5.Logic'), modifierTypeLogic, logicValue);
		SR5_EntityHelpers.updateModifier(matrixActions.matrixPerception.defense, game.i18n.localize('SR5.Sleaze'), modifierTypeSleaze, sleazeValue);
		SR5_EntityHelpers.updateModifier(matrixActions.dataSpike.defense, game.i18n.localize('SR5.Intuition'), modifierTypeIntuition, intuitionValue);
		SR5_EntityHelpers.updateModifier(matrixActions.dataSpike.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );
		SR5_EntityHelpers.updateModifier(matrixActions.crashProgram.defense, game.i18n.localize('SR5.Intuition'), modifierTypeIntuition, intuitionValue);
		SR5_EntityHelpers.updateModifier(matrixActions.crashProgram.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );
		SR5_EntityHelpers.updateModifier(matrixActions.jumpIntoRiggedDevice.defense, game.i18n.localize('SR5.Willpower'), modifierTypeWillpower, willpowerValue);
		SR5_EntityHelpers.updateModifier(matrixActions.jumpIntoRiggedDevice.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );
		SR5_EntityHelpers.updateModifier(matrixActions.rebootDevice.defense, game.i18n.localize('SR5.Willpower'), modifierTypeWillpower, willpowerValue);
		SR5_EntityHelpers.updateModifier(matrixActions.rebootDevice.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );
		SR5_EntityHelpers.updateModifier(matrixActions.hide.defense, game.i18n.localize('SR5.Intuition'), modifierTypeIntuition, intuitionValue);
		SR5_EntityHelpers.updateModifier(matrixActions.hide.defense, game.i18n.localize('SR5.DataProcessing'), modifierTypeDataProcessing, dataProcessingValue );
		SR5_EntityHelpers.updateModifier(matrixActions.jackOut.defense, game.i18n.localize('SR5.Logic'), modifierTypeLogic, logicValue);
		SR5_EntityHelpers.updateModifier(matrixActions.jackOut.defense, game.i18n.localize('SR5.MatrixAttack'), modifierTypeAttack, attackValue);
		SR5_EntityHelpers.updateModifier(matrixActions.traceIcon.defense, game.i18n.localize('SR5.Willpower'), modifierTypeWillpower, willpowerValue);
		SR5_EntityHelpers.updateModifier(matrixActions.traceIcon.defense, game.i18n.localize('SR5.Sleaze'), modifierTypeSleaze, sleazeValue);
		SR5_EntityHelpers.updateModifier(matrixActions.controlDevice.defense, game.i18n.localize('SR5.Intuition'), modifierTypeIntuition, intuitionValue);
		SR5_EntityHelpers.updateModifier(matrixActions.controlDevice.defense, game.i18n.localize('SR5.Firewall'), modifierTypeFirewall, firewallValue );

		matrixActions.checkOverwatchScore.defense.base = 6;


		// handle final calculation
		for (let key of Object.keys(SR5.matrixActions)) {
			if (matrixActions[key].defense) {
				this.applyPenalty("condition", matrixActions[key].defense, actor);
				this.applyPenalty("matrix", matrixActions[key].defense, actor);
				this.applyPenalty("magic", matrixActions[key].defense, actor);
				this.applyPenalty("special", matrixActions[key].defense, actor);
				SR5_EntityHelpers.updateDicePool(matrixActions[key].defense, 0);
			}
		}
	}

	static generateMatrixResistances(actor, item){
		let actorData = actor.system, attributes = actorData.attributes, specialAttributes = actorData.specialAttributes;
		let matrix = actorData.matrix, matrixAttributes = matrix.attributes, matrixResistances = matrix.resistances;

		matrixResistances.matrixDamage.base = 0;
		matrixResistances.biofeedback.base = 0;
		matrixResistances.dumpshock.base = 0;
		matrixResistances.dataBomb.base = 0;
		matrixResistances.fading.base = 0;
		switch(item.system.type){
			case "commlink":
				SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, item.name, "deviceRating", item.system.deviceRating);
				SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				break;
			case "cyberdeck":
			case "riggerCommandConsole":
				SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, item.name, "deviceRating", item.system.deviceRating);
				SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.biofeedback,  game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.biofeedback, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.dumpshock,  game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.dumpshock, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, item.name, "deviceRating", item.system.deviceRating);
				SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				break;
			case "livingPersona":
			case "headcase":
				SR5_EntityHelpers.updateModifier(matrixResistances.fading, `${game.i18n.localize('SR5.Resonance')}`, "linkedAttribute", specialAttributes.resonance.augmented.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.fading,  game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, `${game.i18n.localize('SR5.Resonance')}`, "linkedAttribute", specialAttributes.resonance.augmented.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.biofeedback,  game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.biofeedback, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.dumpshock,  game.i18n.localize('SR5.Willpower'), "linkedAttribute", attributes.willpower.augmented.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.dumpshock, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, item.name, "deviceRating", item.system.deviceRating);
				SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				break;
			case "baseDevice":
				if (actor.type === "actorDrone"){
					if (actorData.vehicleOwner.id && actorData.slaved){
						let controler = actorData.vehicleOwner.system;
						SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, item.name, "controler", controler.matrix.resistances.matrixDamage.dicePool);
					} else {
						SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, item.name, "deviceRating", actorData.matrix.deviceRating);
						SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, game.i18n.localize('SR5.Firewall'), "matrixAttribute", actorData.matrix.attributes.firewall.value);
					}
				} else if (actor.type === "actorDevice"){
					SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, item.name, "deviceRating", actorData.matrix.deviceRating);
					SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, game.i18n.localize('SR5.Firewall'), "matrixAttribute", actorData.matrix.attributes.firewall.value);
				} else if (actor.type === "actorSprite"){
					SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, game.i18n.localize('ACTOR.TypeActorsprite'), "level", matrix.deviceRating);
					SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
					SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, game.i18n.localize('ACTOR.TypeActorsprite'), "level", matrix.deviceRating);
					SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				} else if (actor.type === "actorAgent"){
					SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, `${game.i18n.localize('SR5.ProgramTypeAgent')}`, "itemRating", actorData.rating);
					SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
					SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, `${game.i18n.localize('SR5.ProgramTypeAgent')}`, "itemRating", actorData.rating);
					SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, game.i18n.localize('SR5.Firewall'), "matrixAttribute", matrixAttributes.firewall.value);
				}
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${item.system.type}' deck type in generateMatrixResistances()`);
				return;
		}

		for (let key of Object.keys(SR5.matrixResistances)) {
			SR5_EntityHelpers.updateDicePool(matrixResistances[key]);
		}
	}

	static generateVehicleMatrix(actor, itemData) {
		let actorData = actor.system;

		actorData.matrix.deviceRating = actorData.attributes.pilot.augmented.value;
		actorData.matrix.programsMaximumActive.value = Math.ceil(actorData.matrix.deviceRating / 2);
		actorData.matrix.marks = itemData.marks;
		actorData.matrix.markedItems = itemData.markedItems;

		for (let key of Object.keys(SR5.matrixAttributes)) {
			actorData.matrix.attributes[key].base = 0;
			SR5_EntityHelpers.updateModifier(actorData.matrix.attributes[key], game.i18n.localize('SR5.DeviceRating'), "linkedAttribute", actorData.matrix.deviceRating);
			SR5_EntityHelpers.updateValue(actorData.matrix.attributes[key]);
		}

		SR5_EntityHelpers.updateValue(actorData.matrix.noise);
	}

	static generateDeviceMatrix(actor, itemData) {
		let actorData = actor.system, matrix = actorData.matrix, 
			matrixAttributes = matrix.attributes;

		actorData.matrix.marks = itemData.marks;
		actorData.matrix.markedItems = itemData.markedItems;
		matrix.deviceName = actor.name;

		if (matrix.deviceType === "host"){
			matrix.attributesCollection.value1 = matrix.deviceRating;
			matrix.attributesCollection.value2 = matrix.deviceRating + 1;
			matrix.attributesCollection.value3 = matrix.deviceRating + 2;
			matrix.attributesCollection.value4 = matrix.deviceRating + 3;
		}

		//Handle Ice attack and defense
		if (matrix.deviceType === "ice") {
			matrix.ice.attackDicepool = matrix.deviceRating * 2;
			matrix.actions.matrixPerception.test.dicePool = matrix.deviceRating * 2;
			SR5_EntityHelpers.updateValue(matrixAttributes.dataProcessing, 0);
			matrix.actions.matrixPerception.limit.value = matrixAttributes.dataProcessing.value;
			switch(matrix.deviceSubType){
				case "iceAcid" :
				case "iceScramble" :
					matrix.ice.defenseFirstAttribute = "willpower";
					matrix.ice.defenseSecondAttribute = "firewall";
					break;
				case "iceBinder" :
					matrix.ice.defenseFirstAttribute = "willpower";
					matrix.ice.defenseSecondAttribute = "dataProcessing";
					break;
				case "iceCrash" :
				case "iceBlack" :
				case "iceKiller" :
				case "iceProbe" :
				case "iceSparky" :
				case "iceShocker":
					matrix.ice.defenseFirstAttribute = "intuition";
					matrix.ice.defenseSecondAttribute = "firewall";
					break;
				case "iceBlaster" :
				case "iceTarBaby" :
				case "iceCatapult":
					matrix.ice.defenseFirstAttribute = "logic";
					matrix.ice.defenseSecondAttribute = "firewall";
					break;
				case "iceJammer" :
					matrix.ice.defenseFirstAttribute = "willpower";
					matrix.ice.defenseSecondAttribute = "attack";
					break;
				case "iceTrack" :
				case "iceMarker" :
				case "iceBloodhound":
					matrix.ice.defenseFirstAttribute = "willpower";
					matrix.ice.defenseSecondAttribute = "sleaze";
					break;
				case "icePatrol" :
					break;
				default :
					SR5_SystemHelpers.srLog(1, `Unknown '${matrix.deviceSubType}' ice type in generateDeviceMatrix()`);
			}
		}

		//Handle Attributes
		if ((matrix.deviceType === "device") || (matrix.deviceType === "slavedDevice" && actorData.isDirectlyConnected)){
			for (let key of Object.keys(SR5.matrixAttributes)) {
				matrixAttributes[key].base = matrix.deviceRating;
				SR5_EntityHelpers.updateValue(matrixAttributes[key], 0);
			}
		} else {
			for (let key of Object.keys(SR5.matrixAttributes)) {
				SR5_EntityHelpers.updateValue(matrixAttributes[key], 0);
			}
		}

		SR5_EntityHelpers.updateValue(matrix.noise)
	}

	static generateSpriteMatrix(actor, itemData) {
		let actorData = actor.system, 
			matrix = actorData.matrix,
			matrixAttributes = matrix.attributes;

		actorData.matrix.marks = itemData.marks;
		actorData.matrix.markedItems = itemData.markedItems;
		matrix.deviceRating = actorData.level;

		//Handle base matrix attributes
		for (let key of Object.keys(SR5.matrixAttributes)) {
			matrixAttributes[key].base = matrix.deviceRating;
		}

		//Apply matrix attributes by type
		let label = `${game.i18n.localize(SR5.spriteTypes[actorData.type])}`;
		switch (actorData.type) {
			case "courier":
				SR5_EntityHelpers.updateModifier(matrixAttributes.sleaze, label, "spriteType", +3);
				SR5_EntityHelpers.updateModifier(matrixAttributes.dataProcessing, label, "spriteType", +1);
				SR5_EntityHelpers.updateModifier(matrixAttributes.firewall, label, "spriteType", +2);
				break;
			case "crack":
				SR5_EntityHelpers.updateModifier(matrixAttributes.sleaze, label, "spriteType", +3);
				SR5_EntityHelpers.updateModifier(matrixAttributes.dataProcessing, label, "spriteType", +2);
				SR5_EntityHelpers.updateModifier(matrixAttributes.firewall, label, "spriteType", +1);
				break;
			case "data":
				SR5_EntityHelpers.updateModifier(matrixAttributes.attack, label, "spriteType", -1);
				SR5_EntityHelpers.updateModifier(matrixAttributes.dataProcessing, label, "spriteType", +4);
				SR5_EntityHelpers.updateModifier(matrixAttributes.firewall, label, "spriteType", +2);
				break;
			case "fault":
				SR5_EntityHelpers.updateModifier(matrixAttributes.attack, label, "spriteType", +3);
				SR5_EntityHelpers.updateModifier(matrixAttributes.dataProcessing, label, "spriteType", +1);
				SR5_EntityHelpers.updateModifier(matrixAttributes.firewall, label, "spriteType", +2);
				break;
			case "machine":
				SR5_EntityHelpers.updateModifier(matrixAttributes.attack, label, "spriteType", +1);
				SR5_EntityHelpers.updateModifier(matrixAttributes.dataProcessing, label, "spriteType", +3);
				SR5_EntityHelpers.updateModifier(matrixAttributes.firewall, label, "spriteType", +2);
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${actorData.type}' sprite type in generateSpriteMatrix()`);
		}

		//handle matrix attributes
		for (let key of Object.keys(SR5.matrixAttributes)) {
			SR5_EntityHelpers.updateValue(matrixAttributes[key], 0);
		}

		SR5_EntityHelpers.updateValue(matrix.noise)
	}

	static generateAgentMatrix(actor, itemData){
		let actorData = actor.system;
		if(!actorData.creatorData) return;
		let matrixAttributes = actorData.matrix.attributes, creatorMatrix = actorData.creatorData.system.matrix;

		actorData.matrix.marks = itemData.marks;
		actorData.matrix.markedItems = itemData.markedItems;
		//Device
		actorData.matrix.deviceRating = creatorMatrix.deviceRating;

		//Agent attributes are equal to the rating (Kill code page 26)
		for (let key of Object.keys(SR5.characterAttributes)) {
			actorData.attributes[key].augmented.value = actorData.rating;
		}
		//Agent matrix attributes are the same as decker attributes
		for (let key of Object.keys(SR5.deckerAttributes)) {
			matrixAttributes[key].base = creatorMatrix.attributes[key].value;
			SR5_EntityHelpers.updateValue(matrixAttributes[key], 0);
		}
		//Agent skills are equal to program rating
		for (let key of Object.keys(SR5.agentSkills)){
			actorData.skills[key].rating.base = actorData.rating;
			SR5_EntityHelpers.updateValue(actorData.skills[key].rating, 0);
			actorData.skills[key].test.base = actorData.skills[key].rating.value;
			SR5_EntityHelpers.updateDicePool(actorData.skills[key].test, 0);
		}
		//Noise
		SR5_EntityHelpers.updateValue(actorData.matrix.noise)
		//Grid
		actorData.userGrid = creatorMatrix.userGrid;
	}

	static applyProgramToAgent(actor){
		let actorData = actor.system;
		if(!actorData.creatorData) return;
		for (let i of actorData.creatorData.items){
			if (i.type === "itemProgram" && (i.system.type === "common" || i.system.type === "hacking") && i.system.isActive){
				if (Object.keys(i.system.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
			}
		}

	}

	static async updateProgramAgent(actor){
		let actorObject = actor.toObject(false);
		if (game.actors) {
			for (let a of game.actors) {
				if (a.type === "actorAgent" && a.system.creatorId === actor._id){					
					await a.update({
						"system.creatorData.items": actorObject.items,
				 	})
				}
			}
		}

		if (canvas.scene){
			for (let t of canvas.tokens.placeables) {
				if(t.actor.type === "actorAgent" && t.actor.system.creatorId === actor._id){
					await t.actor.update({
						"system.creatorData.items": actorObject.items,
				 	})
				}
			}
		}
	}

	static async updateControledVehicle(actor){
		let actorObject = actor.toObject(false);
		if (game.actors) {
			for (let a of game.actors) {
				if (a.type === "actorDrone" && a.system.vehicleOwner.id === actor._id){
					await a.update({
						"system.vehicleOwner.system": actorObject.system,
						"system.vehicleOwner.items": actorObject.items,
				 	})
				}
			}
		}

		if (canvas.scene){
			for (let t of canvas.tokens.placeables) {
				if(t.actor.type === "actorDrone" && t.actor.system.vehicleOwner.id === actor._id){
					await t.actor.update({
						"system.vehicleOwner.system": actorObject.system,
						"system.vehicleOwner.items": actorObject.items,
				 	})
				}
			}
		}
	}

	static applyAutosoftEffect(actor){
		let controlerItems = actor.system.vehicleOwner.items;
		let hasLocalAutosoftRunning = actor.items.find(a => a.system.type === "autosoft" && a.system.isActive);
		if (hasLocalAutosoftRunning) actor.system.matrix.hasLocalAutosoftRunning = true;
		else actor.system.matrix.hasLocalAutosoftRunning = false;

		if (actor.system.controlMode !== "autopilot") actor.system.matrix.hasLocalAutosoftRunning = false;

		if (actor.system.controlMode === "autopilot"){
			for (let i of controlerItems){
				if (i.type === "itemProgram" && i.system.type === "autosoft" && i.system.isActive && !hasLocalAutosoftRunning){
					if (i.system.isModelBased){
						if (i.system.model === actor.system.model){
							if (Object.keys(i.system.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
						}
					} else {
						if (Object.keys(i.system.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
					}
				}
			}
		}
	}

	//////////////// MODIFS D'OBJETS ///////////////////

	// Modif dû à la possession d'un esprit
	static _actorModifPossession(item, actor) {
		let actorData = actor.system, actorAttribute = actorData.attributes;
		let spiritForce = item.system.itemRating, spiritType = item.system.type, spiritAttributes = item.system.attributes;

		// Attributes modifiers
		for (let key of Object.keys(SR5.characterPhysicalAttributes)) {
			if (actorAttribute[key].augmented.base < spiritForce) {
				SR5_EntityHelpers.updateModifier(actorAttribute[key].augmented, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(SR5.spiritTypes[spiritType])})`, "possession", Math.floor(spiritForce / 2));
			}
		}
		for (let key of Object.keys(SR5.characterMentalAttributes)) {
			let mod = spiritAttributes[key] - actorAttribute[key].augmented.base;
			SR5_EntityHelpers.updateModifier(actorAttribute[key].augmented, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(SR5.spiritTypes[spiritType])})`, "possession", mod);
		}
		for (let key of Object.keys(SR5.characterSpecialAttributes)) {
			if(spiritAttributes[key]){
				let mod = spiritAttributes[key] - actorData.specialAttributes[key].augmented.base;
				SR5_EntityHelpers.updateModifier(actorData.specialAttributes[key].augmented, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(SR5.spiritTypes[spiritType])})`, "possession", mod);
			}
		}

		// Skills modifiers
		for (let key of Object.keys(SR5.skillGroups)){
			if (actorData.skillGroups[key]){
				let mod = actorData.skillGroups[key].base;
				SR5_EntityHelpers.updateModifier(actorData.skillGroups[key], `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(SR5.spiritTypes[spiritType])})`, "possession", -mod);
			}
		}
		for (let key of Object.keys(SR5.skills)) {
			if (actorData.skills[key]){
				let spiritSkill = item.system.skill.find(skill => skill === key);
				if (spiritSkill === key) {
					let mod = spiritForce - actorData.skills[key].rating.value;
					SR5_EntityHelpers.updateModifier(actorData.skills[key].rating, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(SR5.spiritTypes[spiritType])})`, "possession", mod);
				} else {
					let mod = actorData.skills[key].rating.base;
					SR5_EntityHelpers.updateModifier(actorData.skills[key].rating, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(SR5.spiritTypes[spiritType])})`, "possession", -mod);
				}
			}
		}

		// Initiative "modifier"
		actorData.initiatives.physicalInit.dice.base = 2;

		// Penalties modifiers (rules are so cryptic, I prefer to simplify and just put a "bonus" to penalty)
		SR5_EntityHelpers.updateModifier(actorData.penalties.condition.actual, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(SR5.spiritTypes[spiritType])})`, "possession", spiritForce);

	}

	static applyCustomEffects(item, actor) {
		let itemData = item.system;

		for (let customEffect of Object.values(itemData.customEffects)) {
			let skipCustomEffect = false,
				cumulative = customEffect.cumulative,
				isMultiplier = false;

			if (!customEffect.target || !customEffect.type) {
				SR5_SystemHelpers.srLog(3, `Empty custom effect target or type in applyCustomEffects()`, customEffect);
				skipCustomEffect = true;
			}

			// For effect depending on wifi
			if (customEffect.wifi && !itemData.wirelessTurnedOn) skipCustomEffect = true;
			// For transferable effect
			if (customEffect.transfer) skipCustomEffect = true;
			// Drugs
			if (item.type === "itemDrug"){
				if (!itemData.isActive && !customEffect.wifi) skipCustomEffect = true;
			}
			// Quality : if an effect has "wifi on" check box to true, effect is always turned on, even if quality is not "equiped"
			if (item.type === "itemQuality"){
				if (itemData.isActive && customEffect.wifi) skipCustomEffect = false;
				else if (!itemData.isActive && customEffect.wifi) skipCustomEffect = false;
				else if (!itemData.isActive) skipCustomEffect = true;
			}

			let targetObject = SR5_EntityHelpers.resolveObjectPath(customEffect.target, actor);
			if (targetObject === null) skipCustomEffect = true;

			if (!skipCustomEffect) {
				SR5_SystemHelpers.srLog(3, `Applying Custom Effect for ${item.name}`);
				if (!customEffect.multiplier) customEffect.multiplier = 1;

				//Special case for items'effects which modify all weapons weared by the actor
				if (customEffect.category === "weaponEffectTargets"){
					if (customEffect.target === "system.itemsProperties.weapon.accuracy"){
						customEffect.value = (customEffect.value || 0);
						SR5_EntityHelpers.updateModifier(targetObject, `${item.name} (${game.i18n.localize(SR5.itemTypes[item.type])})`, customEffect.type, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
						continue;
					}
					if (customEffect.target === "system.itemsProperties.weapon.damageValue"){
						customEffect.value = (customEffect.value || 0);
						SR5_EntityHelpers.updateModifier(targetObject, `${item.name} (${game.i18n.localize(SR5.itemTypes[item.type])})`, customEffect.type, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
						continue;
					}
				}

				//Special case for Hardened Armor : value based on actor attributes are not yet calculated, so we need a trick
				if (customEffect.category === "hardenedArmors"){
					if (customEffect.type !== "rating") {
						SR5_EntityHelpers.updateModifier(targetObject, item.name, item.type, 0, isMultiplier, cumulative, customEffect);
						continue;
					}
				}

				//Special case for Energetic Aura
				if (customEffect.target === "system.specialProperties.energyAura"){
					setProperty(actor, customEffect.target, customEffect.type);
					continue;
				}

				//Special case for full Defense
				if (customEffect.target === "system.specialProperties.fullDefenseAttribute"){
					setProperty(actor, customEffect.target, customEffect.type);
					SR5_CharacterUtility.updateDefenses(actor);         
					continue;
				}

				SR5_SystemHelpers.srLog(3, `Apply effect from '${item.name}'. Target: ${customEffect.target} / Value: ${customEffect.value}`)

				//Determine modifier type
				let modifierType = item.type;
				if (item.type === "itemEffect") modifierType = item.system.type;

				switch (customEffect.type) {
					case "rating":
						customEffect.value = (itemData.itemRating || 0);
						SR5_EntityHelpers.updateModifier(targetObject, item.name, modifierType, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
						break;
					case "hits":
						customEffect.value = (itemData.hits || 0);
						SR5_EntityHelpers.updateModifier(targetObject, item.name, modifierType, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
						break;
					case "value":
						customEffect.value = (customEffect.value || 0);
						SR5_EntityHelpers.updateModifier(targetObject, item.name, modifierType, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
						break;
					case "valueReplace":
						targetObject.modifiers= [];
						if (targetObject.base < 1) targetObject.base = 0;
						let modValue = -targetObject.base + (customEffect.value || 0);
						SR5_EntityHelpers.updateModifier(targetObject, item.name, modifierType, modValue * customEffect.multiplier, isMultiplier, cumulative);
						break;
					//currently disabled in effects.html
					case "ratingReplace":
						targetObject.modifiers= [];
						customEffect.value = (itemData.itemRating || 0);
						if (targetObject.base < 1) targetObject.base = 0;
						let modRating = -targetObject.base + customEffect.value;
						SR5_EntityHelpers.updateModifier(targetObject, item.name, modifierType, modRating * customEffect.multiplier, isMultiplier, cumulative);
						break;
					case "boolean":
						let booleanValue;
						if (customEffect.value === "true") booleanValue = true;
						else booleanValue = false;
						setProperty(actor, customEffect.target, booleanValue);
						break;            
					case "divide":
						let divide = 1 / customEffect.multiplier;
						SR5_EntityHelpers.updateModifier(targetObject, item.name, modifierType, divide, true, cumulative);
						break;
					default:
						SR5_SystemHelpers.srLog(1, `Unknown '${customEffect.type}' custom effect type in applyCustomEffects()`, customEffect);
				}

			}
		}
	}

}
