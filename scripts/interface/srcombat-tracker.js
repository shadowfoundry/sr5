import { SR5Combat } from "../system/srcombat.js";

//Custom Combat Tracker
export class SR5CombatTracker extends CombatTracker {
	get template() {
		return "systems/sr5/templates/interface/srcombat-tracker.html";
	}

	async getData(options) {
		let data = await super.getData(options);
		await SR5CombatTracker.manageActions(data.combat, data.turns);
		return data;
	}

	//Add right click options to the combat tracker
	static addCombatTrackerContextOptions(html, options) {
		options.push(
			{
				name: game.i18n.localize('SR5.INIT_SeizeTheInitiative'),
				icon: '<i class="fas fa-sort-numeric-up"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant.actor.system.specialAttributes?.edge?.augmented?.value && combatant.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant) await SR5Combat.seizeInitiative(combatant);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_Blitz'),
				icon: '<i class="fas fa-bolt"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant.actor.system.specialAttributes?.edge?.augmented?.value && combatant.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant) await SR5Combat.blitz(combatant);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusOne'),
				icon: '<i class="fas fa-caret-down"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant) await SR5Combat.adjustInitiative(combatant, -1);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusFive'),
				icon: '<i class="fas fa-angle-down"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant) await SR5Combat.adjustInitiative(combatant, -5);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusTen'),
				icon: '<i class="fas fa-angle-double-down"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant =  game.combat.combatants.get(li.data("combatant-id"));
					if (combatant) await SR5Combat.adjustInitiative(combatant, -10);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_Delaying'),
				icon: '<i class="fas fa-hourglass-end"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant =  game.combat.combatants.get(li.data("combatant-id"));
					if (combatant) await SR5Combat.delayAction(combatant);
				},
			}
		);
		return options;
	}


	static async renderCombatTracker(app, html, data) {
		if (game.combat){
			await SR5CombatTracker.markCombatantAsPlayed(app, html, data);
		}
	}

	static async markCombatantAsPlayed(app, html, data){
		for (let combatant of data.combat.combatants){
			if (combatant.flags.sr5?.hasPlayed || (combatant.initiative <= 0)){
				let li = html.find("[data-combatant-id='" + combatant.id +"']")
				let name = li.find("h4");
				name.addClass("hasPlayed");
				let initScor = li.find(".initiative");
				initScor.addClass("hasPlayed");
			}
		}
	}

	//Add actions to combat tracker
	static async manageActions(combat, turns){
		for (let c of turns){
			let combatant = combat.combatants.find(a => a.id === c.id);
			c.actions = {
				free: combatant.flags.sr5?.actions?.free,
				simple: combatant.flags.sr5?.actions?.simple,
				complex: combatant.flags.sr5?.actions?.complex,
			}
		}
	}

	activateListeners(html) {
		super.activateListeners(html);	
		if (!game.user.isGM) this._contextMenu(html);

		//Edit actions
		html.find('.SR-action-control').click(ev => this._editActions(ev));

	}

	_contextMenu(html) {
		if (game.user.isGM) ContextMenu.create(this, html, ".directory-item", this._getEntryContextOptions());
		else ContextMenu.create(this, html, ".directory-item", []);
	}

	_editActions(ev){
		let target = $(ev.currentTarget).attr("data-control");
		let combatantId = ev.currentTarget.closest(".combatant").dataset.combatantId;
		let combatant = game.combat.combatants.find(c => c.id === combatantId);
		let actor = SR5Combat.getActorFromCombatant(combatant);
		let value = combatant.flags.sr5.actions[target];

		switch (ev.button) {
			case 0:
				if (ev.shiftKey) value ++;
				else value--;
				break;
		}

		let actions = [{type: target, value: combatant.flags.sr5.actions[target] - value}];
		if (actor.isToken) SR5Combat.changeActionInCombat(actor.token.id, actions);
		else SR5Combat.changeActionInCombat(actor.id, actions);
	}


}