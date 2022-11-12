import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function sensorTarget(rollData, actor){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.SensorTargeting")}`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.skills.perception.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.skills.perception.test.modifiers);

    //Determine base limit
    rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.skills.perception.limit.value, actor.system.skills.perception.limit.modifiers);

    //Determine limit modififiers
    rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actor.system.skills.perception.limit.modifiers);

    //Add others informations
    rollData.test.type = "sensorTarget";

    return rollData;
}