import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function spritePower(rollData, actor, item){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.UsePower")} ${item.name}`;

    //Determine dicepool composition
    rollData.dicePool.composition = item.system.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, item.system.test.modifiers);

    //Determine base limit
    rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.matrix.attributes[item.system.testLimit].value, actor.system.matrix.attributes[item.system.testLimit].modifiers);

    //Determine limit modififiers
    rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actor.system.matrix.attributes[item.system.testLimit].modifiers);

    //Add others informations
    rollData.test.type = "spritePower";
    rollData.various.defenseFirstAttribute = item.system.defenseAttribute;
    rollData.various.defenseSecondAttribute = item.system.defenseMatrixAttribute;

    return rollData;
}