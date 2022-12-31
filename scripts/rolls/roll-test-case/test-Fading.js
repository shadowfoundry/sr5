import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5 } from "../../config.js";

export default async function fadingInfo(cardData, actorId){
    let damageValue = cardData.matrix.fading.value - cardData.roll.hits;
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId);

    //Fading do damage
    if (damageValue > 0) {
        cardData.damage.value = damageValue;
        cardData.damage.type = cardData.matrix.fading.type;
        //Add fading damage button
        cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])})`);
    } else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoFading"));

    //Update previous message to remove Fading Resistance button
    let originalMessage, prevData;
    if (cardData.previousMessage.messageId){
        originalMessage = game.messages.get(cardData.previousMessage.messageId);
        prevData = originalMessage.flags?.sr5data;
    }
    if (prevData?.chatCard.buttons.fadingResistance) {
        SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "fadingResistance");
    }
}