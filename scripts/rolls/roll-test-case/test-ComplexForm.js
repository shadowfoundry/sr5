import { SR5_RollMessage } from "../roll-message.js";

export default async function complexFormInfo(cardData){
    cardData.chatCard.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fading", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);
		
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