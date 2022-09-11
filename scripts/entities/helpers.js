import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";

export class SR5_EntityHelpers {

	// Fonction générique pour arrondir
	static roundDecimal(nombre, precision) {
		precision = precision || 2;
		var tmp = Math.pow(10, precision);
		return Math.round(nombre * tmp) / tmp;
	}

	static modifiersSum(modifiersArray) {
		if (modifiersArray === undefined || !Array.isArray(modifiersArray)) {
			SR5_SystemHelpers.srLog(1, `Missing or non-array variable sent to 'modifiersSum()'`, (modifiersArray ? modifiersArray : ''));
			return;
		}
		return this.parseModifiers(modifiersArray, "sum");
	}

	static modifiersOnlyPositivesSum(modifiersArray) {
		if (modifiersArray === undefined || !Array.isArray(modifiersArray)) {
			SR5_SystemHelpers.srLog(1, `Missing or non-array variable sent to 'modifiersOnlyPositivesSum()'`, (modifiersArray ? modifiersArray : ''));
			return;
		}
		return this.parseModifiers(modifiersArray, "sumPositives");
	}

	static modifiersOnlyNegativesSum(modifiersArray) {
		if (modifiersArray === undefined || !Array.isArray(modifiersArray)) {
			SR5_SystemHelpers.srLog(1, `Missing or non-array variable sent to 'modifiersOnlyNegativesSum()'`, (modifiersArray ? modifiersArray : ''));
			return;
		}
		return this.parseModifiers(modifiersArray, "sumNegatives");
	}

	static modifiersProduct(modifiersArray) {
		if (modifiersArray === undefined || !Array.isArray(modifiersArray)) {
			SR5_SystemHelpers.srLog(1, `Missing or non-array variable sent to 'modifiersProduct()'`, (modifiersArray ? modifiersArray : ''));
			return;
		}
		let product = this.parseModifiers(modifiersArray, "product");
		return (product ? product : 1);
	}

	static parseModifiers(modifiersArray, parsingType) {
		if (modifiersArray === undefined || !Array.isArray(modifiersArray)) {
			SR5_SystemHelpers.srLog(1, `Missing or non-array variable sent to 'parseModifiers()'`, (modifiersArray ? modifiersArray : ''));
			return;
		}
		let totalModifiers = 0;
		for (let [index, modifier] of Object.entries(modifiersArray)) {
			if (isNaN(modifier.value)) {
				SR5_SystemHelpers.srLog(1, `Modifier '[${index}]' value is not a number in 'parseModifiers()'`, modifier);
				return;
			}
			switch (parsingType) {
				case "sum":
					if (!modifier.isMultiplier) {
						totalModifiers = totalModifiers + modifier.value * 1;
					}
					break;
				case "sumPositives":
					if (!modifier.isMultiplier && modifier.type.split("_").pop() == 'gain') {
						totalModifiers = totalModifiers + modifier.value * 1;
					}
					break;
				case "sumNegatives":
					if (!modifier.isMultiplier && modifier.type.split("_").pop() == 'loss') {
						totalModifiers = totalModifiers + modifier.value * 1;
					}
					break;
				case "product":
					if (modifier.isMultiplier) {
						if (!totalModifiers) totalModifiers = modifier.value;
						else totalModifiers = totalModifiers * modifier.value;
					}
					break;
				default:
					SR5_SystemHelpers.srLog(1, `Missing or wrong parsing type sent to 'parseModifiers()'`);
					return;
			}
		}
		return totalModifiers;
	}

	static updateModifier(property, modifierLabel, modifierType, modifierValue, isMultiplier = false, cumulative = true) {
		if (property === undefined) { SR5_SystemHelpers.srLog(1, `Missing or incorrect property sent to 'updateModifier()'`); return; }
		if (!property.modifiers) { SR5_SystemHelpers.srLog(1, `Missing or incorrect modifiers for '${property}' property sent to 'updateModifier()'`); return; }
		let modifiersArray = property.modifiers;

		if (modifiersArray === undefined || !Array.isArray(modifiersArray)) { SR5_SystemHelpers.srLog(1, `Missing or non-array variable sent to 'updateModifier()'`); return; }
		if (isNaN(modifierValue)) { SR5_SystemHelpers.srLog(1, `Modifier value '${modifierValue}' is not a number in 'updateModifier()'`); return; }
		let modified = false;

		modifiersArray.find((oldModifier, index) => {
			if (!cumulative && oldModifier.type === modifierType) {
				let newValue = 0;
				if (oldModifier.value >= 0) {
					newValue = Math.max(oldModifier.value, modifierValue);
				} else {
					newValue = Math.min(oldModifier.value, modifierValue);
				}
				modifiersArray[index] = { source: modifierLabel, type: modifierType, value: newValue, isMultiplier: isMultiplier };
				modified = true;
			}
		});
		if (!modified) {
			modifiersArray.push({ source: modifierLabel, type: modifierType, value: modifierValue, isMultiplier: isMultiplier });
		}
	}

	static updateValue(property, minValue, maxValue) {
		if (property === undefined) {
			SR5_SystemHelpers.srLog(1, `Missing or non-existing property '${property}' sent to 'updateValue()'`);
			return;
		}
		this.updatePropertyTotal('value', property, minValue, maxValue)
	}

	static updateDicePool(property, minValue, maxValue) {
		if (property === undefined) {
			SR5_SystemHelpers.srLog(1, `Missing or non-existing property sent to 'updateDicePool()'`);
			return;
		}
		this.updatePropertyTotal('dicePool', property, minValue, maxValue)
	}

	static updatePropertyTotal(total, property, minValue, maxValue) {
		let value = this.roundDecimal((property.base + this.modifiersSum(property.modifiers)) * this.modifiersProduct(property.modifiers), 2);
		if (minValue !== undefined) value = Math.max(value, minValue);
		if (maxValue !== undefined) value = Math.min(value, maxValue);
		property[total] = value;
	}

	static resolveObjectPath(path, object) {
		if (path === undefined) return null;
		return path.split('.').reduce(function (previous, current) {
			return (previous ? previous[current] : null);
		}, object || self);
	}

	static GenerateMonitorBoxes(entity, monitorType) {
		if (!entity || !monitorType) { SR5_SystemHelpers.srLog(1, `Missing 'actor' or 'monitorType' parameter for 'GenerateMonitorBoxes()'`); }
		if (!entity.conditionMonitors || !entity.conditionMonitors[monitorType]) { SR5_SystemHelpers.srLog(1, `Missing or non-existing '${monitorType}' condition monitor in 'GenerateMonitorBoxes()'`); }
		let conditionMonitors = entity.conditionMonitors;
		let monitorMaximum = conditionMonitors[monitorType].value, currentMonitorValue = conditionMonitors[monitorType].actual.value;

		conditionMonitors[monitorType].boxes = []
		for (let loop = 1; loop < monitorMaximum + 1; loop++) {
			if (monitorType == 'overflow' && conditionMonitors['physical'].actual.value < conditionMonitors['physical'].value)
				conditionMonitors[monitorType].boxes.push({ filled: false, locked: true });
			else
				conditionMonitors[monitorType].boxes.push({ filled: (loop <= currentMonitorValue ? true : false) });
		}
	}

	static updateStatusBars(actor, monitorType) {
		let actorData = actor.system, conditionMonitors = actorData.conditionMonitors, statusBars = actorData.statusBars;
		statusBars[monitorType].value = conditionMonitors[monitorType].actual.value;
		statusBars[monitorType].max = conditionMonitors[monitorType].value;
	}

	static getTotalPenalty(actor) {
		if (!actor) {
			SR5_SystemHelpers.srLog(1, `Missing or invalid actor in call to 'getTotalPenalty()'`);
			return;
		}
		if (!actor.penalties) {
			SR5_SystemHelpers.srLog(1, `No penalties properties for '${actor.name}' actor in call to 'getTotalPenalty()'`);
			return;
		}
		return actor.penalties.actual.reduce(function (totalPenalty, currentPenalty) {
			return totalPenalty + currentPenalty.value;
		}, 0);
	}

	//Get the real actor Document based on ID
	static getRealActorFromID(actorID){
		let actor, token, tokenDocument;
		actor = game.actors.get(actorID);
		if (actor) return actor;
		if (canvas.scene){
			token = canvas.tokens.get(actorID);
			if (token){
				const scene = game.scenes.get(token.scene.id);
				tokenDocument = scene.tokens.get(actorID);
				actor = tokenDocument.actor;
			}
		}
		return actor;
	}

	/**
	 * Get the position of an actor on the canvas
	 * @param actor             The actor entity
	 * @return {actorPosition}  The position of the actor {x: ; y:}
	 */
	static getActorCanvasPosition(actor){
		let actorPosition = 0;
		if (actor.token) {
			actorPosition = { x: actor.token.x, y: actor.token.y };
		} else {
			let t = canvas.scene?.tokens.find((token) => token.actorId === actor.id);
			if (t !== undefined) actorPosition = { x: t.x, y: t.y };
		}
		return actorPosition;
	}

	// Return object with properties sorted alphabetically by translated terms, using keys from a "table" from config.js
	// NOTE: no assumptions should be made regarding order of properties in an object so it might not work for all browsers
	static sortByTranslatedTerm(object, table) {
		if (typeof table === "undefined" || !SR5[table]) {
			SR5_SystemHelpers.srLog(0, `Missing or inexistant translation '${table}' table`);
			return object;
		}
		const newObject = {};
		const arrayTerms = [];
		for (let [key, data] of Object.entries(object)) {
			if (Object.prototype.toString.call(data) !== "[object Object]") {
				let tmpObject = {
					key: key,
					label: data
				};
				arrayTerms.push(tmpObject);
			} else {
				data.key = key;
				arrayTerms.push(data);
			}
		}
		arrayTerms.sort((a, b) => {
			return game.i18n.localize(SR5[table][a.key]).localeCompare(game.i18n.localize(SR5[table][b.key]));
		});
		for (let loop = 0; loop < arrayTerms.length; ++loop) {
			newObject[arrayTerms[loop]["key"]] = arrayTerms[loop];
		}
		for (let key of Object.keys(newObject)) {
			let label = newObject[key].label;
			delete newObject[key].key;
			delete newObject[key].label;
			if (!Object.values(newObject[key]).length) {
				newObject[key] = label;
			}
		}
		return newObject;
	}

	// Here we sort all the tables except those mentionned in the switch
	static sortTranslations(object) {
		for (let key of Object.keys(object)) {
			switch (key) {
				case "actionTypes":
				case "augmentationGrades":
				case "characterAttributes":
				case "characterDefenses":
				case "characterInitiatives":
				case "characterResistances":
				case "characterSpecialAttributes":
				case "deckModules":
				case "deckModes":
				case "droneTypes":
				case "genders":
				case "legalTypes":
				case "legalTypesShort":
				case "metatypes":
				case "valueMultipliers":
				case "spellCombatTypes":
				case "spellCombatTypesShort":
				case "spellDurations":
				case "spellDurationsShort":
				case "spellTypes":
				case "spellTypesShort":
				case "statusEffects":
				case "lifestyleTypes":
				case "qualityTypes":
				case "qualityTypesShort":
				case "barrierTypes":
					break;
				default:
					object[key] = this.sortByTranslatedTerm(object[key], key);
			}
		}
		return object;
	}

	//Sort alphabetically the value of an Object
	static sortObjectValue(obj){
		// convert object into array
		var sortable=[];
		for(var key in obj){
			if(obj.hasOwnProperty(key)) sortable.push([key, obj[key]]); // each item is an array in format [key, value]
		}
		// sort items by value
		sortable.sort(function (a, b){
			return a[1].localeCompare(b[1]);
		});
		sortable = Object.fromEntries(sortable)
		return sortable;
	}

	static getLabelByKey(key){
		let newKey = ""
		if (key.includes("system.matrix.attributes")){
			newKey = key.slice(25);
			return `${game.i18n.localize(SR5.matrixAttributes[newKey])}`;
		} else if (key.includes("system.attributes")){
			newKey = key.slice(18);
			newKey = newKey.replace('.augmented','');
			return `${game.i18n.localize(SR5.characterAttributes[newKey])}`;
		} else if (key.includes("system.initiatives")){
			newKey = key.slice(19);
			return `${game.i18n.localize(SR5.characterInitiatives[newKey])}`;
		} else {
			switch (key){
				case "system.conditionMonitors.stun.actual":
					return `${game.i18n.localize("SR5.DamageTemporary")} (${game.i18n.localize("SR5.DamageTypeStun")})`;
				case "system.conditionMonitors.physical.actual":
					return `${game.i18n.localize("SR5.DamageTemporary")} (${game.i18n.localize("SR5.DamageTypePhysical")})`;
				case "system.conditionMonitors.condition.actual":
					return `${game.i18n.localize("SR5.DamageTemporary")} (${game.i18n.localize("SR5.DamageTypePhysical")})`;
				case "system.conditionMonitors.matrix":
					return game.i18n.localize("SR5.MatrixMonitor");
				case "system.itemsProperties.armor":
					return game.i18n.localize("SR5.Armor");
				case "system.penalties.special.actual":
					return game.i18n.localize("SR5.GlobalPenalty");
				case "system.defenses.defend":
					return game.i18n.localize("SR5.Defenses");
				default:
					SR5_SystemHelpers.srLog(1, `Unknown '${key}' in 'getLabelByKey()'`);
					return newKey;
			}
		}
	}

}
