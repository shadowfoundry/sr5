import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function matrixResistance(rollData, rollKey, actor, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.TakeOnDamageMatrix")} (${chatData.matrix.damage})`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.matrix.resistances[rollKey].modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
 
    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);
 
    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.matrix.resistances[rollKey].modifiers);

    /*if (chatData.matrixTargetItemUuid){
        let matrixTargetItem = await fromUuid(chatData.matrixTargetItemUuid);
        if (matrixTargetItem.system.type !== "baseDevice" && matrixTargetItem.system.type !== "livingPersona" && matrixTargetItem.system.type !== "headcase"){ 
            title = `${matrixTargetItem.name}: ${game.i18n.localize("SR5.TakeOnDamageShort")} (${chatData.matrixDamageValue})`;
            dicePool = matrixTargetItem.system.deviceRating * 2;
            dicePoolComposition = ([
                {source: game.i18n.localize("SR5.DeviceRating"), type: "linkedAttribute", value: matrixTargetItem.system.deviceRating},
                {source: game.i18n.localize("SR5.DeviceRating"), type: "linkedAttribute", value: matrixTargetItem.system.deviceRating},
            ]);
        }
        optionalData = mergeObject(optionalData, {
            matrixTargetItemUuid: chatData.matrixTargetItemUuid,
        }); 
    }*/

    //Add others informations
    rollData.test.type = "matrixResistance";
    rollData.test.typeSub = rollKey;
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.damage.matrix.value = chatData.damage.matrix.value;
    rollData.damage.matrix.base = chatData.damage.matrix.base;
    rollData.damage.type = chatData.damage.type;

    return rollData;
}
