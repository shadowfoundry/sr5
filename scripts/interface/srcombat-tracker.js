import { SR5Combat } from "../system/srcombat.js";

//Custom Combat Tracker
export class SR5CombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {

	static PARTS = {
		header: { template: "systems/sr5/templates/interface/combat/header.html" },
		tracker: { template: "systems/sr5/templates/interface/combat/tracker.html", scrollable: [""] },
		footer: { template: "systems/sr5/templates/interface/combat/footer.html" }
	};

	/** @override */
	async _prepareTurnContext(combat, combatant, index) {
		const turn = await super._prepareTurnContext(combat, combatant, index);
		turn.actions = {
			free: combatant.flags.sr5?.actions?.free,
			simple: combatant.flags.sr5?.actions?.simple,
			complex: combatant.flags.sr5?.actions?.complex,
		};
		return turn;
	}

	/** @override */
	async _prepareCombatContext(context, options) {
		await super._prepareCombatContext(context, options);
	}

	/** @override */
	_getEntryContextOptions() {
		const options = super._getEntryContextOptions();
		const getCombatant = li => this.viewed?.combatants.get(li.dataset.combatantId);
		options.push(
			{
				name: game.i18n.localize('SR5.INIT_SeizeTheInitiative'),
				icon: '<i class="fas fa-sort-numeric-up"></i>',
				condition: (li) => {
					const combatant = getCombatant(li);
					return combatant?.actor.system.specialAttributes?.edge?.augmented?.value && combatant.actor.permission > 0;
				},
				callback: async (li) => {
					const combatant = getCombatant(li);
					if (combatant) await SR5Combat.seizeInitiative(combatant);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_Blitz'),
				icon: '<i class="fas fa-bolt"></i>',
				condition: (li) => {
					const combatant = getCombatant(li);
					return combatant?.actor.system.specialAttributes?.edge?.augmented?.value && combatant.actor.permission > 0;
				},
				callback: async (li) => {
					const combatant = getCombatant(li);
					if (combatant) await SR5Combat.blitz(combatant);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusOne'),
				icon: '<i class="fas fa-caret-down"></i>',
				condition: (li) => getCombatant(li)?.actor.permission > 0,
				callback: async (li) => {
					const combatant = getCombatant(li);
					if (combatant) await SR5Combat.adjustInitiative(combatant, -1);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusFive'),
				icon: '<i class="fas fa-angle-down"></i>',
				condition: (li) => getCombatant(li)?.actor.permission > 0,
				callback: async (li) => {
					const combatant = getCombatant(li);
					if (combatant) await SR5Combat.adjustInitiative(combatant, -5);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusTen'),
				icon: '<i class="fas fa-angle-double-down"></i>',
				condition: (li) => getCombatant(li)?.actor.permission > 0,
				callback: async (li) => {
					const combatant = getCombatant(li);
					if (combatant) await SR5Combat.adjustInitiative(combatant, -10);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_Delaying'),
				icon: '<i class="fas fa-hourglass-end"></i>',
				condition: (li) => getCombatant(li)?.actor.permission > 0,
				callback: async (li) => {
					const combatant = getCombatant(li);
					if (combatant) await SR5Combat.delayAction(combatant);
				},
			}
		);
		return options;
	}

	/** @override */
	async _onRender(context, options) {
		await super._onRender(context, options);

		// Mark combatants that have played
		if (this.viewed) {
			for (const combatant of this.viewed.combatants) {
				if (combatant.flags.sr5?.hasPlayed || (combatant.initiative <= 0)) {
					const li = this.element.querySelector(`[data-combatant-id='${combatant.id}']`);
					if (!li) continue;
					const name = li.querySelector("h4");
					if (name) name.classList.add("hasPlayed");
					const initScore = li.querySelector(".initiative");
					if (initScore) initScore.classList.add("hasPlayed");
				}
			}
		}

		// Edit actions
		this.element.querySelectorAll('.SR-action-control').forEach(el => {
			el.addEventListener('click', ev => this._editActions(ev));
		});
	}

	_editActions(ev) {
		let target = ev.currentTarget.dataset.control;
		let combatantId = ev.currentTarget.closest(".combatant").dataset.combatantId;
		let combatant = game.combat.combatants.get(combatantId);
		let actor = SR5Combat.getActorFromCombatant(combatant);
		let value = combatant.flags.sr5.actions[target];

		switch (ev.button) {
			case 0:
				if (ev.shiftKey) value++;
				else value--;
				break;
		}

		let actions = [{ type: target, value: combatant.flags.sr5.actions[target] - value, source: "manual" }];
		if (actor.isToken) SR5Combat.changeActionInCombat(actor.token.id, actions);
		else SR5Combat.changeActionInCombat(actor.id, actions);
	}
}
