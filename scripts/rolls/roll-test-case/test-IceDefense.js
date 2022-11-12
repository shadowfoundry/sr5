import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function iceDefenseInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
        actorData = actor.system,
        netHits = cardData.hits - cardData.roll.hits,
        originalActor = await SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor),
        targetItem = await fromUuid(cardData.matrixTargetItemUuid),
        existingMark = await SR5_DiceHelper.findMarkValue(targetItem.system, originalActor.id);

    cardData.attackerName = originalActor.name;

    if (netHits <= 0) {
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));
        if (netHits < 0) {
            cardData.matrixDamageValue = netHits * -1;
            cardData.chatCard.buttons.defenderDoMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.format('SR5.DoMatrixDamage', {key: cardData.matrixDamageValue, name: cardData.attackerName})}`);
        }
    } else {
        cardData.matrixDamageValue = netHits;
        switch(cardData.iceType){
            case "iceAcid":
                if (actorData.matrix.attributes.firewall.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceFirewall"));
                else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
                break;
            case "iceBinder":
                if (actorData.matrix.attributes.dataProcessing.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceDataProcessing"));
                else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
                break;
            case "iceJammer":
                if (actorData.matrix.attributes.attack.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceAttack"));
                else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
                break;
            case "iceMarker":
                if (actorData.matrix.attributes.dataProcessing.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceSleaze"));
                else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
                break;
            case "iceKiller":
            case "iceBlaster":
            case "iceBlack":
            case "iceSparky":
                cardData.matrixResistanceType = "matrixDamage";
                cardData = await SR5_DiceHelper.updateMatrixDamage(cardData, netHits, actor);
                if ((cardData.iceType === "iceBlaster" || cardData.iceType === "iceBlack") && (!actorData.matrix.isLinkLocked)) {
                    cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.LinkLockConnection"));
                }
                cardData.chatCard.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${(cardData.matrixDamageValue)})`);
                break;
            case "iceCrash":
                if (existingMark >= 1) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.MatrixActionCrashProgram"));
                break;
            case "icePatrol":
                break;
            case "iceProbe":
                cardData.mark = 1;
                cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
                break;
            case "iceScramble":
                if (existingMark >= 3) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.DeviceReboot"));
                break;
            case "iceTarBaby":
                if (actorData.matrix.isLinkLocked) {
                    cardData.mark = 1;
                    cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.mark, item: targetItem.name, name: cardData.speakerActor})}`);
                } else {
                    cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.LinkLockConnection"));
                }
                break;
            case "iceTrack":
                if (existingMark >= 2) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.Geolocated"));
                break;
            default:
                SR5_SystemHelpers.srLog(1, `Unknown '${cardData.iceType}' type in addIceDefenseInfoToCard`);
        }
    }
}