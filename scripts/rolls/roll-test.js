import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_RollMessage } from "./roll-message.js";
import { SR5_RollTestHelper } from "./roll-test-helper.js";
import * as SR5_AddRollInfo from "./roll-test-case/index.js";
import { SR5Combat } from "../system/srcombat.js";
import SR5_RollDialog from "./roll-dialog.js";
import { SR5_ConverterHelpers } from "./roll-helpers/converter.js";
import { SR5_CombatHelpers } from "./roll-helpers/combat.js";

export class SR5_RollTest {
	//Prepare the roll window
	static async generateRollDialog(dialogData, edge = false, cancel = true) {
		let actor = SR5_EntityHelpers.getRealActorFromID(dialogData.owner.actorId),
			actorData = actor.system,
			template = "systems/sr5/templates/rolls/roll-dialog.html";

		//Handle Edge
		dialogData.edge.canUseEdge = await SR5_RollTestHelper.canUseEdge(actor, dialogData);
		let edgeActor = await SR5_RollTestHelper.determineEdgeActor(actor);

		let buttons = {
			roll: {
				label: game.i18n.localize("SR5.RollDice"),
				class: ['test', 'truc'],
				icon: '<i class="fas fa-dice-six"></i>',
				callback: () => (cancel = false),
			},
		}
		if (dialogData.edge.canUseEdge){
			buttons = foundry.utils.mergeObject(buttons, {
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
						if (dialogData.magic.hasUsedReagents) {
							dialogData.magic.reagentsSpent = parseInt(html.find('[name="reagentsSpent"]').val());
							actor.update({ "system.magic.reagents": actorData.magic.reagents - dialogData.magic.reagentsSpent});
						}

						//Rename chatCard title for extended test
						if (dialogData.test.isExtended) dialogData.test.title = dialogData.test.title.replace("Test", game.i18n.localize("SR5.ExtendedTest"));

						//Ensure force and level are determined
						if ((dialogData.test.type === "spell" || dialogData.test.typeSub === "summoning" || dialogData.test.type === "preparationFormula") && isNaN(dialogData.magic.force)) {
							ui.notifications.warn(game.i18n.localize("SR5.WARN_NoForce"));
							dialogData.magic.force = actorData.specialAttributes.magic.augmented.value;
						}
						if ((dialogData.test.type === "complexForm" || dialogData.test.typeSub === "compileSprite") && isNaN(dialogData.matrix.level)) {
							ui.notifications.warn(game.i18n.localize("SR5.WARN_NoLevel"));
							dialogData.matrix.level = actorData.specialAttributes.resonance.augmented.value;
						}

						//Add limit for force, reagents and level
						if ((dialogData.magic.force || dialogData.magic.hasUsedReagents) && dialogData.test.type !== "spellResistance"){
							if (dialogData.magic.force > 0) {
								dialogData.limit.base = dialogData.magic.force;
								dialogData.limit.type = "force";
							}
							if (dialogData.magic.hasUsedReagents && dialogData.test.type !== "ritual") {
								dialogData.limit.base = dialogData.magic.reagentsSpent;
								dialogData.limit.type = "reagents";
							}
						}
						if (dialogData.matrix.level) {
							dialogData.limit.base = dialogData.matrix.level;
							dialogData.limit.type = "level";
						}
						
						//Add limit modifiers
						dialogData = await SR5_RollTestHelper.handleLimitModifiers(dialogData);
						
						//Add dice pool modifiers
						dialogData = await SR5_RollTestHelper.handleDicePoolModifiers(dialogData);

						if (dialogData.combat.ammo.fired > 0 && dialogData.combat.firingMode.selected !== "SF"){
							let actualRecoil = actor.getFlag("sr5", "cumulativeRecoil") || 0;
							actualRecoil += dialogData.combat.ammo.fired;
							actor.setFlag("sr5", "cumulativeRecoil", actualRecoil);
						}

						// Roll dices
						if (edge) {
							// push the limits
							dialogData.roll = await SR5_RollTest.rollDice({
								dicePool: dialogData.dicePool.value,
								explose: edge,
							});
							dialogData.edge.hasUsedPushTheLimit = true;
						} else {
							dialogData.roll = await SR5_RollTest.rollDice({
								dicePool: dialogData.dicePool.value,
								limit: dialogData.limit.value,
							});
						}

						//Add info to chatCard
						await SR5_RollTest.addInfoToCard(dialogData, dialogData.owner.actorId);

						// Return roll result and card info to chat message.
						await SR5_RollTest.renderRollCard(dialogData);

						//Update items according to roll
						if (dialogData.owner.itemUuid) SR5_RollTestHelper.updateItemAfterRoll(dialogData);

						//Update spirit if spirit aid is used
						if (dialogData.dicePool.modifiers.spiritAid?.value > 0){
							let spiritItem = await fromUuid(dialogData.magic.spiritAid.id);
							let spiritItemData = foundry.utils.duplicate(spiritItem.system);
        					spiritItemData.services.value -= 1;
        					await spiritItem.update({'data': spiritItemData});
							ui.notifications.info(`${spiritItem.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.format('SR5.INFO_ServicesReduced', {service: 1})}`);
							let spiritActor = game.actors.find(a => a.system.creatorItemId === spiritItem.id);
							if (spiritActor){
        						let spiritActorData = foundry.utils.duplicate(spiritActor.system);
								spiritActorData.services.value -= 1;
								await spiritActor.update({'data': spiritActorData});
							}
						}

						//Update combatant if Active defense or full defense is used.
						if (dialogData.dicePool.modifiers.fullDefense || (dialogData.combat.activeDefenseSelected !== "none")){
							let initModifier = 0;
							if (dialogData.dicePool.modifiers.fullDefense){
								let isInFullDefense = actor.effects.find(e => e.origin === "fullDefense") ? true : false;
								if (!isInFullDefense){
									initModifier += -10;
									SR5_CombatHelpers.applyFullDefenseEffect(actor);
								}
							}
							if (dialogData.combat.activeDefenseSelected !== "") initModifier += SR5_ConverterHelpers.activeDefenseToInitMod(dialogData.combat.activeDefenseSelected);
							if (initModifier < 0) SR5Combat.changeInitInCombatHelper(actor.id, initModifier);
						}

						//Change actions in combat tracker
						if (game.combat && dialogData.combat.actions.length){
							await SR5Combat.changeActionInCombat(dialogData.owner.actorId, dialogData.combat.actions);
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
	static async rollDice({ dicePool, limit, explose, edgeRoll }) {
		let formula = `${dicePool}d6`;
		if (explose) formula += "x6";
		if (limit) formula += `kh${limit}`;
		formula += "cs>=5";

		let roll = new Roll(formula);
		let rollMode = game.settings.get("core", "rollMode");
		let rollRoll = await roll.evaluate();
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
		let messageData = message.flags.sr5data,
			dicePool = messageData.dicePool.value - 1;

		//roll new test
		let newRoll = await SR5_RollTest.rollDice({ dicePool: dicePool, limit: messageData.limit.value });

		//Keep only original hits and concatenat with new hits
		let dicesKeeped = messageData.roll.dices.filter(function (d) {
			return d.result > 4;
		});
		let dicesTotal = newRoll.dices.concat(dicesKeeped);

		//Prepare new chat card
		let newMessage = foundry.utils.duplicate(messageData);
		newMessage.roll.hits = messageData.roll.hits + newRoll.hits;
		newMessage.roll.dices = dicesTotal;
		newMessage.test.extended.roll += 1;
		if (typeof newMessage.originalModifiers === 'undefined') {
				newMessage.originalModifiers = messageData.dicePool.modifiersTotal;
		}
		newMessage.dicePool.modifiers.extendedTest = {
			label: game.i18n.localize("SR5.ExtendedTest"),
			value: -( - newMessage.originalModifiers + newMessage.test.extended.roll - 1),
		}
		newMessage = await SR5_RollTestHelper.handleDicePoolModifiers(newMessage);
		await SR5_RollTest.addInfoToCard(newMessage, actor.id);

		if (newMessage.owner.itemUuid) SR5_RollTestHelper.updateItemAfterRoll(newMessage, actor);

		SR5_RollMessage.updateRollCardHelper(message.id, newMessage);
	}

	//Handle second chance : reroll failed dice and update message with new message
	static async secondeChance(message, actor) {
		let messageData = message.flags.sr5data;

		//Re roll failed dices
		let dicePool = messageData.dicePool.value - messageData.roll.hits;
		if (dicePool < 0) dicePool = 0;
		let limit = messageData.limit.value - messageData.roll.hits;
		if (limit < 0) limit = 0;
		let chance = await SR5_RollTest.rollDice({ dicePool: dicePool, limit: limit, edgeRoll: true,});
		let chanceHit = chance.hits;
		if (chance.hits > limit && (limit !== 0)) chanceHit = limit;
		let dicesKeeped = messageData.roll.dices.filter(function (d) {
			return d.result > 4;
		});

		//Met à jour les infos sur le nouveau message avec le résultat du nouveau jet.
		let newMessage = foundry.utils.duplicate(messageData);
		newMessage.roll.hits = messageData.roll.hits + chanceHit;
		newMessage.roll.dices = dicesKeeped.concat(chance.dices);
		newMessage.edge.hasUsedSecondChance = true;
		newMessage.edge.canUseEdge = false;
		await SR5_RollTest.addInfoToCard(newMessage, actor.id);
		if (newMessage.owner.itemUuid) SR5_RollTestHelper.updateItemAfterRoll(newMessage, actor);

		//Remove 1 to actor's Edge
		await SR5_RollTestHelper.removeEdgeFromActor(messageData, actor);

		//update message with new infos
		SR5_RollMessage.updateRollCardHelper(message.id, newMessage);
	}

	//Handle Push the Limit test
	static async pushTheLimit(message, actor) {
		let messageData = message.flags.sr5data;
		let dicePool, creator;

		//If roller is a bounder spirit, use actor Edge instead
		if (actor.type === "actorSpirit"){
			creator = SR5_EntityHelpers.getRealActorFromID(actor.system.creatorId);
			dicePool = creator.system.specialAttributes.edge.augmented.value;
		} else dicePool = actor.system.specialAttributes.edge.augmented.value;

		let newRoll = await SR5_RollTest.rollDice({
			dicePool: dicePool,
			explose: true,
			edgeRoll: true,
		});

		let newMessage = foundry.utils.duplicate(messageData);
		newMessage.roll.hits = messageData.roll.hits + newRoll.hits;
		newMessage.roll.dices = messageData.roll.dices.concat(newRoll.dices);
		newMessage.edge.hasUsedPushTheLimit = true;
		newMessage.edge.canUseEdge = false;
		newMessage.dicePool.modifiers.pushTheLimit = {
			value: dicePool,
			label: game.i18n.localize("SR5.PushTheLimit"),
		}
		newMessage = await SR5_RollTestHelper.handleDicePoolModifiers(newMessage);
		await SR5_RollTest.addInfoToCard(newMessage, actor.id);
		if (newMessage.itemUuid) SR5_RollTestHelper.updateItemAfterRoll(newMessage, actor);

		//Remove 1 to actor's Edge
		await SR5_RollTestHelper.removeEdgeFromActor(messageData, actor);

		//Rafraichi le message avec les nouvelles infos.
		SR5_RollMessage.updateRollCardHelper(message.id, newMessage);
	}

	//Render the chat message
	static async renderRollCard(cardData) {
		//Add button to edit result for GM
		//if (game.user.isGM) cardData.chatCard.canEditResult = true;

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
		cardData.owner.userId = game.user.id;

		chatData.flags = {
			sr5data: cardData,
			sr5template: template,
			img: cardData.owner.speakerImg,
			css: "SRCustomMessage",
			speakerId: chatData.speakerId,
			borderColor: userActive.color,
		};

		//Handle Dice so Nice
		if (cardData.roll.originalRoll) await SR5_RollTest.showDiceSoNice(cardData.roll.originalRoll, cardData.roll.rollMode);

		//Create chat message
		ChatMessage.create(chatData);
	}

	//Add support for the Dice So Nice module
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
	static async addInfoToCard(cardData, actorId) {
		//Reset button
		cardData.chatCard.buttons = {};

		//Handle Extended Test
		if (cardData.test.isExtended){
			if (!cardData.test.extended.roll) cardData.test.extended.roll = 1;
			cardData.test.extended.intervalValue = cardData.test.extended.multiplier * cardData.test.extended.roll;
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
				await SR5_AddRollInfo.actionHitInfo(cardData, cardData.test.type);
				break;
			case "power":
				if (cardData.magic.spell.category === "regeneration") return SR5_AddRollInfo.regenerationInfo(cardData, cardData.test.type);
				if (cardData.test.typeSub !== "powerWithDefense") { 
					if (!cardData.effects.canApplyEffect) return;
					else await SR5_AddRollInfo.spellInfo(cardData);
				} else await SR5_AddRollInfo.actionHitInfo(cardData, cardData.test.type);
				break;
			case "drain":
				await SR5_AddRollInfo.drainInfo(cardData, actorId);
				break;
			case "complexForm":
				await SR5_AddRollInfo.complexFormInfo(cardData);
				break;
			case "complexFormDefense":
				await SR5_AddRollInfo.complexFormDefenseInfo(cardData);
				break;
			case "fading":
				await SR5_AddRollInfo.fadingInfo(cardData, actorId);
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
			case "dispellResistance":
			case "spellResistance":
			case "spellResistance":
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
			case "vehicleTest":
				await SR5_AddRollInfo.vehicleTestInfo(cardData, actorId);
				break;
			case "attributeOnly":
			case "languageSkill":
            case "knowledgeSkill":
			case "defenseSimple":
			case "resistanceSimple":
			case "matrixDefenseSimple":
			case "astralTracking":
			case "derivedAttribute":
			case "itemRoll":
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${cardData.test.type}' type in addInfoToCard`);
		}
	}
}
