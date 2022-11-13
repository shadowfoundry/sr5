import { SR5_RollMessage } from "../roll-message.js";

export default async function complexFormDefenseInfo(cardData){
    cardData.roll.netHits = cardData.previousMessage.hits - cardData.roll.hits;

    if (cardData.roll.netHits <= 0) cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));
    else {
        if (cardData.test.typeSub === "resonanceSpike" || cardData.test.typeSub === "derezz"){
            cardData.damage.matrix.value = cardData.roll.netHits;
            cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.matrix.value})`);
        } else {
            if (cardData.switch?.transferEffect) cardData.chatCard.buttons.applyEffect = SR5_RollMessage.generateChatButton("opposedTest", "applyEffect", game.i18n.localize("SR5.ApplyEffect"));
            else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.DefenseFailure"));
        }
    }

    //Update previous message to remove Complexform Defense button
    if (cardData.previousMessage.messageId) {
        if (!game.user?.isGM) {
            await SR5_SocketHandler.emitForGM("updateChatButton", {
                message: cardData.previousMessage.messageId,
                buttonToUpdate: "complexFormDefense",
            });
        } else SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "complexFormDefense");
    }
}