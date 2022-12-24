import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default async function powerDefense(rollData, actor, chatData){
    if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return;
    let actorData = actor.system,
        firstAttribute, secondAttribute,
        powerItem = await fromUuid(chatData.owner.itemUuid);

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${powerItem.name}`;

    //Determine dicepool composition
    if (chatData.various.defenseFirstAttribute === "edge" || chatData.various.defenseFirstAttribute === "magic" || chatData.various.defenseFirstAttribute === "resonance") firstAttribute = actorData.specialAttributes[chatData.various.defenseFirstAttribute].augmented.value;
    else firstAttribute = actorData.attributes[chatData.various.defenseFirstAttribute].augmented.value;
    if (chatData.various.defenseSecondAttribute === "edge" || chatData.various.defenseSecondAttribute === "magic" || chatData.various.defenseSecondAttribute === "resonance") secondAttribute = actorData.specialAttributes[chatData.various.defenseSecondAttribute].augmented.value;
    else secondAttribute = actorData.attributes[chatData.various.defenseSecondAttribute].augmented.value;

    rollData.dicePool.composition = ([
        {source: game.i18n.localize(SR5.allAttributes[chatData.various.defenseFirstAttribute]), type: "linkedAttribute", value: firstAttribute},
        {source: game.i18n.localize(SR5.allAttributes[chatData.various.defenseSecondAttribute]), type: "linkedAttribute", value: secondAttribute},
    ]);

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Add others informations
    rollData.test.type = "powerDefense";
    rollData.owner.itemUuid = chatData.owner.itemUuid;
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.actorId = chatData?.owner.actorId;
    rollData.combat.activeDefenses.full = actorData.specialProperties.fullDefenseValue || 0;

    //Check if an effect is transferable
    rollData = SR5_PrepareRollHelper.addTransferableEffect(rollData, powerItem);

    //Special case for Paralyzing Howl
    if (chatData.magic.spell.category === "paralyzingHowl"){
        rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actorData.itemsProperties.armor.specialDamage.sound.modifiers);
    }

    return rollData;
}