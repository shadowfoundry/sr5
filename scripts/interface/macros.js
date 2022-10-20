import { SR5 } from "../config.js";
import { SR5_PrepareRollTest } from "../rolls/roll-prepare.js";

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createSR5MacroItem(data, slot) {
	const item = fromUuidSync(data.uuid);
	if (item.type !== "itemWeapon" 
		&& item.type !== "itemSpell"
		&& item.type !== "itemPreparation"
		&& (item.type !== "itemAdeptPower" && item.needRoll)
		&& item.type !== "itemComplexForm"
		) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoMacro")}`);

	let command = `game.sr5.rollItemMacro("${data.uuid}");`;
	let macro = game.macros.find((m) => m.name === item.name && m.command === command);

	// Create the macro command
	if (!macro){
		macro = await Macro.create({
			name: item.name,
			img: item.img,
			type: "script",
			command: command,
			scope: "actor",
			flags: {"sr5.itemMacro": true}
		});
	}

	game.user.assignHotbarMacro(macro, slot);
}

/* -------------------------------------------- */

export async function createSR5Macro(data, slot){
	let name, img, command;

	command = `game.sr5.rollMacro("${data.type}", "${data.subType}");`;	
	if (data.type === "Skill"){
		name = game.i18n.localize(SR5.skills[data.subType]);
		img = "systems/sr5/img/icons/macro-skills.svg"
	} else if (data.type === "MatrixAction"){
		name = game.i18n.localize(SR5.matrixActions[data.subType]);
		img = "systems/sr5/img/icons/macro-matrixAction.svg"
	} else if (data.type === "ResonanceAction"){
		name = game.i18n.localize(SR5.resonanceActions[data.subType]);
		img = "systems/sr5/img/icons/macro-resonanceAction.svg"
	}

	let macro = game.macros.find((m) => m.name === name && m.command === command);
	// Create the macro command
	if (!macro){
		macro = await Macro.create({
			name: name,
			img: img,
			type: "script",
			command: command,
			scope: "actor",
			flags: {"sr5.macro": true}
		});
	}

	game.user.assignHotbarMacro(macro, slot);
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
export function rollItemMacro(itemUuid) {
	const item = fromUuidSync(itemUuid);

	// Trigger the item roll
	switch(item.type){
		case "itemSpell":
			return item.rollTest("spell");
		case "itemPreparation":
			return item.rollTest("preparation");
		case "itemWeapon":
			if (item.system.category === "grenade") return item.placeGabarit();
			else return item.rollTest("weapon");
		case "itemAdeptPower":
			return item.rollTest("adeptPower");
		case "itemComplexForm":
			return item.rollTest("complexForm");
		default:
			return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoMacro")}`);
	}
}

export function rollMacro(type, subType){
	const speaker = ChatMessage.getSpeaker();
    let actor = null;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
	if (!actor) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActor")}`); 

	switch(type){
		case "Skill":
			return actor.rollTest("skillDicePool", subType);
		case "MatrixAction":
			return actor.rollTest("matrixAction", subType);
		case "ResonanceAction":
			return actor.rollTest("resonanceAction", subType);
		default:
			return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoMacro")}`);
	}
}