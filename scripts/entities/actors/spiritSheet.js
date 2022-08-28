import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for spirit type actors in the Shadowrun 5 system.
 */
export class SR5SpiritSheet extends ActorSheetSR5 {
	constructor(...args) {
		super(...args);

		this._shownUntrainedSkills = false;
		this._filters = {
			skills: "",
		};
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			template: "systems/sr5/templates/actors/spirit-sheet.html",
			width: 800,
			height: 618,
			resizable: false,
			classes: ["sr5", "sheet", "actor", "spirit"],
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

		return context;
	}

	_prepareSkills(actor) {
		const activeSkills = {};
		for (let [key, skill] of Object.entries(actor.system.skills)) {
			if (skill.rating.value > 0 || this._shownUntrainedSkills) activeSkills[key] = skill;
		}
		actor.system.skills = activeSkills;
	}

	_prepareItems(actor) {
		const weapons = [];
		const spells = [];
		const powers = [];
		const externalEffects = [];
		const traditions = [];

		// Iterate through items, allocating to containers
		for (let i of actor.items) {
			if (i.type === "itemSpell") spells.push(i);
			else if (i.type === "itemWeapon") weapons.push(i);
			else if (i.type === "itemPower") powers.push(i);
			else if (i.type === "itemEffect") externalEffects.push(i);
			else if (i.type === "itemTradition") traditions.push(i);
		}

		actor.weapons = weapons;
		actor.spells = spells;
		actor.powers = powers;
		actor.externalEffects = externalEffects;
		actor.traditions = traditions;
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

	/** @override */
	async _onDropItemCreate(itemData) {
		switch(itemData.type){
			case "itemTradition":
				for (let i of this.actor.items){
					if (i.data.type === "itemTradition") return ui.notifications.warn(game.i18n.localize('SR5.WARN_OnlyOneTradition'));
				}
				return super._onDropItemCreate(itemData);
			case "itemWeapon":
				for (let i of this.actor.items){
					if (i.data.type === "itemWeapon" && i.data.data.isActive && (i.data.data.category === itemData.data.category)) return super._onDropItemCreate(itemData);
				}
				itemData.data.isActive = true;
				return super._onDropItemCreate(itemData);
			case "itemPower":
				if (itemData.data.actionType === "permanent") itemData.data.isActive = true;
				return super._onDropItemCreate(itemData);
			case "itemTradition":
			case "itemSpell":
			case "itemEffect":
				return super._onDropItemCreate(itemData);
			default:
				ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
				return;
		}        
	}

}
