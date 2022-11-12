import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function matrixResistanceInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
        actorData = actor.system,
        attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor),
        attackerData = attacker?.system,
        targetItem;

    if (cardData.matrixTargetItemUuid) targetItem = await fromUuid(cardData.matrixTargetItemUuid);
    cardData.matrixDamageValue = cardData.matrixDamageValueBase - cardData.roll.hits;

    if (cardData.matrixDamageValue > 0) {
        cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.matrixDamageValue})`);
        //If Biofeedback, add button	
        if ( attackerData.matrix.programs.biofeedback.isActive
        || attackerData.matrix.programs.blackout.isActive
        || (attackerData.matrix.deviceSubType === "iceBlack")
        || (attackerData.matrix.deviceSubType === "iceBlaster")
        || (attackerData.matrix.deviceSubType === "iceSparky") ) {
            if (((actor.type === "actorPc" || actor.type === "actorGrunt") && (actorData.matrix.userMode !== "ar") && (targetItem.type === "itemDevice"))
            || (actor.type === "actorDrone" && actorData.controlMode === "rigging")) {
                cardData.damage.resistanceType = "biofeedback";
                cardData.damage.value = cardData.matrixDamageValueBase;
                cardData.damage.type = "stun";
                if ((attackerData.matrix.programs.biofeedback.isActive && actorData.matrix.userMode === "hotSim") || (attackerData.matrix.deviceSubType === "iceBlack")) cardData.damage.type = "physical";
                cardData.chatCard.buttons.attackerDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerDoBiofeedbackDamage", `${game.i18n.localize('SR5.TakeOnDamageBiofeedback')} ${game.i18n.localize('SR5.DamageValueShort')} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`);
            }
        }
        //If Link Lock, add button
        if (attackerData.matrix.programs.lockdown.isActive) cardData.chatCard.buttons.linkLock = SR5_RollMessage.generateChatButton("nonOpposedTest", "linkLock", game.i18n.localize('SR5.MatrixLinkLock'));
    } else {
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDamage"));
    }

    //Remove Resist chat button from previous chat message
    let originalMessage, prevData;
    if (cardData.previousMessage.messageId){
        originalMessage = game.messages.get(cardData.previousMessage.messageId);
        prevData = originalMessage.flags?.sr5data;
        if (prevData.buttons?.matrixResistance) {
            if (!game.user?.isGM) {
                await SR5_SocketHandler.emitForGM("updateChatButton", {
                    message: cardData.previousMessage.messageId,
                    buttonToUpdate: "matrixResistance",
                });
            } else SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "matrixResistance");
        }
    }
}