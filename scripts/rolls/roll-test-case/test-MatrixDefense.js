import { SR5_RollMessage } from "../roll-message.js";

export default async function matrixDefenseInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
		actorData = actor.system,
		attacker = SR5_EntityHelpers.getRealActorFromID(cardData.previousMessage.actorId),
		attackerData = attacker?.system,
		netHits = cardData.previousMessage.hits - cardData.roll.hits,
		targetItem = await fromUuid(cardData.target.itemUuid);

	cardData.attackerName = attacker.name;

	//Overwatch button if illegal action
	if (cardData.overwatchScore && cardData.roll.hits > 0) cardData.chatCard.buttons.overwatch = await SR5_RollMessage.generateChatButton("nonOpposedTest", "overwatch", `${game.i18n.format('SR5.IncreaseOverwatch', {name: cardData.attackerName, score: cardData.roll.hits})}`);

	//if defender wins
	if (netHits <= 0) {
		cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));

		if (cardData.matrixActionType === "attack" && netHits < 0) {
			cardData.damage.matrix.value = netHits * -1;
			cardData.chatCard.buttons.defenderDoMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.format('SR5.DoMatrixDamage', {key: cardData.damage.matrix.value, name: cardData.attackerName})}`);
			//If Biofeedback, add damage and button
			if ((actorData.matrix.programs.biofeedback.isActive || actorData.matrix.programs.blackout.isActive)
			  && attackerData.matrix.userMode !== "ar"
			  && (attacker.type === "actorPc" || attacker.type === "actorGrunt")) {
				cardData.damage.base = netHits * -1;
				cardData.damage.value = netHits * -1;
				cardData.damage.resistanceType = "biofeedback";
				cardData.damage.type = "stun";
				if ((actorData.matrix.programs.biofeedback.isActive && attackerData.matrix.userMode === "hotSim")) cardData.damage.type = "physical";
				cardData.chatCard.buttons.defenderDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoBiofeedbackDamage", `${game.i18n.format('SR5.DoBiofeedBackDamage', {damage: cardData.damage.matrix.value, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])), name: cardData.attackerName})}`);
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
				cardData.damage.matrix.value = Math.ceil(netHits / 2);
				cardData.matrixResistanceType = "matrixDamage";
				cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
				if (actorData.matrix.deviceType !== "host") cardData.chatCard.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.damage.matrix.value})`);
				break;
			case "dataSpike":
				cardData.matrixResistanceType = "matrixDamage";
				cardData.damage.matrix.valueBase = attacker.system.matrix.attributes.attack.value;
				cardData = await SR5_DiceHelper.updateMatrixDamage(cardData, netHits, actor);
				cardData.chatCard.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${cardData.damage.matrix.value})`);
				break;
			default:
				cardData.chatCard.buttons.actionEnd = await SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.DefenseFailure"));
			}
		}
}