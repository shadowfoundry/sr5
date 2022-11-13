import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

//Add info for skill dicePool roll
export default async function spell(rollData, actor, item){
    let itemData = item.system,
        spellCategory = itemData.category,
        actorData = actor.system;

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.CastSpell")} ${item.name}`;

    //Determine dicepool composition
    rollData.dicePool.composition = actorData.skills.spellcasting.spellCategory[spellCategory].modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actorData.skills.spellcasting.spellCategory[spellCategory].modifiers);

    //Limit
    rollData.limit.type = "force";
    rollData.limit.base = actorData.specialAttributes.magic.augmented.value;

    //Add others informations
    rollData.test.type = "spell";
    rollData.test.typeSub = itemData.subCategory;
    rollData.magic.drain.type = "stun";
    rollData.magic.drain.modifiers.spell = {
        value: itemData.drain.value,
        label: game.i18n.localize("SR5.DrainModifier"),
    }
    rollData.damage.type = itemData.damageType;
    rollData.damage.element = itemData.damageElement;
    rollData.magic.spell.type = itemData.type;
    rollData.magic.spell.category = itemData.category;
    rollData.magic.spell.isResisted = itemData.resisted;
    rollData.magic.spell.range = itemData.range;
    rollData.magic.force = actorData.specialAttributes.magic.augmented.value;
    //rollData.owner.actorMagic = actorData.specialAttributes.magic.augmented.value;
    rollData.dialogSwitch.reagents = true;
    rollData.dialogSwitch.specialization = true;
    rollData.owner.itemUuid = item.uuid;

    //Background count limit modifier
    if (actorData.magic.bgCount.value > 0){
        rollData = SR5_PrepareRollHelper.addBackgroundCountLimitModifiers(rollData, actor);
    }

    //Add special info for area spell
    if (itemData.range === "area" || itemData.spellAreaExtended){
        rollData.chatCard.templatePlace = true;
        //Spell Shaping metamagic
        if (actorData.magic.metamagics.spellShaping) rollData.dialogSwitch.spellShaping = true;
    }

    //If spell is resisted, check if an effect can be transfered
    if (!itemData.resisted){
        rollData = SR5_PrepareRollHelper.addTransferableEffect(rollData, item);
    }

    //Check if an object can resist to spell
    for (let e of Object.values(itemData.systemEffects)){
        if (e.value === "sre_ObjectResistance") rollData.magic.spell.objectCanResist = true;
    }

    //Check if a spirit can aid sorcery
    SR5_PrepareRollHelper.handleSpiritAid(actor, item, rollData);

    return rollData;
}