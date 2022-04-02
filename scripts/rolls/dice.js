import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utility.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_RollMessage } from "./roll-message.js";
import { SR5Combat } from "../system/srcombat.js";
import SR5_RollDialog from "./roll-dialog.js";

export class SR5_Dice {

	/** Met à jour les infos du ChatMessage
	 * @param {Number} dicePool - Le nombre de dés à lancer
	 * @param {Number} limit - Le nombre maximum de succèse
	 * @param {Boolean} explose - Détermine si les 6 explose
	 */
	static srd6({ dicePool, limit, explose }) {
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
			criticalGlitchRoll = false;
		for (let d of rollJSON.terms[0].results) {
			if (d.result === 1) {
				d.glitch = true;
				totalGlitch ++;
			}
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
		let chance = SR5_Dice.srd6({ dicePool: dicePool, limit: limit });
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
		newMessage.test.dices = chance.dices.concat(dicesKeeped);
		newMessage.secondeChanceUsed = true;
		newMessage.pushLimitUsed = true;
		await SR5_Dice.srDicesAddInfoToCard(newMessage, actor);
		if (newMessage.item) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

		//Remove 1 to actor's Edge
		if (messageData.actor.type === "actorSpirit"){
			let creator = SR5_EntityHelpers.getRealActorFromID(messageData.actor.data.creatorId);
			creator.update({ "data.conditionMonitors.edge.current": creator.data.data.conditionMonitors.edge.current + 1 });
		} else actor.update({ "data.conditionMonitors.edge.current": actor.data.data.conditionMonitors.edge.current + 1 });

		//Rafraichi le message avec les nouvelles infos.
		SR5_RollMessage.updateRollCard(message.data, newMessage);
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
		await SR5_Dice.srDicesAddInfoToCard(newMessage, actor);
		if (newMessage.item) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

		SR5_RollMessage.updateRollCard(message.data, newMessage);
	}

	static async pushTheLimit(message, actor) {
		let messageData = message.data.flags.sr5data;
		let dicePool, creator;
		if (messageData.actor.type === "actorSpirit"){
			creator = SR5_EntityHelpers.getRealActorFromID(messageData.actor.data.creatorId);
			dicePool = creator.data.data.specialAttributes.edge.augmented.value;
		} else dicePool = actor.data.data.specialAttributes.edge.augmented.value;

		let newRoll = SR5_Dice.srd6({
			dicePool: dicePool,
			explose: true
		});

		let newMessage = duplicate(messageData);
		newMessage.test.hits = messageData.test.hits + newRoll.hits;
		newMessage.test.dices = newRoll.dices.concat(messageData.test.dices);
		newMessage.secondeChanceUsed = true;
		newMessage.pushLimitUsed = true;
		newMessage.dicePoolMod.pushTheLimit = dicePool;
		newMessage.dicePoolModHas = true;
		newMessage.test.dicePool += dicePool;
		await SR5_Dice.srDicesAddInfoToCard(newMessage, actor);
		if (newMessage.item) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

		//Remove 1 to actor's Edge
		if (messageData.actor.type === "actorSpirit"){
			creator.update({ "data.conditionMonitors.edge.current": creator.data.data.conditionMonitors.edge.current + 1 });
		} else actor.update({ "data.conditionMonitors.edge.current": actor.data.data.conditionMonitors.edge.current + 1 });

		//Rafraichi le message avec les nouvelles infos.
		SR5_RollMessage.updateRollCard(message.data, newMessage);
	}

	/** Prepare the roll window
	 * @param {Object} dialogData - Informations for the dialog window
	 * @param {Object} cardData - Informations to add to chatMessage
	 */
	static async prepareRollDialog(dialogData, cardData, edge = false, cancel = true) {
		let actor = dialogData.actor;
		let realActor = SR5_EntityHelpers.getRealActorFromID(dialogData.speakerId);
		let template = "systems/sr5/templates/rolls/roll-dialog.html";

		//Handle Edge
		let hasEdge = false;
		let edgeActor = realActor;
		if (actor.data.specialAttributes?.edge) {
			if (actor.data.conditionMonitors.edge.current < actor.data.specialAttributes.edge.augmented.value) hasEdge = true;
		}
		if (actor.type === "actorSpirit" && actor.data.creatorId){
			let creator = SR5_EntityHelpers.getRealActorFromID(actor.data.creatorId);
			if (creator.data.data.conditionMonitors.edge.current < creator.data.data.specialAttributes.edge.augmented.value){
				hasEdge = true;
				edgeActor = creator;
			}
		}

		let buttons = {
			roll: {
				label: game.i18n.localize("SR5.RollDice"),
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
							if (dialogData.button.removeTemplate) SR5_Dice.removeTemplate(null, dialogData.item.id);
							//Remove last cumulative Defense if roll is cancelled.
							if (actor.flags?.sr5?.cumulativeDefense){
								let actualDefense = actor.flags.sr5.cumulativeDefense;
								realActor.setFlag("sr5", "cumulativeDefense", (actualDefense));
							}
							return;
						}

						// Push the limits
						if (edge && edgeActor) {
							dialogData.dicePoolMod.edge = edgeActor.data.data.specialAttributes.edge.augmented.value;
							edgeActor.update({
								"data.conditionMonitors.edge.current": edgeActor.data.data.conditionMonitors.edge.current + 1,
							});
						}

						//Verify if reagents are used, if so, remove from actor
						let reagentsSpent = parseInt(html.find('[name="reagentsSpent"]').val());
						if (!isNaN(reagentsSpent)) realActor.update({ "data.magic.reagents": actor.data.magic.reagents - reagentsSpent});

						// Apply modifiers from dialog window
						if (dialogData.spiritType) dialogData.dicePool = actor.data.skills.summoning.spiritType[dialogData.spiritType].dicePool;
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
							dialogData.force = actor.data.specialAttributes.magic.augmented.value;
						}
						if ((dialogData.type === "complexForm" || dialogData.typeSub === "compileSprite") && isNaN(dialogData.level)) {
							ui.notifications.warn(game.i18n.localize("SR5.WARN_NoLevel"));
							dialogData.level = actor.data.specialAttributes.resonance.augmented.value;
						}
						if (dialogData.force || dialogData.switch?.canUseReagents){
							if (dialogData.force) dialogData.limit = dialogData.force;			
							if (!isNaN(reagentsSpent)) {
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
							let actualRecoil = realActor.getFlag("sr5", "cumulativeRecoil") || 0;
							actualRecoil += dialogData.firedAmmo;
							realActor.setFlag("sr5", "cumulativeRecoil", actualRecoil);
							dialogData.firingModeDefenseMod = SR5_DiceHelper.mapRoundsToDefenseMod(dialogData.firedAmmo);
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
						await SR5_Dice.srDicesAddInfoToCard(cardData, actor);

						// Return roll result and card info to chat message.
						SR5_Dice.renderRollCard(cardData);

						//Update items according to roll
						if (dialogData.item) SR5_DiceHelper.srDicesUpdateItem(cardData, realActor);

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
								let fullDefenseEffect = realActor.effects.find(e => e.data.origin === "fullDefense");
								let isInFullDefense = (fullDefenseEffect) ? true : false;
								if (!isInFullDefense){
									initModifier += -10;
									SR5_DiceHelper.applyFullDefenseEffect(realActor);
								}
							}
							if (dialogData.activeDefenseMode) initModifier += SR5_DiceHelper.convertActiveDefenseToInitModifier(dialogData.activeDefenseMode);
							if (initModifier < 0) SR5Combat.changeInitInCombat(realActor, initModifier);
						}
					},
				}).render(true);
			});
		});
	}

	static async renderRollCard(cardData) {
		//Add button to edit result
		if (game.user.isGM) cardData.editResult = true;

		//Handle Edge use
		if (cardData.actor.type === "actorPc") {
			if (cardData.actor.data.conditionMonitors.edge.current >= cardData.actor.data.specialAttributes.edge.augmented.value) {
				cardData.secondeChanceUsed = true;
				cardData.pushLimitUsed = true;
			}
		} else if (cardData.actor.type === "actorSpirit" && cardData.actor.data.creatorId){
			let creator = SR5_EntityHelpers.getRealActorFromID(cardData.actor.data.creatorId);
			if (creator.data.data.conditionMonitors.edge.current >= creator.data.data.specialAttributes.edge.augmented.value){
				cardData.secondeChanceUsed = true;
				cardData.pushLimitUsed = true;
			}
		} else {
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
		divButtons.append(`<button class="messageAction ${cardData.buttons[button].testType}" data-action="${cardData.buttons[button].testType}" data-type="${cardData.buttons[button].actionType}">${cardData.buttons[button].label}</button>`);
	}
	html = newHtml[0].outerHTML;;

    let chatData = {
      roll: cardData.test.r,
      rollMode: cardData.test.rollMode,
      user: game.user.id,
      content: html,
      speaker: {
        actor: cardData.speakerId,
        token: cardData.speakerId,
        alias: cardData.speakerActor,
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
      borderColor: userActive.color,
    };

    //SR5_SystemHelpers.srLog(3, chatData.flags.sr5data);
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

	static async srDicesAddInfoToCard(cardData, author) {
		//Reset button
		cardData.button.actionEnd = false;
		cardData.button.attack = false;
		cardData.button.resistance = false;
		cardData.button.takeDamage = false;
		cardData.button.complexForm = false;
		cardData.button.powerDefense = false;
		cardData.button.createPreparation = false;
		cardData.button.attackerPlaceMark = false;
		cardData.button.attackerDoBiofeedbackDamage = false;
		cardData.button.defenderDoMatrixDamage = false;
		cardData.button.defenderDoBiofeedbackDamage = false;
		cardData.button.matrixResistance = false;
		cardData.button.spell = false;
		cardData.button.preparationResist = false;
		cardData.button.overwatch = false;
		cardData.button.defenderPlaceMark = false;
		cardData.button.takeMatrixDamage = false;
		cardData.button.iceEffect = false;
		cardData.button.summonSpirit = false;
		cardData.button.compileSprite = false;
		cardData.button.spriteDecompileDefense = false;
		cardData.button.extended = false;
		cardData.button.killComplexFormResistance = false;
		cardData.button.reduceComplexForm = false;

		if (cardData.extendedTest){
			cardData.extendedIntervalValue = cardData.extendedMultiplier * cardData.extendedRoll;
			if (cardData.dicePool > 0) cardData.button.extended = true;
		}

		cardData.buttons = {};

		switch (cardData.type) {
			case "attack":
				SR5_Dice.addAttackInfoToCard(cardData, author);
				break;
			case "defenseCard":
				SR5_Dice.addDefenseInfoToCard(cardData, author);
				break;
			case "resistanceCard":
				SR5_Dice.addResistanceInfoToCard(cardData, author);
				break;
			case "spell":
			case "preparation":
				SR5_Dice.addSpellInfoToCard(cardData, author);
				break;
			case "preparationFormula":
				SR5_Dice.addPreparationFormulaInfoToCard(cardData, author);
				break;
			case "preparationResistance":
				SR5_Dice.addPreparationResistanceInfoToCard(cardData, author);
				break;
			case "drainCard":
				SR5_Dice.addDrainInfoToCard(cardData, author);
				break;
			case "complexForm":
				SR5_Dice.addComplexFormInfoToCard(cardData, author);
				break;
			case "complexFormDefense":
				SR5_Dice.addComplexFormDefenseInfoToCard(cardData, author);
				break;
			case "fadingCard":
				SR5_Dice.addFadingInfoToCard(cardData, author);
				break;
			case "matrixAction":
				SR5_Dice.addMatrixActionInfoToCard(cardData, author);
				break;
			case "matrixDefense":
				SR5_Dice.addMatrixDefenseInfoToCard(cardData, author);
				break;
			case "matrixResistance":
				SR5_Dice.addMatrixResistanceInfoToCard(cardData, author);
				break;
			case "matrixIceAttack":
				SR5_Dice.addMatrixIceAttackInfoToCard(cardData, author);
				break;
			case "iceDefense":
				await SR5_Dice.addIceDefenseInfoToCard(cardData, author);
				break;
			case "lift":
				cardData.weightTotal = cardData.derivedBaseValue + (cardData.test.hits * cardData.derivedExtraValue);
				break;
			case "movement":
				cardData.movementTotal = cardData.derivedBaseValue + (cardData.test.hits * cardData.derivedExtraValue);
				break;
			case "skill":
			case "skillDicePool":
				SR5_Dice.addSkillInfoToCard(cardData, author);
				break;
			case "summoningResistance":
				SR5_Dice.addSummoningResistanceInfoToCard(cardData, author);
				break;
			case "power":
				SR5_Dice.addPowerInfoToCard(cardData, author);
				break;
			case "powerDefense":
				SR5_Dice.addPowerDefenseInfoToCard(cardData, author);
				break;
			case "spritePower":
				SR5_Dice.addSpritePowerInfoToCard(cardData, author);
				break;
			case "resonanceAction":
				SR5_Dice.addResonanceActionInfoToCard(cardData, author);
				break;
			case "compilingResistance":
				SR5_Dice.addCompilingResistanceInfoToCard(cardData, author);
				break;
			case "resistFire":
				SR5_Dice.addResistFireInfoToCard(cardData, author);
				break;
			case "activeSensorTargeting":
				SR5_Dice.addSensorTargetingInfoToCard(cardData, author);
				break;
			case "activeSensorDefense":
				SR5_Dice.addSensorDefenseInfoToCard(cardData, author);
				break;
			case "attribute":
			case "languageSkill":
            case "knowledgeSkill":
			case "defense":
			case "resistance":
			case "matrixSimpleDefense":
				break;
			case "jackOutResistance":
				SR5_Dice.addJackOutDefenseInfoToCard(cardData, author);
				break;
			case "eraseMark":
				SR5_Dice.addEraseMarkInfoToCard(cardData, author);
			case "overwatchResistance":
				SR5_Dice.addOverwatchResistanceInfoToCard(cardData, author);
			case "decompilingResistance":
				SR5_Dice.addDecompilingResistanceInfoToCard(cardData, author);
				break;
			case "registeringResistance":
				SR5_Dice.addRegisteringResistanceInfoToCard(cardData, author);
				break;
			case "complexFormResistance":
				SR5_Dice.addComplexFormResistanceInfoToCard(cardData, author);
				break;
			case "spellResistance":
				SR5_Dice.addSpellResistanceInfoToCard(cardData, author);
				break;
			case "bindingResistance":
				SR5_Dice.addBindingResistanceInfoToCard(cardData, author);
				break;
			case "banishingResistance":
				SR5_Dice.addBanishingResistanceInfoToCard(cardData, author);
				break;
			case "enchantmentResistance":
				SR5_Dice.addEnchantmentResistanceInfoToCard(cardData, author);
				break;
			case "disjointingResistance":
				SR5_Dice.addDisjointingResistanceInfoToCard(cardData, author);
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
			if (cardData.test.hits < 3){
				//Handle Scatter chat button
				cardData.buttons.scatter = SR5_RollMessage.generateChatButton("nonOpposedTest","scatter",game.i18n.localize("SR5.Scatter"));
			}

			//Handle Resistant chat button
			let label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`;
			if (cardData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.incomingPA}`;
			cardData.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCard",label);

		} else if (cardData.test.hits > 0) {
			if (cardData.typeSub === "rangedWeapon") {
				cardData.ammoType = cardData.item.data.ammunition.type;
				cardData.buttons.defenseRangedWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseRangedWeapon",game.i18n.localize("SR5.Defend"));
			} else if (cardData.typeSub === "meleeWeapon") {
				cardData.buttons.defenseMeleeWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseMeleeWeapon",game.i18n.localize("SR5.Defend"));
			}

		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.AttackMissed"));
		}
	}

	static async addDefenseInfoToCard(cardData, author){
		let netHits = cardData.hits - cardData.test.hits;
		if (netHits <= 0) {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
		} else {
			cardData.damageResistanceType = "physicalDamage";

			//If materialized spirit : check weapon immunity
			if (author.type === "actorSpirit") {
				let immunity = (author.data.essence.value * 2) + cardData.incomingPA;
				if (cardData.damageValue <= immunity) {
					cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NormalWeaponsImmunity"));
					return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToNormalWeapons", {essence: author.data.essence.value * 2, pa: cardData.incomingPA, damage: cardData.damageValue})}`);
				}
			}
			
			//SF firing mode, no additional damage from hits
			if (cardData.firingMode === "SF") cardData.damageValue = cardData.damageValueBase
			else cardData.damageValue = cardData.damageValueBase + netHits;

			//Special case for fire damage
			if (cardData.damageElement === "fire") cardData.fireTreshold = netHits;

			//Special case for Drone and vehicle
			if (author.type === "actorDrone" || author.type === "actorVehicle") {
				if (cardData.damageType === "stun" && cardData.damageElement === "electricity") {
					cardData.damageType = "physical";
					ui.notifications.info(`${game.i18n.localize("SR5.INFO_ElectricityChangeDamage")}`);
				}
				if (cardData.damageType === "stun") {
					cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.VehicleArmorResistance"));
					return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToStunDamage")}`);
				}
				if (author.data.attributes.armor.augmented.value >= cardData.damageValue) {
					cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.VehicleArmorResistance"));
					return ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDV", {armor: author.data.attributes.armor.augmented.value, damage:cardData.damageValue})}`); //
				}
			}

			//Generate Resistance chat button
			let label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`;
			if (cardData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.incomingPA}`;
			cardData.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCard",label);
		}
	}

	static async addResistanceInfoToCard(cardData, author){
		//Remove Defense chat button from previous chat message
		SR5_RollMessage.changeChatButton(cardData.originalMessage, "resistanceCard");

		//Add automatic succes to Spirit TO-DO : change this when Materialization is up.
		if (author.type === "actorSpirit" && (cardData.typeSub === "physicalDamage" || cardData.typeSub === "stun")) {
			let hardenedArmor = Math.floor((author.data.essence.value + cardData.incomingPA) / 2);
			if (hardenedArmor > 0) {
			  ui.notifications.info(`${game.i18n.localize("SR5.HardenedArmor")}: ${hardenedArmor} ${game.i18n.localize("SR5.INFO_AutomaticHits")}`);
			  cardData.test.hits += hardenedArmor;
      		}
		}

		cardData.damageValue = cardData.damageValueBase - cardData.test.hits;
		if (cardData.damageValue > 0) cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest","damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`);
		else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDamage"));

		//Special case for Biofeedback damage
		//WARNING : COME BACK LATER
		if (cardData.typeSub === "biofeedbackDamage"){
			if (!cardData.defenderDoBiofeedbackDamage && cardData.originalMessage.flags.sr5data.button.attackerDoBiofeedbackDamage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "attackerDoBiofeedbackDamage");
			else if (cardData.originalMessage.flags.sr5data.button.defenderDoBiofeedbackDamage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "defenderDoBiofeedbackDamage");
		} else if (cardData.typeSub !== "dumpshock" && cardData.originalMessage.flags.sr5data.button.resistance){
			SR5_RollMessage.updateChatButton(cardData.originalMessage, "resistance");
		}
	}

	static async addSpellInfoToCard(cardData, author){
		let actionType, label;

		//Add Resist Drain chat button
		if (cardData.type === "spell") {
			cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
		}

		//Roll Succeed
		if (cardData.test.hits > 0) {
			cardData.hits = cardData.test.hits;

			//Handle Attack spell type
			if (cardData.typeSub === "indirect" || cardData.typeSub === "direct") {
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
			}

			//Handle spell Area
			if (cardData.item.data.range === "area"){
				cardData.spellArea = cardData.force;
				if (cardData.item.data.category === "detection") {
					if (cardData.item.data.spellAreaExtended === true) cardData.spellArea = cardData.force * cardData.actorMagic * 10;
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
			else label = game.i18n.localize("SR5.PreparationCreateFailed");
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", label);
		}
	}

	static async addPreparationFormulaInfoToCard(cardData){
		cardData.ownerAuthor = cardData.speakerId;

		if (cardData.test.hits > 0) {
			cardData.hits = cardData.test.hits;
			cardData.buttons.preparationResist = SR5_RollMessage.generateChatButton("nonOpposedTest", "preparationResist", game.i18n.localize("SR5.PreparationResistance"));
		} else { 
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.PreparationCreateFailed"));
		}

		//Add Resist Drain chat button
		cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
	}

	static async addPreparationResistanceInfoToCard(cardData) {
		if (cardData.hits > cardData.test.hits) {
			cardData.buttons.createPreparation = SR5_RollMessage.generateChatButton("nonOpposedTest", "createPreparation", game.i18n.localize("SR5.PreparationCreate"));
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.PreparationCreateFailed"));
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
			cardData.buttons.takeDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])})`);
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDrain"));
		}

		//Update previous message to remove Drain Resistance button
		if (cardData.originalMessage) SR5_RollMessage.changeChatButton(cardData.originalMessage, "drainCard");
	}

	static async addComplexFormInfoToCard(cardData){
		cardData.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeDamage", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);
		
		if (cardData.test.hits > 0) {
			cardData.hits = cardData.test.hits;
			cardData.originalActionAuthor = cardData.speakerId;
			if (cardData.defenseAttribute !== "" & cardData.defenseMatrixAttribute !== "") cardData.button.complexForm = true;
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
	}

	static async addFadingInfoToCard(cardData){
		let damageValue = cardData.fadingValue - cardData.test.hits;

		if (damageValue > 0) {
			cardData.damageValue = damageValue;
			if (cardData.hits > cardData.actorResonance || cardData.fadingType === "physical") cardData.damageType = "physical";
			else cardData.damageType = "stun";
			cardData.buttons.takeDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])})`);
		} else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoFading"));

		if (cardData.originalMessage.flags.sr5data.button.fadingResistance) SR5_RollMessage.updateChatButton(cardData.originalMessage, "fadingCard");
	}

	static async addMatrixActionInfoToCard(cardData, author){
		cardData.originalActionAuthor = cardData.speakerId;

		if (cardData.test.hits > 0 && (cardData.typeSub !== "matrixSearch")) {
			if (cardData.testType === "opposedTest") cardData.buttons.matrixAction = SR5_RollMessage.generateChatButton("opposedTest", "matrixAction", game.i18n.localize("SR5.Defend"));
			if (cardData.typeSub === "jackOut" && author.data.matrix.isLinkLocked) cardData.buttons.jackOut = SR5_RollMessage.generateChatButton("nonOpposedTest", "jackOut", game.i18n.localize("SR5.MatrixActionJackOutResistance"));
			if (cardData.typeSub === "eraseMark") cardData.buttons.eraseMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "eraseMark", game.i18n.localize("SR5.ChooseMarkToErase"));
			if (cardData.typeSub === "checkOverwatchScore") cardData.buttons.checkOverwatchScore = SR5_RollMessage.generateChatButton("nonOpposedTest", "checkOverwatchScore", game.i18n.localize("SR5.OverwatchResistance"));
			if (cardData.typeSub === "jamSignals") cardData.buttons.matrixJamSignals = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixJamSignals", game.i18n.localize("SR5.MatrixActionJamSignals"));
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.ActionFailure"));
		}

		//Matrix search special case
		if (cardData.typeSub === "matrixSearch"){
			cardData.matrixSearchTreshold = SR5_DiceHelper.convertMatrixSearchToTreshold(cardData.matrixSearchType);
			let netHits = cardData.test.hits - cardData.matrixSearchTreshold;
			cardData.matrixSearchDuration = await SR5_DiceHelper.getMatrixSearchDuration(cardData, netHits);
			if (netHits <=0) {
				netHits = 1;
				cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.MatrixSearchFailed"));
			} else {
				cardData.buttons.matrixSearchSuccess = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "matrixSearchSuccess", `${game.i18n.localize("SR5.MatrixSearchSuccess")} [${cardData.matrixSearchDuration}]`);
			}
			cardData.title = `${game.i18n.localize("SR5.MatrixActionTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[cardData.typeSub])} (${cardData.matrixSearchTreshold})`;
		}
	}

	static async addMatrixDefenseInfoToCard(cardData, author){
		let defender = author,
			attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionAuthor),
			attackerData = attacker?.data.data,
			netHits = cardData.hits - cardData.test.hits;

		cardData.attackerName = attacker.name;

		//Overwatch button if illegal action
		if (cardData.overwatchScore && cardData.test.hits > 0) cardData.buttons.overwatch = SR5_RollMessage.generateChatButton("nonOpposedTest", "overwatch", `${game.i18n.localize('SR5.IncreaseOverwatch', {name: cardData.attackerName, score: cardData.test.hits})}`);

		//if defender wins
		if (netHits <= 0) {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));

			if (cardData.matrixActionType === "attack" && netHits < 0) {
				cardData.matrixDamageValue = netHits * -1;
				cardData.buttons.defenderDoMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.localize('SR5.DoMatrixDamage', {key: cardData.matrixDamageValue, name: cardData.attackerName})}`);
				//If Biofeedback, add damage and button
				if ((defender.data.matrix.programs.biofeedback.isActive || defender.data.matrix.programs.blackout.isActive)
				  && attackerData.matrix.userMode !== "ar"
				  && (attacker.data.type === "actorPc" || attacker.data.type === "actorGrunt")) {
					cardData.damageValueBase = netHits * -1;
					cardData.damageValue = netHits * -1;
					cardData.damageResistanceType = "biofeedback";
					cardData.damageType = "stun";
					if ((defender.data.matrix.programs.biofeedback.isActive && attackerData.matrix.userMode === "hotSim")) cardData.damageType = "physical";
					cardData.buttons.defenderDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.localize('SR5.DoBiofeedBackDamage', {damage: cardData.matrixDamageValue, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.damageType])), name: cardData.attackerName})}`);
				}
			} else if (cardData.matrixActionType === "sleaze") {
        		cardData.mark = 1;
				cardData.buttons.defenderPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderPlaceMark", `${game.i18n.localize('SR5.DefenderPlaceMarkTo', {key: cardData.mark, item: cardData.matrixTargetItem.name, name: cardData.attackerName})}`);
			}
		}

		//if attacker wins
		else {
			switch (cardData.typeSub) {
				case "hackOnTheFly":
					cardData.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.localize('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: cardData.matrixTargetItem.name, name: cardData.speakerActor})}`);
					break;
				case "bruteForce":
					cardData.matrixDamageValue = Math.ceil(netHits / 2);
					cardData.matrixResistanceType = "matrixDamage";
					cardData.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.localize('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: cardData.matrixTargetItem.name, name: cardData.speakerActor})}`);
					if (defender.data.matrix.deviceType !== "host") cardData.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix') (cardData.matrixDamageValue)}`);
					break;
				case "dataSpike":
					cardData.matrixResistanceType = "matrixDamage";
					cardData.matrixDamageValueBase = attacker.data.data.matrix.attributes.attack.value;
					cardData = await SR5_DiceHelper.updateMatrixDamage(cardData, netHits, author);
					cardData.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix') (cardData.matrixDamageValue)}`);
					break;
				default:
					cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.DefenseFailure"));
			}
		}
	}

	static async addMatrixResistanceInfoToCard(cardData, author){
		let defender = author,
			attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionAuthor),
			attackerData = attacker?.data.data;
		
		cardData.matrixDamageValue = cardData.matrixDamageValueBase - cardData.test.hits;

		if (cardData.matrixDamageValue > 0) {
			cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
			//If Biofeedback, add button	
			if ( attackerData.matrix.programs.biofeedback.isActive
			  || attackerData.matrix.programs.blackout.isActive
			  || (attackerData.matrix.deviceSubType === "iceBlack")
			  || (attackerData.matrix.deviceSubType === "iceBlaster")
			  || (attackerData.matrix.deviceSubType === "iceSparky") ) {
				if (((defender.type === "actorPc" || defender.type === "actorGrunt") && (defender.data.matrix.userMode !== "ar"))
				  || (defender.type === "actorDrone" && defender.data.controlMode === "rigging")) {
					cardData.button.attackerDoBiofeedbackDamage = true;
					cardData.damageResistanceType = "biofeedback";
					cardData.damageValue = cardData.matrixDamageValueBase;
					cardData.damageType = "stun";
					if ((attackerData.matrix.programs.biofeedback.isActive && defender.data.matrix.userMode === "hotSim") || (attackerData.matrix.deviceSubType === "iceBlack")) cardData.damageType = "physical";
				}
			}
			//Link Lock
			if (attackerData.matrix.programs.lockdown.isActive) cardData.button.linkLock = true;
		} else {
			cardData.button.actionEnd = true;
			cardData.button.linklock = false;
			cardData.button.actionEndTitle = `${game.i18n.localize("SR5.NoDamage")}`;
		}
		if (cardData.originalMessage.flags?.sr5data?.button?.matrixResistance) SR5_RollMessage.updateChatButton(cardData.originalMessage, "matrixResistance");
	}

	static async addMatrixIceAttackInfoToCard(cardData, author){
		if (cardData.test.hits > 0) {
			cardData.button.iceDefense = true;
			cardData.originalActionAuthor = cardData.speakerId;
			cardData.hits = cardData.test.hits;
		} else {
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.ActionFailure");
		}
	}

	static async addIceDefenseInfoToCard(cardData, author){
		let netHits = cardData.hits - cardData.test.hits,
			existingMark, markedActor,
			originalActor = await SR5_EntityHelpers.getRealActorFromID(cardData.originalActionAuthor);

		cardData.attackerName = originalActor.name;

		if (netHits <= 0) {
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = `${game.i18n.localize("SR5.SuccessfulDefense")}`;
			if (netHits < 0) {
				cardData.button.defenderDoMatrixDamage = true;
				cardData.matrixDamageValue = netHits * -1;
			}
		} else {
			cardData.button.iceEffect = true;
			switch(cardData.iceType){
				case "iceAcid":
					if (cardData.actor.data.matrix.attributes.firewall.value > 0) {
						cardData.button.iceEffectTitle = game.i18n.localize("SR5.EffectReduceFirewall");
					} else {
						cardData.button.iceEffect = false;
						cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
						cardData.matrixDamageValue = netHits;
					}
					break;
				case "iceBinder":
					if (cardData.actor.data.matrix.attributes.dataProcessing.value > 0) {
						cardData.button.iceEffectTitle = game.i18n.localize("SR5.EffectReduceDataProcessing");
					} else {
						cardData.button.iceEffect = false;
						cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
						cardData.matrixDamageValue = netHits;
					}
					break;
				case "iceKiller":
				case "iceBlaster":
				case "iceBlack":
				case "iceSparky":
					cardData.button.iceEffect = false;
					cardData.button.matrixResistance = true;
					cardData.matrixResistanceType = "matrixDamage";
					await SR5_DiceHelper.updateMatrixDamage(cardData, netHits, author);
					if ((cardData.iceType === "iceBlaster" || cardData.iceType === "iceBlack") && (!cardData.actor.data.matrix.isLinkLocked)) {
						cardData.button.iceEffect = true;
						cardData.button.iceEffectTitle = game.i18n.localize("SR5.LinkLockConnection");
					}
					break;
				case "iceCrash":
					markedActor = SR5_EntityHelpers.getRealActorFromID(author._id);
					existingMark = await SR5_DiceHelper.findMarkValue(cardData.matrixTargetItem.data, originalActor.id);
					if (existingMark >= 1) {
						cardData.button.iceEffect = true;
						cardData.button.iceEffectTitle = game.i18n.localize("SR5.MatrixActionCrashProgram");
					} else {
						cardData.button.iceEffect = false;
					}
					break;
				case "iceJammer":
					if (cardData.actor.data.matrix.attributes.attack.value > 0) {
						cardData.button.iceEffectTitle = game.i18n.localize("SR5.EffectReduceAttack");
					} else {
						cardData.button.iceEffect = false;
						cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
						cardData.matrixDamageValue = netHits;
					}
					break;
				case "iceMarker":
					if (cardData.actor.data.matrix.attributes.dataProcessing.value > 0) {
						cardData.button.iceEffectTitle = game.i18n.localize("SR5.EffectReduceSleaze");
					} else {
						cardData.button.iceEffect = false;
						cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
						cardData.matrixDamageValue = netHits;
					}
					break;
				case "icePatrol":
					cardData.button.iceEffect = false;
					break;
				case "iceProbe":
					cardData.button.attackerPlaceMark = true;
					cardData.button.iceEffect = false;
					cardData.mark = 1;
					break;
				case "iceScramble":
					existingMark = await SR5_DiceHelper.findMarkValue(cardData.matrixTargetItem.data, originalActor.id);
					if (existingMark >= 3) {
						cardData.button.iceEffect = true;
						cardData.button.iceEffectTitle = game.i18n.localize("SR5.DeviceReboot");
					} else {
						cardData.button.iceEffect = false;
					}
					break;
				case "iceTarBaby":
					if (cardData.actor.data.matrix.isLinkLocked) {
						cardData.button.attackerPlaceMark = true;
						cardData.button.iceEffect = false;
						cardData.mark = 1;
					} else {
						cardData.button.iceEffect = true;
						cardData.button.iceEffectTitle = game.i18n.localize("SR5.LinkLockConnection");
					}
					break;
				case "iceTrack":
					//si 2 marks sur l'acteur géolocalisé
					markedActor = SR5_EntityHelpers.getRealActorFromID(author._id);
					existingMark = await SR5_DiceHelper.findMarkValue(cardData.matrixTargetItem.data, originalActor.id);
					if (existingMark >= 2) {
						cardData.button.iceEffect = true;
						cardData.button.iceEffectTitle = game.i18n.localize("SR5.Geolocated")
					}
					break;
				default:
					SR5_SystemHelpers.srLog(1, `Unknown '${cardData.iceType}' type in srDicesAddInfoToCard`);
			}
		}
	}

	static async addSkillInfoToCard(cardData, author){
		cardData.ownerAuthor = cardData.speakerId;
		let itemTarget;
		if (cardData.typeSub === "summoning") {
			cardData.button.summonSpiritResist = true;
			cardData.hits = cardData.test.hits;
		} else if (cardData.typeSub === "binding"){
			if (cardData.hasTarget) cardData.button.targetBindingDefense = true;
			else cardData.button.spiritBindingDefense = true;
		} else if (cardData.typeSub === "banishing"){
			if (cardData.hasTarget) cardData.button.targetBanishingDefense = true;
			else cardData.button.spiritBanishingDefense = true;
		} else if (cardData.typeSub === "counterspelling" && cardData.targetEffect) {
			itemTarget = await fromUuid(cardData.targetEffect);
			cardData.drainValue = itemTarget.data.data.drainValue.value;
			if (itemTarget.data.data.force > cardData.actor.data.specialAttributes.magic.augmented.value) cardData.drainType = "physical";
			else cardData.drainType = "stun";
			cardData.button.drainCard = true;
			if (cardData.test.hits > 0) cardData.button.dispellResistance = true;
			else cardData.button.dispellResistance = false;
		} else if (cardData.typeSub === "disenchanting" && cardData.targetEffect) {
			itemTarget = await fromUuid(cardData.targetEffect);
			if (itemTarget.type === "itemPreparation"){
				cardData.drainValue = itemTarget.data.data.drainValue.value;
				if (cardData.test.hits > cardData.actor.data.specialAttributes.magic.augmented.value) cardData.drainType = "physical";
				else cardData.drainType = "stun";
				cardData.button.drainCard = true;
			}
			if (cardData.test.hits > 0) {
				if (itemTarget.type === "itemFocus") cardData.button.enchantmentResistance = true;
				if (itemTarget.type === "itemPreparation") cardData.button.disjointingResistance = true;
			} else {
				cardData.button.enchantmentResistance = false;
				cardData.button.enchantmentResistanceP = false;
			}
		}
	}

	static async addSummoningResistanceInfoToCard(cardData, author){
		let damageValue = cardData.test.hits * 2;
		if (damageValue === 0) damageValue = 2;
		cardData.button.drainCard = true;
		cardData.drainValue = damageValue;
		if (cardData.hits > cardData.test.hits) {
			cardData.button.summonSpirit = true;
		} else {
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = `${game.i18n.localize("SR5.FailedSummon")}`;
		}
	}

	static async addPowerInfoToCard(cardData, author){
		if (cardData.defenseFirstAttribute){
			if (cardData.test.hits > 0) cardData.button.powerDefense = true;
		}
	}

	static async addPowerDefenseInfoToCard(cardData, author){
		if (cardData.test.hits >= cardData.hits) {
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.SuccessfulDefense");
		} else {
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.DefenseFailure");
		}
	}

	static async addSpritePowerInfoToCard(cardData, author){
		if (cardData.test.hits > 0) {
			cardData.hits = cardData.test.hits;
			cardData.button.complexForm = true;
		} else {
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.PowerFailure");
		}
	}

	static async addResonanceActionInfoToCard(cardData, author){
		cardData.ownerAuthor = cardData.speakerId;
		if (cardData.typeSub === "compileSprite"){
			cardData.button.compileSpriteResist = true;
			cardData.hits = cardData.test.hits;
		}
		if (cardData.typeSub === "decompileSprite"){
			if (cardData.hasTarget) cardData.button.targetDecompilingDefense = true;
			else cardData.button.spriteDecompileDefense = true;
		}
		if (cardData.typeSub === "registerSprite"){
			cardData.button.spriteRegisterDefense = true;
		}
		if (cardData.typeSub === "killComplexForm" && cardData.targetEffect) {
			let complexForm = await fromUuid(cardData.targetEffect);
			cardData.fadingValue = complexForm.data.data.fadingValue;
			if (complexForm.data.data.level > cardData.actor.data.specialAttributes.resonance.augmented.value) cardData.fadingType = "physical";
			else cardData.fadingType = "stun";
			cardData.button.fadingResistance = true;

			if (cardData.test.hits > 0) cardData.button.killComplexFormResistance = true;
		}
	}

	static async addCompilingResistanceInfoToCard(cardData, author){
		let damageValue = cardData.test.hits * 2;
		if (damageValue === 0) damageValue = 2;
		cardData.button.fadingResistance = true;
		cardData.fadingValue = damageValue;
		if (cardData.hits > cardData.test.hits) {
			cardData.button.compileSprite = true;
		} else {
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.FailedCompiling");
		}
	}

	static async addResistFireInfoToCard(cardData, author){
		if (cardData.test.hits < cardData.fireTreshold) {
			cardData.button.catchFire = true;
			cardData.button.actionEnd = false;
		} else {
			cardData.button.catchFire = false;
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.CatchFireResisted");
		}
	}

	static async addSensorTargetingInfoToCard(cardData, author){
		if (cardData.test.hits > 0) {
			cardData.hits = cardData.test.hits;
			cardData.button.sensorTargeting = true;
			cardData.originalActionAuthor = cardData.speakerId;
		} else {
			cardData.button.sensorTargeting = false;
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.SensorTargetingActiveFailed");
		}
	}

	static async addSensorDefenseInfoToCard(cardData, author){
		if (cardData.test.hits < cardData.hits) {
			cardData.button.targetLocked = true;
		} else {
			cardData.button.targetLocked = false;
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.SuccessfulDefense");
		}
	}

	static async addJackOutDefenseInfoToCard(cardData, author){
		if (cardData.test.hits < cardData.hits) {
			cardData.button.jackOutSuccess = true;
		} else {
			cardData.button.jackOutSuccess = false;
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.MatrixActionJackOutFailed");
		}
	}

	static async addEraseMarkInfoToCard(cardData, author){
		if (cardData.originalMessage.flags.sr5data.button.eraseMark) SR5_RollMessage.updateChatButton(cardData.originalMessage, "eraseMark");
		if (cardData.test.hits < cardData.hits) {
			cardData.button.eraseMarkSuccess = true;
		} else {
			cardData.button.eraseMarkSuccess = false;
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.MatrixActionEraseMarkFailed");
		}
	}

	static async addOverwatchResistanceInfoToCard(cardData, author){
		let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionAuthor)
		let currentOS = attacker.data.data.matrix.overwatchScore;
		cardData.attackerName = attacker.name;
		cardData.button.actionEnd = true;
		if (cardData.test.hits > 0) cardData.button.overwatch = true;
		if (cardData.test.hits < cardData.hits) cardData.button.actionEndTitle = `${game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreSuccess")} ${currentOS}`;
		else cardData.button.actionEndTitle = game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreFailed");
	}

	static async addDecompilingResistanceInfoToCard(cardData, author){
		let newMessage = duplicate(cardData.originalMessage.flags.sr5data);
        if (newMessage.button.spriteDecompileDefense) newMessage.button.spriteDecompileDefense = !newMessage.button.spriteDecompileDefense;
		if (newMessage.button.targetDecompileDefense) newMessage.button.targetDecompileDefense = !newMessage.button.targetDecompileDefense;
		cardData.button.fadingResistance = false;

		if (cardData.test.hits < cardData.hits) {
			cardData.netHits = cardData.hits - cardData.test.hits;
			cardData.button.reduceTask = true;
		} else {
			cardData.button.reduceTask = false;
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.ResistDecompilingSuccess");
		}
		if (cardData.test.hits > 0){
			if (!newMessage.button.fadingResistanceActive){
				newMessage.button.fadingResistance = !newMessage.button.fadingResistance;
				newMessage.button.fadingResistanceActive = true;
			}
			newMessage.fadingValue = cardData.test.hits;
			if (newMessage.fadingValue < 2) newMessage.fadingValue = 2;
		}

		SR5_RollMessage.updateRollCard(cardData.originalMessage, newMessage);
	}

	static async addRegisteringResistanceInfoToCard(cardData, author){
		let newMessage = duplicate(cardData.originalMessage.flags.sr5data);
        if (newMessage.button.spriteRegisterDefense) newMessage.button.spriteRegisterDefense = !newMessage.button.spriteRegisterDefense;
		cardData.button.fadingResistance = false;

		if (cardData.test.hits < cardData.hits) {
			cardData.netHits = cardData.hits - cardData.test.hits;
			cardData.button.registerSprite = true;
		} else {
			cardData.button.registerSprite = false;
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.RegisteringFailed");
		}
		if (cardData.test.hits > 0){
			if (!newMessage.button.fadingResistanceActive){
				newMessage.button.fadingResistance = !newMessage.button.fadingResistance;
				newMessage.button.fadingResistanceActive = true;
			}
			newMessage.fadingValue = cardData.test.hits;
			if (newMessage.fadingValue < 2) newMessage.fadingValue = 2;
		}

		SR5_RollMessage.updateRollCard(cardData.originalMessage, newMessage);
	}

	static async addComplexFormResistanceInfoToCard(cardData, author){
		if (cardData.test.hits >= cardData.hits){
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.KillComplexFormFailed");
		} else {
			cardData.netHits = cardData.test.hits - cardData.hits;
			cardData.button.reduceComplexForm = true;
		}
	}

	static async addSpellResistanceInfoToCard(cardData, author){
		if (cardData.test.hits >= cardData.hits){
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.DispellingFailed");
		} else {
			cardData.netHits = cardData.test.hits - cardData.hits;
			cardData.button.reduceSpell = true;
		}
	}

	static async addBindingResistanceInfoToCard(cardData, author){
		let newMessage = duplicate(cardData.originalMessage.flags.sr5data);
        if (newMessage.button.spiritBindingDefense) newMessage.button.spiritBindingDefense = !newMessage.button.spiritBindingDefense;
		if (newMessage.button.targetBindingDefense) newMessage.button.targetBindingDefense = !newMessage.button.targetBindingDefense;
		cardData.button.drainCard = false;

		if (cardData.test.hits < cardData.hits) {
			cardData.netHits = cardData.hits - cardData.test.hits;
			cardData.button.bindSpirit = true;
		} else {
			cardData.button.bindSpirit = false;
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.BindingFailed");
		}
		if (cardData.test.hits > 0){
			if (!newMessage.button.drainCardActive){
				newMessage.button.drainCard = !newMessage.button.drainCard;
				newMessage.button.drainCardActive = true;
			}
			newMessage.drainValue = cardData.test.hits;
			if (newMessage.drainValue < 2) newMessage.drainValue = 2;
		}

		SR5_RollMessage.updateRollCard(cardData.originalMessage, newMessage);
	}

	static async addBanishingResistanceInfoToCard(cardData, author){
		let newMessage = duplicate(cardData.originalMessage.flags.sr5data);
        if (newMessage.button.spiritBanishingDefense) newMessage.button.spiritBanishingDefense = !newMessage.button.spiritBanishingDefense;
		if (newMessage.button.targetBanishingDefense) newMessage.button.targetBanishingDefense = !newMessage.button.targetBanishingDefense;
		cardData.button.drainCard = false;

		if (cardData.test.hits < cardData.hits) {
			cardData.netHits = cardData.hits - cardData.test.hits;
			cardData.button.reduceService = true;
		} else {
			cardData.button.reduceService = false;
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.BanishingFailed");
		}
		if (cardData.test.hits > 0){
			if (!newMessage.button.drainCardActive){
				newMessage.button.drainCard = !newMessage.button.drainCard;
				newMessage.button.drainCardActive = true;
			}
			newMessage.drainValue = cardData.test.hits;
			if (newMessage.drainValue < 2) newMessage.drainValue = 2;
		}

		SR5_RollMessage.updateRollCard(cardData.originalMessage, newMessage);
	}

	static async addEnchantmentResistanceInfoToCard(cardData, author){
		cardData.drainValue = cardData.test.hits;
		if (cardData.drainValue > 0) cardData.button.drainCard = true;
		if (cardData.hits > cardData.test.hits) {
			cardData.button.desactivateFocus = true;
		} else {
			cardData.button.desactivateFocus = false;
			cardData.button.actionEnd = true;
			cardData.button.actionEndTitle = `${game.i18n.localize("SR5.DisenchantFailed")}`;
		}
	}

	static async addDisjointingResistanceInfoToCard(cardData){
		if (cardData.test.hits >= cardData.hits){
			cardData.button.actionEnd = true;
			cardData.button.reducePreparationPotency = false;
			cardData.button.actionEndTitle = game.i18n.localize("SR5.DisjointingFailed");
		} else {
			cardData.netHits = cardData.test.hits - cardData.hits;
			cardData.button.reducePreparationPotency = true;
		}
	}
}
