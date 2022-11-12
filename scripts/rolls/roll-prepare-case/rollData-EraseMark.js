import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
//TODO repasser là
export default function eraseMark(rollData, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.MarkResistance")}`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.matrix.actions.eraseMark.defense.dicePool.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.matrix.actions.eraseMark.defense.dicePool.modifiers);

    //Add others informations
    rollData.test.type = "eraseMark";
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.itemUuid = chatData.owner.itemUuid;
    rollData.previousMessage.hits = chatData.roll.hits;

    return rollData;
}