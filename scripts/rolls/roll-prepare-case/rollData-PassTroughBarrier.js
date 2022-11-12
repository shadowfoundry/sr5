import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function passThroughBarrier(rollData, actor){
    //Determine title
    rollData.test.title = game.i18n.localize("SR5.PassThroughBarrierTest");

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.magic.passThroughBarrier.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.magic.passThroughBarrier.modifiers);

    //Determine base limit
    rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.limits.astralLimit.value, actor.system.limits.astralLimit.modifiers);

    //Determine limit modififiers
    rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actor.system.limits.astralLimit.modifiers);

    //Add others informations
    rollData.test.type = "passThroughBarrier";
    rollData.limit.type = "astral";

    //Background count limit modifier
    if (actorData.magic.bgCount.value > 0){
        rollData = SR5_PrepareRollHelper.addBackgroundCountLimitModifiers(rollData, actor);
    }

    return rollData;
}