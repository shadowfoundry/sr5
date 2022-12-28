import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function matrixDefenseSimple(rollData, rollKey, actor){
    let matrixAction = actor.system.matrix.actions[rollKey];

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.MatrixDefenseTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.matrixRolledActions[rollKey])}`;

    //Determine dicepool composition
    rollData.dicePool.composition = matrixAction.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, matrixAction.test.modifiers);

    //Add others informations
    rollData.test.type = "matrixDefenseSimple";
    rollData.test.typeSub = rollKey;
    rollData.combat.activeDefenses.full = actor.system.specialProperties.fullDefenseValue || 0;

    return rollData;
}