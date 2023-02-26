import { SR5 } from "../../config.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_MatrixHelpers } from "../roll-helpers/matrix.js";

export default async function matrixDefenseInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
		actorData = actor.system,
		attacker = SR5_EntityHelpers.getRealActorFromID(cardData.previousMessage.actorId),
		attackerData = attacker?.system,
		netHits = cardData.previousMessage.hits - cardData.roll.hits,
		targetItem = await fromUuid(cardData.target.itemUuid);

	//Overwatch button if illegal action
	if (cardData.matrix.overwatchScore && cardData.roll.hits > 0) cardData.chatCard.buttons.overwatch = await SR5_RollMessage.generateChatButton("nonOpposedTest", "overwatch", `${game.i18n.format('SR5.IncreaseOverwatch', {name: attacker.name, score: cardData.roll.hits})}`);

	//if defender wins
	if (netHits <= 0) {
		cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));

		if (cardData.matrix.actionType === "attack" && netHits < 0) {
			cardData.damage.matrix.value = netHits * -1;
			cardData.chatCard.buttons.defenderDoMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.format('SR5.DoMatrixDamage', {key: cardData.damage.matrix.value, name: attacker.name})}`);
			//If Biofeedback, add damage and button
			if ((actorData.matrix.programs.biofeedback.isActive || actorData.matrix.programs.blackout.isActive)
			  && attackerData.matrix.userMode !== "ar"
			  && (attacker.type === "actorPc" || attacker.type === "actorGrunt")) {
				cardData.damage.base = netHits * -1;
				cardData.damage.value = netHits * -1;
				cardData.damage.resistanceType = "biofeedback";
				cardData.damage.type = "stun";
				if ((actorData.matrix.programs.biofeedback.isActive && attackerData.matrix.userMode === "hotsim")) cardData.damage.type = "physical";
				cardData.chatCard.buttons.defenderDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoBiofeedbackDamage", `${game.i18n.format('SR5.DoBiofeedBackDamage', {damage: cardData.damage.matrix.value, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])), name: attacker.name})}`);
			}
		} else if (cardData.matrix.actionType === "sleaze") {
			cardData.chatCard.buttons.defenderPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderPlaceMark", `${game.i18n.format('SR5.DefenderPlaceMarkTo', {key: cardData.matrix.mark, item: targetItem.name, name: attacker.name})}`);
		}
	}

	//if attacker wins
	else {
		switch (cardData.test.typeSub) {
			case "hackOnTheFly":
				cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.matrix.mark, item: targetItem.name, name: cardData.owner.speakerActor})}`);
				break;
			case "bruteForce":
				cardData.damage.matrix.value = Math.ceil(netHits / 2);
				cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.matrix.mark, item: targetItem.name, name: cardData.owner.speakerActor})}`);
				if (actorData.matrix.deviceType !== "host") cardData.chatCard.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.damage.matrix.value})`);
				break;
			case "dataSpike":
				cardData.damage.matrix.base = attacker.system.matrix.attributes.attack.value;
				cardData = await SR5_MatrixHelpers.updateMatrixDamage(cardData, netHits, actor);
				cardData.chatCard.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.damage.matrix.value})`);
				break;
			case "popupCybercombat":
				cardData.damage.matrix.base = 0;
				cardData = await SR5_MatrixHelpers.updateMatrixDamage(cardData, netHits, actor);
				cardData.chatCard.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.damage.matrix.value})`);
				cardData.chatCard.buttons.popup = SR5_RollMessage.generateChatButton("nonOpposedTest", "popup", game.i18n.localize("SR5.ApplyEffect"));
				break;
			case "popupHacking":
				cardData.chatCard.buttons.popup = SR5_RollMessage.generateChatButton("nonOpposedTest", "popup", game.i18n.localize("SR5.ApplyEffect"));
				break;
			case "denialOfService":
				cardData.chatCard.buttons.denialOfService = SR5_RollMessage.generateChatButton("nonOpposedTest", "denialOfService", game.i18n.localize("SR5.ApplyEffect"));
				break;
			case "haywire":
				cardData.chatCard.buttons.haywire = SR5_RollMessage.generateChatButton("nonOpposedTest", "haywire", game.i18n.localize("SR5.ApplyEffect"));
				break;
			default:
				cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.DefenseFailure"));
		}
	}

	//Remove chat button from previous chat message
    if (cardData.previousMessage.messageId){
        let originalMessage = game.messages.get(cardData.previousMessage.messageId);
        if (originalMessage.flags?.sr5data?.chatCard.buttons?.matrixAction) {
            SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "matrixAction");
        }
    }
}