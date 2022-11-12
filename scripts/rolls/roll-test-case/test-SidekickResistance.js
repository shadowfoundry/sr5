import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function sidekickResistanceInfo(cardData, type){
    let originalMessage = game.messages.get(cardData.previousMessage.messageId);
    let newMessage = originalMessage.flags?.sr5data;
    let key, label, labelEnd, buttonToRemove, resistType;
    cardData.roll.netHits = cardData.hits - cardData.roll.hits;

    switch (type){
        case "decompilingResistance":
            key = "reduceTask";
            label = `${game.i18n.localize("SR5.ReduceTask")} (${cardData.roll.netHits})`;
            labelEnd = game.i18n.localize("SR5.ResistDecompilingSuccess");
            buttonToRemove = "decompilingResistance";
            resistType = "fading";
            break;
        case "registeringResistance":
            key = "registerSprite";
            label = game.i18n.localize("SR5.HELP_RegisterButton");
            labelEnd = game.i18n.localize("SR5.RegisteringFailed");
            buttonToRemove = "registeringResistance";
            resistType = "fading";
            break;
        case "bindingResistance":
            key = "bindSpirit";
            label = game.i18n.localize("SR5.BindSpirit");
            labelEnd = game.i18n.localize("SR5.BindingFailed");
            buttonToRemove = "bindingResistance";
            resistType = "drain";
            break;
        case "banishingResistance":
            key = "reduceService";
            label = `${game.i18n.localize("SR5.ReduceService")} (${cardData.roll.netHits})`;
            labelEnd = game.i18n.localize("SR5.BanishingFailed");
            buttonToRemove = "banishingResistance";
            resistType = "drain";
            break;
    }

    if (cardData.roll.hits < cardData.hits) cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton("nonOpposedTest", key, label);
    else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", labelEnd);

    if (cardData.roll.hits > 0){
        if (resistType === "fading"){
            newMessage.fadingValue = cardData.roll.hits;
            if (newMessage.fadingValue < 2) newMessage.fadingValue = 2;
            newMessage.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fading", `${game.i18n.localize("SR5.ResistFading")} (${newMessage.fadingValue})`);
        } else if (resistType === "drain"){
            newMessage.drainValue = cardData.roll.hits;
            if (newMessage.drainValue < 2) newMessage.drainValue = 2;
            newMessage.buttons.drain = SR5_RollMessage.generateChatButton("nonOpposedTest", "drain", `${game.i18n.localize("SR5.ResistDrain")} (${newMessage.drainValue})`);
        }
    }

    await SR5_RollMessage.updateRollCard(cardData.previousMessage.messageId, newMessage);
    if (!game.user?.isGM) {
        await SR5_SocketHandler.emitForGM("updateChatButton", {
            message: cardData.previousMessage.messageId,
            buttonToUpdate: buttonToRemove,
        });
    } else SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, buttonToRemove);
}