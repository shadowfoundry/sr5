import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for agent type actors in the Shadowrun 5 system.
 */
export class SR5AgentSheet extends ActorSheetSR5 {
	constructor(...args) {
		super(...args);

		this._shownUntrainedSkills = false;
		this._shownNonRollableMatrixActions = false;
		this._filters = {
			skills: "",
			matrixActions: "",
		};
	}

	static DEFAULT_OPTIONS = {
		classes: ["agent"],
		position: { width: 800, height: 618 },
		window: { resizable: false },
	};

	static PARTS = {
		sheet: {
			template: "systems/sr5/templates/actors/agent-sheet.html",
			root: true,
			scrollable: [".SR-ActorMainCentre", ".SR-ActorColGauche"],
		},
	};

	static TABS = {
		gauche: {
			tabs: [
				{ id: "tab-attributs" },
			],
			initial: "tab-attributs",
		},
	};

	async _prepareContext(options) {
		const context = await super._prepareContext(options);

		this._prepareItems(context.actor);
		this._prepareSkills(context.actor);
		this._prepareMatrixActions(context.actor);

		context.rulesMatrixGrid = game.settings.get("sr5", "sr5MatrixGridRules");
		context.rulesCalledShot = game.settings.get("sr5", "sr5CalledShotsRules");
		context.rulesKillCode = game.settings.get("sr5", "sr5KillCodeRules");
		context.matrixActionsRigger5 = game.settings.get("sr5", "sr5Rigger5Actions");

		return context;
	}

	_prepareSkills(actor) {
		const activeSkills = {};
		for (let [key, skill] of Object.entries(actor.system.skills)) {
			if (skill.rating.value > 0 || this._shownUntrainedSkills) {
				activeSkills[key] = skill;
			}
		}
		actor.system.skills = activeSkills;
	}

	_prepareMatrixActions(actor) {
		const activeMatrixActions = {};
		let killCodeRules = game.settings.get("sr5", "sr5KillCodeRules");
		let rigger5Actions = game.settings.get("sr5", "sr5Rigger5Actions");
		for (let [key, matrixAction] of Object.entries(actor.system.matrix.actions)) {
			if ((matrixAction.source === "core" || (killCodeRules && matrixAction.source === "killCode") || (rigger5Actions && matrixAction.source === "rigger5")) &&   matrixAction.test?.dicePool > 0 || matrixAction.defense?.dicePool > 0  || this._shownNonRollableMatrixActions) {
				activeMatrixActions[key] = matrixAction;
			}
		}
		actor.system.matrix.actions = activeMatrixActions;
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
