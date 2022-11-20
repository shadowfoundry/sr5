import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";

export default async function matrixDefense(rollData, rollKey, actor, chatData){
    if (actor.type === "actorSpirit") return;
    let matrixAction = actor.system.matrix.actions[rollKey];

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.MatrixDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[rollKey])} (${chatData.roll.hits})`;

    //Determine dicepool composition
    rollData.dicePool.composition = matrixAction.defense.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup" || mod.type === "matrixAttribute"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, matrixAction.defense.modifiers);

    debugger;
    //Handle item targeted
    if (chatData.target.itemUuid){
        let targetItem = await fromUuid(chatData.target.itemUuid);
        rollData.target.itemUuid = chatData.target.itemUuid;
        if (targetItem.system.type !== "device"){
            if (!targetItem.system.isSlavedToPan){
                rollData.test.title = `${targetItem.name} - ${game.i18n.localize("SR5.MatrixDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[rollKey])} (${chatData.roll.hits})`;
                rollData.dicePool.composition = ([
                    {source: game.i18n.localize("SR5.DeviceRating"), type: "linkedAttribute", value: targetItem.system.deviceRating},
                    {source: game.i18n.localize("SR5.DeviceRating"), type: "linkedAttribute", value: targetItem.system.deviceRating},
                ]);
            } else {
                let panMaster = SR5_EntityHelpers.getRealActorFromID(targetItem.system.panMaster);
                if (targetItem.system.deviceRating * 2 > panMaster.system.matrix.actions[rollKey].defense.dicePool){
                    rollData.dicePool.composition = ([
                        {source: game.i18n.localize("SR5.DeviceRating"), type: "linkedAttribute", value: targetItem.system.deviceRating},
                        {source: game.i18n.localize("SR5.DeviceRating"), type: "linkedAttribute", value: targetItem.system.deviceRating},
                    ]);
                } else {
                    rollData.dicePool.composition = panMaster.system.matrix.actions[rollKey].defense.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup" || mod.type === "matrixAttribute"));
                    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, panMaster.system.matrix.actions[rollKey].defense.modifiers);
                }
            }
            rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);
        } 
    } else {
        let deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive);
        rollData.target.itemUuid = deck.uuid;
    }
    
    //Add others informations
    rollData.test.type = "matrixDefense";
    rollData.test.typeSub = rollKey;
    rollData.combat.activeDefenses.full = actor.system.specialProperties?.fullDefenseValue || 0;
    rollData.matrix.mark = chatData.matrix.mark;
    rollData.matrix.overwatchScore = matrixAction.increaseOverwatchScore;
    rollData.matrix.actionType = chatData.matrix.actionType;
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.hits = chatData.roll.hits;

    //Special case for erase Mark
    if (rollKey === "eraseMark" && chatData.previousMessage.actorId){
        rollData.test.type = "eraseMark";
        rollData.previousMessage.actorId = chatData.previousMessage.actorId;
        rollData.previousMessage.itemUuid = chatData.previousMessage.itemUuid;
        rollData.previousMessage.messageId = chatData.owner.messageId;
    }

    return rollData;
}