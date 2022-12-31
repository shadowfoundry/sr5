import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function resistFire(rollData, actor, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.TryToNotCatchFire")} (${chatData.threshold.value})`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.resistances.specialDamage.fire.modifiers.filter(mod => (mod.type !=="linkedAttribute"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Check if AP is greater than Armor
    let armor = actor.system.itemsProperties.armor.value + actor.system.itemsProperties.armor.specialDamage.fire.value;
    if (-chatData.combat.armorPenetration > armor) chatData.combat.armorPenetration = -armor;

    //Add AP modifiers to dicepool
    rollData.dicePool.modifiers.armorPenetration = {};
    rollData.dicePool.modifiers.armorPenetration.value = chatData.combat.armorPenetration;
    rollData.dicePool.modifiers.armorPenetration.label = game.i18n.localize("SR5.ArmorPenetration");

    //Add others informations
    rollData.threshold.value = chatData.threshold.value;
    rollData.threshold.type = chatData.threshold.type;
    rollData.test.type = "resistFire";

    return rollData;
}