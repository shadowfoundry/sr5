export default function banishingResistance(rollData, actor, chatData){
    if (actor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);

    //Determine title
    rollData.test.title = game.i18n.localize("SR5.ResistBanishing");

    //Determine dicepool composition
    rollData.dicePool.composition = [{source: game.i18n.localize("SR5.Force"), type: "linkedAttribute", value: actorData.force.value}];

    //Determine base dicepool
    rollData.dicePool.base = actorData.force.value;

    //Determine dicepool modififiers
    if (actor.system.isBounded) {
        rollData.dicePool.modifiers.summonerMagic = {};
        rollData.dicePool.modifiers.summonerMagic.label = game.i18n.localize("SR5.v")
        rollData.dicePool.modifiers.summonerMagic.value = actor.system.summonerMagic;
    }

    //Add others informations
    rollData.test.type = "banishingResistance";
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.hits = chatData.roll.hits;

    return rollData;
}