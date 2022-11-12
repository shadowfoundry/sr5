import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_RollMessage } from "./roll-message.js";
import { SR5_RollTestHelper } from "./roll-test-helper.js";
import * as SR5_AddRollInfo from "./roll-test-case/index.js";
import { SR5Combat } from "../system/srcombat.js";
import SR5_RollDialog from "./roll-dialog.js";

export class SR5_RollTest {
	/** Prepare the roll window
	 * @param {Object} dialogData - Informations for the dialog window
	 */
	 static async generateRollDialog(dialogData, edge = false, cancel = true) {
		let actor = SR5_EntityHelpers.getRealActorFromID(dialogData.owner.actorId),
			actorData = actor.system,
			template = "systems/sr5/templates/rolls/roll-dialog.html";

		//Handle Edge
		dialogData.edge.canUseEdge = await SR5_RollTestHelper.canUseEdge(actor, dialogData);
		let edgeActor = await this.determineEdgeActor(actor);

		let buttons = {
			roll: {
				label: game.i18n.localize("SR5.RollDice"),
				class: ['test', 'truc'],
				icon: '<i class="fas fa-dice-six"></i>',
				callback: () => (cancel = false),
			},
		}
		if (dialogData.edge.canUseEdge){
			buttons = mergeObject(buttons, {
				edge: {
					label: game.i18n.localize("SR5.PushTheLimit"),
					icon: '<i class="fas fa-bomb"></i>',
					callback: () => {
						edge = true;
						cancel = false;
					},
				},
			});
		}

		return new Promise((resolve) => {
			renderTemplate(template, dialogData).then((dlg) => {
				new SR5_RollDialog({
					title: dialogData.test.title,
					id: "jet",
					content: dlg,
					data: dialogData,
					buttons: buttons,
					default: "roll",
					close: async (html) => {
						//If roll is cancelled
						if (cancel) return SR5_RollTestHelper.handleCanceledTest(actor, dialogData);
						//If roll "push the limits"
						if (edge && edgeActor) dialogData = await SR5_RollTestHelper.handleEdgeUse(edgeActor, dialogData);

						//Verify if reagents are used, if so, remove from actor
						let reagentsSpent = parseInt(html.find('[name="reagentsSpent"]').val());
						if (!isNaN(reagentsSpent)) {
							actor.update({ "system.magic.reagents": actorData.magic.reagents - reagentsSpent});
							dialogData.reagentsSpent = reagentsSpent;
						}

						// Apply modifiers from dialog window
						if (dialogData.test.isExtended){
							let extendedMultiplier = parseInt(html.find('[name="extendedMultiplier"]').val());
							if (isNaN(extendedMultiplier)) extendedMultiplier = 1;
							dialogData.extendedRoll = 1;
							dialogData.extendedMultiplier = extendedMultiplier;
							dialogData.extendedInterval = html.find('[name="extendedTime"]').val();
							dialogData.test.title = dialogData.test.title.replace("Test", game.i18n.localize("SR5.ExtendedTest"));
						}
						if ((dialogData.test.type === "spell" || dialogData.test.typeSub === "summoning" || dialogData.test.type === "preparationFormula") && isNaN(dialogData.magic.force)) {
							ui.notifications.warn(game.i18n.localize("SR5.WARN_NoForce"));
							dialogData.force = actorData.specialAttributes.magic.augmented.value;
						}
						if ((dialogData.test.type === "complexForm" || dialogData.test.typeSub === "compileSprite") && isNaN(dialogData.matrix.level)) {
							ui.notifications.warn(game.i18n.localize("SR5.WARN_NoLevel"));
							dialogData.level = actorData.specialAttributes.resonance.augmented.value;
						}
						if (dialogData.force || dialogData.dialogSwitch.reagents){
							if (dialogData.magic.force > 0) dialogData.limit.value = dialogData.magic.force;	
							if (!isNaN(reagentsSpent) && dialogData.test.type !== "ritual") {
								dialogData.limit.value = reagentsSpent;
								dialogData.limit.type = "reagents";
							}
						}
						if (dialogData.matrix.level) dialogData.limit.value = dialogData.matrix.level;
						
						//Add limit modifiers
						dialogData = await SR5_RollTestHelper.handleLimitModifiers(dialogData);
						
						//Add dice pool modifiers
						dialogData = await SR5_RollTestHelper.handleDicePoolModifiers(dialogData);
						

						if (dialogData.combat.ammoFired){
							let actualRecoil = actor.getFlag("sr5", "cumulativeRecoil") || 0;
							actualRecoil += dialogData.ammoFired;
							actor.setFlag("sr5", "cumulativeRecoil", actualRecoil);
						}

						// Roll dices
						if (edge) {
							// push the limits
							dialogData.roll = await SR5_RollTest.srd6({
								dicePool: dialogData.dicePool.value,
								explose: edge,
							});
							dialogData.edge.hasUsedPushTheLimit = true;
						} else {
							dialogData.roll = await SR5_RollTest.srd6({
								dicePool: dialogData.dicePool.value,
								limit: dialogData.limit.value,
							});
						}

						//Add info to chatCard
						await SR5_RollTest.srDicesAddInfoToCard(dialogData, dialogData.owner.actorId);

						// Return roll result and card info to chat message.
						await SR5_RollTest.renderRollCard(dialogData);

						//Update items according to roll
						if (dialogData.owner.itemUuid) SR5_DiceHelper.srDicesUpdateItem(dialogData);

						//Update spirit if spirit aid is used
						if (dialogData.dicePool.modifiers.spiritAid?.value > 0){
							let spiritItem = await fromUuid(dialogData.magic.spiritAid.id);
							let spiritItemData = duplicate(spiritItem.system);
        					spiritItemData.services.value -= 1;
        					await spiritItem.update({'data': spiritItemData});
							ui.notifications.info(`${spiritItem.name}: ${game.i18n.format('SR5.INFO_ServicesReduced', {service: 1})}`);
							let spiritActor = game.actors.find(a => a.system.creatorItemId === spiritItem.id);
							if (spiritActor){
        						let spiritActorData = duplicate(spiritActor.system);
								spiritActorData.services.value -= 1;
								await spiritActor.update({'data': spiritActorData});
							}
						}

						//Update combatant if Active defense or full defense is used.
						if (dialogData.dicePool.modifiers.defenseFull || (dialogData.combat.activeDefenseSelected !== "none")){
							let initModifier = 0;
							if (dialogData.dicePool.modifiers.defenseFull){
								let fullDefenseEffect = actor.effects.find(e => e.origin === "fullDefense");
								let isInFullDefense = (fullDefenseEffect) ? true : false;
								if (!isInFullDefense){
									initModifier += -10;
									SR5_DiceHelper.applyFullDefenseEffect(actor);
								}
							}
							if (dialogData.combat.activeDefenseSelected !== "") initModifier += SR5_DiceHelper.convertActiveDefenseToInitModifier(dialogData.combat.activeDefenseSelected);
							if (initModifier < 0) SR5Combat.changeInitInCombat(actor, initModifier);
						}
					},
				}).render(true);
			});
		});
	}

	/** Roll a shadowrun 5 test
	 * @param {Number} dicePool - Number of dice to roll
	 * @param {Number} limit - Limit maximum success
	 * @param {Boolean} explose - Handle explosing 6 result
	 */
	static async srd6({ dicePool, limit, explose, edgeRoll }) {
		let formula = `${dicePool}d6`;
		if (explose) formula += "x6";
		if (limit) formula += `kh${limit}`;
		formula += "cs>=5";

		let roll = new Roll(formula);
		let rollMode = game.settings.get("core", "rollMode");
		let rollRoll = await roll.evaluate({async: true});
		let rollJSON = await roll.toJSON(rollRoll);
		//Glitch
		let totalGlitch = 0,
			glitchRoll = false,
			criticalGlitchRoll = false,
			realHits = 0;
		for (let d of rollJSON.terms[0].results) {
			if (d.result === 1) {
				d.glitch = true;
				totalGlitch ++;
			}
			if (edgeRoll) d.edge = true;
			if (d.result >= 5) realHits ++;
		}

		if (totalGlitch > dicePool/2){
			glitchRoll = true;
			if (rollJSON.terms[0].total < 1) {
				glitchRoll = false;
				criticalGlitchRoll = true;
			}
		}

		let rollResult = {
			dicePool: dicePool,
			hits: rollRoll.total,
			realHits: realHits,
			glitchRoll: glitchRoll,
			criticalGlitchRoll: criticalGlitchRoll,
			dices: rollJSON.terms[0].results,
			limit: limit,
			rollMode: rollMode,
			r: rollJSON,
			originalRoll: roll
		};

		return rollResult;
	}

	//Handle extended roll
	static async extendedRoll(message, actor){
		let messageData = message.flags.sr5data;
		let dicePool = messageData.test.dicePool - 1;
		let newRoll = await SR5_RollTest.srd6({ dicePool: dicePool, limit: messageData.test.limit });
		let dices = messageData.test.dices;
		let dicesKeeped = dices.filter(function (d) {
			return d.result > 4;
		});
		let dicesTotal = newRoll.dices.concat(dicesKeeped);

		let newMessage = duplicate(messageData);
		newMessage.roll.hits = messageData.roll.hits + newRoll.hits;
		newMessage.test.dices = dicesTotal;
		newMessage.dicePool = dicePool;
		newMessage.test.dicePool = dicePool;
		newMessage.extendedRoll += 1;
		await SR5_RollTest.srDicesAddInfoToCard(newMessage, actor.id);
		if (newMessage.itemId) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

		SR5_RollMessage.updateRollCard(message.id, newMessage);
	}

	 /** Handle second chance : reroll failed dice and update message with new message
	 * @param {Object} message - ChatMessage data
	 * @param {Object} actor - actor who use edge
	 */
	static async secondeChance(message, actor) {
		let messageData = message.flags.sr5data;
		//Re roll failed dices
		let dicePool = messageData.test.dicePool - messageData.roll.hits;
		if (dicePool < 0) dicePool = 0;
		let limit = messageData.test.limit - messageData.roll.hits;
		if (limit < 0) limit = 0;
		let chance = await SR5_RollTest.srd6({ dicePool: dicePool, limit: limit, edgeRoll: true,});
		let chanceHit;
		if (chance.hits > limit) chanceHit = limit;
		else chanceHit = chance.hits;
		let dices = messageData.test.dices;
		let dicesKeeped = dices.filter(function (d) {
			return d.result > 4;
		});

		//Met à jour les infos sur le nouveau message avec le résultat du nouveau jet.
		let newMessage = duplicate(messageData);
		newMessage.roll.hits = messageData.roll.hits + chanceHit;
		newMessage.test.dices = dicesKeeped.concat(chance.dices);
		newMessage.secondeChanceUsed = true;
		newMessage.pushLimitUsed = true;
		await SR5_RollTest.srDicesAddInfoToCard(newMessage, actor.id);
		if (newMessage.itemId) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

		//Remove 1 to actor's Edge
		if (messageData.actorType === "actorSpirit"){
			let creator = SR5_EntityHelpers.getRealActorFromID(actor.system.creatorId);
			creator.update({ "system.conditionMonitors.edge.actual.base": creator.system.conditionMonitors.edge.actual.base + 1 });
		} else {
			//If actor is grunt, change actor to parent
			if (actor.isToken) actor = game.actors.get(actor.id);
			actor.update({ "system.conditionMonitors.edge.actual.base": actor.system.conditionMonitors.edge.actual.base + 1 });
		}

		//update message with new infos
		SR5_RollMessage.updateRollCard(message.id, newMessage);
	}

	static async pushTheLimit(message, actor) {
		let messageData = message.flags.sr5data;
		let dicePool, creator;

		//If roller is a bounder spirit, use actor Edge instead
		if (messageData.actorType === "actorSpirit"){
			creator = SR5_EntityHelpers.getRealActorFromID(actor.system.creatorId);
			dicePool = creator.system.specialAttributes.edge.augmented.value;
		} else dicePool = actor.system.specialAttributes.edge.augmented.value;

		let newRoll = await SR5_RollTest.srd6({
			dicePool: dicePool,
			explose: true,
			edgeRoll: true,
		});

		let newMessage = duplicate(messageData);
		newMessage.roll.hits = messageData.roll.hits + newRoll.hits;
		newMessage.test.dices = messageData.test.dices.concat(newRoll.dices);
		newMessage.secondeChanceUsed = true;
		newMessage.pushLimitUsed = true;
		newMessage.dicePoolMod.pushTheLimit = {
			value: dicePool,
			label: game.i18n.localize("SR5.PushTheLimit"),
		}
		newMessage.dicePoolModHas = true;
		newMessage.test.dicePool += dicePool;
		await SR5_RollTest.srDicesAddInfoToCard(newMessage, actor.id);
		if (newMessage.itemId) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

		//Remove 1 to actor's Edge
		if (messageData.actorType === "actorSpirit"){
			creator.update({ "system.conditionMonitors.edge.actual.base": creator.system.conditionMonitors.edge.actual.base + 1 });
		} else {
			//If actor is grunt, change actor to parent
			if (actor.isToken) actor = game.actors.get(actor.id);
			actor.update({ "system.conditionMonitors.edge.actual.base": actor.system.conditionMonitors.edge.actual.base + 1 });
		}

		//Rafraichi le message avec les nouvelles infos.
		SR5_RollMessage.updateRollCard(message.id, newMessage);
	}

	

	//Determine from whom actor edge must be reduce
	static async determineEdgeActor(actor){
		let edgeActor = actor;
		if (actor.type === "actorSpirit" && actor.system.creatorId){
			let creator = SR5_EntityHelpers.getRealActorFromID(actor.system.creatorId);
			if (creator.system.conditionMonitors.edge?.actual?.value < creator.system.specialAttributes?.edge?.augmented?.value){
				edgeActor = creator;
			}
		}
		return edgeActor;
	}

	static async renderRollCard(cardData) {
		//Add button to edit result for GM
		if (game.user.isGM) cardData.chatCard.canEditResult = true;

		//If Edge was used previously or test type is an object resistance, turn off edge use on chat message
		if (!cardData.edge.canUseEdge || cardData.test.type === "objectResistance") {
			cardData.edge.hasUsedSecondChance = true;
			cardData.edge.hasUsedPushTheLimit = true;
		}

		const templateData = cardData;
		const template = `systems/sr5/templates/rolls/roll-card.html`;
		let html = await renderTemplate(template, templateData);

		//Add chat buttons to chat card
		let newHtml = $(html);
		let divButtons = newHtml.find('[id="srButtonTest"]');
		for (let button in cardData.chatCard.buttons){
			divButtons.append(`<button class="messageAction ${cardData.chatCard.buttons[button].testType} ${cardData.chatCard.buttons[button].gmAction}" data-action="${cardData.chatCard.buttons[button].testType}" data-type="${cardData.chatCard.buttons[button].actionType}">${cardData.chatCard.buttons[button].label}</button>`);
		}
		html = newHtml[0].outerHTML;

		let chatData = {
			roll: cardData.roll.r,
			rollMode: cardData.roll.rollMode,
			user: game.user.id,
			content: html,
			speaker: {
				actor: cardData.owner.speakerId,
				token: cardData.owner.speakerId,
				alias: cardData.owner.speakerActor,
			},
		};

		if (["gmroll", "blindroll"].includes(cardData.roll.rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
		if (cardData.roll.rollMode === "blindroll") chatData["blind"] = true;
		else if (cardData.roll.rollMode === "selfroll") chatData["whisper"] = [game.user];

		let userActive = game.users.get(chatData.user);

		chatData.flags = {
			sr5data: cardData,
			sr5template: template,
			img: cardData.owner.speakerImg,
			css: "SRCustomMessage",
			speakerId: chatData.speakerId,
			borderColor: userActive.color,
		};

		console.log(chatData.flags.sr5data);
		//Handle Dice so Nice
		await SR5_RollTest.showDiceSoNice(cardData.roll.originalRoll, cardData.roll.rollMode);

		//Create chat message
		ChatMessage.create(chatData);
	}

	/**
	* Add support for the Dice So Nice module
	* @param {Object} roll
	* @param {String} rollMode
	*/
	static async showDiceSoNice(roll, rollMode) {
		if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active) {
			let whisper = null;
			let blind = false;
			switch (rollMode) {
				case "blindroll": //GM only
					blind = true;
				case "gmroll": //GM + rolling player
					let gmList = game.users.filter(user => user.isGM);
					let gmIDList = [];
					gmList.forEach(gm => gmIDList.push(gm.id));
					whisper = gmIDList;
					break;
				case "roll": //everybody
					let userList = game.users.filter(user => user.active);
					let userIDList = [];
					userList.forEach(user => userIDList.push(user.data._id));
					whisper = userIDList;
					break;
			}
			await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
		}
	}

	//Iterate througt test type to handle results
	static async srDicesAddInfoToCard(cardData, actorId) {
		//Reset button
		cardData.chatCard.buttons = {};

		//Handle Extended Test
		if (cardData.test.isExtended){
			cardData.test.extended.intervalValue = cardData.test.extended.multiplier * cardData.extendedRoll;
			if (cardData.dicePool.value <= 0) cardData.test.isExtended = false;
		}

		switch (cardData.test.type) {
			case "attack":
				await SR5_AddRollInfo.attackInfo(cardData);
				break;
			case "defense":							
			case "rammingDefense":
				await SR5_AddRollInfo.defenseInfo(cardData, actorId);
				break;
			case "resistanceCard":
			case "splitted":
				await SR5_AddRollInfo.resistanceInfo(cardData, actorId);
				break;
			case "spell":
			case "preparation":
			case "adeptPower":
				await SR5_AddRollInfo.spellInfo(cardData);
				break;
			case "sensorTarget":
			case "preparationFormula":
			case "iceAttack":
			case "spritePower":						
			case "martialArt":
			case "ritual":
			case "passThroughBarrier":
			case "escapeEngulf":							
			case "ramming":
				await SR5_AddRollInfo.actionHit(cardData, cardData.type);
				break;
			case "power":
				if (cardDatamagic.spell.category === "regeneration") return SR5_AddRollInfo.regenerationInfo(cardData, cardData.type);
				if (cardData.test.typeSub !== "powerWithDefense") { 
					if (!cardData.effects.canApplyEffect) return;
					else await SR5_AddRollInfo.spellInfo(cardData);
				} else await SR5_AddRollInfo.actionHit(cardData, cardData.type);
				break;
			case "drain":
				await SR5_AddRollInfo.drainInfo(cardData, actorId);
				break;
			case "accidentCard":
				await SR5_AddRollInfo.accidentInfo(cardData);
				break;
			case "complexForm":
				await SR5_AddRollInfo.complexFormInfo(cardData);
				break;
			case "complexFormDefense":
				await SR5_AddRollInfo.complexFormDefenseInfo(cardData);
				break;
			case "fading":
				await SR5_AddRollInfo.fadingInfo(cardData);
				break;
			case "matrixAction":
				await SR5_AddRollInfo.matrixActionInfo(cardData, actorId);
				break;
			case "matrixDefense":
				await SR5_AddRollInfo.matrixDefenseInfo(cardData, actorId);
				break;
			case "matrixResistance":
				await SR5_AddRollInfo.matrixResistanceInfo(cardData, actorId);
				break;
			case "iceDefense":
				await SR5_AddRollInfo.iceDefenseInfo(cardData, actorId);
				break;
			case "lift":
				await SR5_AddRollInfo.liftInfo(cardData, actorId);
				break;
			case "movement":
				await SR5_AddRollInfo.movementInfo(cardData, actorId);
				break;
			case "skill":
			case "skillDicePool":
				await SR5_AddRollInfo.skillInfo(cardData);
				break;
			case "resonanceAction":
				await SR5_AddRollInfo.resonanceActionInfo(cardData);
				break;
			case "resistFire":
				await SR5_AddRollInfo.fireResistanceInfo(cardData);
				break;
			case "preparationResistance":
			case "ritualResistance":
			case "summoningResistance":
			case "compilingResistance":
			case "sensorDefense":
			case "jackOutDefense":
			case "eraseMark":
			case "passThroughDefense":
			case "engulfResistance":				
			case "intimidationResistance":
			case "ricochetResistance":
			case "warningResistance":
			case "stunnedResistance":
			case "buckledResistance":
			case "nauseousResistance":
			case "knockdownResistance":
				await SR5_AddRollInfo.defenseResultInfo(cardData, cardData.test.type);
				break;
			case "overwatchResistance":
				await SR5_AddRollInfo.overwatchResistanceInfo(cardData);
				break;
			case "registeringResistance":
			case "decompilingResistance":
			case "bindingResistance":
			case "banishingResistance":
				await SR5_AddRollInfo.sidekickResistanceInfo(cardData, cardData.test.type);
				break;
			case "spellResistance":
			case "resistSpell":
			case "complexFormResistance":
			case "enchantmentResistance":
			case "disjointingResistance":
			case "powerDefense":				
			case "martialArtDefense":
			case "etiquetteResistance":
			case "weaponResistance":				
				await SR5_AddRollInfo.resistanceResultInfo(cardData, cardData.test.type);
				break;
			case "objectResistance":
				await SR5_AddRollInfo.objectResistanceResultInfo(cardData);
				break;
			case "regeneration":
				await SR5_AddRollInfo.regenerationResultInfo(cardData, actorId);
				break;
			case "healing":
				await SR5_AddRollInfo.healingInfo(cardData);
				break;
			case "attributeOnly":
			case "languageSkill":
            case "knowledgeSkill":
			case "defenseSimple":
			case "resistanceSimple":
			case "matrixDefenseSimple":
			case "astralTracking":
			case "derivedAttribute":
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${cardData.test.type}' type in srDicesAddInfoToCard`);
		}
	}
}
