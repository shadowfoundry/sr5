import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utility.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_RollMessage } from "./roll-message.js";
import { SR5Combat } from "../system/srcombat.js";
import { SR5_SocketHandler } from "../socket.js";
import SR5_RollDialog from "./roll-dialog.js";

export class SR5_Dice {

	/** Met à jour les infos du ChatMessage
	 * @param {Number} dicePool - Le nombre de dés à lancer
	 * @param {Number} limit - Le nombre maximum de succès
	 * @param {Boolean} explose - Détermine si les 6 explose
	 */
	static srd6({ dicePool, limit, explose, edgeRoll }) {
		let formula = `${dicePool}d6`;
		if (explose) formula += "x6";
		if (limit) formula += `kh${limit}`;
		formula += "cs>=5";

		let roll = new Roll(formula);
		let rollMode = game.settings.get("core", "rollMode");
		let rollRoll = roll.evaluate({async: true});
		let rollJSON = roll.toJSON(rollRoll);
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
			hits: rollJSON.terms[0].total,
			realHits: realHits,
			glitchRoll: glitchRoll,
			criticalGlitchRoll: criticalGlitchRoll,
			dices: rollJSON.terms[0].results,
			limit: limit,
			rollMode: rollMode,
			//r: rollJSON,
			originalRoll: roll
		};

		return rollResult;
	}

	 /** Handle second chance : reroll failed dice and update message with new message
	 * @param {Object} message - ChatMessage data
	 * @param {Object} actor - actor who use edge
	 */
	static async secondeChance(message, actor) {
		let messageData = message.data.flags.sr5data;
		//Re roll failed dices
		let dicePool = messageData.test.dicePool - messageData.test.hits;
		if (dicePool < 0) dicePool = 0;
		let limit = messageData.test.limit - messageData.test.hits;
		if (limit < 0) limit = 0;
		let chance = SR5_Dice.srd6({ dicePool: dicePool, limit: limit, edgeRoll: true,});
		let chanceHit;
		if (chance.hits > limit) chanceHit = limit;
		else chanceHit = chance.hits;
		let dices = messageData.test.dices;
		let dicesKeeped = dices.filter(function (d) {
			return d.result > 4;
		});

		//Met à jour les infos sur le nouveau message avec le résultat du nouveau jet.
		let newMessage = duplicate(messageData);
		newMessage.test.hits = messageData.test.hits + chanceHit;
		newMessage.test.dices = dicesKeeped.concat(chance.dices);
		newMessage.secondeChanceUsed = true;
		newMessage.pushLimitUsed = true;
		await SR5_Dice.srDicesAddInfoToCard(newMessage, actor.id);
		if (newMessage.itemId) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

		//Remove 1 to actor's Edge
		if (messageData.actorType === "actorSpirit"){
			let creator = SR5_EntityHelpers.getRealActorFromID(actor.data.data.creatorId);
			creator.update({ "data.conditionMonitors.edge.actual.base": creator.data.data.conditionMonitors.edge.actual.base + 1 });
		} else actor.update({ "data.conditionMonitors.edge.actual.base": actor.data.data.conditionMonitors.edge.actual.base + 1 });

		//Rafraichi le message avec les nouvelles infos.
		SR5_RollMessage.updateRollCard(message.id, newMessage);
	}

	//Handle extended roll
	static async extendedRoll(message, actor){
		let messageData = message.data.flags.sr5data;
		let dicePool = messageData.test.dicePool - 1;
		let newRoll = SR5_Dice.srd6({ dicePool: dicePool, limit: messageData.test.limit });
		let dices = messageData.test.dices;
		let dicesKeeped = dices.filter(function (d) {
			return d.result > 4;
		});
		let dicesTotal = newRoll.dices.concat(dicesKeeped);

		let newMessage = duplicate(messageData);
		newMessage.test.hits = messageData.test.hits + newRoll.hits;
		newMessage.test.dices = dicesTotal;
		newMessage.dicePool = dicePool;
		newMessage.test.dicePool = dicePool;
		newMessage.extendedRoll += 1;
		await SR5_Dice.srDicesAddInfoToCard(newMessage, actor.id);
		if (newMessage.itemId) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

		SR5_RollMessage.updateRollCard(message.id, newMessage);
	}

	static async pushTheLimit(message, actor) {
		let messageData = message.data.flags.sr5data;
		let dicePool, creator;

		//If roller is a bounder spirit, use actor Edge instead
		if (messageData.actorType === "actorSpirit"){
			creator = SR5_EntityHelpers.getRealActorFromID(actor.data.data.creatorId);
			dicePool = creator.data.data.specialAttributes.edge.augmented.value;
		} else dicePool = actor.data.data.specialAttributes.edge.augmented.value;

		let newRoll = SR5_Dice.srd6({
			dicePool: dicePool,
			explose: true,
			edgeRoll: true,
		});

		let newMessage = duplicate(messageData);
		newMessage.test.hits = messageData.test.hits + newRoll.hits;
		newMessage.test.dices = messageData.test.dices.concat(newRoll.dices);
		newMessage.secondeChanceUsed = true;
		newMessage.pushLimitUsed = true;
		newMessage.dicePoolMod.pushTheLimit = dicePool;
		newMessage.dicePoolModHas = true;
		newMessage.test.dicePool += dicePool;
		await SR5_Dice.srDicesAddInfoToCard(newMessage, actor.id);
		if (newMessage.itemId) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

		//Remove 1 to actor's Edge
		if (messageData.actorType === "actorSpirit"){
			creator.update({ "data.conditionMonitors.edge.actual.base": creator.data.data.conditionMonitors.edge.actual.base + 1 });
		} else actor.update({ "data.conditionMonitors.edge.actual.base": actor.data.data.conditionMonitors.edge.actual.base + 1 });

		//Rafraichi le message avec les nouvelles infos.
		SR5_RollMessage.updateRollCard(message.id, newMessage);
	}

	/** Prepare the roll window
	 * @param {Object} dialogData - Informations for the dialog window
	 * @param {Object} cardData - Informations to add to chatMessage
	 */
	static async prepareRollDialog(dialogData, cardData, edge = false, cancel = true) {
		let actor = SR5_EntityHelpers.getRealActorFromID(dialogData.actorId),
			actorData = actor.data.data,
			template = "systems/sr5/templates/rolls/roll-dialog.html";

		//Handle Edge
		let hasEdge = false;
		let edgeActor = actor;
		if (actorData.specialAttributes?.edge) {
			if (actorData.conditionMonitors.edge.actual.value < actorData.specialAttributes.edge.augmented.value) hasEdge = true;
		}
		if (actor.type === "actorSpirit" && actorData.creatorId){
			let creator = SR5_EntityHelpers.getRealActorFromID(actorData.creatorId);
			if (creator.data.data.conditionMonitors.edge?.actual?.value < creator.data.data.specialAttributes?.edge?.augmented?.value){
				hasEdge = true;
				edgeActor = creator;
			}
		}
		if (dialogData.type === "objectResistance")  hasEdge = false;

		let buttons = {
			roll: {
				label: game.i18n.localize("SR5.RollDice"),
				class: ['test', 'truc'],
				icon: '<i class="fas fa-dice-six"></i>',
				callback: () => (cancel = false),
			},
		}
		if (hasEdge && dialogData.type !== "preparation"){
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
					title: dialogData.title,
					id: "jet",
					content: dlg,
					data: dialogData,
					buttons: buttons,
					default: "roll",
					close: async (html) => {
						if (cancel) {
							if (dialogData.templateRemove) SR5_RollMessage.removeTemplate(null, dialogData.itemId);
							//Remove last cumulative Defense if roll is cancelled.
							if (actor.data.flags?.sr5?.cumulativeDefense){
								let actualDefense = actor.data.flags.sr5.cumulativeDefense -1;
								actor.setFlag("sr5", "cumulativeDefense", (actualDefense));
							}
							return;
						}

						// Push the limits
						if (edge && edgeActor) {
							dialogData.dicePoolMod.edge = edgeActor.data.data.specialAttributes.edge.augmented.value;
							edgeActor.update({
								"data.conditionMonitors.edge.actual.base": edgeActor.data.data.conditionMonitors.edge.actual.base + 1,
							});
						}

						//Verify if reagents are used, if so, remove from actor
						let reagentsSpent = parseInt(html.find('[name="reagentsSpent"]').val());
						if (!isNaN(reagentsSpent)) {
							actor.update({ "data.magic.reagents": actorData.magic.reagents - reagentsSpent});
							dialogData.reagentsSpent = reagentsSpent;
						}

						// Apply modifiers from dialog window
						if (dialogData.extendedTest === true){
							let extendedMultiplier = parseInt(html.find('[name="extendedMultiplier"]').val());
							if (isNaN(extendedMultiplier)) extendedMultiplier = 1;
							dialogData.extendedRoll = 1;
							dialogData.extendedMultiplier = extendedMultiplier;
							dialogData.extendedInterval = html.find('[name="extendedTime"]').val();
							dialogData.title = dialogData.title.replace("Test", game.i18n.localize("SR5.ExtendedTest"));
						}
						if ((dialogData.type === "spell" || dialogData.typeSub === "summoning" || dialogData.type === "preparationFormula") && isNaN(dialogData.force)) {
							ui.notifications.warn(game.i18n.localize("SR5.WARN_NoForce"));
							dialogData.force = actorData.specialAttributes.magic.augmented.value;
						}
						if ((dialogData.type === "complexForm" || dialogData.typeSub === "compileSprite") && isNaN(dialogData.level)) {
							ui.notifications.warn(game.i18n.localize("SR5.WARN_NoLevel"));
							dialogData.level = actorData.specialAttributes.resonance.augmented.value;
						}
						if (dialogData.force || dialogData.switch?.canUseReagents){
							if (dialogData.force) dialogData.limit = dialogData.force;			
							if (!isNaN(reagentsSpent) && dialogData.type !== "ritual") {
								dialogData.limit = reagentsSpent;
								dialogData.limitType = "reagents";
							}
						}
						if (dialogData.level) dialogData.limit = dialogData.level;
						for (let key in dialogData.limitMod){
							dialogData.limit += dialogData.limitMod[key];
							if (dialogData.limitMod[key] !== 0) dialogData.hasLimitMod = true;
						}
						for (let key in dialogData.dicePoolMod){
							dialogData.dicePool += dialogData.dicePoolMod[key];
							if (dialogData.dicePoolMod[key] !== 0) dialogData.dicePoolModHas = true;
						}

						if (dialogData.firedAmmo){
							let actualRecoil = actor.getFlag("sr5", "cumulativeRecoil") || 0;
							actualRecoil += dialogData.firedAmmo;
							actor.setFlag("sr5", "cumulativeRecoil", actualRecoil);
						}
						//Debug DicePool can't be negative
						if (dialogData.dicePool < 0) dialogData.dicePool = 0;

						// Roll dices
						let result = {};
						if (edge) {
							// push the limits
							result = SR5_Dice.srd6({
								dicePool: dialogData.dicePool,
								explose: edge,
							});
							result.pushthelimit = true;
							dialogData.pushLimitUsed = true;
							dialogData.secondeChanceUsed = true;
						} else {
							result = SR5_Dice.srd6({
								dicePool: dialogData.dicePool,
								limit: dialogData.limit,
							});
							result.pushthelimit = false;
						}

						//Add info to chatCard
						cardData = dialogData;
						cardData.test = result;
						if (dialogData.type === "matrixAction" && (dialogData.typeSub === "hackOnTheFly" || dialogData.typeSub === "bruteForce")){
							dialogData.mark = SR5_DiceHelper.calculMark(-dialogData.dicePoolMod.matrixMarkWanted);
						}
						await SR5_Dice.srDicesAddInfoToCard(cardData, dialogData.actorId);

						// Return roll result and card info to chat message.
						await SR5_Dice.renderRollCard(cardData);

						//Update items according to roll
						if (dialogData.itemId) SR5_DiceHelper.srDicesUpdateItem(cardData, actor);

						//Update spirit if spirit aid is used
						if (dialogData.dicePoolMod.spiritAid > 0){
							let spiritItem = await fromUuid(dialogData.spiritAidId);
							let spiritItemData = duplicate(spiritItem.data.data);
        					spiritItemData.services.value -= 1;
        					await spiritItem.update({'data': spiritItemData});
							ui.notifications.info(`${spiritItem.name}: ${game.i18n.format('SR5.INFO_ServicesReduced', {service: 1})}`);
							let spiritActor = game.actors.find(a => a.data.data.creatorItemId === spiritItem.id);
							if (spiritActor){
        						let spiritActorData = duplicate(spiritActor.data.data);
								spiritActorData.services.value -= 1;
								await spiritActor.update({'data': spiritActorData});
							}
						}

						//Update combatant if Active defense or full defense is used.
						if (dialogData.dicePoolMod.defenseFull || (dialogData.activeDefenseMode !== "none")){
							let initModifier = 0;
							if (dialogData.dicePoolMod.defenseFull){
								let fullDefenseEffect = actor.effects.find(e => e.data.origin === "fullDefense");
								let isInFullDefense = (fullDefenseEffect) ? true : false;
								if (!isInFullDefense){
									initModifier += -10;
									SR5_DiceHelper.applyFullDefenseEffect(actor);
								}
							}
							if (dialogData.activeDefenseMode) initModifier += SR5_DiceHelper.convertActiveDefenseToInitModifier(dialogData.activeDefenseMode);
							if (initModifier < 0) SR5Combat.changeInitInCombat(actor, initModifier);
						}
					},
				}).render(true);
			});
		});
	}

	static async renderRollCard(cardData) {
		let actor = await SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
		let actorData = actor.data;
		//Add button to edit result
		if (game.user.isGM) cardData.editResult = true;

		//Handle Edge use
		if (actorData.type === "actorPc") {
			if (actorData.data.conditionMonitors.edge.actual.value >= actorData.data.specialAttributes.edge.augmented.value) {
				cardData.secondeChanceUsed = true;
				cardData.pushLimitUsed = true;
			}
		} else if (actorData.type === "actorSpirit" && actorData.data.creatorId){
			let creator = await SR5_EntityHelpers.getRealActorFromID(actorData.data.creatorId);
			if (creator.data.data.conditionMonitors.edge?.actual?.value >= creator.data.data.specialAttributes?.edge?.augmented?.value){
				cardData.secondeChanceUsed = true;
				cardData.pushLimitUsed = true;
			}
		} else {
			cardData.secondeChanceUsed = true;
			cardData.pushLimitUsed = true;
		}

		if (cardData.type === "objectResistance") {
			cardData.secondeChanceUsed = true;
			cardData.pushLimitUsed = true;
		}

		const templateData = cardData;
		const template = `systems/sr5/templates/rolls/roll-card.html`;
		let html = await renderTemplate(template, templateData);

		//Add chat buttons to chat card
		let newHtml = $(html);
		let divButtons = newHtml.find('[id="srButtonTest"]');
		for (let button in cardData.buttons){
			divButtons.append(`<button class="messageAction ${cardData.buttons[button].testType} ${cardData.buttons[button].gmAction}" data-action="${cardData.buttons[button].testType}" data-type="${cardData.buttons[button].actionType}">${cardData.buttons[button].label}</button>`);
		}
		html = newHtml[0].outerHTML;

		let chatData = {
			roll: cardData.test.r,
			rollMode: cardData.test.rollMode,
			user: game.user.id,
			content: html,
			speaker: {
				actor: cardData.speakerId,
				token: cardData.speakerId,
				alias: cardData.speakerActor,
				originalActionUser: cardData.originalActionUser,
			},
		};

		if (["gmroll", "blindroll"].includes(cardData.test.rollMode))
		chatData["whisper"] = ChatMessage.getWhisperRecipients("GM").map(
			(u) => u.id
		);
		if (cardData.test.rollMode === "blindroll") chatData["blind"] = true;
		else if (cardData.test.rollMode === "selfroll") chatData["whisper"] = [game.user];

		if (cardData.ownerAuthor) chatData.speaker.token = cardData.ownerAuthor;

		let userActive = game.users.get(chatData.user);

		chatData.flags = {
		sr5data: cardData,
		sr5template: template,
		img: cardData.speakerImg,
		css: "SRCustomMessage",
		speakerId: cardData.speakerId,
		originalActionUser: cardData.originalActionUser,
		borderColor: userActive.color,
		};

		console.log(chatData.flags.sr5data);
		//Handle Dice so Nice
		await SR5_Dice.showDiceSoNice(
		cardData.test.originalRoll,
		cardData.test.rollMode
		);

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
					gmList.forEach(gm => gmIDList.push(gm.data._id));
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
		cardData.buttons = {};

		//Handle Extended Test
		if (cardData.extendedTest){
			cardData.extendedIntervalValue = cardData.extendedMultiplier * cardData.extendedRoll;
			if (cardData.dicePool <= 0) cardData.extendedTest = false;
		}

		switch (cardData.type) {
			case "attack":
				await SR5_Dice.addAttackInfoToCard(cardData);
				break;
			case "defenseCard":							
			case "rammingDefense":
				await SR5_Dice.addDefenseInfoToCard(cardData, actorId);
				break;
			case "resistanceCard":
			case "splitted":
				await SR5_Dice.addResistanceInfoToCard(cardData, actorId);
				break;
			case "spell":
			case "preparation":
			case "adeptPower":
				await SR5_Dice.addSpellInfoToCard(cardData);
				break;
			case "activeSensorTargeting":
			case "preparationFormula":
			case "matrixIceAttack":
			case "spritePower":
			case "power":				
			case "martialArt":
			case "ritual":
			case "passThroughBarrier":
			case "escapeEngulf":							
			case "rammingTest":
				if (cardData.isRegeneration) return SR5_Dice.addRegenerationResultInfoToCard(cardData, cardData.type);
				if (cardData.type === "power" && cardData.typeSub !== "powerWithDefense") return;
				await SR5_Dice.addActionHitInfoToCard(cardData, cardData.type);
				break;
			case "drainCard":
				await SR5_Dice.addDrainInfoToCard(cardData);
				break;
			case "accidentCard":
				await SR5_Dice.addAccidentInfoToCard(cardData);
				break;
			case "complexForm":
				await SR5_Dice.addComplexFormInfoToCard(cardData);
				break;
			case "complexFormDefense":
				await SR5_Dice.addComplexFormDefenseInfoToCard(cardData);
				break;
			case "fadingCard":
				await SR5_Dice.addFadingInfoToCard(cardData);
				break;
			case "matrixAction":
				await SR5_Dice.addMatrixActionInfoToCard(cardData, actorId);
				break;
			case "matrixDefense":
				await SR5_Dice.addMatrixDefenseInfoToCard(cardData, actorId);
				break;
			case "matrixResistance":
				await SR5_Dice.addMatrixResistanceInfoToCard(cardData, actorId);
				break;
			case "iceDefense":
				await SR5_Dice.addIceDefenseInfoToCard(cardData, actorId);
				break;
			case "lift":
				cardData.weightTotal = cardData.derivedBaseValue + (cardData.test.hits * cardData.derivedExtraValue);
				break;
			case "movement":
				cardData.movementTotal = cardData.derivedBaseValue + (cardData.test.hits * cardData.derivedExtraValue);
				break;
			case "skill":
			case "skillDicePool":
				await SR5_Dice.addSkillInfoToCard(cardData);
				break;
			case "resonanceAction":
				await SR5_Dice.addResonanceActionInfoToCard(cardData);
				break;
			case "resistFire":
				await SR5_Dice.addResistFireInfoToCard(cardData);
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
				await SR5_Dice.addDefenseResultInfoToCard(cardData, cardData.type);
				break;
			case "overwatchResistance":
				await SR5_Dice.addOverwatchResistanceInfoToCard(cardData);
				break;
			case "registeringResistance":
			case "decompilingResistance":
			case "bindingResistance":
			case "banishingResistance":
				await SR5_Dice.addSidekickResistanceInfoToCard(cardData, cardData.type);
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
				await SR5_Dice.addResistanceResultInfoToCard(cardData, cardData.type);
				break;
			case "objectResistance":
				await SR5_Dice.addObjectResistanceResultInfoToCard(cardData);
				break;
			case "regeneration":
				await SR5_Dice.addRegenerationResultInfoToCard(cardData);
				break;
			case "healing":
				await SR5_Dice.addHealingInfoToCard(cardData);
				break;
			case "attribute":
			case "languageSkill":
            case "knowledgeSkill":
			case "defense":
			case "resistance":
			case "matrixSimpleDefense":
			case "astralTracking":
				break;
			default:
				SR5_SystemHelpers.srLog(1, `Unknown '${cardData.type}' type in srDicesAddInfoToCard`);
		}
	}

	static async addAttackInfoToCard(cardData){
		cardData.damageResistanceType = "physicalDamage";

		if (cardData.typeSub === "grenade") {
			cardData.damageValue = cardData.damageValueBase;
			//Handle scatter
			if (cardData.test.hits < 3) cardData.buttons.scatter = SR5_RollMessage.generateChatButton("nonOpposedTest","scatter",game.i18n.localize("SR5.Scatter"));
			//Handle Grenade Resistant chat button
			let label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`;
			if (cardData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.incomingPA}`;
			if (cardData.damageElement === "toxin") label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.Toxin")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.toxinTypes[cardData.toxin.type])}`;
			cardData.buttons.resistanceCard = SR5_RollMessage.generateChatButton("opposedTest","resistanceCard",label);
		} else if (cardData.test.hits > 0) {
			if (cardData.typeSub === "rangedWeapon") cardData.buttons.defenseRangedWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseRangedWeapon",game.i18n.localize("SR5.Defend"));
			else if (cardData.typeSub === "meleeWeapon") cardData.buttons.defenseMeleeWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseMeleeWeapon",game.i18n.localize("SR5.Defend"));
		} else {
			if (cardData.type === "rammingTest") cardData.buttons.defenseRamming = SR5_RollMessage.generateChatButton("opposedTest","defenseRamming",game.i18n.localize("SR5.Defend"));
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.AttackMissed"));
		}
	}

	static async addDefenseInfoToCard(cardData, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let actorData = actor.data.data;
		cardData.netHits = cardData.hits - cardData.test.hits;

		//Special case for injection ammo, need 3 net hits if armor is weared
		if (cardData.ammoType === "injection" && actor.data.data.itemsProperties.armor.value > 0){
			if (cardData.netHits < 3) {
				cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
				return ui.notifications.info(game.i18n.localize("SR5.INFO_NeedAtLeastThreeNetHits"));
			}
		}

		//If Defenser win, return
		if (cardData.netHits <= 0) {
			if (cardData.calledShot?.name === "throughAndInto") {
				let originalAttackMessage = game.messages.get(cardData.originalMessage);
				originalAttackMessage.data.flags.sr5data.calledShot.name = '';
				cardData.originalAttackMessage = originalAttackMessage.data.flags.sr5data;
				cardData.buttons.defenseRangedWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseThroughAndInto",game.i18n.localize("SR5.DefendSecondTarget"));
			}
			return cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
		}

		//Handle astral combat damage
		if (cardData.typeSub === "astralCombat") cardData.damageResistanceType = "astralDamage";
		else cardData.damageResistanceType = "physicalDamage";

		//If Hardened Armor, check if damage do something
		if ((actorData.specialProperties?.hardenedArmor.value > 0) && (cardData.damageSource !== "spell")) {
			let immunity = actorData.specialProperties.hardenedArmor.value + cardData.incomingPA;
			if (cardData.damageValue + cardData.netHits <= immunity) {
				cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NormalWeaponsImmunity"));
				return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToNormalWeapons", {essence: actorData.essence.value * 2, pa: cardData.incomingPA, damage: cardData.damageValue})}`);
			}
		}

		//Damage value calculation
		if (cardData.firingMode === "SF") cardData.damageValue = cardData.damageValueBase;
		else if (cardData.damageElement === "toxin") {
			if (cardData.toxin.type === "airEngulf") cardData.damageValue = cardData.damageValueBase + cardData.netHits;
			else cardData.damageValue = cardData.damageValueBase;
		} else cardData.damageValue = cardData.damageValueBase + cardData.netHits;
			
		//Handle Called Shot specifics
		if (cardData.calledShot?.name) cardData = await SR5_Dice.handleCalledShotDefenseInfo(cardData, actorData);

		//Add fire threshold
		if (cardData.damageElement === "fire") cardData.fireTreshold = cardData.netHits;

		//Special case for Drone and vehicle
		if (actor.type === "actorDrone" || actor.type === "actorVehicle") {
			if (cardData.damageType === "stun" && cardData.damageElement === "electricity") {
				cardData.damageType = "physical";
				ui.notifications.info(`${game.i18n.localize("SR5.INFO_ElectricityChangeDamage")}`);
			}
			if (cardData.damageType === "stun") {
				cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.VehicleArmorResistance"));
				return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToStunDamage")}`);
			}
			if (actorData.attributes.armor.augmented.value >= cardData.damageValue) {
				cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.VehicleArmorResistance"));
				return ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDV", {armor: actorData.attributes.armor.augmented.value, damage:cardData.damageValue})}`); //
			}
		}

		//Special case for called shots
		if (cardData.calledShot?.name === "breakWeapon") return cardData.buttons.weaponResistance = SR5_RollMessage.generateChatButton("nonOpposedTest","weaponResistance",game.i18n.localize("SR5.WeaponResistance"));
		if (cardData.calledShot?.name === "feint") return;

		//Generate Resistance chat button if not already done by called shot
		if (!cardData.calledShotButton) {
			let label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`;
			if (cardData.damageElement === "toxin" && !cardData.damageType) label = `${game.i18n.localize("SR5.ResistToxin")}`;
			if (cardData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.incomingPA}`;
			cardData.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCard",label);
		}
	}

	static async addResistanceInfoToCard(cardData, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let actorData = actor.data.data;

		//Remove Resist chat button from previous chat message, if necessary
		let originalMessage, prevData;
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.data?.flags?.sr5data;
		}
		if (prevData?.type === "spell" && prevData?.spellRange === "area") ;
		else if (prevData?.typeSub === "grenade") ;
		else if (cardData.damageContinuous && cardData.damageIsContinuating) ;
		else SR5_RollMessage.updateChatButton(cardData.originalMessage, "resistanceCard");
		if (cardData.isFatiguedCard) SR5_RollMessage.updateChatButton(cardData.originalMessage, "fatiguedCard");

		//Remove Biofeedback chat button from previous chat message
		if (cardData.typeSub === "biofeedbackDamage"){
			if (prevData.buttons.attackerDoBiofeedbackDamage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "attackerDoBiofeedbackDamage");
			if (prevData.buttons.defenderDoBiofeedbackDamage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "defenderDoBiofeedbackDamage");
		}

		//Toxin management
		if (cardData.damageElement === "toxin"){
			cardData.damageValue = cardData.damageValueBase - cardData.test.hits;

			//Handle called Shot specifics
			if (cardData.calledShot?.name){
				if (cardData.originalMessage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "spendNetHits");
				cardData = await SR5_Dice.handleCalledShotResistanceInfo(cardData, actor);
			}

			if (cardData.damageValue > 0) {
				//Get Damage info
				let damage = "";
				if (cardData.damageType) damage = `& ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`;
				
				//Get Speed info
				let speed = game.i18n.localize("SR5.ApplyToxinEffectAtTheEndOfTheRound");
				if (cardData.toxin.speed > 0) speed = `${game.i18n.format('SR5.ApplyToxinEffectAtTheEndOfXRound', {round: cardData.toxin.speed})}`;
				
				//If Actor is in combat, adjust speed to display the good round
				let combatant = SR5Combat.getCombatantFromActor(actor);
				if (combatant){
					let speedRound = combatant.combat.round + cardData.toxin.speed;
					speed = `${game.i18n.format('SR5.ApplyToxinEffectAtTheEndOfXRound', {round: speedRound})}`;
				}
				if (cardData.toxin.type === "airEngulf") return cardData.buttons.toxinEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "toxinEffect",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`);
				else return cardData.buttons.toxinEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "toxinEffect",`${game.i18n.localize("SR5.ApplyToxinEffect")} ${damage}<br> ${speed}`);
			}
			else return cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDamage"));
		}

		//Add automatic succes for Hardened Armor.
		if ((actorData.specialProperties?.hardenedArmor.value > 0) && (cardData.damageSource !== "spell")) {
			let hardenedArmor = Math.floor((actorData.specialProperties.hardenedArmor.value + cardData.incomingPA) / 2);
			if (hardenedArmor > 0) {
			  ui.notifications.info(`${game.i18n.localize("SR5.HardenedArmor")}: ${hardenedArmor} ${game.i18n.localize("SR5.INFO_AutomaticHits")}`);
			  cardData.test.hits += hardenedArmor;
      		}
		}

		if (cardData.damageIsContinuating) cardData.damageValueBase = cardData.damageOriginalValue;
		cardData.damageValue = cardData.damageValueBase - cardData.test.hits;

		//If no Damage, return
		if (cardData.damageValue <= 0) return cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDamage"));

		//Handle continous damage
		if (cardData.damageContinuous && !cardData.damageIsContinuating) {
			cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`);
			let label = `${game.i18n.localize("SR5.TakeOnDamageContinuous")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damageOriginalValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`;
			if (cardData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.incomingPA}`;
			cardData.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCard",label);
            cardData.damageResistanceType = "physicalDamage";
			cardData.damageIsContinuating = true;
            //Escape engulf
            cardData.buttons.escapeEngulf = SR5_RollMessage.generateChatButton("nonOpposedTest","escapeEngulf", game.i18n.localize("SR5.EscapeEngulfAttempt"));
			return;
		}

		//Handle called Shot specifics
		if (cardData.calledShot?.name){
			if (cardData.originalMessage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "spendNetHits");
			cardData = await SR5_Dice.handleCalledShotResistanceInfo(cardData, actor);
			if (cardData.calledShot.name === "splittedDamage") {
				if (cardData.splittedDamageTwo) return cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.splittedDamageOne}${game.i18n.localize('SR5.DamageTypeStunShort')} & ${cardData.splittedDamageTwo}${game.i18n.localize('SR5.DamageTypePhysicalShort')}`);
				else return cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.splittedDamageOne}${game.i18n.localize('SR5.DamageTypeStunShort')}`);
			}
		}

		//Normal damage
		if (cardData.damageValue > 0) cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`);		
	}

	static async addSpellInfoToCard(cardData){
		let actionType, label, item;
		if (cardData.itemUuid) item = await fromUuid(cardData.itemUuid);

		//Add Resist Drain chat button
		if (cardData.type === "spell" || (cardData.type === "adeptPower" && cardData.hasDrain)) {
			cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
		}

		//Roll Succeed
		if (cardData.test.hits > 0) {
			cardData.hits = cardData.test.hits;
			//Handle Attack spell type
			if (cardData.spellCategory === "combat") {
				if (cardData.typeSub === "indirect") {
					actionType = "defenseRangedWeapon";
					label = game.i18n.localize("SR5.Defend");
					cardData.damageValue = cardData.force;
					cardData.incomingPA = -cardData.force;
					cardData.damageResistanceType = "physicalDamage";
				} else if (cardData.typeSub === "direct") {
					label = game.i18n.localize("SR5.ResistDirectSpell");
					cardData.damageValue = cardData.test.hits;
					actionType = "resistanceCard";
					if (cardData.spellType === "mana") cardData.damageResistanceType = "directSpellMana";
					else cardData.damageResistanceType = "directSpellPhysical";
				}
				//Generate Resist spell chat button
				cardData.buttons[actionType] = SR5_RollMessage.generateChatButton("opposedTest", actionType, label);
			} else if (cardData.spellResisted) {
				actionType = "resistSpell";
				label = game.i18n.localize("SR5.ResistSpell");
				cardData.buttons[actionType] = SR5_RollMessage.generateChatButton("opposedTest", actionType, label);
			} 
			
			//Handle object resistance 
			if (cardData.switch?.objectResistanceTest){
				actionType = "objectResistance";
				label = game.i18n.localize("SR5.ObjectResistanceTest");
				cardData.buttons[actionType] = SR5_RollMessage.generateChatButton("nonOpposedTest", actionType, label, {gmAction: true});
			}
			
			//Handle spell Area
			if (cardData.spellRange === "area"){
				cardData.spellArea = cardData.force + (cardData.spellAreaMod || 0);
				if (item.data.data.category === "detection") {
					if (item.data.data.spellAreaExtended === true) cardData.spellArea = cardData.force * cardData.actorMagic * 10;
					else cardData.spellArea = cardData.force * cardData.actorMagic;
				}
			}

			//Generate apply effect on Actor chat button
			if (cardData.switch?.transferEffect) cardData.buttons.applyEffect = SR5_RollMessage.generateChatButton("opposedTest", "applyEffect", game.i18n.localize("SR5.ApplyEffect"));
			//Generate apply effect on Item chat button
			if (cardData.switch?.transferEffectOnItem) cardData.buttons.applyEffectOnItem = SR5_RollMessage.generateChatButton("opposedTest", "applyEffectOnItem", game.i18n.localize("SR5.ApplyEffect"));
		} 
		//Roll failed
		else {
			if (cardData.type === "spell") label = game.i18n.localize("SR5.SpellCastingFailed");
			else if (cardData.type === "adeptPower") label = game.i18n.localize("SR5.PowerFailure");
			else label = game.i18n.localize("SR5.PreparationCreateFailed");
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", label);
		}
	}

	static async addDrainInfoToCard(cardData) {
		let damageValue = cardData.drainValue - cardData.test.hits;

		//Drain do damage
		if (damageValue > 0) {
			cardData.damageValue = damageValue;
			//Check if Drain is Stun or Physical
			if (cardData.drainType) cardData.damageType = cardData.drainType;
			else {
				if (cardData.hits > cardData.actorMagic) cardData.damageType = "physical";
				else cardData.damageType = "stun";
			}
			//Add drain damage button
			cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])})`);
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDrain"));
		}

		//Update previous message to remove Drain Resistance button
		let originalMessage, prevData;
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.data?.flags?.sr5data;
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
		let damageValue = cardData.accidentValue - cardData.test.hits;		

		//Accident do damage
		if (damageValue > 0) {
			cardData.damageValue = damageValue;
			cardData.damageType = "physical";
			//Add Accident damage button
			let label = cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])})`);
			if (cardData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.incomingPA}`;
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDamage"));
		}
	}

	static async addFadingInfoToCard(cardData){
		let damageValue = cardData.fadingValue - cardData.test.hits;

		if (damageValue > 0) {
			cardData.damageValue = damageValue;
			//Check if Fading is Stun or Physical
			if (cardData.fadingType) cardData.damageType = cardData.fadingType;
			else {
				if (cardData.hits > cardData.actorResonance || cardData.fadingType === "physical") cardData.damageType = "physical";
				else cardData.damageType = "stun";
			}
			//Add fading damage button
			cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])})`);
		} else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoFading"));

		//Update previous message to remove Fading Resistance button
		let originalMessage, prevData;
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.data?.flags?.sr5data;
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
		cardData.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fadingCard", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);
		
		if (cardData.test.hits > 0) {
			cardData.hits = cardData.test.hits;
			cardData.originalActionActor = cardData.speakerId;
			if (cardData.defenseAttribute !== "" && cardData.defenseMatrixAttribute !== "") cardData.buttons.complexFormDefense = SR5_RollMessage.generateChatButton("opposedTest", "complexFormDefense", game.i18n.localize("SR5.Defend"));
			else {
				//Generate apply effect on Actor chat button
				if (cardData.switch?.transferEffect) cardData.buttons.applyEffect = SR5_RollMessage.generateChatButton("opposedTest", "applyEffect", game.i18n.localize("SR5.ApplyEffect"));
				//Generate apply effect on Item chat button
				if (cardData.switch?.transferEffectOnItem) cardData.buttons.applyEffectOnItem = SR5_RollMessage.generateChatButton("opposedTest", "applyEffectOnItem", game.i18n.localize("SR5.ApplyEffect"));
			}
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.ThreadingFailure"));
		}
	}

	static async addComplexFormDefenseInfoToCard(cardData){
		cardData.netHits = cardData.hits - cardData.test.hits;

		if (cardData.netHits <= 0) cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));
		else {
			if (cardData.typeSub === "resonanceSpike" || cardData.typeSub === "derezz"){
				cardData.matrixDamageValue = cardData.netHits;
				cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
			} else {
				if (cardData.switch?.transferEffect) cardData.buttons.applyEffect = SR5_RollMessage.generateChatButton("opposedTest", "applyEffect", game.i18n.localize("SR5.ApplyEffect"));
				else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.DefenseFailure"));
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
		let actorData = actor.data.data;
		cardData.originalActionActor = cardData.speakerId;

		//Matrix search special case
		if (cardData.typeSub === "matrixSearch"){
			let netHits = cardData.test.hits - cardData.threshold;
			cardData.matrixSearchDuration = await SR5_DiceHelper.getMatrixSearchDuration(cardData, netHits);
			if (netHits <=0) {
				netHits = 1;
				cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.MatrixSearchFailed"));
			} else {
				cardData.buttons.matrixSearchSuccess = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "matrixSearchSuccess", `${game.i18n.localize("SR5.MatrixSearchSuccess")} [${cardData.matrixSearchDuration}]`);
			}
			cardData.title = `${game.i18n.localize("SR5.MatrixActionTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[cardData.typeSub])} (${cardData.threshold})`;
			return;
		}

		if (cardData.test.hits > 0) {
			if (cardData.typeSub === "jackOut" && actorData.matrix.isLinkLocked) cardData.buttons.jackOut = SR5_RollMessage.generateChatButton("nonOpposedTest", "jackOut", game.i18n.localize("SR5.MatrixActionJackOutResistance"));
			else if (cardData.typeSub === "eraseMark") cardData.buttons.eraseMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "eraseMark", game.i18n.localize("SR5.ChooseMarkToErase"));
			else if (cardData.typeSub === "checkOverwatchScore") cardData.buttons.checkOverwatchScore = SR5_RollMessage.generateChatButton("nonOpposedTest", "checkOverwatchScore", game.i18n.localize("SR5.OverwatchResistance"));
			else if (cardData.typeSub === "jamSignals") cardData.buttons.matrixJamSignals = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixJamSignals", game.i18n.localize("SR5.MatrixActionJamSignals"));
			else cardData.buttons.matrixAction = SR5_RollMessage.generateChatButton("opposedTest", "matrixDefense", game.i18n.localize("SR5.Defend"));
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.ActionFailure"));
		}
	}

	static async addMatrixDefenseInfoToCard(cardData, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			actorData = actor.data.data,
			attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor),
			attackerData = attacker?.data.data,
			netHits = cardData.hits - cardData.test.hits,
			targetItem = await fromUuid(cardData.matrixTargetItemUuid);

		cardData.attackerName = attacker.name;

		//Overwatch button if illegal action
		if (cardData.overwatchScore && cardData.test.hits > 0) cardData.buttons.overwatch = await SR5_RollMessage.generateChatButton("nonOpposedTest", "overwatch", `${game.i18n.format('SR5.IncreaseOverwatch', {name: cardData.attackerName, score: cardData.test.hits})}`);

		//if defender wins
		if (netHits <= 0) {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));

			if (cardData.matrixActionType === "attack" && netHits < 0) {
				cardData.matrixDamageValue = netHits * -1;
				cardData.buttons.defenderDoMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.format('SR5.DoMatrixDamage', {key: cardData.matrixDamageValue, name: cardData.attackerName})}`);
				//If Biofeedback, add damage and button
				if ((actorData.matrix.programs.biofeedback.isActive || actorData.matrix.programs.blackout.isActive)
				  && attackerData.matrix.userMode !== "ar"
				  && (attacker.data.type === "actorPc" || attacker.data.type === "actorGrunt")) {
					cardData.damageValueBase = netHits * -1;
					cardData.damageValue = netHits * -1;
					cardData.damageResistanceType = "biofeedback";
					cardData.damageType = "stun";
					if ((actorData.matrix.programs.biofeedback.isActive && attackerData.matrix.userMode === "hotSim")) cardData.damageType = "physical";
					cardData.buttons.defenderDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoBiofeedbackDamage", `${game.i18n.format('SR5.DoBiofeedBackDamage', {damage: cardData.matrixDamageValue, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.damageType])), name: cardData.attackerName})}`);
				}
			} else if (cardData.matrixActionType === "sleaze") {
        		cardData.mark = 1;
				cardData.buttons.defenderPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderPlaceMark", `${game.i18n.format('SR5.DefenderPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.attackerName})}`);
			}
		}

		//if attacker wins
		else {
			switch (cardData.typeSub) {
				case "hackOnTheFly":
					cardData.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
					break;
				case "bruteForce":
					cardData.matrixDamageValue = Math.ceil(netHits / 2);
					cardData.matrixResistanceType = "matrixDamage";
					cardData.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
					if (actorData.matrix.deviceType !== "host") cardData.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.matrixDamageValue})`);
					break;
				case "dataSpike":
					cardData.matrixResistanceType = "matrixDamage";
					cardData.matrixDamageValueBase = attacker.data.data.matrix.attributes.attack.value;
					cardData = await SR5_DiceHelper.updateMatrixDamage(cardData, netHits, actor);
					cardData.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.matrixDamageValue})`);
					break;
				default:
					cardData.buttons.actionEnd = await SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.DefenseFailure"));
			}
		}
	}

	static async addMatrixResistanceInfoToCard(cardData, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			actorData = actor.data.data,
			attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor),
			attackerData = attacker?.data.data,
			targetItem;
		
		if (cardData.matrixTargetItemUuid) targetItem = await fromUuid(cardData.matrixTargetItemUuid);
		cardData.matrixDamageValue = cardData.matrixDamageValueBase - cardData.test.hits;

		if (cardData.matrixDamageValue > 0) {
			cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
			//If Biofeedback, add button	
			if ( attackerData.matrix.programs.biofeedback.isActive
			  || attackerData.matrix.programs.blackout.isActive
			  || (attackerData.matrix.deviceSubType === "iceBlack")
			  || (attackerData.matrix.deviceSubType === "iceBlaster")
			  || (attackerData.matrix.deviceSubType === "iceSparky") ) {
				if (((actor.type === "actorPc" || actor.type === "actorGrunt") && (actorData.matrix.userMode !== "ar") && (targetItem.type === "itemDevice"))
				  || (actor.type === "actorDrone" && actorData.controlMode === "rigging")) {
					cardData.damageResistanceType = "biofeedback";
					cardData.damageValue = cardData.matrixDamageValueBase;
					cardData.damageType = "stun";
					if ((attackerData.matrix.programs.biofeedback.isActive && actorData.matrix.userMode === "hotSim") || (attackerData.matrix.deviceSubType === "iceBlack")) cardData.damageType = "physical";
					cardData.buttons.attackerDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerDoBiofeedbackDamage", `${game.i18n.localize('SR5.TakeOnDamageBiofeedback')} ${game.i18n.localize('SR5.DamageValueShort')} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`);
				}
			}
			//If Link Lock, add button
			if (attackerData.matrix.programs.lockdown.isActive) cardData.buttons.linkLock = SR5_RollMessage.generateChatButton("nonOpposedTest", "linkLock", game.i18n.localize('SR5.MatrixLinkLock'));
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDamage"));
		}

		//Remove Resist chat button from previous chat message
		let originalMessage, prevData;
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.data?.flags?.sr5data;
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
			actorData = actor.data.data,
			netHits = cardData.hits - cardData.test.hits,
			//markedActor = await SR5_EntityHelpers.getRealActorFromID(author._id),
			originalActor = await SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor),
			targetItem = await fromUuid(cardData.matrixTargetItemUuid),
			existingMark = await SR5_DiceHelper.findMarkValue(targetItem.data.data, originalActor.id);

		cardData.attackerName = originalActor.name;

		if (netHits <= 0) {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));
			if (netHits < 0) {
				cardData.matrixDamageValue = netHits * -1;
				cardData.buttons.defenderDoMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.format('SR5.DoMatrixDamage', {key: cardData.matrixDamageValue, name: cardData.attackerName})}`);
			}
		} else {
			cardData.matrixDamageValue = netHits;
			switch(cardData.iceType){
				case "iceAcid":
					if (actorData.matrix.attributes.firewall.value > 0) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceFirewall"));
					else cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceBinder":
					if (actorData.matrix.attributes.dataProcessing.value > 0) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceDataProcessing"));
					else cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceJammer":
					if (actorData.matrix.attributes.attack.value > 0) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceAttack"));
					else cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceMarker":
					if (actorData.matrix.attributes.dataProcessing.value > 0) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceSleaze"));
					else cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceKiller":
				case "iceBlaster":
				case "iceBlack":
				case "iceSparky":
					cardData.matrixResistanceType = "matrixDamage";
					cardData = await SR5_DiceHelper.updateMatrixDamage(cardData, netHits, actor);
					if ((cardData.iceType === "iceBlaster" || cardData.iceType === "iceBlack") && (!actorData.matrix.isLinkLocked)) {
						cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.LinkLockConnection"));
					}
					cardData.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${(cardData.matrixDamageValue)})`);
					break;
				case "iceCrash":
					if (existingMark >= 1) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.MatrixActionCrashProgram"));
					break;
				case "icePatrol":
					break;
				case "iceProbe":
					cardData.mark = 1;
					cardData.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
					break;
				case "iceScramble":
					if (existingMark >= 3) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.DeviceReboot"));
					break;
				case "iceTarBaby":
					if (actorData.matrix.isLinkLocked) {
						cardData.mark = 1;
						cardData.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
					} else {
						cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.LinkLockConnection"));
					}
					break;
				case "iceTrack":
					if (existingMark >= 2) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.Geolocated"));
					break;
				default:
					SR5_SystemHelpers.srLog(1, `Unknown '${cardData.iceType}' type in addIceDefenseInfoToCard`);
			}
		}
	}

	static async addSkillInfoToCard(cardData){
		let itemTarget, testType;
		let actor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
		let actorData = actor.data.data;
		cardData.ownerAuthor = cardData.speakerId;
		cardData.hits = cardData.test.hits;

		if (cardData.hasTarget) testType = "nonOpposedTest";
		else testType = "opposedTest";

		if (cardData.targetEffect) itemTarget = await fromUuid(cardData.targetEffect);

		switch (cardData.typeSub){
			case "summoning":
				cardData.buttons.summoningResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "summoningResistance", game.i18n.localize("SR5.SpiritResistance"), {gmAction: true});
				break;
			case "binding":
				cardData.buttons.bindingResistance = SR5_RollMessage.generateChatButton(testType, "bindingResistance", game.i18n.localize("SR5.SpiritResistance"), {gmAction: true});
				break;
			case "banishing":
				cardData.buttons.banishingResistance = SR5_RollMessage.generateChatButton(testType, "banishingResistance", game.i18n.localize("SR5.SpiritResistance"), {gmAction: true});
				break;
			case "counterspelling":
				if (cardData.targetEffect){
					//Get Drain value
					cardData.drainValue = itemTarget.data.data.drainValue.value;
					if (itemTarget.data.data.force > actorData.specialAttributes.magic.augmented.value) cardData.drainType = "physical";
					else cardData.drainType = "stun";
					//Add buttons to chat
					cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
					if (cardData.test.hits > 0) cardData.buttons.dispellResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "dispellResistance", game.i18n.localize("SR5.SpellResistance"), {gmAction: true});
				}
				break;
			case "disenchanting":
				if (cardData.targetEffect){
					if (itemTarget.type === "itemPreparation"){
						cardData.drainValue = itemTarget.data.data.drainValue.value;
						if (cardData.test.hits > actorData.specialAttributes.magic.augmented.value) cardData.drainType = "physical";
						else cardData.drainType = "stun";
						cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
					}
					if (cardData.test.hits > 0) {
						if (itemTarget.type === "itemFocus") cardData.buttons.enchantmentResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "enchantmentResistance", game.i18n.localize("SR5.EnchantmentResistance"), {gmAction: true});
						if (itemTarget.type === "itemPreparation") cardData.buttons.disjointingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "disjointingResistance", game.i18n.localize("SR5.DisjointingResistance"), {gmAction: true});
					}
				}
				break;
			case "astralCombat":
				if (cardData.test.hits > 0) cardData.buttons.defenseAstralCombat = SR5_RollMessage.generateChatButton("opposedTest","defenseAstralCombat",game.i18n.localize("SR5.Defend"));
				break;
			case "firstAid":
				if (cardData.test.criticalGlitchRoll) {
					let failedDamage = new Roll(`1d3`);
					await failedDamage.evaluate({async: true});
					cardData.damageValue = failedDamage.total;
					cardData.damageType = await SR5_DiceHelper.chooseDamageType();
					if (cardData.hasTarget) cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.format('SR5.HealButtonFailed', {hits: cardData.damageValue, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.damageType]))})}`);
					else cardData.buttons.damage = SR5_RollMessage.generateChatButton("opposedTest", "damage", `${game.i18n.format('SR5.HealButtonFailed', {hits: cardData.damageValue, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.damageType]))})}`);
				} else if (cardData.test.hits > 2) {
					cardData.healValue = cardData.test.hits - 2;
					if (cardData.healValue > actorData.skills.firstAid.rating.value) cardData.healValue = actorData.skills.firstAid.rating.value;
					if (cardData.hasTarget) cardData.buttons.firstAid = SR5_RollMessage.generateChatButton("nonOpposedTest", "firstAid", `${game.i18n.format('SR5.FirstAidButton', {hits: cardData.healValue})}`);
					else cardData.buttons.firstAid = SR5_RollMessage.generateChatButton("opposedTest", "firstAid", `${game.i18n.format('SR5.FirstAidButton', {hits: cardData.healValue})}`);
				}
				break;
			case "escapeArtist":
				if (cardData.test.hits >= cardData.threshold){
					cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.EscapeArtistSuccess"));
				} else {
					cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.EscapeArtistFailed"));
				}
				break;
			case "perception":
				if (cardData.opposedSkillTest){
					if (cardData.test.hits >= cardData.opposedSkillThreshold) cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
					else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.FailedDefense"));
				} else {
					if (cardData.perceptionType === "sight" && canvas.scene) cardData.dicePoolMod.environmentalSceneMod = SR5_DiceHelper.handleEnvironmentalModifiers(game.scenes.active, actorData, true);
					if (cardData.perceptionThreshold > 0){
						if (cardData.test.hits >= cardData.perceptionThreshold) cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.PerceptionSuccess"));
						else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.PerceptionFailed"));
					}
				}
				break;
			case "con":
			case "impersonation":
			case "etiquette":
			case "negociation":
			case "intimidation":
			case "performance":
			case "leadership":
				if (cardData.opposedSkillTest){
					if (cardData.test.hits >= cardData.opposedSkillThreshold) cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
					else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.FailedDefense"));
				} else {
					if (cardData.test.hits > 0) cardData.buttons.con = SR5_RollMessage.generateChatButton("opposedTest", cardData.typeSub, game.i18n.localize("SR5.Resist"));
					cardData.opposedSkillTest = true;
					cardData.opposedSkillTestType = cardData.typeSub;
				}
				break;
			default:
		}
	}

	static async addPowerDefenseInfoToCard(cardData){
		if (cardData.test.hits >= cardData.hits) {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.DefenseFailure"));
		}
	}

	static async addResonanceActionInfoToCard(cardData){
		cardData.ownerAuthor = cardData.speakerId;
		cardData.hits = cardData.test.hits;
		let testType = cardData.hasTarget ? "nonOpposedTest" : "opposedTest";
		
		if (cardData.typeSub === "compileSprite"){
			cardData.buttons.compileSpriteResist = SR5_RollMessage.generateChatButton("nonOpposedTest", "compileSpriteResist", game.i18n.localize("SR5.SpriteResistance"), {gmAction: true});
		}
		if (cardData.typeSub === "decompileSprite"){
			cardData.buttons.decompilingResistance = SR5_RollMessage.generateChatButton(testType, "decompilingResistance", game.i18n.localize("SR5.SpriteResistance"), {gmAction: true});
		}
		if (cardData.typeSub === "registerSprite"){
			cardData.buttons.registeringResistance = SR5_RollMessage.generateChatButton(testType, "registeringResistance", game.i18n.localize("SR5.SpriteResistance"), {gmAction: true});;
		}
		if (cardData.typeSub === "killComplexForm" && cardData.targetEffect) {
			let complexForm = await fromUuid(cardData.targetEffect);
			let actor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
			cardData.fadingValue = complexForm.data.data.fadingValue;
			if (complexForm.data.data.level > actor.data.data.specialAttributes.resonance.augmented.value) cardData.fadingType = "physical";
			else cardData.fadingType = "stun";
			cardData.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fadingCard", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);

			if (cardData.test.hits > 0) cardData.buttons.killComplexFormResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "killComplexFormResistance", game.i18n.localize("SR5.ComplexFormResistance"), {gmAction: true});
		}
	}

	static async addResistFireInfoToCard(cardData){
		if (cardData.test.hits < cardData.fireTreshold) {
			cardData.buttons.catchFire = SR5_RollMessage.generateChatButton("nonOpposedTest", "catchFire", game.i18n.localize("SR5.CatchFire"));
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.CatchFireResisted"));
		}
	}

	static async addActionHitInfoToCard(cardData, type){
		let key, label, labelEnd, testType, gmAction = false;
		cardData.hits = cardData.test.hits;
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
				cardData.buttons.accidentCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "accidentCard", `${game.i18n.localize("SR5.ResistAccident")} (${cardData.accidentValue})`);
				break;
			case "preparationFormula":
				label = game.i18n.localize("SR5.PreparationResistance");
				labelEnd = game.i18n.localize("SR5.PreparationCreateFailed");
				key = "preparationResist";
				testType = "nonOpposedTest";
				cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
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

		if (cardData.test.hits > 0) {
			cardData.buttons[key] = SR5_RollMessage.generateChatButton(testType, key, label, gmAction);
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
		}
	}

	static async addDefenseResultInfoToCard(cardData, type){
		let key, label, labelEnd, successTestType = "nonOpposedTest", failedTestType = "SR-CardButtonHit endTest", failedKey = "";
		let originalMessage, prevData;
		if (cardData.originalMessage){
			originalMessage = game.messages.get(cardData.originalMessage);
			prevData = originalMessage.data?.flags?.sr5data;
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
				cardData.fadingValue = cardData.test.hits * 2;
				if (cardData.level > cardData.actorResonance) cardData.fadingType = "physical";
				else cardData.fadingType = "stun";
				if (cardData.fadingValue < 2) cardData.fadingValue = 2;
				cardData.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fadingCard", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);
				break;
			case "summoningResistance":
				label = game.i18n.localize("SR5.SummonSpirit");
				labelEnd = game.i18n.localize("SR5.FailedSummon");
				key = "summonSpirit";
				cardData.drainValue = cardData.test.hits * 2;
				if (cardData.force > cardData.actorMagic) cardData.drainType = "physical";
				else cardData.drainType = "stun";
				if (cardData.drainValue < 2) cardData.drainValue = 2;
				cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
				break;
			case "ritualResistance":
				label = game.i18n.localize("SR5.RitualSuccess");
				labelEnd = game.i18n.localize("SR5.RitualFailed");
				cardData.drainValue = cardData.test.hits * 2;
				if (prevData.test.realHits > prevData.actorMagic) cardData.drainType = "physical";
				else cardData.drainType = "stun";
				if (cardData.reagentsSpent > cardData.force) {
					cardData.drainMod = {};
					cardData.drainMod.hits = cardData.test.hits * 2;
					cardData.drainValue -= (cardData.reagentsSpent - cardData.force);
					cardData.drainMod.reagents = -(cardData.reagentsSpent - cardData.force);
				}
				key = "ritualSealed";
				if (cardData.drainValue < 2) cardData.drainValue = 2;
				cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("opposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);

				let item = await fromUuid(cardData.itemUuid);
				if (item.data.data.durationMultiplier === "netHits"){
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
				if (cardData.test.hits < cardData.hits) {
					let parentMessage = game.messages.find(m => m.data.flags.sr5data.buttons.escapeEngulf && m.data.flags.sr5data.attackerId === cardData.attackerId)
					if (parentMessage) prevData = parentMessage.data?.flags?.sr5data;
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

		if (cardData.test.hits < cardData.hits) cardData.buttons[key] = SR5_RollMessage.generateChatButton(successTestType, key, label);
		else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton(failedTestType, failedKey, labelEnd);
	}

	static async addOverwatchResistanceInfoToCard(cardData){
		let label;
		let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor);
		let currentOS = attacker.data.data.matrix.overwatchScore;
		cardData.attackerName = attacker.name;
		
		if (cardData.test.hits < cardData.hits) label = `${game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreSuccess")} ${currentOS}`;
		else label = game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreFailed");

		cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", label);
	}

	static async addSidekickResistanceInfoToCard(cardData, type){
		let originalMessage = game.messages.get(cardData.originalMessage);
		let newMessage = originalMessage.data?.flags?.sr5data;
        let key, label, labelEnd, buttonToRemove, resistType;
		cardData.netHits = cardData.hits - cardData.test.hits;

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

		if (cardData.test.hits < cardData.hits) cardData.buttons[key] = SR5_RollMessage.generateChatButton("nonOpposedTest", key, label);
		else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", labelEnd);

		if (cardData.test.hits > 0){
			if (resistType === "fading"){
				newMessage.fadingValue = cardData.test.hits;
				if (newMessage.fadingValue < 2) newMessage.fadingValue = 2;
				newMessage.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fadingCard", `${game.i18n.localize("SR5.ResistFading")} (${newMessage.fadingValue})`);
			} else if (resistType === "drain"){
				newMessage.drainValue = cardData.test.hits;
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
		let key, label, labelEnd, applyEffect = true, actor, weapon;
		cardData.netHits = cardData.test.hits - cardData.hits;

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
				cardData.drainValue = cardData.test.hits;
				label = game.i18n.localize("SR5.DesactivateFocus");
				labelEnd = game.i18n.localize("SR5.DisenchantFailed");
				key = "desactivateFocus";
				break;
			case "disjointingResistance":
				cardData.drainValue = cardData.test.hits;
				label = `${game.i18n.localize("SR5.ReducePreparationPotency")} (${cardData.netHits})`;
				labelEnd = game.i18n.localize("SR5.DisjointingFailed");
				key = "reducePreparationPotency";
				break;
			case "resistSpell":
				cardData.netHits = cardData.hits - cardData.test.hits;
				label = game.i18n.localize("SR5.ApplyEffect");
				labelEnd = game.i18n.localize("SR5.SpellResisted");
				key = "applyEffectAuto";
				if (!cardData.switch?.transferEffect && !cardData.switch?.transferEffectOnItem) applyEffect = false;
				if (!cardData.originalMessage?.flags?.sr5data?.spellArea) {
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
				cardData.netHits = cardData.hits - cardData.test.hits;
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
				if (cardData.structure > (cardData.hits - cardData.test.hits)) {
					ui.notifications.info(`${game.i18n.format("SR5.INFO_StructureGreaterThanDV", {structure: cardData.structure, damage: cardData.hits})}`);
				} else {
					actor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
					weapon = actor.items.find(i => i.type === "itemWeapon" && i.data.data.isActive);
					cardData.targetItem = weapon.uuid;
					if (weapon.data.data.accuracy.value <= 3 && weapon.data.data.reach.value === 0){
						applyEffect = false;
						label = `${game.i18n.localize("SR5.NoEffectApplicable")}`;
					}
				}
				break;
			default :
		}

		if (cardData.test.hits >= cardData.hits) cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
		else {
			if (applyEffect) {
				if (type === "weaponResistance"){
					if (weapon.data.data.accuracy.value > 3) cardData.buttons.decreaseAccuracy = SR5_RollMessage.generateChatButton("nonOpposedTest", "decreaseAccuracy", game.i18n.localize("SR5.AccuracyDecrease"));
					if (weapon.data.data.reach.value > 0) cardData.buttons.decreaseReach = SR5_RollMessage.generateChatButton("nonOpposedTest", "decreaseReach", game.i18n.localize("SR5.WeaponReachDecrease"));
				} else cardData.buttons[key] = SR5_RollMessage.generateChatButton("nonOpposedTest", key, label);
			}
			else cardData.buttons[key] = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", label);
		}

		if (cardData.drainValue > 0) cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
	}

	static async addObjectResistanceResultInfoToCard(cardData){
		let labelEnd;
		cardData.netHits = cardData.hits - cardData.test.hits;
		if (cardData.netHits > 0){
			labelEnd = `${game.i18n.localize("SR5.ObjectResistanceFailed")} (${cardData.netHits})`;
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);

			let prevData = cardData.originalMessage?.flags?.sr5data;
			if (prevData?.type === "spell") {
				let item = await fromUuid(prevData.itemUuid);
				let newItem = duplicate(item.data.data);
			    if (newItem.duration === "sustained") newItem.isActive = true;
    			await item.update({"data": newItem});

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
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
		}
	}

	static async addRegenerationResultInfoToCard(cardData){
		cardData.netHits = cardData.test.hits + cardData.actorBody;
		cardData.buttons.regeneration = SR5_RollMessage.generateChatButton("nonOpposedTest", "regeneration", `${game.i18n.format('SR5.Regenerate', {hits: cardData.netHits})}`);
	}

	static async addHealingInfoToCard(cardData){
		if (cardData.test.glitchRoll || cardData.test.criticalGlitchRoll) cardData.extendedIntervalValue = cardData.extendedIntervalValue *2;
		if (cardData.test.criticalGlitchRoll) {
			let failedDamage = new Roll(`1d3`);
			await failedDamage.evaluate({async: true});
			cardData.damageValue = failedDamage.total;
			cardData.damageType = cardData.typeSub;
			cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.format('SR5.HealButtonFailed', {hits: cardData.damageValue, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.typeSub]))})}`);
		}
		if (cardData.test.hits > 0) cardData.buttons.heal = SR5_RollMessage.generateChatButton("nonOpposedTest", "heal", `${game.i18n.format('SR5.HealButton', {hits: cardData.test.hits, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.typeSub]))})}`);
	}

	static async handleCalledShotDefenseInfo(cardData, actorData){
		cardData.calledShotButton = true;
		if (typeof cardData.calledShot.effects === "object") cardData.calledShot.effects = Object.values(cardData.calledShot.effects);

		switch (cardData.calledShot.name){
			case "dirtyTrick":
				if (cardData.calledShot.limitDV === 0) cardData.damageValue = 0;
				else cardData.calledShotButton = false;
				cardData.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				break;
			case "disarm":
				if ((cardData.netHits + cardData.attackerStrength) > actorData.limits.physicalLimit.value) cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.Disarm"));
				else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDisarm"));
				break;
			case "knockdown":
				if ((cardData.netHits + cardData.attackerStrength) > actorData.limits.physicalLimit.value) {
					cardData.calledShot.effects = {"0": {"name": "prone",}};
					cardData.damageValue = 0;				
					cardData.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				} else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
				break;
			case "blastOutOfHand":
				if (cardData.calledShot.limitDV === 0) cardData.damageValue = 0;
				else cardData.calledShotButton = false;
				let mod = cardData.calledShot.effects.find(e => e.name === "blastOutOfHand");
				cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${game.i18n.format('SR5.BlastOutOfHand', {range: cardData.netHits + mod.modFingerPopper})}`);
				break;
			case "feint":
				cardData.calledShotButton = false;
				cardData.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				break;
			case "reversal":
				cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize('SR5.ReversedSituation'));
				break;
			case "onPinsAndNeedles":
				cardData.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				break;
			case "tag":
				cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize('SR5.CS_AS_Tag'));
				break;
			case "throughAndInto":
				let originalAttackMessage = game.messages.get(cardData.originalMessage);
				originalAttackMessage.data.flags.sr5data.calledShot.name = '';
				originalAttackMessage.data.flags.sr5data.damageValue -= 1;
				originalAttackMessage.data.flags.sr5data.damageValueBase -= 1;
				cardData.originalAttackMessage = originalAttackMessage.data.flags.sr5data;
				cardData.buttons.defenseRangedWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseThroughAndInto",game.i18n.localize("SR5.DefendSecondTarget"));
				cardData.calledShotButton = false;
				break;
			default:
				cardData.calledShotButton = false;
		}

		//Handle Called Shots specifics
		if (!cardData.calledShotHitsSpent && cardData.calledShot.limitDV !== 0 && (cardData.calledShot.name === "specificTarget" || cardData.calledShot.name === "upTheAnte") && cardData.targetActorType !== "actorDrone") {
			if (cardData.netHits > 1) {
				cardData.buttons.spendNetHits = SR5_RollMessage.generateChatButton("attackerTest", "spendNetHits", `${game.i18n.localize("SR5.SpendHits")} (${cardData.netHits - 1})`);
				cardData.calledShotButton = true;
			} else {
				cardData.calledShotButton = false;
			}
		}

		// Handle Fatigued
		if (cardData.calledShot.effects.length){
			if (cardData.calledShot.effects.find(e => e.name === "fatigued")){
				cardData.damageValueFatiguedBase = Math.floor(cardData.damageValue/2);
				cardData.buttons.fatiguedCard = SR5_RollMessage.generateChatButton("nonOpposedTest","fatiguedCard", `${game.i18n.localize("SR5.TakeOnDamageShort")} (${game.i18n.localize("SR5.STATUSES_Fatigued")}) ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damageValueFatiguedBase}${game.i18n.localize("SR5.DamageTypeStunShort")}`);
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
			if (cardData.calledShot.limitDV < cardData.damageValue) ui.notifications.info(`${game.i18n.format("SR5.INFO_DVLimitByCalledShot", {value: cardData.calledShot.limitDV})}`);
			cardData.damageValue = Math.min(cardData.damageValue, cardData.calledShot.limitDV);
		}

		switch(cardData.calledShot.name){
			case "flameOn":
				actor.fireDamageEffect(cardData);
				break;
			case "extremeIntimidation":
				cardData.buttons.fear = SR5_RollMessage.generateChatButton("nonOpposedTest","fear",`${game.i18n.localize('SR5.Composure')} (${cardData.netHits})`);
				cardData.damageValue = 0;
				break;
			case "warningShot":
				cardData.buttons.fear = SR5_RollMessage.generateChatButton("nonOpposedTest","fear",`${game.i18n.localize('SR5.Composure')} (4)`);
				cardData.damageValue = 0;
				break;
			case "ricochetShot":
				cardData.buttons.fear = SR5_RollMessage.generateChatButton("nonOpposedTest","fear",`${game.i18n.localize('SR5.Composure')} (2)`);
				cardData.calledShot.effects = {"0":  {"name": "shaked",}};
				break;
			case "bellringer":
				SR5Combat.changeInitInCombat(actor, -10);
				ui.notifications.info(`${actor.name}: ${game.i18n.format("SR5.INFO_Stunned", {initiative: 10})}`)
				cardData.buttons.bellringerEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", `${game.i18n.localize("SR5.EffectApplied")} (${game.i18n.localize("SR5.STATUSES_Stunned")})`);
				break;
			case "shakeUp":
				SR5Combat.changeInitInCombat(actor, cardData.calledShot.initiative);			
				ui.notifications.info(`${actor.name}: ${game.i18n.format("SR5.INFO_ShakeUp", {value: cardData.calledShot.initiative})}`);
				cardData.buttons.shakeUpEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", `${game.i18n.localize("SR5.EffectApplied")} (${game.i18n.localize("SR5.STATUSES_Shaked")})`);
				break;
			case "pin":
				if (cardData.damageValue > actor.data.data.itemsProperties.armor.value){
					cardData.calledShot.effects = {
						"0": {
							"name": "pin",
							"initialDV": cardData.damageValue - actor.data.data.itemsProperties.armor.value,
						}
					};
					cardData.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				}
				break;
			case "dirtyTrick":
				if (cardData.netHits > 0){
					cardData.calledShot.effects = {"0": {"name": "dirtyTrick",}};
					cardData.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
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
					cardData.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect", `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.calledShot.name])}`);
				}
				break;
			case "splittingDamage":
				let originalDamage = cardData.damageValue;
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
						cardData.buttons[effect.name] = SR5_RollMessage.generateChatButton("nonOpposedTest", effect.name,`${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[effect.name])})}`);
						break;
					default:
						effectsName.push(effect.name);
						let effectsLabel = effectsName.map(e => game.i18n.localize(SR5.calledShotsEffects[e]));
						effectsLabel = effectsLabel.join(", ");
						let applyLabel = (effectsName.length > 1) ? game.i18n.localize("SR5.ApplyEffects") : game.i18n.localize("SR5.ApplyEffect");
						cardData.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect", `${applyLabel}${game.i18n.localize("SR5.Colons")} ${effectsLabel}`);
				}
			}
		}

		return cardData;
	}
}
