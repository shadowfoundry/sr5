import { SR5Combat } from "../system/srcombat.js";

//Custom Combat Tracker
export class SR5CombatTracker extends CombatTracker {
	get template() {
		return "systems/sr5/templates/interface/srcombat-tracker.html";
	}

	//Add right click options to the combat tracker
	static addCombatTrackerContextOptions(html, options) {
		options.push(
			{
				name: game.i18n.localize('SR5.INIT_SeizeTheInitiative'),
				icon: '<i class="fas fa-sort-numeric-up"></i>',
				condition: (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant.actor.data.data.specialAttributes?.edge?.augmented?.value) return true;
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
					if (combatant.actor.data.data.specialAttributes?.edge?.augmented?.value) return true;
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
				callback: async (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant) await SR5Combat.adjustInitiative(combatant, -1);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusFive'),
				icon: '<i class="fas fa-angle-down"></i>',
				callback: async (li) => {
					const combatant = game.combat.combatants.get(li.data("combatant-id"));
					if (combatant) await SR5Combat.adjustInitiative(combatant, -5);
				},
			},
			{
				name: game.i18n.localize('SR5.INIT_MinusTen'),
				icon: '<i class="fas fa-angle-double-down"></i>',
				callback: async (li) => {
					const combatant =  game.combat.combatants.get(li.data("combatant-id"));
					if (combatant) await SR5Combat.adjustInitiative(combatant, -10);
				},
			}
		);
		return options;
	}


	static async renderCombatTracker(app, html, data) {
		if (game.combat) await SR5CombatTracker.markCombatantAsPlayed(app, html, data)
	}

	static async markCombatantAsPlayed(app, html, data){
		for (let combatant of data.combat.combatants){
			if (combatant.data.flags.sr5?.hasPlayed || (combatant.data.initiative <= 0)){
				let li = html.find("[data-combatant-id='" + combatant.id +"']")
				let name = li.find("h4");
				name.addClass("hasPlayed");
				let initScor = li.find(".initiative");
				initScor.addClass("hasPlayed");
			}
		}
	}

}