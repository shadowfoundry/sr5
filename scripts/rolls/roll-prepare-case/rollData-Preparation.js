import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function preparation(rollData, actor, item){
    let itemData = item.system;

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.PreparationUse")}${game.i18n.localize("SR5.Colons")} ${item.name}`;

    //Determine dicepool composition
    rollData.dicePool.composition = itemData.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, itemData.test.modifiers);

    //Limit
    rollData.limit.type = "force";
    rollData.limit.base = itemData.force;

    //Add others informations
    rollData.test.type = "preparation";
    rollData.test.typeSub = itemData.subCategory;
    rollData.damage.type = itemData.damageType;
    rollData.damage.element = itemData.damageElement;
    rollData.magic.spell.type = itemData.type;
    rollData.magic.spell.category = itemData.category;
    rollData.magic.spell.isResisted = itemData.resisted;
    rollData.magic.force = itemData.force;
    rollData.owner.itemUuid = item.uuid;

    //Background count limit modifier
    if (actor.system.magic.bgCount.value > 0){
        rollData = SR5_PrepareRollHelper.addBackgroundCountLimitModifiers(rollData, actor);
    }
 
    //Add special info for area spell
    if (itemData.range === "area" || itemData.spellAreaExtended){
        rollData.chatCard.templatePlace = true;
    }

    //If spell is resisted, check if an effect can be transfered
    if (!itemData.resisted){
        rollData = SR5_PrepareRollHelper.addTransferableEffect(rollData, item);
    }

    return rollData;
}