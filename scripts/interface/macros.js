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
export async function createSR5Macro(data, slot) {
	if (data.type !== "Item") return ui.notifications.warn(`Pas de marco programmé pour ce type d'objet`);//TODO: translate;
	if (data.type != "itemWeapon" && data.type != "itemSpell") return ui.notifications.warn(`Pas de marco programmé pour ce type d'objet`);//TODO: translate
	if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items"); //TODO: translate
	const item = data;

	// Create the macro command
	const command = `game.sr5.rollItemMacro("${item.name}");`;
	let macro = game.macros.contents.find((m) => m.name === item.name && m.command === command);
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: "script",
			img: item.img,
			command: command,
			flags: { "sr5.itemMacro": true },
		});
	}
	game.user.assignHotbarMacro(macro, slot);
	return false;
}

/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
export function rollItemMacro(itemName) {
	const speaker = ChatMessage.getSpeaker();
	let actor;
	if (speaker.token) actor = game.actors.tokens[speaker.token];
	if (!actor) actor = game.actors.get(speaker.actor);

	// Get matching items
	const items = actor ? actor.items.filter((i) => i.name === itemName) : [];
	if (items.length > 1) {
		ui.notifications.warn(`${actor.name} possède plusieurs objet ${itemName}. Le premier sera choisi.`); //TODO: translate
	} else if (items.length === 0) {
		return ui.notifications.warn(`L'acteur contrôlé ne possède pas d'objet ${itemName}`);//TODO: translate
	}
	const item = items[0];

	// Trigger the item roll
	if (item.type === "itemSpell") return item.rollTest("spell");
	if (item.type === "itemWeapon") {
		if (item.system.category === "grenade")
			return item.placeGabarit();
		else return item.rollTest("weapon");
	}
	return ui.notifications.warn(`Pas de marco programmé pour ce type d'objet`);//TODO: translate
}
