import { SR5_RollMessage } from "../roll-message.js";

export default async function regenerationInfo(cardData){
    cardData.roll.netHits = cardData.roll.hits + cardData.actorBody;
	cardData.chatCard.buttons.regeneration = SR5_RollMessage.generateChatButton("nonOpposedTest", "regeneration", `${game.i18n.format('SR5.Regenerate', {hits: cardData.roll.netHits})}`);
}