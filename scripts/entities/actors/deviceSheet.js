import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for device type actors in the Shadowrun 5 system.
 */
export class SR5AppareilSheet extends ActorSheetSR5 {
	constructor(...args) {
		super(...args);
	}

	static DEFAULT_OPTIONS = {
		classes: ["device"],
		position: { width: 800, height: 448 },
		window: { resizable: false },
	};

	static PARTS = {
		sheet: {
			template: "systems/sr5/templates/actors/device-sheet.html",
			root: true,
			scrollable: [".sr-panel"],
		},
	};

	async _prepareContext(options) {
		const context = await super._prepareContext(options);

		this._prepareItems(context.actor);

		context.rulesMatrixGrid = game.settings.get("sr5", "sr5MatrixGridRules");
		context.rulesCalledShot = game.settings.get("sr5", "sr5CalledShotsRules");
		context.rulesKillCode = game.settings.get("sr5", "sr5KillCodeRules");
		context.matrixActionsRigger5 = game.settings.get("sr5", "sr5Rigger5Actions");

		return context;
	}

	_prepareItems(actor) {
		const externalEffects = [];

		// Iterate through items, allocating to containers
		for (let i of actor.items) {
			if (i.type === "itemEffect") externalEffects.push(i);
		}

		actor.externalEffects = externalEffects;
	}

	/** @override */
	async _onDropItemCreate(itemData) {
		switch(itemData.type){
			case "itemEffect":
				return super._onDropItemCreate(itemData);
			default:
				ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
				return;
		}
	}
}
