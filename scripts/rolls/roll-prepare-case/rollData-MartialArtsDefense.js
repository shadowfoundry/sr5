import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default async function martialArtsDefense(rollData, actor, chatData){
    if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return;
    let actorData = actor.system,
        firstLabel, secondLabel, firstType, secondType, firstAttribute, secondAttribute,
        martialArtItem = await fromUuid(chatData.owner.itemUuid);

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${martialArtItem.name}`;

    //Determine dicepool composition
    if (Object.keys(SR5.characterAttributes).find(e => e === chatData.various.defenseFirstAttribute)){
        firstAttribute = actorData.attributes[chatData.various.defenseFirstAttribute].augmented.value;
        firstLabel = game.i18n.localize(SR5.allAttributes[chatData.various.defenseFirstAttribute]);
        firstType = "linkedAttribute";
    } else {
        firstAttribute = actorData.skills[chatData.various.defenseFirstAttribute].rating.value;
        firstLabel = game.i18n.localize(SR5.skills[chatData.various.defenseFirstAttribute]);
        firstType = "skillRating";
    }
    if (Object.keys(SR5.characterAttributes).find(e => e === chatData.various.defenseSecondAttribute)){
        secondAttribute = actorData.attributes[chatData.various.defenseSecondAttribute].augmented.value;
        secondLabel = game.i18n.localize(SR5.allAttributes[chatData.various.defenseSecondAttribute]);
        secondType = "linkedAttribute";
    } else {
        secondAttribute = actorData.skills[chatData.various.defenseSecondAttribute].rating.value;                                             
        secondLabel = game.i18n.localize(SR5.skills[chatData.various.defenseSecondAttribute]);
        secondType = "skillRating";
    }

    rollData.dicePool.composition = ([
        {source: firstLabel, type: firstType, value: firstAttribute},
        {source: secondLabel, type: secondType, value: secondAttribute},
    ]);

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Add others informations
    rollData.test.type = "martialArtDefense";
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.actorId = chatData?.owner.actorId;
    rollData.combat.activeDefenses.full = actorData.specialProperties.fullDefenseValue || 0;
    rollData.owner.itemUuid = chatData.owner.itemUuid;

    //Check if an effect is transferable
    rollData = SR5_PrepareRollHelper.addTransferableEffect(rollData, martialArtItem);

    return rollData;
}