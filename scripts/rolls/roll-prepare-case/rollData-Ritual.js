import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function ritual(rollData, actor, item){
    if (!actor.system.magic.reagents > 0) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoReagents")}`);
    let itemData = item.system;

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.PerformRitual")} ${item.name}`;

    //Determine base dicepool & composition
    if (itemData.spellLinkedType !== ""){
        rollData.dicePool.composition = actor.system.skills.ritualSpellcasting.spellCategory[itemData.spellLinkedType].modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
        rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);
        rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.skills.ritualSpellcasting.spellCategory[itemData.spellLinkedType].modifiers);
    } else {
        rollData.dicePool.composition = actor.system.skills.ritualSpellcasting.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
        rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);
        rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.skills.ritualSpellcasting.test.modifiers);
    }

    //Limit
    rollData.limit.type = "force";
    rollData.limit.base = actor.system.specialAttributes.magic.augmented.value;

    //Background count limit modifier
    if (actor.system.magic.bgCount.value > 0){
        rollData = SR5_PrepareRollHelper.addBackgroundCountLimitModifiers(rollData, actor);
    }

    //Add others informations
    rollData.test.type = "ritual";
    rollData.magic.force = 1;
    rollData.dialogSwitch.reagents = true;
    rollData.dialogSwitch.specialization = true;
    rollData.owner.itemUuid = item.uuid;

    return rollData;
}