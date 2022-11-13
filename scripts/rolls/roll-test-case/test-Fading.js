import { SR5_RollMessage } from "../roll-message.js";
import { SR5_SocketHandler } from "../../socket.js";

export default async function fadingInfo(cardData){
    let damageValue = cardData.fadingValue - cardData.roll.hits;

    if (damageValue > 0) {
        cardData.damage.value = damageValue;
        //Check if Fading is Stun or Physical
        if (cardData.fadingType) cardData.damage.type = cardData.fadingType;
        else {
            if (cardData.previousMessage.hits > cardData.actorResonance || cardData.fadingType === "physical") cardData.damage.type = "physical";
            else cardData.damage.type = "stun";
        }
        //Add fading damage button
        cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])})`);
    } else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoFading"));

    //Update previous message to remove Fading Resistance button
    let originalMessage, prevData;
    if (cardData.previousMessage.messageId){
        originalMessage = game.messages.get(cardData.previousMessage.messageId);
        prevData = originalMessage.flags?.sr5data;
    }
    if (prevData.buttons.fadingResistance) {
        if (!game.user?.isGM) {
            await SR5_SocketHandler.emitForGM("updateChatButton", {
                message: cardData.previousMessage.messageId,
                buttonToUpdate: "fadingResistance",
            });
        } else SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "fadingResistance");
    }
}