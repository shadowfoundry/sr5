import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default async function complexFormDefense(rollData, actor, chatData){
    if (actor.type === "actorSpirit") return;
    let actorData = actor.system,
        defenseAttribute, defenseMatrixAttribute, 
        firstLabel = game.i18n.localize("SR5.DeviceRating"),
        complexFormItem = await fromUuid(chatData.owner.itemUuid);

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${complexFormItem.name} (${chatData.roll.hits})`;

    //Determine dicepool composition
    if (actor.type === "actorDevice" || actor.type === "actorSprite") {
        defenseAttribute = actorData.matrix.deviceRating;
        defenseMatrixAttribute = actorData.matrix.attributes[chatData.various.defenseSecondAttribute].value;
    } else {
        if (actorData.attributes[chatData.various.defenseFirstAttribute]){
            defenseAttribute = actorData.attributes[chatData.various.defenseFirstAttribute].augmented.value;
            defenseMatrixAttribute = actorData.matrix.attributes[chatData.various.defenseSecondAttribute].value;
            firstLabel = game.i18n.localize(SR5.allAttributes[chatData.various.defenseFirstAttribute]);
        } else {
            if (actor.type === "actorDrone" && actorData.slaved && actorData.vehicleOwner.id !== "") {
                defenseAttribute = actorData.vehicleOwner.system.attributes[chatData.various.defenseFirstAttribute].augmented.value;
                defenseMatrixAttribute = actorData.vehicleOwner.system.matrix.attributes[chatData.various.defenseSecondAttribute].value;
                firstLabel = game.i18n.localize(SR5.allAttributes[chatData.various.defenseFirstAttribute]);
            } else {
                defenseAttribute = actorData.matrix.deviceRating;
                defenseMatrixAttribute = actorData.matrix.attributes[chatData.various.defenseSecondAttribute].value;
            }
        }
    }

    rollData.dicePool.composition = ([
        {source: firstLabel, type: "linkedAttribute", value: defenseAttribute},
        {source: game.i18n.localize(SR5.matrixAttributes[chatData.various.defenseSecondAttribute]), type: "matrixAttribute", value: defenseMatrixAttribute},
    ]);

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);
    
    //Add others informations
    rollData.test.type = "complexFormDefense";
    rollData.test.typeSub = chatData.test.typeSub;
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.itemUuid = chatData.owner.itemUuid;
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.messageId = chatData.owner.messageId;
    rollData.combat.activeDefenses.full = actorData.specialProperties.fullDefenseValue || 0;

    //Check if an effect is transferable
    rollData = SR5_PrepareRollHelper.addTransferableEffect(rollData, complexFormItem);

    return rollData;
}