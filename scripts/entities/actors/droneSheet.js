import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for player character type actors in the Shadowrun 5 system.
 */
export class SR5DroneSheet extends ActorSheetSR5 {
	constructor(...args) {
		super(...args);

		this._shownInactiveMatrixPrograms = true;
		this._shownUntrainedSkills = false;
		this._shownUntrainedGroups = false;
		this._filters = {
			skills: "",
		};
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			template: "systems/sr5/templates/actors/drone-sheet.html",
			width: 800,
			height: 618,
			resizable: false,
			classes: ["sr5", "sheet", "actor", "drone"],
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
		const weapons = [];
		const armors = [];
		const programs = [];
		const ammunitions = [];
		const vehiclesMod = [];
		const externalEffects = [];

		// Iterate through items, allocating to containers
		for (let i of actor.items) {
			if (i.type === "itemWeapon") weapons.push(i);
			else if (i.type === "itemArmor") armors.push(i);
			else if (i.type === "itemProgram") {
				if (i.system.isActive === true || this._shownInactiveMatrixPrograms) programs.push(i);
			}
			else if (i.type === "itemMark") marks.push(i);
			else if (i.type === "itemAmmunition") ammunitions.push(i);
			else if (i.type === "itemEffect") externalEffects.push(i);
			else if (i.type === "itemVehicleMod") vehiclesMod.push(i);
		}

		actor.weapons = weapons;
		actor.armors = armors;
		actor.programs = programs;
		actor.ammunitions = ammunitions;
		actor.vehiclesMod = vehiclesMod;
		actor.externalEffects = externalEffects;
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

	/** @override */
	async _onDropItemCreate(item) {
		switch(item.type){
			case "itemWeapon":
				if (item.system.category !== "rangedWeapon") {
					ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
					return;
				}
				for (let i of this.actor.items){
					if (i.system.type === "itemWeapon" && i.system.isActive && (i.system.category === item.system.category)) {
						return super._onDropItemCreate(item);
					}
				}
				item.system.isActive = true;
				return super._onDropItemCreate(item);
			case "itemArmor":
			case "itemProgram":
			case "itemMark":
			case "itemAmmunition":
			case "itemVehicleMod":
			case "itemEffect":
				return super._onDropItemCreate(item);
			default:
				ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
				return;
		}
	}
}
