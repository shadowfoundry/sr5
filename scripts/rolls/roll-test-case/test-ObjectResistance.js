import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function objectResistanceResultInfo(cardData){
    let labelEnd,
        originalMessage = game.messages.get(cardData.previousMessage.messageId),
        prevData = originalMessage.flags?.sr5data;

    cardData.roll.netHits = cardData.previousMessage.hits - cardData.roll.hits;
    if (cardData.roll.netHits > 0){
        labelEnd = `${game.i18n.localize("SR5.ObjectResistanceFailed")} (${cardData.roll.netHits})`;
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);

        if (prevData?.test.type === "spell") {
            //Update spell
            let item = await fromUuid(prevData.owner.itemUuid);
            let newItem = duplicate(item.system);
            if (newItem.duration === "sustained") newItem.isActive = true;
            await item.update({"system": newItem});
        }
    } else {
        labelEnd = game.i18n.localize("SR5.ObjectResistanceSuccess");
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
    }

    //Update previous chat button
    if (!prevData?.magic.spell.area > 0) SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "objectResistance");
}