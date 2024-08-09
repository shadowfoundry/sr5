import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for player character type actors in the Shadowrun 5 system.
 */
export class SR5AppareilSheet extends ActorSheetSR5 {
  	constructor(...args) {
		super(...args);
  	}

  	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(super.defaultOptions, {
			template: "systems/sr5/templates/actors/device-sheet.html",
			width: 800,
			height: 448,
			resizable: false,
			classes: ["sr5", "sheet", "actor", "device"],
		});
  	}

	getData() {
		const actorData = this.actor.toObject(false);
		const context ={
			editable: this.isEditable,
			actor: actorData,
			system: actorData.system,
			items: actorData.items,
			owner: this.actor.isOwner,
			filters: this._filters,
			lists: actorData.system.lists,
		};

		// Sort Owned Items
		for ( let i of context.items ) {
			const item = this.actor.items.get(i._id);
			i.labels = item.labels;
		}
		context.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));

		this._prepareItems(context.actor);

		if (game.settings.get("sr5", "sr5MatrixGridRules")) context.rulesMatrixGrid = true;
		else context.rulesMatrixGrid = false;
		if (game.settings.get("sr5", "sr5CalledShotsRules")) context.rulesCalledShot = true;
		else context.rulesCalledShot = false;
		if (game.settings.get("sr5", "sr5KillCodeRules")) context.rulesKillCode = true;
		else context.rulesKillCode = false;
		if (game.settings.get("sr5", "sr5Rigger5Actions")) context.matrixActionsRigger5 = true;
		else context.matrixActionsRigger5 = false;

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

  	activateListeners(html) {
		super.activateListeners(html);
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
