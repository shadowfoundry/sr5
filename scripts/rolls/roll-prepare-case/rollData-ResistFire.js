import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function resistFire(rollData, actorData, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.TryToNotCatchFire")} (${chatData.fireTreshold})`;

    //Determine dicepool composition
    rollData.dicePool.composition = actorData.itemsProperties.armor.specialDamage.fire.modifiers.concat(actorData.itemsProperties.armor.modifiers);

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Check if AP is greater than Armor
    let armor = actorData.itemsProperties.armor.value + actorData.itemsProperties.armor.specialDamage.fire.value;
    if (-chatData.combat.armorPenetration > armor) chatData.combat.armorPenetration = -armor;

    //Add AP modifiers to dicepool
    rollData.dicePool.modifiers.armorPenetration = {};
    rollData.dicePool.modifiers.armorPenetration.value = chatData.combat.armorPenetration;
    rollData.dicePool.modifiers.armorPenetration.label = game.i18n.localize("SR5.ArmorPenetration");

    //Add others informations
    rollData.threshold.value = chatData.threshold.value;
    rollData.test.type = "resistFire";

    return rollData;
}