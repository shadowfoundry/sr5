import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5 } from "../../config.js";

//Add info for lift roll
export default async function lift(rollData, rollKey, actor){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.CarryingTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.weightActions[rollKey])}`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.weightActions[rollKey].test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.weightActions[rollKey].test.modifiers);

    //Add others informations
    rollData.test.type = "lift";
    rollData.test.typeSub = rollKey;

    return rollData;
}