import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function sensorDefense(rollData, actor, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.SensorDefense")}`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.skills.sneaking.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.skills.sneaking.test.modifiers);

    //Determine base limit & modifiers
    if (actor.type === "actorDrone"){
        rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.skills.sneaking.limit.value, actor.system.skills.sneaking.limit.modifiers);
        rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actor.system.skills.sneaking.limit.modifiers);
    } else {
        rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.limits.physicalLimit.value, actor.system.limits.physicalLimit.modifiers);
        rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actor.system.limits.physicalLimit.modifiers);
    }

    //Add others informations
    rollData.test.type = "sensorDefense";
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.hits = chatData.roll.hits;

    return rollData;
}