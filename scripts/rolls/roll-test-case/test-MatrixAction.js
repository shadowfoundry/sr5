import { SR5 } from "../../config.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5_MatrixHelpers } from "../roll-helpers/matrix.js";

export default async function matrixActionInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
	let actorData = actor.system;
	cardData.previousMessage.actorId = cardData.speakerId;

	//Matrix search special case
	if (cardData.test.typeSub === "matrixSearch"){
		let netHits = cardData.roll.hits - cardData.threshold.value;
		cardData.matrix.searchDuration = await SR5_MatrixHelpers.getMatrixSearchDuration(cardData, netHits);
		if (netHits <=0) {
			netHits = 1;
			cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.MatrixSearchFailed"));
		} else {
			cardData.chatCard.buttons.matrixSearchSuccess = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "matrixSearchSuccess", `${game.i18n.localize("SR5.MatrixSearchSuccess")} [${cardData.matrix.searchDuration}]`);
		}
		return cardData.test.title = `${game.i18n.localize("SR5.MatrixActionTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[cardData.test.typeSub])} (${cardData.threshold.value})`;
	}

	if (cardData.roll.hits > 0) {
		if (cardData.test.typeSub === "jackOut" && actorData.matrix.isLinkLocked) cardData.chatCard.buttons.jackOut = SR5_RollMessage.generateChatButton("nonOpposedTest", "jackOut", game.i18n.localize("SR5.MatrixActionJackOutResistance"), true);
		else if (cardData.test.typeSub === "eraseMark") cardData.chatCard.buttons.eraseMark = SR5_RollMessage.generateChatButton("opposedTest", "eraseMark", game.i18n.localize("SR5.ChooseMarkToErase"));
		else if (cardData.test.typeSub === "checkOverwatchScore") cardData.chatCard.buttons.checkOverwatchScore = SR5_RollMessage.generateChatButton("nonOpposedTest", "checkOverwatchScore", game.i18n.localize("SR5.OverwatchResistance"), true);
		else if (cardData.test.typeSub === "jamSignals") cardData.chatCard.buttons.matrixJamSignals = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixJamSignals", game.i18n.localize("SR5.MatrixActionJamSignals"));
		else if (cardData.test.typeSub === "iAmTheFirewall") cardData.chatCard.buttons.iAmTheFirewall = SR5_RollMessage.generateChatButton("opposedTest", "iAmTheFirewall", game.i18n.localize("SR5.ApplyEffect"));
		else if (cardData.test.typeSub === "intervene") cardData.chatCard.buttons.intervene = SR5_RollMessage.generateChatButton("opposedTest", "intervene", `${game.i18n.format("SR5.MatrixActionInterveneEffect", {hits: cardData.roll.hits})}`);
		else cardData.chatCard.buttons.matrixAction = SR5_RollMessage.generateChatButton("opposedTest", "matrixDefense", game.i18n.localize("SR5.Defend"));
	} else {
		cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.ActionFailure"));
	}
}