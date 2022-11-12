import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5 } from "../../config.js";

export default async function defenseSimple(rollData, rollKey, actor){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.PhysicalDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterDefenses[rollKey])}`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.defenses[rollKey].modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.defenses[rollKey].modifiers);

    //Special case for active defenses : add limit
    if (rollKey !== "defend") {
        rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.limits.physicalLimit.value, actor.system.limits.physicalLimit.modifiers);
        rollData.limit.type = "physicalLimit";
    }

    //Handle cumulative defense
    rollData = await SR5_PrepareRollHelper.handleCumulativeDefense(rollData, actor);

    //Add others informations
    rollData.test.type = "defenseSimple";
    rollData.test.typeSub = rollKey;
    rollData.dialogSwitch.cover = true;
    rollData.combat.activeDefenses.full = actorData.specialProperties.fullDefenseValue || 0;
}