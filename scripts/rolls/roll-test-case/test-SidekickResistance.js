import { SR5_RollMessage } from "../roll-message.js";

export default async function sidekickResistanceInfo(cardData, type){
    let originalMessage = game.messages.get(cardData.previousMessage.messageId);
    let newMessage = originalMessage.flags?.sr5data;
    let key, label, labelEnd, buttonToRemove, resistType;
    cardData.roll.netHits = cardData.previousMessage.hits - cardData.roll.hits;

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

    if (cardData.roll.hits < cardData.previousMessage.hits) cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton("nonOpposedTest", key, label);
    else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", labelEnd);

    //Manage Drain or Fading
    if (resistType === "fading"){
        newMessage.matrix.fading.value = cardData.roll.hits * 2;
        if (newMessage.matrix.fading.value < 2) newMessage.matrix.fading.value = 2;
        newMessage.chatCard.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fading", `${game.i18n.localize("SR5.ResistFading")} (${newMessage.matrix.fading.value})`);
    } else if (resistType === "drain"){
        newMessage.magic.drain.value = cardData.roll.hits * 2;
        if (newMessage.magic.drain.value < 2) newMessage.magic.drain.value = 2;
        newMessage.chatCard.buttons.drain = SR5_RollMessage.generateChatButton("nonOpposedTest", "drain", `${game.i18n.localize("SR5.ResistDrain")} (${newMessage.magic.drain.value})`);
    }

    await SR5_RollMessage.updateRollCardHelper(cardData.previousMessage.messageId, newMessage);
    SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, buttonToRemove)
}