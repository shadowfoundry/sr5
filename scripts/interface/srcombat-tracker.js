import { SR5Combat } from "../system/srcombat.js";

//Custom Combat Tracker
export class SR5CombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
	get template() {
		return "systems/sr5/templates/interface/srcombat-tracker.html";
	}

	async getData(options) {
		let data = await super.getData(options);
		await SR5CombatTracker.manageActions(data.combat, data.turns);
		return data;
	}

	// Helper to get combatant ID from a list element (supports both jQuery and native DOM)
	static _getCombatantId(li) {
		if (li instanceof HTMLElement) return li.dataset.combatantId;
		return li.data("combatant-id") ?? li[0]?.dataset?.combatantId;
	}

	//Add right click options to the combat tracker
	static addCombatTrackerContextOptions(html, options) {
		options.push(
			{
				name: game.i18n.localize('SR5.INIT_SeizeTheInitiative'),
				icon: '<i class="fas fa-sort-numeric-up"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant?.actor.system.specialAttributes?.edge?.augmented?.value && combatant.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant) await SR5Combat.seizeInitiative(combatant);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_Blitz'),
				icon: '<i class="fas fa-bolt"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant?.actor.system.specialAttributes?.edge?.augmented?.value && combatant.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant) await SR5Combat.blitz(combatant);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusOne'),
				icon: '<i class="fas fa-caret-down"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant?.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant) await SR5Combat.adjustInitiative(combatant, -1);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusFive'),
				icon: '<i class="fas fa-angle-down"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant?.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant) await SR5Combat.adjustInitiative(combatant, -5);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusTen'),
				icon: '<i class="fas fa-angle-double-down"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant?.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant) await SR5Combat.adjustInitiative(combatant, -10);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_Delaying'),
				icon: '<i class="fas fa-hourglass-end"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
					if (combatant?.actor.permission > 0) return true;
					else return false;
				},
				callback: async (li) => {
					const combatant = game.combat.combatants.get(SR5CombatTracker._getCombatantId(li));
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
		// v13: html may be a raw DOM element or jQuery object
		const element = html instanceof HTMLElement ? html : html[0];
		for (let combatant of data.combat.combatants){
			if (combatant.flags.sr5?.hasPlayed || (combatant.initiative <= 0)){
				let li = element.querySelector("[data-combatant-id='" + combatant.id +"']");
				if (!li) continue;
				let name = li.querySelector("h4");
				if (name) name.classList.add("hasPlayed");
				let initScor = li.querySelector(".initiative");
				if (initScor) initScor.classList.add("hasPlayed");
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
		const element = html instanceof HTMLElement ? html : html[0];
		element.querySelectorAll('.SR-action-control').forEach(el => {
			el.addEventListener('click', ev => this._editActions(ev));
		});

	}

	_contextMenu(html) {
		if (game.user.isGM) ContextMenu.create(this, html, ".directory-item", this._getEntryContextOptions());
		else ContextMenu.create(this, html, ".directory-item", []);
	}

	_editActions(ev){
		let target = ev.currentTarget.dataset.control;
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

		let actions = [{type: target, value: combatant.flags.sr5.actions[target] - value, source: "manual"}];
		if (actor.isToken) SR5Combat.changeActionInCombat(actor.token.id, actions);
		else SR5Combat.changeActionInCombat(actor.id, actions);
	}


}