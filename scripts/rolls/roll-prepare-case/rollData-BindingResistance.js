export default function bindingResistance(rollData, actor, chatData){
    if (actor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);

    //Determine title
    rollData.test.title = game.i18n.localize("SR5.ResistBinding");

    //Determine dicepool composition
    rollData.dicePool.composition = [
        {source: game.i18n.localize("SR5.Force"), type: "linkedAttribute", value: actorData.force.value},
        {source: game.i18n.localize("SR5.Force"), type: "linkedAttribute", value: actorData.force.value},
    ];

    //Determine base dicepool
    rollData.dicePool.base = actorData.force.value * 2;

    //Add others informations
    rollData.test.type = "bindingResistance";
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.hits = chatData.roll.hits;

    return rollData;
}