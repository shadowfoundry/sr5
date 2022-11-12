import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function objectResistanceResultInfo(cardData){
    let labelEnd;
    cardData.roll.netHits = cardData.hits - cardData.roll.hits;
    if (cardData.roll.netHits > 0){
        labelEnd = `${game.i18n.localize("SR5.ObjectResistanceFailed")} (${cardData.roll.netHits})`;
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);

        let prevData = cardData.previousMessage.messageId?.flags?.sr5data;
        if (prevData?.type === "spell") {
            let item = await fromUuid(prevData.itemUuid);
            let newItem = duplicate(item.system);
            if (newItem.duration === "sustained") newItem.isActive = true;
            await item.update({"system": newItem});

            if (!prevData.spellArea) {
                if (!game.user?.isGM) {
                    await SR5_SocketHandler.emitForGM("updateChatButton", {
                        message: cardData.previousMessage.messageId,
                        buttonToUpdate: "objectResistance",
                    });
                } else SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "objectResistance");
            }
        }
    } else {
        labelEnd = game.i18n.localize("SR5.ObjectResistanceSuccess");
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
    }
}