import { SR5_RollMessage } from "../roll-message.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";

export default async function regenerationInfo(cardData){
    let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);

    cardData.roll.netHits = cardData.roll.hits + actor.system.attributes.body.augmented.value;
	cardData.chatCard.buttons.regeneration = SR5_RollMessage.generateChatButton("nonOpposedTest", "regeneration", `${game.i18n.format('SR5.Regenerate', {hits: cardData.roll.netHits})}`);
}