import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for spirit type actors in the Shadowrun 5 system.
 */
export class SR5SpriteSheet extends ActorSheetSR5 {
	constructor(...args) {
		super(...args);

		this._shownUntrainedSkills = false;
		this._shownNonRollableMatrixActions = false;
		this._filters = {
			skills: "",
			matrixActions: "",
		};
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/sr5/templates/actors/sprite-sheet.html",
			width: 800,
			height: 618,
			resizable: false,
			classes: ["sr5", "sheet", "actor", "sprite"],
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
		this._prepareSkills(context.actor);
		this._prepareMatrixActions(context.actor);

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

	_prepareSkills(actor) {
		const activeSkills = {};
		for (let [key, skill] of Object.entries(actor.system.skills)) {
		if (skill.rating.value > 0 || this._shownUntrainedSkills)
			activeSkills[key] = skill;
		}
		actor.system.skills = activeSkills;
	}

	_prepareMatrixActions(actor) {
		const activeMatrixActions = {};
		let killCodeRules = game.settings.get("sr5", "sr5KillCodeRules");	
		let rigger5Actions = game.settings.get("sr5", "sr5Rigger5Actions");

		for (let [key, matrixAction] of Object.entries(actor.system.matrix.actions)) {
			if ((matrixAction.source === "core" || (killCodeRules && matrixAction.source === "killCode") || (rigger5Actions && matrixAction.source === "rigger5")) && matrixAction.test?.dicePool > 0 || matrixAction.defense?.dicePool > 0 || this._shownNonRollableMatrixActions) activeMatrixActions[key] = matrixAction;
		}
		actor.system.matrix.actions = activeMatrixActions;
	}

	_prepareItems(actor) {
		const spritePowers = [];
		const externalEffects = [];

		// Iterate through items, allocating to containers
		for (let i of actor.items) {
			if (i.type === "itemSpritePower") spritePowers.push(i);
			else if (i.type === "itemEffect") externalEffects.push(i);
		}

		actor.spritePowers = spritePowers;
		actor.externalEffects = externalEffects;
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

	/** @override */
	async _onDropItemCreate(itemData) {
		switch(itemData.type){
		case "itemSpritePower":
		case "itemEffect":
			return super._onDropItemCreate(itemData);
		default:
			ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
			return;
		}        
	}
	
}
