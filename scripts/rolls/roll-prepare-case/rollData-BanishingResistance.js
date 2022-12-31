export default function banishingResistance(rollData, actor, chatData){
    if (actor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);

    //Determine title
    rollData.test.title = game.i18n.localize("SR5.ResistBanishing");

    //Determine dicepool composition
    rollData.dicePool.composition = [{source: game.i18n.localize("SR5.Force"), type: "linkedAttribute", value: actor.system.force.value}];

    //Determine base dicepool
    rollData.dicePool.base = actor.system.force.value;

    //Determine dicepool modififiers
    if (actor.system.isBounded) {
        rollData.dicePool.modifiers.summonerMagic = {};
        rollData.dicePool.modifiers.summonerMagic.label = game.i18n.localize("SR5.SpiritSummonerMagic");
        rollData.dicePool.modifiers.summonerMagic.value = actor.system.summonerMagic;
    }

    //Add others informations
    rollData.test.type = "banishingResistance";
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.messageId = chatData.owner.messageId;

    return rollData;
}