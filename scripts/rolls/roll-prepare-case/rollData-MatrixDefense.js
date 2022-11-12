import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function matrixDefense(rollData, rollKey, actor, chatData){
    if (actor.type === "actorSpirit") return;
    let matrixAction = actor.system.matrix.actions[rollKey];

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.MatrixDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[rollKey])} (${chatData.roll.hits})`;

    //Determine dicepool composition
    rollData.dicePool.composition = matrixAction.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, matrixAction.test.modifiers);

    //Handle item targeted TODO
    /*if (chatData.matrixTargetDevice && chatData.matrixTargetDevice !== "device"){
        let targetItem = actor.items.find(i => i.id === chatData.matrixTargetDevice);
        if (!targetItem.system.isSlavedToPan){
            title = `${targetItem.name} - ${game.i18n.localize("SR5.MatrixDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[rollKey])} (${chatData.test.hits})`;
            dicePool = targetItem.system.deviceRating * 2 || 0;
            dicePoolComposition = ([
                {source: game.i18n.localize("SR5.DeviceRating"), type: "linkedAttribute", value: targetItem.system.deviceRating},
                {source: game.i18n.localize("SR5.DeviceRating"), type: "linkedAttribute", value: targetItem.system.deviceRating},
            ]);
        } else {
            let panMaster = SR5_EntityHelpers.getRealActorFromID(targetItem.system.panMaster);
            let panMasterDefense = panMaster.system.matrix.actions[rollKey].defense.dicePool;
            if (targetItem.system.deviceRating * 2 > panMasterDefense){
                dicePool = targetItem.system.deviceRating;
                dicePoolComposition = ([
                    {source: game.i18n.localize("SR5.DeviceRating"), type: "linkedAttribute", value: targetItem.system.deviceRating},
                    {source: game.i18n.localize("SR5.DeviceRating"), type: "linkedAttribute", value: targetItem.system.deviceRating},
                ]);
            } else {
                dicePool = panMasterDefense;
                dicePoolComposition = panMaster.system.matrix.actions[rollKey].defense.modifiers;
            }
        }
        optionalData = mergeObject(optionalData, {matrixTargetItemUuid: targetItem.uuid,});  
    } else {
        let deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive);
        optionalData = mergeObject(optionalData, {matrixTargetItemUuid: deck.uuid,});
    }*/
    
    //Add others informations
    rollData.test.type = "matrixDefense";
    rollData.test.typeSub = rollKey;
    rollData.combat.activeDefenses.full = actor.system.specialProperties.fullDefenseValue || 0;
    rollData.matrix.mark = chatData.matrix.mark;
    rollData.matrix.overwatchScore = matrixAction.increaseOverwatchScore;
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.hits = chatData.roll.hits;

    return rollData;
}