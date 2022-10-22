import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_RollMessage } from "./roll-message.js";
import { SR5_RollTestHelper } from "./roll-test-helper.js";
import * as SR5_RollTestCase from "./roll-test-case/index.js";
import { SR5Combat } from "../system/srcombat.js";
import { SR5_SocketHandler } from "../socket.js";
import SR5_RollDialog from "./roll-dialog.js";

export class SR5_RollTest {
	/** Prepare the roll window
	 * @param {Object} dialogData - Informations for the dialog window
	 */
	 static async generateRollDialog(dialogData, edge = false, cancel = true) {
		let actor = SR5_EntityHelpers.getRealActorFromID(dialogData.owner.actorID),
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
						if ((dialogData.test.type === "spell" || dialogData.test.typeSub === "summoning" || dialogData.test.type === "preparationFormula") && isNaN(dialogData.force)) {
							ui.notifications.warn(game.i18n.localize("SR5.WARN_NoForce"));
							dialogData.force = actorData.specialAttributes.magic.augmented.value;
						}
						if ((dialogData.test.type === "complexForm" || dialogData.test.typeSub === "compileSprite") && isNaN(dialogData.level)) {
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
						await SR5_RollTest.srDicesAddInfoToCard(dialogData, dialogData.owner.actorID);

						// Return roll result and card info to chat message.
						await SR5_RollTest.renderRollCard(dialogData);

						//Update items according to roll
						if (dialogData.owner.itemID) SR5_DiceHelper.srDicesUpdateItem(dialogData, actor);

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
				await SR5_RollTest.addAttackInfoToCard(cardData);
				break;
			case "defenseCard":							
			case "rammingDefense":
				await SR5_RollTest.addDefenseInfoToCard(cardData, actorId);
				break;
			case "resistanceCard":
			case "splitted":
				await SR5_RollTest.addResistanceInfoToCard(cardData, actorId);
				break;
			case "spell":
			case "preparation":
			case "adeptPower":
				await SR5_RollTest.addSpellInfoToCard(cardData);
				break;
			case "activeSensorTargeting":
			case "preparationFormula":
			case "matrixIceAttack":
			case "spritePower":						
			case "martialArt":
			case "ritual":
			case "passThroughBarrier":
			case "escapeEngulf":							
			case "rammingTest":
				await SR5_RollTest.addActionHitInfoToCard(cardData, cardData.type);
				break;
			case "power":
				if (cardData.isRegeneration) return SR5_RollTest.addRegenerationResultInfoToCard(cardData, cardData.type);
				if (cardData.test.typeSub !== "powerWithDefense") { 
					if (!cardData.switch?.transferEffect) return;
					else await SR5_RollTest.addSpellInfoToCard(cardData);
				} else await SR5_RollTest.addActionHitInfoToCard(cardData, cardData.type);
				break;
			case "drainCard":
				await SR5_RollTest.addDrainInfoToCard(cardData);
				break;
			case "accidentCard":
				await SR5_RollTest.addAccidentInfoToCard(cardData);
				break;
			case "complexForm":
				await SR5_RollTest.addComplexFormInfoToCard(cardData);
				break;
			case "complexFormDefense":
				await SR5_RollTest.addComplexFormDefenseInfoToCard(cardData);
				break;
			case "fadingCard":
				await SR5_RollTest.addFadingInfoToCard(cardData);
				break;
			case "matrixAction":
				await SR5_RollTest.addMatrixActionInfoToCard(cardData, actorId);
				break;
			case "matrixDefense":
				await SR5_RollTest.addMatrixDefenseInfoToCard(cardData, actorId);
				break;
			case "matrixResistance":
				await SR5_RollTest.addMatrixResistanceInfoToCard(cardData, actorId);
				break;
			case "iceDefense":
				await SR5_RollTest.addIceDefenseInfoToCard(cardData, actorId);
				break;
			case "lift":
				cardData.weightTotal = cardData.derivedBaseValue + (cardData.roll.hits * cardData.derivedExtraValue);
				break;
			case "movement":
				cardData.movementTotal = cardData.derivedBaseValue + (cardData.roll.hits * cardData.derivedExtraValue);
				break;
			case "skill":
			case "skillDicePool":
				await SR5_RollTestCase.addSkillInfo(cardData);
				break;
			case "resonanceAction":
				await SR5_RollTest.addResonanceActionInfoToCard(cardData);
				break;
			case "resistFire":
				await SR5_RollTest.addResistFireInfoToCard(cardData);
				break;
			case "preparationResistance":
			case "ritualResistance":
			case "summoningResistance":
			case "compilingResistance":
			case "activeSensorDefense":
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
				await SR5_RollTest.addDefenseResultInfoToCard(cardData, cardData.type);
				break;
			case "overwatchResistance":
				await SR5_RollTest.addOverwatchResistanceInfoToCard(cardData);
				break;
			case "registeringResistance":
			case "decompilingResistance":
			case "bindingResistance":
			case "banishingResistance":
				await SR5_RollTest.addSidekickResistanceInfoToCard(cardData, cardData.type);
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
				await SR5_RollTest.addResistanceResultInfoToCard(cardData, cardData.type);
				break;
			case "objectResistance":
				await SR5_RollTest.addObjectResistanceResultInfoToCard(cardData);
				break;
			case "regeneration":
				await SR5_RollTest.addRegenerationResultInfoToCard(cardData);
				break;
			case "healing":
				await SR5_RollTest.addHealingInfoToCard(cardData);
				break;
			case "attributeOnly":
			case "languageSkill":
            case "knowledgeSkill":
			case "defense":
			case "resistance":
			case "matrixSimpleDefense":
			case "astralTracking":
			case "derivedAttribute":
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${cardData.test.type}' type in srDicesAddInfoToCard`);
		}
	}

	static async addAttackInfoToCard(cardData){
		cardData.damageResistanceType = "physicalDamage";

		if (cardData.test.typeSub === "grenade") {
			cardData.damage.value = cardData.damage.valueBase;
			//Handle scatter
			if (cardData.roll.hits < 3) cardData.buttons.scatter = SR5_RollMessage.generateChatButton("nonOpposedTest","scatter",game.i18n.localize("SR5.Scatter"));
			//Handle Grenade Resistant chat button
			let label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`;
			if (cardData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.incomingPA}`;
			if (cardData.damageElement === "toxin") label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.Toxin")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.toxinTypes[cardData.toxin.type])}`;
			if (cardData.damage.value > 0) cardData.chatCard.buttons.resistanceCard = SR5_RollMessage.generateChatButton("opposedTest","resistanceCard",label);
		} else if (cardData.roll.hits > 0) {
			if (cardData.test.typeSub === "rangedWeapon") cardData.chatCard.buttons.defenseRangedWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseRangedWeapon",game.i18n.localize("SR5.Defend"));
			else if (cardData.test.typeSub === "meleeWeapon") cardData.chatCard.buttons.defenseMeleeWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseMeleeWeapon",game.i18n.localize("SR5.Defend"));
		} else {
			if (cardData.type === "rammingTest") cardData.chatCard.buttons.defenseRamming = SR5_RollMessage.generateChatButton("opposedTest","defenseRamming",game.i18n.localize("SR5.Defend"));
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.AttackMissed"));
		}
	}

	static async addDefenseInfoToCard(cardData, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let actorData = actor.system;
		cardData.netHits = cardData.previousMessage.hits - cardData.roll.hits;

		//Special case for injection ammo, need 3 net hits if armor is weared
		if (cardData.ammoType === "injection" && actor.system.itemsProperties.armor.value > 0){
			if (cardData.netHits < 3) {
				cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
				return ui.notifications.info(game.i18n.localize("SR5.INFO_NeedAtLeastThreeNetHits"));
			}
		}

		//If Defenser win, return
		if (cardData.netHits <= 0) {
			if (cardData.calledShot?.name === "throughAndInto") {
				let originalAttackMessage = game.messages.get(cardData.originalMessage);
				originalAttackMessage.flags.sr5data.calledShot.name = '';
				cardData.originalAttackMessage = originalAttackMessage.flags.sr5data;
				cardData.chatCard.buttons.defenseRangedWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseThroughAndInto",game.i18n.localize("SR5.DefendSecondTarget"));
			}
			return cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
		}

		//Handle astral combat damage
		if (cardData.test.typeSub === "astralCombat") cardData.damageResistanceType = "astralDamage";
		else cardData.damageResistanceType = "physicalDamage";

		//If Hardened Armor, check if damage do something
		if ((actorData.specialProperties?.hardenedArmor.value > 0) && (cardData.damageSource !== "spell")) {
			let immunity = actorData.specialProperties.hardenedArmor.value + cardData.incomingPA;
			if (cardData.damage.value + cardData.netHits <= immunity) {
				cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NormalWeaponsImmunity"));
				return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToNormalWeapons", {essence: actorData.essence.value * 2, pa: cardData.incomingPA, damage: cardData.damage.value})}`);
			}
		}

		//Damage value calculation
		if (cardData.firingMode === "SF") cardData.damage.value = cardData.damage.valueBase;
		else if (cardData.damageElement === "toxin") {
			if (cardData.toxin.type === "airEngulf") cardData.damage.value = cardData.damage.valueBase + cardData.netHits;
			else cardData.damage.value = cardData.damage.valueBase;
		} else cardData.damage.value = cardData.damage.valueBase + cardData.netHits;
			
		//Handle Called Shot specifics
		if (cardData.calledShot?.name) cardData = await SR5_RollTest.handleCalledShotDefenseInfo(cardData, actorData);

		//Add fire threshold
		if (cardData.damageElement === "fire") cardData.fireTreshold = cardData.netHits;

		//Special case for Drone and vehicle
		if (actor.type === "actorDrone" || actor.type === "actorVehicle") {
			if (cardData.damage.type === "stun" && cardData.damageElement === "electricity") {
				cardData.damage.type = "physical";
				ui.notifications.info(`${game.i18n.localize("SR5.INFO_ElectricityChangeDamage")}`);
			}
			if (cardData.damage.type === "stun") {
				cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.VehicleArmorResistance"));
				return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToStunDamage")}`);
			}
			if (actorData.attributes.armor.augmented.value >= cardData.damage.value) {
				cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.VehicleArmorResistance"));
				return ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDV", {armor: actorData.attributes.armor.augmented.value, damage:cardData.damage.value})}`); //
			}
		}

		//Special case for called shots
		if (cardData.calledShot?.name === "breakWeapon") return cardData.chatCard.buttons.weaponResistance = SR5_RollMessage.generateChatButton("nonOpposedTest","weaponResistance",game.i18n.localize("SR5.WeaponResistance"));
		if (cardData.calledShot?.name === "feint") return;

		//Generate Resistance chat button if not already done by called shot
		if (!cardData.calledShotButton) {
			let label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`;
			if (cardData.damageElement === "toxin" && !cardData.damage.type) label = `${game.i18n.localize("SR5.ResistToxin")}`;
			if (cardData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.incomingPA}`;
			cardData.chatCard.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCard",label);
		}
	}

	static async addResistanceInfoToCard(cardData, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let actorData = actor.system;

		//Remove Resist chat button from previous chat message, if necessary
		let originalMessage, prevData;
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.flags?.sr5data;
		}
		if (prevData?.type === "spell" && prevData?.spellRange === "area") ;
		else if (prevData?.test.typeSub === "grenade") ;
		else if (cardData.damageContinuous && cardData.damageIsContinuating) ;
		else SR5_RollMessage.updateChatButton(cardData.originalMessage, "resistanceCard");
		if (cardData.isFatiguedCard) SR5_RollMessage.updateChatButton(cardData.originalMessage, "fatiguedCard");

		//Remove Biofeedback chat button from previous chat message
		if (cardData.test.typeSub === "biofeedbackDamage"){
			if (prevData.buttons.attackerDoBiofeedbackDamage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "attackerDoBiofeedbackDamage");
			if (prevData.buttons.defenderDoBiofeedbackDamage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "defenderDoBiofeedbackDamage");
		}

		//Toxin management
		if (cardData.damageElement === "toxin"){
			cardData.damage.value = cardData.damage.valueBase - cardData.roll.hits;

			//Handle called Shot specifics
			if (cardData.calledShot?.name){
				if (cardData.originalMessage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "spendNetHits");
				cardData = await SR5_RollTest.handleCalledShotResistanceInfo(cardData, actor);
			}

			if (cardData.damage.value > 0) {
				//Get Damage info
				let damage = "";
				if (cardData.damage.type) damage = `& ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`;
				
				//Get Speed info
				let speed = game.i18n.localize("SR5.ApplyToxinEffectAtTheEndOfTheRound");
				if (cardData.toxin.speed > 0) speed = `${game.i18n.format('SR5.ApplyToxinEffectAtTheEndOfXRound', {round: cardData.toxin.speed})}`;
				
				//If Actor is in combat, adjust speed to display the good round
				let combatant = SR5Combat.getCombatantFromActor(actor);
				if (combatant){
					let speedRound = combatant.combat.round + cardData.toxin.speed;
					speed = `${game.i18n.format('SR5.ApplyToxinEffectAtTheEndOfXRound', {round: speedRound})}`;
				}
				if (cardData.toxin.type === "airEngulf") return cardData.chatCard.buttons.toxinEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "toxinEffect",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`);
				else return cardData.chatCard.buttons.toxinEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "toxinEffect",`${game.i18n.localize("SR5.ApplyToxinEffect")} ${damage}<br> ${speed}`);
			}
			else return cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDamage"));
		}

		//Add automatic succes for Hardened Armor.
		if ((actorData.specialProperties?.hardenedArmor.value > 0) && (cardData.damageSource !== "spell")) {
			let hardenedArmor = Math.floor((actorData.specialProperties.hardenedArmor.value + cardData.incomingPA) / 2);
			if (hardenedArmor > 0) {
			  ui.notifications.info(`${game.i18n.localize("SR5.HardenedArmor")}: ${hardenedArmor} ${game.i18n.localize("SR5.INFO_AutomaticHits")}`);
			  cardData.roll.hits += hardenedArmor;
      		}
		}

		if (cardData.damageIsContinuating) cardData.damage.valueBase = cardData.damageOriginalValue;
		cardData.damage.value = cardData.damage.valueBase - cardData.roll.hits;

		//If no Damage, return
		if (cardData.damage.value <= 0) return cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDamage"));

		//Handle continous damage
		if (cardData.damageContinuous && !cardData.damageIsContinuating) {
			cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`);
			let label = `${game.i18n.localize("SR5.TakeOnDamageContinuous")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damageOriginalValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`;
			if (cardData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.incomingPA}`;
			cardData.chatCard.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCard",label);
            cardData.damageResistanceType = "physicalDamage";
			cardData.damageIsContinuating = true;
            //Escape engulf
            cardData.chatCard.buttons.escapeEngulf = SR5_RollMessage.generateChatButton("nonOpposedTest","escapeEngulf", game.i18n.localize("SR5.EscapeEngulfAttempt"));
			return;
		}

		//Handle called Shot specifics
		if (cardData.calledShot?.name){
			if (cardData.originalMessage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "spendNetHits");
			cardData = await SR5_RollTest.handleCalledShotResistanceInfo(cardData, actor);
			if (cardData.calledShot.name === "splittedDamage") {
				if (cardData.splittedDamageTwo) return cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.splittedDamageOne}${game.i18n.localize('SR5.DamageTypeStunShort')} & ${cardData.splittedDamageTwo}${game.i18n.localize('SR5.DamageTypePhysicalShort')}`);
				else return cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.splittedDamageOne}${game.i18n.localize('SR5.DamageTypeStunShort')}`);
			}
		}

		//Normal damage
		if (cardData.damage.value > 0) cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`);		
	}

	static async addSpellInfoToCard(cardData){
		let actionType, label, item;
		if (cardData.itemUuid) item = await fromUuid(cardData.itemUuid);

		//Add Resist Drain chat button
		if (cardData.type === "spell" || (cardData.type === "adeptPower" && cardData.hasDrain)) {
			cardData.chatCard.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);
		}

		//Roll Succeed
		if (cardData.roll.hits > 0) {
			cardData.hits = cardData.roll.hits;
			//Handle Attack spell type
			if (cardData.spellCategory === "combat") {
				if (cardData.test.typeSub === "indirect") {
					actionType = "defenseRangedWeapon";
					label = game.i18n.localize("SR5.Defend");
					cardData.damage.value = cardData.force;
					cardData.incomingPA = -cardData.force;
					cardData.damageResistanceType = "physicalDamage";
				} else if (cardData.test.typeSub === "direct") {
					label = game.i18n.localize("SR5.ResistDirectSpell");
					cardData.damage.value = cardData.roll.hits;
					actionType = "resistanceCard";
					if (cardData.spellType === "mana") cardData.damageResistanceType = "directSpellMana";
					else cardData.damageResistanceType = "directSpellPhysical";
				}
				//Generate Resist spell chat button
				cardData.chatCard.buttons[actionType] = SR5_RollMessage.generateChatButton("opposedTest", actionType, label);
			} else if (cardData.spellResisted) {
				actionType = "resistSpell";
				label = game.i18n.localize("SR5.ResistSpell");
				cardData.chatCard.buttons[actionType] = SR5_RollMessage.generateChatButton("opposedTest", actionType, label);
			} 
			
			//Handle object resistance 
			if (cardData.switch?.objectResistanceTest){
				actionType = "objectResistance";
				label = game.i18n.localize("SR5.ObjectResistanceTest");
				cardData.chatCard.buttons[actionType] = SR5_RollMessage.generateChatButton("nonOpposedTest", actionType, label, {gmAction: true});
			}
			
			//Handle spell Area
			if (cardData.spellRange === "area"){
				cardData.spellArea = cardData.force + (cardData.spellAreaMod || 0);
				if (item.system.category === "detection") {
					if (item.system.spellAreaExtended === true) cardData.spellArea = cardData.force * cardData.actorMagic * 10;
					else cardData.spellArea = cardData.force * cardData.actorMagic;
				}
			}

			//Generate apply effect on Actor chat button
			if (cardData.switch?.transferEffect) cardData.chatCard.buttons.applyEffect = SR5_RollMessage.generateChatButton("opposedTest", "applyEffect", game.i18n.localize("SR5.ApplyEffect"));
			//Generate apply effect on Item chat button
			if (cardData.switch?.transferEffectOnItem) cardData.chatCard.buttons.applyEffectOnItem = SR5_RollMessage.generateChatButton("opposedTest", "applyEffectOnItem", game.i18n.localize("SR5.ApplyEffect"));
		} 
		//Roll failed
		else {
			if (cardData.type === "spell") label = game.i18n.localize("SR5.SpellCastingFailed");
			else if (cardData.type === "adeptPower" || cardData.type === "power") label = game.i18n.localize("SR5.PowerFailure");
			else label = game.i18n.localize("SR5.PreparationCreateFailed");
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", label);
		}
	}

	static async addDrainInfoToCard(cardData) {
		let damageValue = cardData.magic.drain.value - cardData.roll.hits;

		//Drain do damage
		if (damageValue > 0) {
			cardData.damage.value = damageValue;
			//Check if Drain is Stun or Physical
			if (cardData.magic.drain.type) cardData.damage.type = cardData.magic.drain.type;
			else {
				if (cardData.hits > cardData.actorMagic) cardData.damage.type = "physical";
				else cardData.damage.type = "stun";
			}
			//Add drain damage button
			cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])})`);
		} else {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDrain"));
		}

		//Update previous message to remove Drain Resistance button
		let originalMessage, prevData;
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.flags?.sr5data;
		}
		if (prevData?.type !== "ritualResistance") {
			if (!game.user?.isGM) {
				await SR5_SocketHandler.emitForGM("updateChatButton", {
					message: cardData.originalMessage,
					buttonToUpdate: "drainCard",
				});
			} else SR5_RollMessage.updateChatButton(cardData.originalMessage, "drainCard");}
	}

	static async addAccidentInfoToCard(cardData) {
		let damageValue = cardData.accidentValue - cardData.roll.hits;		

		//Accident do damage
		if (damageValue > 0) {
			cardData.damage.value = damageValue;
			cardData.damage.type = "physical";
			//Add Accident damage button
			let label = cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])})`);
			if (cardData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.incomingPA}`;
		} else {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDamage"));
		}
	}

	static async addFadingInfoToCard(cardData){
		let damageValue = cardData.fadingValue - cardData.roll.hits;

		if (damageValue > 0) {
			cardData.damage.value = damageValue;
			//Check if Fading is Stun or Physical
			if (cardData.fadingType) cardData.damage.type = cardData.fadingType;
			else {
				if (cardData.hits > cardData.actorResonance || cardData.fadingType === "physical") cardData.damage.type = "physical";
				else cardData.damage.type = "stun";
			}
			//Add fading damage button
			cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])})`);
		} else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoFading"));

		//Update previous message to remove Fading Resistance button
		let originalMessage, prevData;
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.flags?.sr5data;
		}
		if (prevData.buttons.fadingResistance) {
			if (!game.user?.isGM) {
				await SR5_SocketHandler.emitForGM("updateChatButton", {
					message: cardData.originalMessage,
					buttonToUpdate: "fadingResistance",
				});
			} else SR5_RollMessage.updateChatButton(cardData.originalMessage, "fadingResistance");
		}
	}

	static async addComplexFormInfoToCard(cardData){
		cardData.chatCard.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fadingCard", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);
		
		if (cardData.roll.hits > 0) {
			cardData.hits = cardData.roll.hits;
			cardData.originalActionActor = cardData.speakerId;
			if (cardData.defenseAttribute !== "" && cardData.defenseMatrixAttribute !== "") cardData.chatCard.buttons.complexFormDefense = SR5_RollMessage.generateChatButton("opposedTest", "complexFormDefense", game.i18n.localize("SR5.Defend"));
			else {
				//Generate apply effect on Actor chat button
				if (cardData.switch?.transferEffect) cardData.chatCard.buttons.applyEffect = SR5_RollMessage.generateChatButton("opposedTest", "applyEffect", game.i18n.localize("SR5.ApplyEffect"));
				//Generate apply effect on Item chat button
				if (cardData.switch?.transferEffectOnItem) cardData.chatCard.buttons.applyEffectOnItem = SR5_RollMessage.generateChatButton("opposedTest", "applyEffectOnItem", game.i18n.localize("SR5.ApplyEffect"));
			}
		} else {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.ThreadingFailure"));
		}
	}

	static async addComplexFormDefenseInfoToCard(cardData){
		cardData.netHits = cardData.hits - cardData.roll.hits;

		if (cardData.netHits <= 0) cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));
		else {
			if (cardData.test.typeSub === "resonanceSpike" || cardData.test.typeSub === "derezz"){
				cardData.matrixDamageValue = cardData.netHits;
				cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
			} else {
				if (cardData.switch?.transferEffect) cardData.chatCard.buttons.applyEffect = SR5_RollMessage.generateChatButton("opposedTest", "applyEffect", game.i18n.localize("SR5.ApplyEffect"));
				else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.DefenseFailure"));
			}
		}

		//Update previous message to remove Complexform Defense button
		if (cardData.originalMessage) {
			if (!game.user?.isGM) {
				await SR5_SocketHandler.emitForGM("updateChatButton", {
					message: cardData.originalMessage,
					buttonToUpdate: "complexFormDefense",
				});
			} else SR5_RollMessage.updateChatButton(cardData.originalMessage, "complexFormDefense");
		}
	}

	static async addMatrixActionInfoToCard(cardData, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let actorData = actor.system;
		cardData.originalActionActor = cardData.speakerId;

		//Matrix search special case
		if (cardData.test.typeSub === "matrixSearch"){
			let netHits = cardData.roll.hits - cardData.threshold;
			cardData.matrixSearchDuration = await SR5_DiceHelper.getMatrixSearchDuration(cardData, netHits);
			if (netHits <=0) {
				netHits = 1;
				cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.MatrixSearchFailed"));
			} else {
				cardData.chatCard.buttons.matrixSearchSuccess = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "matrixSearchSuccess", `${game.i18n.localize("SR5.MatrixSearchSuccess")} [${cardData.matrixSearchDuration}]`);
			}
			cardData.title = `${game.i18n.localize("SR5.MatrixActionTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[cardData.test.typeSub])} (${cardData.threshold})`;
			return;
		}

		if (cardData.roll.hits > 0) {
			if (cardData.test.typeSub === "jackOut" && actorData.matrix.isLinkLocked) cardData.chatCard.buttons.jackOut = SR5_RollMessage.generateChatButton("nonOpposedTest", "jackOut", game.i18n.localize("SR5.MatrixActionJackOutResistance"));
			else if (cardData.test.typeSub === "eraseMark") cardData.chatCard.buttons.eraseMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "eraseMark", game.i18n.localize("SR5.ChooseMarkToErase"));
			else if (cardData.test.typeSub === "checkOverwatchScore") cardData.chatCard.buttons.checkOverwatchScore = SR5_RollMessage.generateChatButton("nonOpposedTest", "checkOverwatchScore", game.i18n.localize("SR5.OverwatchResistance"));
			else if (cardData.test.typeSub === "jamSignals") cardData.chatCard.buttons.matrixJamSignals = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixJamSignals", game.i18n.localize("SR5.MatrixActionJamSignals"));
			else cardData.chatCard.buttons.matrixAction = SR5_RollMessage.generateChatButton("opposedTest", "matrixDefense", game.i18n.localize("SR5.Defend"));
		} else {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.ActionFailure"));
		}
	}

	static async addMatrixDefenseInfoToCard(cardData, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			actorData = actor.system,
			attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor),
			attackerData = attacker?.system,
			netHits = cardData.hits - cardData.roll.hits,
			targetItem = await fromUuid(cardData.matrixTargetItemUuid);

		cardData.attackerName = attacker.name;

		//Overwatch button if illegal action
		if (cardData.overwatchScore && cardData.roll.hits > 0) cardData.chatCard.buttons.overwatch = await SR5_RollMessage.generateChatButton("nonOpposedTest", "overwatch", `${game.i18n.format('SR5.IncreaseOverwatch', {name: cardData.attackerName, score: cardData.roll.hits})}`);

		//if defender wins
		if (netHits <= 0) {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));

			if (cardData.matrixActionType === "attack" && netHits < 0) {
				cardData.matrixDamageValue = netHits * -1;
				cardData.chatCard.buttons.defenderDoMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.format('SR5.DoMatrixDamage', {key: cardData.matrixDamageValue, name: cardData.attackerName})}`);
				//If Biofeedback, add damage and button
				if ((actorData.matrix.programs.biofeedback.isActive || actorData.matrix.programs.blackout.isActive)
				  && attackerData.matrix.userMode !== "ar"
				  && (attacker.type === "actorPc" || attacker.type === "actorGrunt")) {
					cardData.damage.valueBase = netHits * -1;
					cardData.damage.value = netHits * -1;
					cardData.damageResistanceType = "biofeedback";
					cardData.damage.type = "stun";
					if ((actorData.matrix.programs.biofeedback.isActive && attackerData.matrix.userMode === "hotSim")) cardData.damage.type = "physical";
					cardData.chatCard.buttons.defenderDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoBiofeedbackDamage", `${game.i18n.format('SR5.DoBiofeedBackDamage', {damage: cardData.matrixDamageValue, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])), name: cardData.attackerName})}`);
				}
			} else if (cardData.matrixActionType === "sleaze") {
        		cardData.mark = 1;
				cardData.chatCard.buttons.defenderPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderPlaceMark", `${game.i18n.format('SR5.DefenderPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.attackerName})}`);
			}
		}

		//if attacker wins
		else {
			switch (cardData.test.typeSub) {
				case "hackOnTheFly":
					cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
					break;
				case "bruteForce":
					cardData.matrixDamageValue = Math.ceil(netHits / 2);
					cardData.matrixResistanceType = "matrixDamage";
					cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
					if (actorData.matrix.deviceType !== "host") cardData.chatCard.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.matrixDamageValue})`);
					break;
				case "dataSpike":
					cardData.matrixResistanceType = "matrixDamage";
					cardData.matrixDamageValueBase = attacker.system.matrix.attributes.attack.value;
					cardData = await SR5_DiceHelper.updateMatrixDamage(cardData, netHits, actor);
					cardData.chatCard.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.matrixDamageValue})`);
					break;
				default:
					cardData.chatCard.buttons.actionEnd = await SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.DefenseFailure"));
			}
		}
	}

	static async addMatrixResistanceInfoToCard(cardData, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			actorData = actor.system,
			attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor),
			attackerData = attacker?.system,
			targetItem;
		
		if (cardData.matrixTargetItemUuid) targetItem = await fromUuid(cardData.matrixTargetItemUuid);
		cardData.matrixDamageValue = cardData.matrixDamageValueBase - cardData.roll.hits;

		if (cardData.matrixDamageValue > 0) {
			cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
			//If Biofeedback, add button	
			if ( attackerData.matrix.programs.biofeedback.isActive
			  || attackerData.matrix.programs.blackout.isActive
			  || (attackerData.matrix.deviceSubType === "iceBlack")
			  || (attackerData.matrix.deviceSubType === "iceBlaster")
			  || (attackerData.matrix.deviceSubType === "iceSparky") ) {
				if (((actor.type === "actorPc" || actor.type === "actorGrunt") && (actorData.matrix.userMode !== "ar") && (targetItem.type === "itemDevice"))
				  || (actor.type === "actorDrone" && actorData.controlMode === "rigging")) {
					cardData.damageResistanceType = "biofeedback";
					cardData.damage.value = cardData.matrixDamageValueBase;
					cardData.damage.type = "stun";
					if ((attackerData.matrix.programs.biofeedback.isActive && actorData.matrix.userMode === "hotSim") || (attackerData.matrix.deviceSubType === "iceBlack")) cardData.damage.type = "physical";
					cardData.chatCard.buttons.attackerDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerDoBiofeedbackDamage", `${game.i18n.localize('SR5.TakeOnDamageBiofeedback')} ${game.i18n.localize('SR5.DamageValueShort')} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`);
				}
			}
			//If Link Lock, add button
			if (attackerData.matrix.programs.lockdown.isActive) cardData.chatCard.buttons.linkLock = SR5_RollMessage.generateChatButton("nonOpposedTest", "linkLock", game.i18n.localize('SR5.MatrixLinkLock'));
		} else {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDamage"));
		}

		//Remove Resist chat button from previous chat message
		let originalMessage, prevData;
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.flags?.sr5data;
			if (prevData.buttons?.matrixResistance) {
				if (!game.user?.isGM) {
					await SR5_SocketHandler.emitForGM("updateChatButton", {
						message: cardData.originalMessage,
						buttonToUpdate: "matrixResistance",
					});
				} else SR5_RollMessage.updateChatButton(cardData.originalMessage, "matrixResistance");
			}
		}
	}

	static async addIceDefenseInfoToCard(cardData, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			actorData = actor.system,
			netHits = cardData.hits - cardData.roll.hits,
			//markedActor = await SR5_EntityHelpers.getRealActorFromID(author._id),
			originalActor = await SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor),
			targetItem = await fromUuid(cardData.matrixTargetItemUuid),
			existingMark = await SR5_DiceHelper.findMarkValue(targetItem.system, originalActor.id);

		cardData.attackerName = originalActor.name;

		if (netHits <= 0) {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));
			if (netHits < 0) {
				cardData.matrixDamageValue = netHits * -1;
				cardData.chatCard.buttons.defenderDoMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.format('SR5.DoMatrixDamage', {key: cardData.matrixDamageValue, name: cardData.attackerName})}`);
			}
		} else {
			cardData.matrixDamageValue = netHits;
			switch(cardData.iceType){
				case "iceAcid":
					if (actorData.matrix.attributes.firewall.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceFirewall"));
					else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceBinder":
					if (actorData.matrix.attributes.dataProcessing.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceDataProcessing"));
					else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceJammer":
					if (actorData.matrix.attributes.attack.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceAttack"));
					else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceMarker":
					if (actorData.matrix.attributes.dataProcessing.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceSleaze"));
					else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceKiller":
				case "iceBlaster":
				case "iceBlack":
				case "iceSparky":
					cardData.matrixResistanceType = "matrixDamage";
					cardData = await SR5_DiceHelper.updateMatrixDamage(cardData, netHits, actor);
					if ((cardData.iceType === "iceBlaster" || cardData.iceType === "iceBlack") && (!actorData.matrix.isLinkLocked)) {
						cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.LinkLockConnection"));
					}
					cardData.chatCard.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${(cardData.matrixDamageValue)})`);
					break;
				case "iceCrash":
					if (existingMark >= 1) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.MatrixActionCrashProgram"));
					break;
				case "icePatrol":
					break;
				case "iceProbe":
					cardData.mark = 1;
					cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
					break;
				case "iceScramble":
					if (existingMark >= 3) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.DeviceReboot"));
					break;
				case "iceTarBaby":
					if (actorData.matrix.isLinkLocked) {
						cardData.mark = 1;
						cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
					} else {
						cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.LinkLockConnection"));
					}
					break;
				case "iceTrack":
					if (existingMark >= 2) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.Geolocated"));
					break;
				default:
					SR5_SystemHelpers.srLog(1, `Unknown '${cardData.iceType}' type in addIceDefenseInfoToCard`);
			}
		}
	}

	static async addPowerDefenseInfoToCard(cardData){
		if (cardData.roll.hits >= cardData.hits) {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
		} else {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.DefenseFailure"));
		}
	}

	static async addResonanceActionInfoToCard(cardData){
		cardData.ownerAuthor = cardData.speakerId;
		cardData.hits = cardData.roll.hits;
		let testType = cardData.hasTarget ? "nonOpposedTest" : "opposedTest";
		
		if (cardData.test.typeSub === "compileSprite"){
			cardData.chatCard.buttons.compileSpriteResist = SR5_RollMessage.generateChatButton("nonOpposedTest", "compileSpriteResist", game.i18n.localize("SR5.SpriteResistance"), {gmAction: true});
		}
		if (cardData.test.typeSub === "decompileSprite"){
			cardData.chatCard.buttons.decompilingResistance = SR5_RollMessage.generateChatButton(testType, "decompilingResistance", game.i18n.localize("SR5.SpriteResistance"), {gmAction: true});
		}
		if (cardData.test.typeSub === "registerSprite"){
			cardData.chatCard.buttons.registeringResistance = SR5_RollMessage.generateChatButton(testType, "registeringResistance", game.i18n.localize("SR5.SpriteResistance"), {gmAction: true});;
		}
		if (cardData.test.typeSub === "killComplexForm" && cardData.targetEffect) {
			let complexForm = await fromUuid(cardData.targetEffect);
			let actor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
			cardData.fadingValue = complexForm.system.fadingValue;
			if (complexForm.system.level > actor.system.specialAttributes.resonance.augmented.value) cardData.fadingType = "physical";
			else cardData.fadingType = "stun";
			cardData.chatCard.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fadingCard", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);

			if (cardData.roll.hits > 0) cardData.chatCard.buttons.killComplexFormResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "killComplexFormResistance", game.i18n.localize("SR5.ComplexFormResistance"), {gmAction: true});
		}
	}

	static async addResistFireInfoToCard(cardData){
		if (cardData.roll.hits < cardData.fireTreshold) {
			cardData.chatCard.buttons.catchFire = SR5_RollMessage.generateChatButton("nonOpposedTest", "catchFire", game.i18n.localize("SR5.CatchFire"));
		} else {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.CatchFireResisted"));
		}
	}

	static async addActionHitInfoToCard(cardData, type){
		let key, label, labelEnd, testType, gmAction = false;
		cardData.hits = cardData.roll.hits;
		cardData.originalActionActor = cardData.speakerId;
		cardData.ownerAuthor = cardData.speakerId;

		switch (type){
			case "activeSensorTargeting":
				label = game.i18n.localize("SR5.SensorDefense");
				labelEnd = game.i18n.localize("SR5.SensorTargetingActiveFailed");
				key = "activeSensorDefense";
				testType = "opposedTest";
				break;
			case "rammingTest":
				label = game.i18n.localize("SR5.Defend");
				labelEnd = game.i18n.localize("SR5.ActionFailure");
				key = "rammingDefense";
				testType = "opposedTest";
				cardData.chatCard.buttons.accidentCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "accidentCard", `${game.i18n.localize("SR5.ResistAccident")} (${cardData.accidentValue})`);
				break;
			case "preparationFormula":
				label = game.i18n.localize("SR5.PreparationResistance");
				labelEnd = game.i18n.localize("SR5.PreparationCreateFailed");
				key = "preparationResist";
				testType = "nonOpposedTest";
				cardData.chatCard.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);
				break;
			case "matrixIceAttack":
				label = game.i18n.localize("SR5.Defend");
				labelEnd = game.i18n.localize("SR5.ActionFailure");
				key = "iceDefense";
				testType = "opposedTest";
				break;
			case "spritePower":
				label = game.i18n.localize("SR5.Defend");
				labelEnd = game.i18n.localize("SR5.PowerFailure");
				key = "complexFormDefense";
				testType = "opposedTest";
				break;
			case "power":
				label = game.i18n.localize("SR5.Defend");
				labelEnd = game.i18n.localize("SR5.PowerFailure");
				key = "powerDefense";
				testType = "opposedTest";
				break;
			case "martialArt":
				label = game.i18n.localize("SR5.Defend");
				labelEnd = game.i18n.localize("SR5.ActionFailure");
				key = "martialArtDefense";
				testType = "opposedTest";
				break;
			case "ritual":
				label = game.i18n.localize("SR5.RitualResistance");
				labelEnd = game.i18n.localize("SR5.RitualFailed");
				key = "ritualResistance";
				testType = "nonOpposedTest";
				break;
			case "passThroughBarrier":
				label = game.i18n.localize("SR5.ManaBarrierResistance");
				labelEnd = game.i18n.localize("SR5.PassThroughBarrierFailed");
				gmAction = true;
				key = "passThroughDefense";
				testType = "nonOpposedTest";
				break;
			case "escapeEngulf":
				label = game.i18n.localize("SR5.SpiritResistance");
				labelEnd = game.i18n.localize("SR5.EscapeEngulfFailed");
				gmAction = true;
				key = "escapeEngulfDefense";
				testType = "nonOpposedTest";
				break;
			default:
		}

		if (cardData.roll.hits > 0) {
			cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton(testType, key, label, gmAction);
		} else {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
		}
	}

	static async addDefenseResultInfoToCard(cardData, type){
		let key, label, labelEnd, successTestType = "nonOpposedTest", failedTestType = "SR-CardButtonHit endTest", failedKey = "";
		let originalMessage, prevData;
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.flags?.sr5data;
		}

		switch (type){
			case "jackOutDefense":
				label = game.i18n.localize("SR5.MatrixActionJackOutSuccess");
				labelEnd = game.i18n.localize("SR5.MatrixActionJackOutFailed");
				key = "jackOutSuccess";
				break;
			case "activeSensorDefense":
				label = game.i18n.localize("SR5.SensorLockedTarget");
				labelEnd = game.i18n.localize("SR5.SuccessfulDefense");
				key = "targetLocked";
				break;
			case "preparationResistance":
				label = game.i18n.localize("SR5.PreparationCreate");
				labelEnd = game.i18n.localize("SR5.PreparationCreateFailed");
				key = "createPreparation";
				break;
			case "compilingResistance":
				label = game.i18n.localize("SR5.CompileSprite");
				labelEnd = game.i18n.localize("SR5.FailedCompiling");
				key = "compileSprite";
				cardData.fadingValue = cardData.roll.hits * 2;
				if (cardData.level > cardData.actorResonance) cardData.fadingType = "physical";
				else cardData.fadingType = "stun";
				if (cardData.fadingValue < 2) cardData.fadingValue = 2;
				cardData.chatCard.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fadingCard", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);
				break;
			case "summoningResistance":
				label = game.i18n.localize("SR5.SummonSpirit");
				labelEnd = game.i18n.localize("SR5.FailedSummon");
				key = "summonSpirit";
				cardData.magic.drain.value = cardData.roll.hits * 2;
				if (cardData.force > cardData.actorMagic) cardData.magic.drain.type = "physical";
				else cardData.magic.drain.type = "stun";
				if (cardData.magic.drain.value < 2) cardData.magic.drain.value = 2;
				cardData.chatCard.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);
				break;
			case "ritualResistance":
				label = game.i18n.localize("SR5.RitualSuccess");
				labelEnd = game.i18n.localize("SR5.RitualFailed");
				cardData.magic.drain.value = cardData.roll.hits * 2;
				if (prevData.test.realHits > prevData.actorMagic) cardData.magic.drain.type = "physical";
				else cardData.magic.drain.type = "stun";
				if (cardData.reagentsSpent > cardData.force) {
					cardData.drainMod = {};
					cardData.drainMod.hits = {
						value: cardData.roll.hits * 2,
						label: game.i18n.localize(SR5.drainModTypes["hits"]),
					};
					cardData.magic.drain.value -= (cardData.reagentsSpent - cardData.force);
					cardData.drainMod.reagents = {
						value: -(cardData.reagentsSpent - cardData.force),
						label: game.i18n.localize(SR5.drainModTypes["reagents"]),
					};
				}
				key = "ritualSealed";
				if (cardData.magic.drain.value < 2) cardData.magic.drain.value = 2;
				cardData.chatCard.buttons.drainCard = SR5_RollMessage.generateChatButton("opposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);

				let item = await fromUuid(cardData.itemUuid);
				if (item.system.durationMultiplier === "netHits"){
					let realActor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
					SR5_DiceHelper.srDicesUpdateItem(cardData, realActor);
				}
				break;
			case "eraseMark":
				label = game.i18n.localize("SR5.MatrixActionEraseMark");
				labelEnd = game.i18n.localize("SR5.MatrixActionEraseMarkFailed");
				key = "eraseMarkSuccess";
				if (prevData.buttons?.eraseMark) {
					if (!game.user?.isGM) {
						await SR5_SocketHandler.emitForGM("updateChatButton", {
							message: cardData.originalMessage,
							buttonToUpdate: "eraseMark",
						});
					} else SR5_RollMessage.updateChatButton(cardData.originalMessage, "eraseMark");
				}
				break;
			case "passThroughDefense":
				label = game.i18n.localize("SR5.PassThroughBarrierSuccess");
				labelEnd = game.i18n.localize("SR5.PassThroughBarrierFailed");
				successTestType = "SR-CardButtonHit endTest";
				if (prevData.buttons?.passThroughDefense) {
					if (!game.user?.isGM) {
						await SR5_SocketHandler.emitForGM("updateChatButton", {
							message: cardData.originalMessage,
							buttonToUpdate: "passThroughDefense",
						});
					} else SR5_RollMessage.updateChatButton(cardData.originalMessage, "passThroughDefense");
				}
				break;
			case "intimidationResistance":
				label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.CS_AS_ExtremeIntimidation")}`;
				labelEnd = game.i18n.localize("SR5.Resisted");
				key = "applyFearEffect";
				if (prevData.buttons?.fear) SR5_RollMessage.updateChatButtonHelper(cardData.originalMessage, "fear");
				break;
			case "ricochetResistance":
				label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.STATUSES_Shaked")}`;
				labelEnd = game.i18n.localize("SR5.Resisted");
				key = "calledShotEffect";
				if (prevData.buttons?.fear) SR5_RollMessage.updateChatButtonHelper(cardData.originalMessage, "fear");
				break;
			case "warningResistance":
				label = `${game.i18n.localize("SR5.ShiftAttitude")}`;
				labelEnd = game.i18n.localize("SR5.Resisted");
				successTestType = "SR-CardButtonHit endTest";
				key = "warningShotEnd";
				if (prevData.buttons?.fear) SR5_RollMessage.updateChatButtonHelper(cardData.originalMessage, "fear");
				break;
			case "stunnedResistance":
				label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.STATUSES_Stunned")}`;
				labelEnd = game.i18n.localize("SR5.Resisted");
				key = "applyStunnedEffect";
				if (prevData.buttons?.stunned) SR5_RollMessage.updateChatButtonHelper(cardData.originalMessage, "stunned");
				break;
			case "buckledResistance":
				label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.STATUSES_Buckled")}`;
				labelEnd = game.i18n.localize("SR5.Resisted");
				key = "calledShotEffect";
				if (prevData.buttons?.buckled) SR5_RollMessage.updateChatButtonHelper(cardData.originalMessage, "buckled");
				break;
			case "nauseousResistance":
				label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.STATUSES_Nauseous")}`;
				labelEnd = game.i18n.localize("SR5.Resisted");
				key = "calledShotEffect";
				if (prevData.buttons?.nauseous) SR5_RollMessage.updateChatButtonHelper(cardData.originalMessage, "nauseous");
				break;
			case "knockdownResistance":
				label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.STATUSES_Knockdown")}`;
				labelEnd = game.i18n.localize("SR5.Resisted");
				key = "calledShotEffect";
				if (prevData.buttons?.knockdown) SR5_RollMessage.updateChatButtonHelper(cardData.originalMessage, "knockdown");
				break;
			case "engulfResistance":
				label = game.i18n.localize("SR5.EscapeEngulfSuccess");
				labelEnd = game.i18n.localize("SR5.EscapeEngulfFailed");
				successTestType = "SR-CardButtonHit endTest";
				if (cardData.roll.hits < cardData.hits) {
					let parentMessage = game.messages.find(m => m.flags.sr5data.buttons.escapeEngulf && m.flags.sr5data.attackerId === cardData.attackerId)
					if (parentMessage) prevData = parentMessage.flags?.sr5data;
					if (prevData.buttons?.escapeEngulf) {
						if (!game.user?.isGM) {
							await SR5_SocketHandler.emitForGM("updateChatButton", {
								message: parentMessage.id,
								buttonToUpdate: "escapeEngulf",
							});
							await SR5_SocketHandler.emitForGM("updateChatButton", {
								message: parentMessage.id,
								buttonToUpdate: "resistanceCard",
							});
						} else {
							SR5_RollMessage.updateChatButton(parentMessage.id, "escapeEngulf");
							SR5_RollMessage.updateChatButton(parentMessage.id, "resistanceCard");
						}
					}
				}
				break;
		}

		if (cardData.roll.hits < cardData.hits) cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton(successTestType, key, label);
		else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton(failedTestType, failedKey, labelEnd);
	}

	static async addOverwatchResistanceInfoToCard(cardData){
		let label;
		let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor);
		let currentOS = attacker.system.matrix.overwatchScore;
		cardData.attackerName = attacker.name;
		
		if (cardData.roll.hits < cardData.hits) label = `${game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreSuccess")} ${currentOS}`;
		else label = game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreFailed");

		cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", label);
	}

	static async addSidekickResistanceInfoToCard(cardData, type){
		let originalMessage = game.messages.get(cardData.originalMessage);
		let newMessage = originalMessage.flags?.sr5data;
        let key, label, labelEnd, buttonToRemove, resistType;
		cardData.netHits = cardData.hits - cardData.roll.hits;

		switch (type){
			case "decompilingResistance":
				key = "reduceTask";
				label = `${game.i18n.localize("SR5.ReduceTask")} (${cardData.netHits})`;
				labelEnd = game.i18n.localize("SR5.ResistDecompilingSuccess");
				buttonToRemove = "decompilingResistance";
				resistType = "fading";
				break;
			case "registeringResistance":
				key = "registerSprite";
				label = game.i18n.localize("SR5.HELP_RegisterButton");
				labelEnd = game.i18n.localize("SR5.RegisteringFailed");
				buttonToRemove = "registeringResistance";
				resistType = "fading";
				break;
			case "bindingResistance":
				key = "bindSpirit";
				label = game.i18n.localize("SR5.BindSpirit");
				labelEnd = game.i18n.localize("SR5.BindingFailed");
				buttonToRemove = "bindingResistance";
				resistType = "drain";
				break;
			case "banishingResistance":
				key = "reduceService";
				label = `${game.i18n.localize("SR5.ReduceService")} (${cardData.netHits})`;
				labelEnd = game.i18n.localize("SR5.BanishingFailed");
				buttonToRemove = "banishingResistance";
				resistType = "drain";
				break;
		}

		if (cardData.roll.hits < cardData.hits) cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton("nonOpposedTest", key, label);
		else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", labelEnd);

		if (cardData.roll.hits > 0){
			if (resistType === "fading"){
				newMessage.fadingValue = cardData.roll.hits;
				if (newMessage.fadingValue < 2) newMessage.fadingValue = 2;
				newMessage.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fadingCard", `${game.i18n.localize("SR5.ResistFading")} (${newMessage.fadingValue})`);
			} else if (resistType === "drain"){
				newMessage.drainValue = cardData.roll.hits;
				if (newMessage.drainValue < 2) newMessage.drainValue = 2;
				newMessage.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${newMessage.drainValue})`);
			}
		}

		await SR5_RollMessage.updateRollCard(cardData.originalMessage, newMessage);
		if (!game.user?.isGM) {
			await SR5_SocketHandler.emitForGM("updateChatButton", {
				message: cardData.originalMessage,
				buttonToUpdate: buttonToRemove,
			});
		} else SR5_RollMessage.updateChatButton(cardData.originalMessage, buttonToRemove);
	}

	static async addResistanceResultInfoToCard(cardData, type){
		let key, label, labelEnd, applyEffect = true, actor, weapon, originalMessage, prevData;
		cardData.netHits = cardData.roll.hits - cardData.hits;
		
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.flags?.sr5data;
		}

		switch (type){
			case "complexFormResistance":
				label = `${game.i18n.localize("SR5.ReduceComplexFormSuccess")} (${cardData.netHits})`;
				labelEnd = game.i18n.localize("SR5.KillComplexFormFailed");
				key = "reduceComplexForm";
				break;
			case "spellResistance":
				label = `${game.i18n.localize("SR5.ReduceSpell")} (${cardData.netHits})`;
				labelEnd = game.i18n.localize("SR5.DispellingFailed");
				key = "reduceSpell";
				break;
			case "enchantmentResistance":
				cardData.magic.drain.value = cardData.roll.hits;
				label = game.i18n.localize("SR5.DesactivateFocus");
				labelEnd = game.i18n.localize("SR5.DisenchantFailed");
				key = "desactivateFocus";
				break;
			case "disjointingResistance":
				cardData.magic.drain.value = cardData.roll.hits;
				label = `${game.i18n.localize("SR5.ReducePreparationPotency")} (${cardData.netHits})`;
				labelEnd = game.i18n.localize("SR5.DisjointingFailed");
				key = "reducePreparationPotency";
				break;
			case "resistSpell":
				cardData.netHits = cardData.hits - cardData.roll.hits;
				label = game.i18n.localize("SR5.ApplyEffect");
				labelEnd = game.i18n.localize("SR5.SpellResisted");
				key = "applyEffectAuto";
				if (!cardData.switch?.transferEffect && !cardData.switch?.transferEffectOnItem) applyEffect = false;
				if (!prevData.spellArea) {
					if (!game.user?.isGM) {
						await SR5_SocketHandler.emitForGM("updateChatButton", {
							message: cardData.originalMessage,
							buttonToUpdate: "resistSpell",
						});
					} else SR5_RollMessage.updateChatButton(cardData.originalMessage, "resistSpell");
				}
				break;
			case "powerDefense":
			case "martialArtDefense":
				cardData.netHits = cardData.hits - cardData.roll.hits;
				if (cardData.switch?.transferEffect){
					label = game.i18n.localize("SR5.ApplyEffect");
					key = "applyEffectAuto";
				} else {
					label = `${game.i18n.localize("SR5.DefenseFailure")}`;
					applyEffect = false;
				}
				labelEnd = game.i18n.localize("SR5.SuccessfulDefense");
				break;
			case "etiquetteResistance":
				break;
			case "weaponResistance":
				labelEnd = game.i18n.localize("SR5.ObjectResistanceSuccess");
				if (cardData.structure > (cardData.hits - cardData.roll.hits)) {
					ui.notifications.info(`${game.i18n.format("SR5.INFO_StructureGreaterThanDV", {structure: cardData.structure, damage: cardData.hits})}`);
				} else {
					actor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
					weapon = actor.items.find(i => i.type === "itemWeapon" && i.system.isActive);
					cardData.targetItem = weapon.uuid;
					if (weapon.system.accuracy.value <= 3 && weapon.system.reach.value === 0){
						applyEffect = false;
						label = `${game.i18n.localize("SR5.NoEffectApplicable")}`;
					}
				}
				break;
			default :
		}

		if (cardData.roll.hits >= cardData.hits) {
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
			//if type is a spell with area effect, create an effect at 0 value on defender to avoir new resistance test inside the canvas template
			if (type === "resistSpell" && prevData.spellArea){
				//add effect "applyEffectAuto"
				if (cardData.netHits < 0) cardData.netHits = 0;
				actor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
				actor.applyExternalEffect(cardData, "customEffects");
			}
		}
		else {
			if (applyEffect) {
				if (type === "weaponResistance"){
					if (weapon.system.accuracy.value > 3) cardData.chatCard.buttons.decreaseAccuracy = SR5_RollMessage.generateChatButton("nonOpposedTest", "decreaseAccuracy", game.i18n.localize("SR5.AccuracyDecrease"));
					if (weapon.system.reach.value > 0) cardData.chatCard.buttons.decreaseReach = SR5_RollMessage.generateChatButton("nonOpposedTest", "decreaseReach", game.i18n.localize("SR5.WeaponReachDecrease"));
				} else cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton("nonOpposedTest", key, label);
			}
			else cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", label);
		}

		if (cardData.magic.drain.value > 0) cardData.chatCard.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);
	}

	static async addObjectResistanceResultInfoToCard(cardData){
		let labelEnd;
		cardData.netHits = cardData.hits - cardData.roll.hits;
		if (cardData.netHits > 0){
			labelEnd = `${game.i18n.localize("SR5.ObjectResistanceFailed")} (${cardData.netHits})`;
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);

			let prevData = cardData.originalMessage?.flags?.sr5data;
			if (prevData?.type === "spell") {
				let item = await fromUuid(prevData.itemUuid);
				let newItem = duplicate(item.system);
			    if (newItem.duration === "sustained") newItem.isActive = true;
    			await item.update({"system": newItem});

				if (!prevData.spellArea) {
					if (!game.user?.isGM) {
						await SR5_SocketHandler.emitForGM("updateChatButton", {
							message: cardData.originalMessage,
							buttonToUpdate: "objectResistance",
						});
					} else SR5_RollMessage.updateChatButton(cardData.originalMessage, "objectResistance");
				}
			}
		} else {
			labelEnd = game.i18n.localize("SR5.ObjectResistanceSuccess");
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
		}
	}

	static async addRegenerationResultInfoToCard(cardData){
		cardData.netHits = cardData.roll.hits + cardData.actorBody;
		cardData.chatCard.buttons.regeneration = SR5_RollMessage.generateChatButton("nonOpposedTest", "regeneration", `${game.i18n.format('SR5.Regenerate', {hits: cardData.netHits})}`);
	}

	static async addHealingInfoToCard(cardData){
		if (cardData.roll.glitchRoll || cardData.roll.criticalGlitchRoll) cardData.extendedIntervalValue = cardData.extendedIntervalValue *2;
		if (cardData.roll.criticalGlitchRoll) {
			let failedDamage = new Roll(`1d3`);
			await failedDamage.evaluate({async: true});
			cardData.damage.value = failedDamage.total;
			cardData.damage.type = cardData.test.typeSub;
			cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.format('SR5.HealButtonFailed', {hits: cardData.damage.value, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.test.typeSub]))})}`);
		}
		if (cardData.roll.hits > 0) cardData.chatCard.buttons.heal = SR5_RollMessage.generateChatButton("nonOpposedTest", "heal", `${game.i18n.format('SR5.HealButton', {hits: cardData.roll.hits, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.test.typeSub]))})}`);
	}

	static async handleCalledShotDefenseInfo(cardData, actorData){
		cardData.calledShotButton = true;
		if (typeof cardData.calledShot.effects === "object") cardData.calledShot.effects = Object.values(cardData.calledShot.effects);

		switch (cardData.calledShot.name){
			case "dirtyTrick":
				if (cardData.calledShot.limitDV === 0) cardData.damage.value = 0;
				else cardData.calledShotButton = false;
				cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				break;
			case "disarm":
				if ((cardData.netHits + cardData.attackerStrength) > actorData.limits.physicalLimit.value) cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.Disarm"));
				else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDisarm"));
				break;
			case "knockdown":
				if ((cardData.netHits + cardData.attackerStrength) > actorData.limits.physicalLimit.value) {
					cardData.calledShot.effects = {"0": {"name": "prone",}};
					cardData.damage.value = 0;				
					cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				} else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
				break;
			case "blastOutOfHand":
				if (cardData.calledShot.limitDV === 0) cardData.damage.value = 0;
				else cardData.calledShotButton = false;
				let mod = cardData.calledShot.effects.find(e => e.name === "blastOutOfHand");
				cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${game.i18n.format('SR5.BlastOutOfHand', {range: cardData.netHits + mod.modFingerPopper})}`);
				break;
			case "feint":
				cardData.calledShotButton = false;
				cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				break;
			case "reversal":
				cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize('SR5.ReversedSituation'));
				break;
			case "onPinsAndNeedles":
				cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				break;
			case "tag":
				cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize('SR5.CS_AS_Tag'));
				break;
			case "throughAndInto":
				let originalAttackMessage = game.messages.get(cardData.originalMessage);
				originalAttackMessage.flags.sr5data.calledShot.name = '';
				originalAttackMessage.flags.sr5data.damageValue -= 1;
				originalAttackMessage.flags.sr5data.damageValueBase -= 1;
				cardData.originalAttackMessage = originalAttackMessage.flags.sr5data;
				cardData.chatCard.buttons.defenseRangedWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseThroughAndInto",game.i18n.localize("SR5.DefendSecondTarget"));
				cardData.calledShotButton = false;
				break;
			default:
				cardData.calledShotButton = false;
		}

		//Handle Called Shots specifics
		if (!cardData.calledShotHitsSpent && cardData.calledShot.limitDV !== 0 && (cardData.calledShot.name === "specificTarget" || cardData.calledShot.name === "upTheAnte") && cardData.targetActorType !== "actorDrone") {
			if (cardData.netHits > 1) {
				cardData.chatCard.buttons.spendNetHits = SR5_RollMessage.generateChatButton("attackerTest", "spendNetHits", `${game.i18n.localize("SR5.SpendHits")} (${cardData.netHits - 1})`);
				cardData.calledShotButton = true;
			} else {
				cardData.calledShotButton = false;
			}
		}

		// Handle Fatigued
		if (cardData.calledShot.effects.length){
			if (cardData.calledShot.effects.find(e => e.name === "fatigued")){
				cardData.damage.valueFatiguedBase = Math.floor(cardData.damage.value/2);
				cardData.chatCard.buttons.fatiguedCard = SR5_RollMessage.generateChatButton("nonOpposedTest","fatiguedCard", `${game.i18n.localize("SR5.TakeOnDamageShort")} (${game.i18n.localize("SR5.STATUSES_Fatigued")}) ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damage.valueFatiguedBase}${game.i18n.localize("SR5.DamageTypeStunShort")}`);
				cardData.calledShotButton = false;
			}
		}

		if (cardData.calledShotHitsSpent) cardData.calledShotButton = false;
		return cardData;
	}

	static async handleCalledShotResistanceInfo(cardData, actor){
		cardData.netHits = cardData.previousHits - cardData.hits; 

		//Handle specific target limit damage if any 
		if (cardData.calledShot.limitDV !== 0) {
			if (cardData.calledShot.limitDV < cardData.damage.value) ui.notifications.info(`${game.i18n.format("SR5.INFO_DVLimitByCalledShot", {value: cardData.calledShot.limitDV})}`);
			cardData.damage.value = Math.min(cardData.damage.value, cardData.calledShot.limitDV);
		}

		switch(cardData.calledShot.name){
			case "flameOn":
				actor.fireDamageEffect(cardData);
				break;
			case "extremeIntimidation":
				cardData.chatCard.buttons.fear = SR5_RollMessage.generateChatButton("nonOpposedTest","fear",`${game.i18n.localize('SR5.Composure')} (${cardData.netHits})`);
				cardData.damage.value = 0;
				break;
			case "warningShot":
				cardData.chatCard.buttons.fear = SR5_RollMessage.generateChatButton("nonOpposedTest","fear",`${game.i18n.localize('SR5.Composure')} (4)`);
				cardData.damage.value = 0;
				break;
			case "ricochetShot":
				cardData.chatCard.buttons.fear = SR5_RollMessage.generateChatButton("nonOpposedTest","fear",`${game.i18n.localize('SR5.Composure')} (2)`);
				cardData.calledShot.effects = {"0":  {"name": "shaked",}};
				break;
			case "bellringer":
				SR5Combat.changeInitInCombat(actor, -10);
				ui.notifications.info(`${actor.name}: ${game.i18n.format("SR5.INFO_Stunned", {initiative: 10})}`)
				cardData.chatCard.buttons.bellringerEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", `${game.i18n.localize("SR5.EffectApplied")} (${game.i18n.localize("SR5.STATUSES_Stunned")})`);
				break;
			case "shakeUp":
				SR5Combat.changeInitInCombat(actor, cardData.calledShot.initiative);			
				ui.notifications.info(`${actor.name}: ${game.i18n.format("SR5.INFO_ShakeUp", {value: cardData.calledShot.initiative})}`);
				cardData.chatCard.buttons.shakeUpEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", `${game.i18n.localize("SR5.EffectApplied")} (${game.i18n.localize("SR5.STATUSES_Shaked")})`);
				break;
			case "pin":
				if (cardData.damage.value > actor.system.itemsProperties.armor.value){
					cardData.calledShot.effects = {
						"0": {
							"name": "pin",
							"initialDV": cardData.damage.value - actor.system.itemsProperties.armor.value,
						}
					};
					cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				}
				break;
			case "dirtyTrick":
				if (cardData.netHits > 0){
					cardData.calledShot.effects = {"0": {"name": "dirtyTrick",}};
					cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				}
				break;
			case "entanglement":
				if (cardData.netHits > 0){
					cardData.calledShot.effects = {
						"0": {
							"name": "entanglement",
							"netHits": cardData.netHits,
						}
					};
					cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect", `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				}
				break;
			case "splittingDamage":
				let originalDamage = cardData.damage.value;
				cardData.splittedDamageOne = Math.ceil(originalDamage/2);
				if (originalDamage > (cardData.armor + cardData.incomingPA)) cardData.splittedDamageTwo = Math.floor(originalDamage/2);				
				break;
		}

		if (cardData.calledShot.effects.length) {		
			let effectsName = [];
			for (let effect of Object.values(cardData.calledShot.effects)) {
				switch (effect.name){
					case "stunned":
					case "buckled":
					case "nauseous":
					case "knockdown":
						cardData.chatCard.buttons[effect.name] = SR5_RollMessage.generateChatButton("nonOpposedTest", effect.name,`${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[effect.name])})}`);
						break;
					default:
						effectsName.push(effect.name);
						let effectsLabel = effectsName.map(e => game.i18n.localize(SR5.calledShotsEffects[e]));
						effectsLabel = effectsLabel.join(", ");
						let applyLabel = (effectsName.length > 1) ? game.i18n.localize("SR5.ApplyEffects") : game.i18n.localize("SR5.ApplyEffect");
						cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect", `${applyLabel}${game.i18n.localize("SR5.Colons")} ${effectsLabel}`);
				}
			}
		}

		return cardData;
	}
}
