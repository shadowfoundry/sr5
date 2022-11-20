import { SR5_RollMessage } from "../roll-message.js";

export default async function fireResistanceInfo(cardData){
    if (cardData.roll.hits < cardData.firethreshold) {
        cardData.chatCard.buttons.catchFire = SR5_RollMessage.generateChatButton("nonOpposedTest", "catchFire", game.i18n.localize("SR5.CatchFire"));
    } else {
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.CatchFireResisted"));
    }
}