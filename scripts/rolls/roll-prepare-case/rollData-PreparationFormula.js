import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function preparationFormula(rollData, actor, item){
    let alchemicalSpellCategories = item.system.category;

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.PreparationCreate")}${game.i18n.localize("SR5.Colons")} ${item.name}`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.skills.alchemy.spellCategory[alchemicalSpellCategories].modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.skills.alchemy.spellCategory[alchemicalSpellCategories].modifiers);

    //Add others informations
    rollData.test.type = "preparationFormula";
    rollData.dialogSwitch.specialization = true;
    rollData.dialogSwitch.reagents = true;
    rollData.magic.drain.modifiers.spell = {};
    rollData.magic.drain.modifiers.spell.value = item.system.drain.value;
    rollData.magic.drain.modifiers.spell.label = game.i18n.localize("SR5.DrainModifier");
    rollData.magic.force = actor.system.specialAttributes.magic.augmented.value;

    //Background count limit modifier
    if (actor.system.magic.bgCount.value > 0){
        rollData = SR5_PrepareRollHelper.addBackgroundCountLimitModifiers(rollData, actor);
    }
    
    //Check if a spirit can aid sorcery
    SR5_PrepareRollHelper.handleSpiritAid(actor, item.system, rollData);

    return rollData;

}