import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5_MatrixHelpers } from "../roll-helpers/matrix.js";
import { SR5_MarkHelpers } from "../roll-helpers/mark.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";

export default async function iceDefenseInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
        actorData = actor.system,
        netHits = cardData.previousMessage.hits - cardData.roll.hits,
        originalActor = await SR5_EntityHelpers.getRealActorFromID(cardData.previousMessage.actorId),
        targetItem = await fromUuid(cardData.target.itemUuid),
        existingMark = await SR5_MarkHelpers.findMarkValue(targetItem.system, originalActor.id);

    cardData.attackerName = originalActor.name;

    if (netHits <= 0) {
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.SuccessfulDefense"));
        if (netHits < 0) {
            cardData.damage.matrix.value = netHits * -1;
            cardData.chatCard.buttons.defenderDoMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "defenderDoMatrixDamage", `${game.i18n.format('SR5.DoMatrixDamage', {key: cardData.damage.matrix.value, name: cardData.attackerName})}`);
        }
    } else {
        cardData.damage.matrix.value = netHits;
        switch(cardData.test.typeSub){
            case "iceAcid":
                if (actorData.matrix.attributes.firewall.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceFirewall"));
                else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.matrix.value})`);
                break;
            case "iceBinder":
                if (actorData.matrix.attributes.dataProcessing.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceDataProcessing"));
                else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.matrix.value})`);
                break;
            case "iceJammer":
                if (actorData.matrix.attributes.attack.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceAttack"));
                else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.matrix.value})`);
                break;
            case "iceMarker":
                if (actorData.matrix.attributes.dataProcessing.value > 0) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.EffectReduceSleaze"));
                else cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.matrix.value})`);
                break;
            case "iceKiller":
            case "iceBlaster":
            case "iceBlack":
            case "iceSparky":
                cardData = await SR5_MatrixHelpers.updateMatrixDamage(cardData, netHits, actor);
                if ((cardData.test.typeSub === "iceBlaster" || cardData.test.typeSub === "iceBlack") && (!actorData.matrix.isLinkLocked)) {
                    cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.LinkLockConnection"));
                }
                cardData.chatCard.buttons.matrixResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixResistance", `${game.i18n.localize('SR5.TakeOnDamageMatrix')} (${(cardData.damage.matrix.value)})`);
                break;
            case "iceCrash":
                if (existingMark >= 1) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.MatrixActionCrashProgram"));
                break;
            case "icePatrol":
                break;
            case "iceProbe":
                cardData.matrix.mark = 1;
                cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.matrix.mark, item: targetItem.name, name: cardData.owner.speakerActor})}`);
                break;
            case "iceScramble":
                if (existingMark >= 3) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.DeviceReboot"));
                break;
            case "iceTarBaby":
                if (actorData.matrix.isLinkLocked) {
                    cardData.matrix.mark = 1;
                    cardData.chatCard.buttons.attackerPlaceMark = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerPlaceMark", `${game.i18n.format('SR5.AttackerPlaceMarkTo', {key: cardData.matrix.mark, item: targetItem.name, name: cardData.owner.speakerActor})}`);
                } else {
                    cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.LinkLockConnection"));
                }
                break;
            case "iceTrack":
                if (existingMark >= 2) cardData.chatCard.buttons.iceEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "iceEffect", game.i18n.localize("SR5.Geolocated"));
                break;
            default:
                SR5_SystemHelpers.srLog(1, `Unknown '${cardData.test.typeSub}' type in iceDefenseInfo`);
        }
    }
}