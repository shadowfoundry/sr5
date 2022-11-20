import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5 } from "../../config.js";

export default async function matrixResistanceInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
        actorData = actor.system,
        attacker = SR5_EntityHelpers.getRealActorFromID(cardData.previousMessage.actorId),
        attackerData = attacker?.system,
        targetItem;

    debugger;
    //Get the target item
    if (cardData.target.itemUuid) targetItem = await fromUuid(cardData.target.itemUuid);

    //Determine matrix damage
    cardData.damage.matrix.value = cardData.damage.matrix.base - cardData.roll.hits;

    if (cardData.damage.matrix.value > 0) {
        cardData.chatCard.buttons.takeMatrixDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "takeMatrixDamage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.matrix.value})`);
        
        //Handle Biofeedback
        if ( attackerData.matrix.programs.biofeedback.isActive || attackerData.matrix.programs.blackout.isActive
          || (attackerData.matrix.deviceSubType === "iceBlack") || (attackerData.matrix.deviceSubType === "iceBlaster")
          || (attackerData.matrix.deviceSubType === "iceSparky") ) {
            if (((actor.type === "actorPc" || actor.type === "actorGrunt") && (actorData.matrix.userMode !== "ar") && (targetItem.type === "itemDevice"))
              || (actor.type === "actorDrone" && actorData.controlMode === "rigging")) {
                cardData.damage.resistanceType = "biofeedback";
                cardData.damage.value = cardData.damage.matrix.base;
                if ((attackerData.matrix.programs.biofeedback.isActive && actorData.matrix.userMode === "hotsim") || (attackerData.matrix.deviceSubType === "iceBlack")) cardData.damage.type = "physical";
                else cardData.damage.type = "stun";
                cardData.chatCard.buttons.attackerDoBiofeedbackDamage = SR5_RollMessage.generateChatButton("nonOpposedTest", "attackerDoBiofeedbackDamage", `${game.i18n.localize('SR5.TakeOnDamageBiofeedback')} ${game.i18n.localize('SR5.DamageValueShort')} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`);
            }
        }
        
        //If Link Lock, add button
        if (attackerData.matrix.programs.lockdown.isActive) cardData.chatCard.buttons.linkLock = SR5_RollMessage.generateChatButton("nonOpposedTest", "linkLock", game.i18n.localize('SR5.MatrixLinkLock'));
    } else {
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDamage"));
    }

    //Remove Resist chat button from previous chat message
    if (cardData.previousMessage.messageId){
        let originalMessage = game.messages.get(cardData.previousMessage.messageId);
        if (originalMessage.flags?.sr5data?.chatCard.buttons?.matrixResistance) {
            SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "matrixResistance");
        }
    }
}