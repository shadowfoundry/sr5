export default function registeringResistance(rollData, actor, chatData){
    if (actor.type !== "actorSprite") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASprite")}`);

    //Determine title
    rollData.test.title = game.i18n.localize("SR5.ResistRegistering");

    //Determine dicepool composition
    rollData.dicePool.composition = [
        {source: game.i18n.localize("SR5.Level"), type: "linkedAttribute", value: actor.system.level},
        {source: game.i18n.localize("SR5.Level"), type: "linkedAttribute", value: actor.system.level},
    ];

    //Determine base dicepool
    rollData.dicePool.base = actor.system.level * 2;

    //Add others informations
    rollData.test.type = "registeringResistance";
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.messageId = chatData.owner.messageId;

    return rollData;
}