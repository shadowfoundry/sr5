import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function regenerationResultInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
    cardData.roll.netHits = cardData.roll.hits + actor.system.attributes.body.augmented.value;
    cardData.chatCard.buttons.regeneration = SR5_RollMessage.generateChatButton("nonOpposedTest", "regeneration", `${game.i18n.format('SR5.Regenerate', {hits: cardData.roll.netHits})}`);
}