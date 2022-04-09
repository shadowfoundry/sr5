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

		//If roller is a bounder spirit, use actor Edge instead
		if (messageData.actor.type === "actorSpirit"){
			creator = SR5_EntityHelpers.getRealActorFromID(messageData.actor.data.creatorId);
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
							if (dialogData.templateRemove) SR5_RollMessage.removeTemplate(null, dialogData.item.id);
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
						if (!isNaN(reagentsSpent)) {
							realActor.update({ "data.magic.reagents": actor.data.magic.reagents - reagentsSpent});
							dialogData.reagentsSpent = reagentsSpent;
						}

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

    //console.log(chatData.flags.sr5data);
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
		cardData.buttons = {};

		//Handle Extended Test
		if (cardData.extendedTest){
			cardData.extendedIntervalValue = cardData.extendedMultiplier * cardData.extendedRoll;
			if (cardData.dicePool <= 0) cardData.extendedTest = false;
		}

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
			case "activeSensorTargeting":
			case "preparationFormula":
			case "matrixIceAttack":
			case "spritePower":
			case "power":
			case "ritual":
				if (cardData.type === "power" && cardData.typeSub !== "powerWithDefense") return;
				SR5_Dice.addActionHitInfoToCard(cardData, cardData.type);
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
			case "powerDefense":
				SR5_Dice.addPowerDefenseInfoToCard(cardData, author);
				break;
			case "resonanceAction":
				SR5_Dice.addResonanceActionInfoToCard(cardData, author);
				break;
			case "resistFire":
				SR5_Dice.addResistFireInfoToCard(cardData, author);
				break;
			case "preparationResistance":
			case "ritualResistance":
			case "summoningResistance":
			case "compilingResistance":
			case "activeSensorDefense":
			case "jackOutDefense":
			case "eraseMark":
				SR5_Dice.addDefenseResultInfoToCard(cardData, cardData.type);
				break;
			case "overwatchResistance":
				SR5_Dice.addOverwatchResistanceInfoToCard(cardData, author);
				break;
			case "registeringResistance":
			case "decompilingResistance":
			case "bindingResistance":
			case "banishingResistance":
				SR5_Dice.addSidekickResistanceInfoToCard(cardData, cardData.type);
				break;
			case "spellResistance":
			case "complexFormResistance":
			case "enchantmentResistance":
			case "disjointingResistance":
				SR5_Dice.addResistanceResultInfoToCard(cardData, cardData.type);
				break;
			case "attribute":
			case "languageSkill":
            case "knowledgeSkill":
			case "defense":
			case "resistance":
			case "matrixSimpleDefense":
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
			cardData.buttons.resistanceCard = SR5_RollMessage.generateChatButton("opposedTest","resistanceCard",label);
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
		if (netHits <= 0) cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
		else {
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
					cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.VehicleArmorResistance"));
					return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToStunDamage")}`);
				}
				if (author.data.attributes.armor.augmented.value >= cardData.damageValue) {
					cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.VehicleArmorResistance"));
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
		//Remove Resist chat button from previous chat message, if necessary
		let prevData = cardData.originalMessage?.flags?.sr5data;
		if (prevData.type === "spell") {
			if (prevData.item.data.range !== "area") SR5_RollMessage.updateChatButton(cardData.originalMessage, "resistanceCard");
		} else if (prevData.typeSub !== "grenade") SR5_RollMessage.updateChatButton(cardData.originalMessage, "resistanceCard");

		//Add automatic succes to Spirit TO-DO : change this when Materialization is up.
		if (author.type === "actorSpirit" && (cardData.typeSub === "physicalDamage" || cardData.typeSub === "stun")) {
			let hardenedArmor = Math.floor((author.data.essence.value + cardData.incomingPA) / 2);
			if (hardenedArmor > 0) {
			  ui.notifications.info(`${game.i18n.localize("SR5.HardenedArmor")}: ${hardenedArmor} ${game.i18n.localize("SR5.INFO_AutomaticHits")}`);
			  cardData.test.hits += hardenedArmor;
      		}
		}

		cardData.damageValue = cardData.damageValueBase - cardData.test.hits;
		if (cardData.damageValue > 0) cardData.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`);
		else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDamage"));

		//Remove Biofeedback chat button from previous chat message
		if (cardData.typeSub === "biofeedbackDamage"){
			if (prevData.buttons.attackerDoBiofeedbackDamage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "attackerDoBiofeedbackDamage");
			if (prevData.buttons.defenderDoBiofeedbackDamage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "defenderDoBiofeedbackDamage");
		} 
	}

	static async addSpellInfoToCard(cardData){
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
		if (cardData.originalMessage && cardData.originalMessage.flags.sr5data.type !== "ritualResistance") SR5_RollMessage.updateChatButton(cardData.originalMessage, "drainCard");
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
		if (cardData.originalMessage.flags.sr5data.buttons.fadingResistance) SR5_RollMessage.updateChatButton(cardData.originalMessage, "fadingResistance");
	}

	static async addComplexFormInfoToCard(cardData){
		cardData.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fadingCard", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);
		
		if (cardData.test.hits > 0) {
			cardData.hits = cardData.test.hits;
			cardData.originalActionAuthor = cardData.speakerId;
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
		if (cardData.originalMessage) SR5_RollMessage.updateChatButton(cardData.originalMessage, "complexFormDefense");
	}

	static async addMatrixActionInfoToCard(cardData, author){
		cardData.originalActionAuthor = cardData.speakerId;

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
			return;
		}

		if (cardData.test.hits > 0) {
			if (cardData.typeSub === "jackOut" && author.data.matrix.isLinkLocked) cardData.buttons.jackOut = SR5_RollMessage.generateChatButton("nonOpposedTest", "jackOut", game.i18n.localize("SR5.MatrixActionJackOutResistance"));
			else if (cardData.typeSub === "eraseMark") cardData.buttons.eraseMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "eraseMark", game.i18n.localize("SR5.ChooseMarkToErase"));
			else if (cardData.typeSub === "checkOverwatchScore") cardData.buttons.checkOverwatchScore = SR5_RollMessage.generateChatButton("nonOpposedTest", "checkOverwatchScore", game.i18n.localize("SR5.OverwatchResistance"));
			else if (cardData.typeSub === "jamSignals") cardData.buttons.matrixJamSignals = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixJamSignals", game.i18n.localize("SR5.MatrixActionJamSignals"));
			else cardData.buttons.matrixAction = SR5_RollMessage.generateChatButton("opposedTest", "matrixDefense", game.i18n.localize("SR5.Defend"));
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.ActionFailure"));
		}

		
	}

	static async addMatrixDefenseInfoToCard(cardData, author){
		let defender = author,
			attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionAuthor),
			attackerData = attacker?.data.data,
			netHits = cardData.hits - cardData.test.hits;

		cardData.attackerName = attacker.name;

		//Overwatch button if illegal action
		if (cardData.overwatchScore && cardData.test.hits > 0) cardData.buttons.overwatch = SR5_RollMessage.generateChatButton("nonOpposedTest", "overwatch", `${game.i18n.format('SR5.IncreaseOverwatch', {name: cardData.attackerName, score: cardData.test.hits})}`);

		//if defender wins
		if (netHits <= 0) {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));

			if (cardData.matrixActionType === "attack" && netHits < 0) {
				cardData.matrixDamageValue = netHits * -1;
				cardData.buttons.defenderDoMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.format('SR5.DoMatrixDamage', {key: cardData.matrixDamageValue, name: cardData.attackerName})}`);
				//If Biofeedback, add damage and button
				if ((defender.data.matrix.programs.biofeedback.isActive || defender.data.matrix.programs.blackout.isActive)
				  && attackerData.matrix.userMode !== "ar"
				  && (attacker.data.type === "actorPc" || attacker.data.type === "actorGrunt")) {
					cardData.damageValueBase = netHits * -1;
					cardData.damageValue = netHits * -1;
					cardData.damageResistanceType = "biofeedback";
					cardData.damageType = "stun";
					if ((defender.data.matrix.programs.biofeedback.isActive && attackerData.matrix.userMode === "hotSim")) cardData.damageType = "physical";
					cardData.buttons.defenderDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoBiofeedbackDamage", `${game.i18n.format('SR5.DoBiofeedBackDamage', {damage: cardData.matrixDamageValue, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.damageType])), name: cardData.attackerName})}`);
				}
			} else if (cardData.matrixActionType === "sleaze") {
        		cardData.mark = 1;
				cardData.buttons.defenderPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderPlaceMark", `${game.i18n.format('SR5.DefenderPlaceMarkTo', {key: cardData.mark, item: cardData.matrixTargetItem.name, name: cardData.attackerName})}`);
			}
		}

		//if attacker wins
		else {
			switch (cardData.typeSub) {
				case "hackOnTheFly":
					cardData.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: cardData.matrixTargetItem.name, name: cardData.speakerActor})}`);
					break;
				case "bruteForce":
					cardData.matrixDamageValue = Math.ceil(netHits / 2);
					cardData.matrixResistanceType = "matrixDamage";
					cardData.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: cardData.matrixTargetItem.name, name: cardData.speakerActor})}`);
					if (defender.data.matrix.deviceType !== "host") cardData.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.matrixDamageValue})`);
					break;
				case "dataSpike":
					cardData.matrixResistanceType = "matrixDamage";
					cardData.matrixDamageValueBase = attacker.data.data.matrix.attributes.attack.value;
					cardData = await SR5_DiceHelper.updateMatrixDamage(cardData, netHits, author);
					cardData.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.matrixDamageValue})`);
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
					cardData.damageResistanceType = "biofeedback";
					cardData.damageValue = cardData.matrixDamageValueBase;
					cardData.damageType = "stun";
					if ((attackerData.matrix.programs.biofeedback.isActive && defender.data.matrix.userMode === "hotSim") || (attackerData.matrix.deviceSubType === "iceBlack")) cardData.damageType = "physical";
					cardData.buttons.attackerDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerDoBiofeedbackDamage", `${game.i18n.localize('SR5.TakeOnDamageBiofeedback')} ${game.i18n.localize('SR5.DamageValueShort')} ${cardData.damageValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damageType])}`);
				}
			}
			//If Link Lock, add button
			if (attackerData.matrix.programs.lockdown.isActive) cardData.buttons.linkLock = SR5_RollMessage.generateChatButton("nonOpposedTest", "linkLock", game.i18n.localize('SR5.MatrixLinkLock'));
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDamage"));
		}

		//Remove Resist chat button from previous chat message
		if (cardData.originalMessage.flags?.sr5data?.buttons?.matrixResistance) SR5_RollMessage.updateChatButton(cardData.originalMessage, "matrixResistance");
	}

	static async addIceDefenseInfoToCard(cardData, author){
		let netHits = cardData.hits - cardData.test.hits,
			markedActor = await SR5_EntityHelpers.getRealActorFromID(author._id),
			originalActor = await SR5_EntityHelpers.getRealActorFromID(cardData.originalActionAuthor),
			existingMark = await SR5_DiceHelper.findMarkValue(cardData.matrixTargetItem.data, originalActor.id);

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
					if (cardData.actor.data.matrix.attributes.firewall.value > 0) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceFirewall"));
					else cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceBinder":
					if (cardData.actor.data.matrix.attributes.dataProcessing.value > 0) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceDataProcessing"));
					else cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceJammer":
					if (cardData.actor.data.matrix.attributes.attack.value > 0) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceAttack"));
					else cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceMarker":
					if (cardData.actor.data.matrix.attributes.dataProcessing.value > 0) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceSleaze"));
					else cardData.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
					break;
				case "iceKiller":
				case "iceBlaster":
				case "iceBlack":
				case "iceSparky":
					cardData.matrixResistanceType = "matrixDamage";
					cardData = await SR5_DiceHelper.updateMatrixDamage(cardData, netHits, author);
					if ((cardData.iceType === "iceBlaster" || cardData.iceType === "iceBlack") && (!cardData.actor.data.matrix.isLinkLocked)) {
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
					cardData.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: cardData.matrixTargetItem.name, name: cardData.speakerActor})}`);
					break;
				case "iceScramble":
					if (existingMark >= 3) cardData.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.DeviceReboot"));
					break;
				case "iceTarBaby":
					if (cardData.actor.data.matrix.isLinkLocked) {
						cardData.mark = 1;
						cardData.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: cardData.matrixTargetItem.name, name: cardData.speakerActor})}`);
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
		cardData.ownerAuthor = cardData.speakerId;
		cardData.hits = cardData.test.hits;

		if (cardData.hasTarget) testType = "nonOpposedTest";
		else testType = "opposedTest";

		if (cardData.targetEffect) itemTarget = await fromUuid(cardData.targetEffect);

		switch (cardData.typeSub){
			case "summoning":
				cardData.buttons.summoningResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "summoningResistance", game.i18n.localize("SR5.SpiritResistance"));
				break;
			case "binding":
				cardData.buttons.bindingResistance = SR5_RollMessage.generateChatButton(testType, "bindingResistance", game.i18n.localize("SR5.SpiritResistance"));
				break;
			case "banishing":
				cardData.buttons.banishingResistance = SR5_RollMessage.generateChatButton(testType, "banishingResistance", game.i18n.localize("SR5.SpiritResistance"));
				break;
			case "counterspelling":
				if (cardData.targetEffect){
					//Get Drain value
					cardData.drainValue = itemTarget.data.data.drainValue.value;
					if (itemTarget.data.data.force > cardData.actor.data.specialAttributes.magic.augmented.value) cardData.drainType = "physical";
					else cardData.drainType = "stun";
					//Add buttons to chat
					cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
					if (cardData.test.hits > 0) cardData.buttons.dispellResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "dispellResistance", game.i18n.localize("SR5.SpellResistance"));
				}
				break;
			case "disenchanting":
				if (cardData.targetEffect){
					if (itemTarget.type === "itemPreparation"){
						cardData.drainValue = itemTarget.data.data.drainValue.value;
						if (cardData.test.hits > cardData.actor.data.specialAttributes.magic.augmented.value) cardData.drainType = "physical";
						else cardData.drainType = "stun";
						cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
					}
					if (cardData.test.hits > 0) {
						if (itemTarget.type === "itemFocus") cardData.buttons.enchantmentResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "enchantmentResistance", game.i18n.localize("SR5.EnchantmentResistance"));
						if (itemTarget.type === "itemPreparation") cardData.buttons.disjointingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "disjointingResistance", game.i18n.localize("SR5.DisjointingResistance"));
					}
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
			cardData.buttons.compileSpriteResist = SR5_RollMessage.generateChatButton("nonOpposedTest", "compileSpriteResist", game.i18n.localize("SR5.SpriteResistance"));
		}
		if (cardData.typeSub === "decompileSprite"){
			cardData.buttons.decompilingResistance = SR5_RollMessage.generateChatButton(testType, "decompilingResistance", game.i18n.localize("SR5.SpriteResistance"));
		}
		if (cardData.typeSub === "registerSprite"){
			cardData.buttons.registeringResistance = SR5_RollMessage.generateChatButton(testType, "registeringResistance", game.i18n.localize("SR5.SpriteResistance"));;
		}
		if (cardData.typeSub === "killComplexForm" && cardData.targetEffect) {
			let complexForm = await fromUuid(cardData.targetEffect);
			cardData.fadingValue = complexForm.data.data.fadingValue;
			if (complexForm.data.data.level > cardData.actor.data.specialAttributes.resonance.augmented.value) cardData.fadingType = "physical";
			else cardData.fadingType = "stun";
			cardData.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fadingCard", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);

			if (cardData.test.hits > 0) cardData.buttons.killComplexFormResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "killComplexFormResistance", game.i18n.localize("SR5.ComplexFormResistance"));
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
		let key, label, labelEnd, testType;
		cardData.hits = cardData.test.hits;
		cardData.originalActionAuthor = cardData.speakerId;
		cardData.ownerAuthor = cardData.speakerId;

		switch (type){
			case "activeSensorTargeting":
				label = game.i18n.localize("SR5.SensorDefense");
				labelEnd = game.i18n.localize("SR5.SensorTargetingActiveFailed");
				key = "activeSensorDefense";
				testType = "opposedTest";
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
			case "ritual":
				label = game.i18n.localize("SR5.RitualResistance");
				labelEnd = game.i18n.localize("SR5.RitualFailed");
				key = "ritualResistance";
				testType = "nonOpposedTest";
		}

		if (cardData.test.hits > 0) {
			cardData.buttons[key] = SR5_RollMessage.generateChatButton(testType, key, label);
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
		}
	}

	static async addDefenseResultInfoToCard(cardData, type){
		let key, label, labelEnd;
		let prevData = cardData.originalMessage?.flags?.sr5data;

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

				if (cardData.item.data.durationMultiplier === "netHits"){
					let realActor = SR5_EntityHelpers.getRealActorFromID(cardData.actor._id);
					SR5_DiceHelper.srDicesUpdateItem(cardData, realActor);
				}
				break;
			case "eraseMark":
				label = game.i18n.localize("SR5.MatrixActionEraseMark");
				labelEnd = game.i18n.localize("SR5.MatrixActionEraseMarkFailed");
				key = "eraseMarkSuccess";
				if (cardData.originalMessage.flags.sr5data.button.eraseMark) SR5_RollMessage.updateChatButton(cardData.originalMessage, "eraseMark");
				break;
		}

		if (cardData.test.hits < cardData.hits) cardData.buttons[key] = SR5_RollMessage.generateChatButton("nonOpposedTest", key, label);
		else cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
	}

	static async addOverwatchResistanceInfoToCard(cardData){
		let label;
		let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionAuthor)
		let currentOS = attacker.data.data.matrix.overwatchScore;
		cardData.attackerName = attacker.name;
		
		if (cardData.test.hits < cardData.hits) label = `${game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreSuccess")} ${currentOS}`;
		else label = game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreFailed");

		cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", label);
	}

	static async addSidekickResistanceInfoToCard(cardData, type){
		let newMessage = duplicate(cardData.originalMessage.flags.sr5data);
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

		if (cardData.test.hits < cardData.hits) {
			cardData.buttons[key] = SR5_RollMessage.generateChatButton("nonOpposedTest", key, label);
		} else {
			cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", labelEnd);
		}
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
		await SR5_RollMessage.updateChatButton(cardData.originalMessage, buttonToRemove);
	}

	static async addResistanceResultInfoToCard(cardData, type){
		let key, label, labelEnd;
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
			default :
		}

		if (cardData.test.hits >= cardData.hits)cardData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
		else cardData.buttons[key] = SR5_RollMessage.generateChatButton("nonOpposedTest", key, label);

		if (cardData.drainValue > 0) cardData.buttons.drainCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "drainCard", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.drainValue})`);
	}
}
