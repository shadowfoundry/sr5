export default function decompilingResistance(rollData, actor, chatData){
    if (actor.type !== "actorSprite") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASprite")}`);

    //Determine title
    rollData.test.title = game.i18n.localize("SR5.ResistDecompiling");

    //Determine dicepool composition
    rollData.dicePool.composition = [{source: game.i18n.localize("SR5.Level"), type: "linkedAttribute", value: actor.system.level}];

    //Determine base dicepool
    rollData.dicePool.base = actor.system.level;

    //Determine dicepool modififiers
    if (actor.system.isRegistered) {
        rollData.dicePool.modifiers.compilerResonance = {};
        rollData.dicePool.modifiers.compilerResonance.label = game.i18n.localize("SR5.SpriteCompilerResonance")
        rollData.dicePool.modifiers.compilerResonance.value = actor.system.compilerResonance;
    }

    //Add others informations
    rollData.test.type = "decompilingResistance";
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.hits = chatData.roll.hits;

    return rollData;
}