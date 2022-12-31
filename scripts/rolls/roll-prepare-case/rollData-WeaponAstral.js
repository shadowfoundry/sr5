import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function weaponAstral(rollData, item){
    let itemData = item.system;

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.AstralAttackWith")} ${item.name}`

    //Determine dicepool composition
    rollData.dicePool.composition = itemData.weaponSkill.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, itemData.weaponSkill.modifiers);

    //Determine limit
    rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(itemData.accuracy.value, itemData.accuracy.modifiers);
    rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, itemData.accuracy.modifiers);
    rollData.limit.type = "accuracy";

    //Add others informations
    rollData.test.typeSub = "astralCombat";
    rollData.test.type = "skillDicePool";
    rollData.damage.base = itemData.damageValue.value;
    rollData.damage.value = itemData.damageValue.value;
    rollData.dialogSwitch.chooseDamageType = true;
    rollData.dialogSwitch.specialization = true;

    return rollData;
}