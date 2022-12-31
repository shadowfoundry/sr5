import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function power(rollData, rollType, item){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.UsePower")} ${item.name}`;

    //Determine dicepool composition
    rollData.dicePool.composition = item.system.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, item.system.test.modifiers);

    //Add others informations
    rollData.test.type = rollType;
    rollData.dialogSwitch.extended = true;

    //Add defense attribute, if any
    if (item.system.defenseFirstAttribute && item.system.defenseSecondAttribute){
        rollData.dialogSwitch.extended = false;
        rollData.test.typeSub = "powerWithDefense";
        rollData.various.defenseFirstAttribute = item.system.defenseFirstAttribute || 0;
        rollData.various.defenseSecondAttribute = item.system.defenseSecondAttribute || 0;
    }

    //Add transferable effects
    rollData = SR5_PrepareRollHelper.addTransferableEffect(rollData, item);

    //Add drain roll if needed
    if (rollType === "adeptPower" && item.system.hasDrain) rollData.magic.drain.value = item.system.drainValue.value;

    //Special power cases
    if (item.system.systemEffects.length){
        for (let e of Object.values(item.system.systemEffects)){
            if (e.value === "paralyzingHowl") rollData.magic.spell.category = "paralyzingHowl";
            if (e.value === "regeneration") rollData.magic.spell.category = "regeneration";
        }
    }

    return rollData;
}