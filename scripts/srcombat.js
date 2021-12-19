import { SR5_CharacterUtility } from "./entities/actors/utility.js";
import { SR5_EntityHelpers } from "./entities/helpers.js";
import { SR5_SocketHandler } from "./socket.js";

export class SR5Combat extends Combat {
	get initiativePass(){
		return this.getFlag("sr5", "combatInitiativePass") || 1;
	}

	static async setInitiativePass(combat, pass){
		await combat.unsetFlag("sr5", "combatInitiativePass");
		await combat.setFlag("sr5", "combatInitiativePass", pass);
	}

	/**
	* @param combatant
	* @param adjustment
	**/
	static async adjustInitiative(combatant, adjustment){
		combatant = typeof combatant === 'string' ? this.combatants.find((c) => c._id === combatant) : combatant;
		if (!combatant || typeof combatant === 'string') {
			console.error('Could not find combatant with id ', combatant);
			return;
		}

		let key = SR5_CharacterUtility.findActiveInitiative(combatant.actor.data);
		let udpateData ={
			initiative: Number(combatant.initiative) + adjustment,
			"flags.sr5.currentInitRating" : combatant.actor.data.data.initiatives[key].value,
      		"flags.sr5.currentInitDice" : combatant.actor.data.data.initiatives[key].dice.value,
		}		
		if (!combatant.data.flags.sr5.hasPlayed && (combatant.id !== combatant.combat.current.combatantId) ) { 
			let actualCombatant = combatant.combat.combatants.find(c => c.id === combatant.combat.current.combatantId);
			if (actualCombatant.initiative > (combatant.initiative + adjustment)) {
				udpateData = mergeObject(udpateData, {
					"flags.sr5.baseCombatantInitiative": Number(combatant.initiative) + adjustment,
				});
			}
		}
		await combatant.update(udpateData);
	}

	static async seizeInitiative(combatant){
		let actor = SR5Combat.getActorFromCombatant(combatant)
		if (!actor) return;
		let actorData = deepClone (actor.data);
		actorData = actorData.toObject(false);
		if (actorData.data.conditionMonitors.edge?.current < actorData.data.conditionMonitors.edge?.value){
			await combatant.setFlag("sr5", "seizeInitiative", true);
			actorData.data.conditionMonitors.edge.current += 1;
			await actor.update(actorData);
			ui.notifications.info(`${actorData.name} ${game.i18n.localize("SR5.INFO_ActorSeizeInitiative")}`);
		} else {
			ui.notifications.info(`${actorData.name} ${game.i18n.localize("SR5.INFO_ActorSeizeInitiativeFailed")}`);
		}
	}

	static async blitz(combatant){
		let actor = SR5Combat.getActorFromCombatant(combatant)
		if (!actor) return;
		let actorData = deepClone (actor.data);
		actorData = actorData.toObject(false);
		if (actorData.data.conditionMonitors.edge?.current < actorData.data.conditionMonitors.edge?.value){
			await combatant.update({
				initiative: null,
				"flags.sr5.blitz": true,
			});
			actorData.data.conditionMonitors.edge.current += 1;
			await actor.update(actorData);
			ui.notifications.info(`${actorData.name} ${game.i18n.localize("SR5.INFO_ActorUseBlitz")}`);
		} else {
			ui.notifications.info(`${actorData.name} ${game.i18n.localize("SR5.INFO_ActorUseBlitzFailed")}`);
		}
	}

	static async handleIniPass(combatId) {
		const combat = game.combats?.get(combatId);
		if (!combat) return;

		const initiativePass = combat.initiativePass + 1;
		const turn = 0;

		for (const combatant of combat.combatants) {
			const initiative = SR5Combat.reduceIniResultAfterPass(Number(combatant.initiative));
			await combatant.update({
				initiative: initiative, 
				"flags.sr5.hasPlayed": false,
				"flags.sr5.baseCombatantInitiative": initiative,
			});
		}

		await SR5Combat.setInitiativePass(combat, initiativePass);
		await combat.update({turn});
		return;
	}

	static async handleNextRound(combatId){
		//console.log("nouveau round");
		const combat = game.combats?.get(combatId);
		if (!combat) return;
		await combat.resetAll();
		for (let combatant of combat.combatants){
			combatant.update({
				"flags.sr5.seizeInitiative" : false,
				"flags.sr5.blitz" : false,
				"flags.sr5.hasPlayed" : false,
			  });
		}
		await SR5Combat.setInitiativePass(combat, 1);
		await combat.rollAll();

		const turn = 0;
		await combat.update({turn});
	}

	setupTurns(){
		// Determine the turn order and the current turn
		const turns = this.combatants.contents.sort(SR5Combat.sortByRERIC);
		this.data.turn = Math.clamped(this.data.turn, 0, turns.length-1);

		// Update state tracking
		let c = turns[this.data.turn];
		 
		this.current = {
			round: this.data.round,
			turn: this.data.turn,
			combatantId: c ? c.id : null,
			tokenId: c ? c.data.tokenId : null
		};
		return this.turns = turns;
	}

	static sortByRERIC(left, right) {
		// Check if a combatant Seize the initiative
		const leftSeizeInit = left.data.flags.sr5?.seizeInitiative;
		const rightSeizeInit = right.data.flags.sr5?.seizeInitiative;
		if (leftSeizeInit === true && rightSeizeInit === false) return -1;
		if (rightSeizeInit === true && leftSeizeInit === false) return 1;
		// First sort by initiative value if different
		const leftInit = Number(left.data.flags.sr5?.baseCombatantInitiative);
		const rightInit = Number(right.data.flags.sr5?.baseCombatantInitiative);
		if (isNaN(leftInit)) return 1;
		if (isNaN(rightInit)) return -1;
		if (leftInit > rightInit) return -1;
		if (leftInit < rightInit) return 1;

		// now we sort by ERIC
		const genData = (actor) => {
			if (!actor) return [0, 0, 0, 0];
			// edge, reaction, intuition, coinflip
			return [
				actor.data.data.specialAttributes?.edge?.augmented.value,
				actor.data.data.attributes?.reaction?.augmented.value,
				actor.data.data.attributes?.intuition?.augmented.value,
				new Roll("1d2").roll({async:true}).total,
			];
		};

		const leftData = genData(left.actor);
		const rightData = genData(right.actor);
		// if we find a difference that isn't 0, return it
		for (let index = 0; index < leftData.length; index++) {
			const diff = rightData[index] - leftData[index];
			if (diff !== 0) return diff;
		}

		return 0;
	}

	/**
	* Return the position in the current ini pass of the next undefeated combatant.
	*/
	get nextUndefeatedTurnPosition(){
		for (let [turnInPass, combatant] of this.turns.entries()) {
			if (turnInPass <= this.turn) continue;
			if (!combatant.data.defeated && combatant.initiative > 0 && !combatant.data.flags.sr5.hasPlayed) {
				return turnInPass;
			}
		}
		return this.turns.length;
	}

	/**
	* Return the position in the current ini pass of the next combatant that has an action phase left.
	*/
	get nextViableTurnPosition(){
		for (let [turnInPass, combatant] of this.turns.entries()) {
			if (turnInPass <= this.turn) continue;
			if (combatant.initiative > 0 && !combatant.data.flags.sr5.hasPlayed) {
				return turnInPass;
			}
		}
		return this.turns.length;
	}

	/**
	* Determine wheter the current combat situation (current turn order) needs and can have an initiative pass applied.
	* @return true means that an initiative pass must be applied
	*/
	doIniPass(nextTurn){
		if (nextTurn < this.turns.length) return false;
		const currentScores = this.combatants.map(combatant => Number(combatant.initiative));

		return SR5Combat.iniOrderCanDoAnotherPass(currentScores);
	}

	async nextTurn(){
		for (let combatant of this.combatants){
			if (combatant.id === this.current.combatantId){
				let actor = SR5Combat.getActorFromCombatant(combatant);
				await actor.setFlag("sr5", "cumulativeDefense", 0);
			}
		}
		// Maybe advance to the next round/init pass
		let nextRound = this.round;
		let initiativePass = this.initiativePass;
		// Get the next viable turn position.
		let nextTurn = this.settings.skipDefeated ? this.nextUndefeatedTurnPosition : this.nextViableTurnPosition;

		// Start of the combat Handling
		if (nextRound === 0 && initiativePass === 0) {
			await this.startCombat();
			return;
		}

		// Just step from one combatant to the next!
		if (nextTurn < this.turns.length) {
			for (let combatant of this.combatants){
				if (combatant.id === this.current.combatantId) await combatant.setFlag("sr5", "hasPlayed", true)
			}
			await this.update({turn: nextTurn});
			return;
		}

		// Initiative Pass Handling. Owner permissions are needed to change the initiative pass.
		if (!game.user?.isGM && this.doIniPass(nextTurn)) {
			await this._createDoIniPassSocketMessage();
			return;
		}

		if (game.user?.isGM && this.doIniPass(nextTurn)) {
			await SR5Combat.handleIniPass(this.id)
			return;
		}

		return this.nextRound();
	}

	async startCombat() {
		await SR5Combat.setInitiativePass(this, 1);
		await this.update({
			round: 1, 
			turn: 0,
		});
		await this.rollAll();

		return this;
	}

	async nextRound(){
		// Let Foundry handle time and some other things.
		await super.nextRound();
		for (let combatant of this.combatants){
			await combatant.setFlag("sr5", "hasPlayed", false)
		}

		// Owner permissions are needed to change the shadowrun initiative round.
		if (!game.user?.isGM) {
				await this._createDoNextRoundSocketMessage();
		} else {
				await SR5Combat.handleNextRound(this.id);
		}
	}

	/**
	* use default behaviour but ALWAYS start at the top!
	*/
	async rollAll(){
		const combat = await super.rollAll();
		if (combat.turn !== 0) await combat.update({turn: 0});
		return combat;
	}

	async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
		// Structure input data
		ids = typeof ids === "string" ? [ids] : ids;
		const currentId = this.combatant.id;

		// Iterate over Combatants, performing an initiative roll for each
		const updates = [];
		const messages = [];
		for ( let [i, id] of ids.entries() ) {
			// Get Combatant data (non-strictly)
			const combatant = this.combatants.get(id);
			if ( !combatant?.isOwner ) return results;

			// Produce an initiative roll for the Combatant
			const roll = combatant.getInitiativeRoll(formula);
			let initiative = roll.total;
			if (this.data.flags.sr5?.combatInitiativePass > 1){
				let currentPass = this.data.flags.sr5?.combatInitiativePass - 1;
				initiative -= (currentPass * 10);
				if (initiative < 0) initiative = 0;
			}
			updates.push({_id: id, initiative: initiative, "flags.sr5.baseCombatantInitiative": initiative});

			// Construct chat message data
			let title;
			switch (SR5_CharacterUtility.findActiveInitiative(combatant.actor.data)) {
				case "physicalInit":
					title = game.i18n.localize('SR5.InitiativePhysical');
					break;
				case "astralInit":
					title = game.i18n.localize('SR5.InitiativeAstral');
					break;
				case "matrixInit":
					title = game.i18n.localize('SR5.InitiativeMatrix');
					break;
			}
			var templateData = {
				actor: combatant.actor,
				title: title,
				roll: roll,
			};
			const template = `systems/sr5/templates/rolls/roll-init.html`;
			const html = await renderTemplate(template, templateData);
			const messageData = mergeObject(
				{
					speaker: {
						scene: this.scene.id,
						actor: combatant.actor?.id,
						token: combatant.token?.id,
						alias: combatant.name
					},
					content: html,
					flags: {
						"core.initiativeRoll": true,
						"img": combatant.img,
						css: "SRCustomMessage",
					}, 
				},
				messageOptions
			);
			
			let chatData = new ChatMessage(messageData, {create: false})
			// Play 1 sound for the whole rolled set
			if ( i > 0 ) chatData.sound = null;
			messages.push(chatData.toObject());
		}
		
		if ( !updates.length ) return this;

		// Update multiple combatants
		await this.updateEmbeddedDocuments("Combatant", updates);

		// Ensure the turn order remains with the same combatant
		if ( updateTurn ) {
			await this.update({turn: this.turns.findIndex(t => t.id === currentId)});
		}

		if (this.initiativePass === 1) await this.update({turn: 0});

		// Create multiple chat messages
		await ChatMessage.create(messages);

		return this;
	}

	static iniOrderCanDoAnotherPass(scores){
		for (const score of scores) {
			if (SR5Combat.iniScoreCanDoAnotherPass(score)) return true;
		}
		return false;
	}
	/**
	* Check if there is another initiative pass possible with the given score.
	* @param score
	* @return true means another initiative pass is possible
	*/
	static iniScoreCanDoAnotherPass(score){
		return SR5Combat.reduceIniResultAfterPass(score) > 0;
	}
	/**
	* Reduce the given initiative score according to @PDF SR5#159
	* @param score This given score can't be reduced under zero.
	*/
	static reduceIniResultAfterPass(score){
		return Math.max(score -10, 0);
	}

	static async _handleDoNextRoundSocketMessage(message) {
		if (!message.data.hasOwnProperty('id') && typeof message.data.id !== 'string') {
				console.error(`SR5Combat Socket Message 'DoNextRound' data.id must be a string (combat id) but is ${typeof message.data} (${message.data})!`);
				return;
		}

		return await SR5Combat.handleNextRound(message.data.id);
	}

	static async _handleDoInitPassSocketMessage(message) {
		if (!message.data.hasOwnProperty('id') && typeof message.data.id !== 'string') {
				console.error(`SR5Combat Socket Message 'DoInitPass' data.id must be a string (combat id) but is ${typeof message.data} (${message.data})!`);
				return;
		}

		return await SR5Combat.handleIniPass(message.data.id);
	}

	async _createDoNextRoundSocketMessage() {
		await SR5_SocketHandler.emitForGM("doNextRound", {id: this.id});
	}

	async _createDoIniPassSocketMessage() {
		await SR5_SocketHandler.emitForGM("doInitPass", {id: this.id});
	}

	static getActorFromCombatant(combatant){
		if (!combatant.actor.isToken) return SR5_EntityHelpers.getRealActorFromID(combatant.data.actorId)
		else return SR5_EntityHelpers.getRealActorFromID(combatant.data.tokenId)
	}

	static getCombatantFromActor(document){
		if (!game.combat) return;
		let combatant;
      	if (document.isToken) combatant = game.combat.data.combatants.find(c => c.data.tokenId === document.token.id);
      	else combatant = game.combat.data.combatants.find(c => c.data.actorId === document.id);
		return combatant;
	}

	static async changeInitInCombat(document, initChange){
		if (game.combat){
			let combatant = SR5Combat.getCombatantFromActor(document),
				sign;
			if (!combatant) return;
			if (combatant.initiative <= 0) return;
			else {
			  	let initKey = SR5_CharacterUtility.findActiveInitiative(document.data),
			  		initRatingChange = (initChange ||0), initDiceChange = 0, diceResult = 0,diceToRoll = 0;
			  	if (document.data.data.initiatives[initKey].value !== combatant.data.flags.sr5.currentInitRating) initRatingChange += document.data.data.initiatives[initKey].value - combatant.data.flags.sr5.currentInitRating;
			  	if (document.data.data.initiatives[initKey].dice.value !== combatant.data.flags.sr5.currentInitDice) {
					sign = Math.sign(document.data.data.initiatives[initKey].dice.value - combatant.data.flags.sr5.currentInitDice);
					diceToRoll = Math.abs(document.data.data.initiatives[initKey].dice.value - combatant.data.flags.sr5.currentInitDice);
					if (isNaN(diceToRoll)) diceToRoll = 0;
					diceResult = new Roll(`${diceToRoll}d6`).evaluate({async: false}).total;
					if (sign > 0) initDiceChange += diceResult;
					else initDiceChange -= diceResult;
			  	}
				if (isNaN(initRatingChange)) initRatingChange = 0;
			  	let initFinalChange = initRatingChange + initDiceChange;
			  
			  	if (initRatingChange !== 0  || initDiceChange !== 0) {
				  	await SR5Combat.adjustInitiative(combatant, initFinalChange);
				  	let signDice ="", signRating="", initRatingValue = Math.abs(initRatingChange), initDiceValue = Math.abs(diceResult); 
				  	if (sign < 0) signDice = "-"
				  	else signDice = "+"
				  	if (initRatingChange > 0) signRating = "+"
				  	else signRating = "-"
				  	if (diceToRoll > 0) {
				  		ui.notifications.info(`${combatant.name}: ${game.i18n.format("SR5.INFO_ChangeInitInCombat", {signRating: signRating, signDice: signDice, diceToRoll: diceToRoll, initDiceChange: initDiceValue, initRatingChange: initRatingValue, initFinalChange: initFinalChange})}`);
					} else {
						ui.notifications.info(`${combatant.name}: ${game.i18n.format("SR5.INFO_ChangeInitInCombatNoDices", {initFinalChange: initFinalChange})}`);
					}
				}
			}
		}
	}

}


//Custom Initiative formula
export const _getInitiativeFormula = function() {
	const actor = this.actor;
	if ( !actor ) return "1d6";

	let key = SR5_CharacterUtility.findActiveInitiative(actor.data);
	let initiative = actor.data.data.initiatives[key].value
	let initiativeDice = actor.data.data.initiatives[key].dice.value + "d6";
	if (this.data.flags.sr5?.blitz) initiativeDice = "5d6";

	const parts = [initiative, initiativeDice];
	return parts.filter((p) => p !== null).join(" + ");
}