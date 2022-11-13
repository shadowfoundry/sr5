import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function resistanceResultInfo(cardData, type){
    let key, label, labelEnd, applyEffect = true, actor, weapon, originalMessage, prevData;
    cardData.roll.netHits = cardData.roll.hits - cardData.previousMessage.hits;
    
    if (cardData.previousMessage.messageId){
        originalMessage = game.messages.get(cardData.previousMessage.messageId);
        prevData = originalMessage.flags?.sr5data;
    }

    switch (type){
        case "complexFormResistance":
            label = `${game.i18n.localize("SR5.ReduceComplexFormSuccess")} (${cardData.roll.netHits})`;
            labelEnd = game.i18n.localize("SR5.KillComplexFormFailed");
            key = "reduceComplexForm";
            break;
        case "spellResistance":
            label = `${game.i18n.localize("SR5.ReduceSpell")} (${cardData.roll.netHits})`;
            labelEnd = game.i18n.localize("SR5.DispellingFailed");
            key = "reduceSpell";
            break;
        case "enchantmentResistance":
            cardData.magic.drain.value = cardData.roll.hits;
            label = game.i18n.localize("SR5.DesactivateFocus");
            labelEnd = game.i18n.localize("SR5.DisenchantFailed");
            key = "desactivateFocus";
            break;
        case "disjointingResistance":
            if(cardData.test.typeSub !== "preparation") cardData.magic.drain.value = cardData.roll.hits;
            label = `${game.i18n.localize("SR5.ReducePreparationPotency")} (${cardData.roll.netHits})`;
            labelEnd = game.i18n.localize("SR5.DisjointingFailed");
            key = "reducePreparationPotency";
            break;
        case "spellResistance":
            cardData.roll.netHits = cardData.previousMessage.hits - cardData.roll.hits;
            label = game.i18n.localize("SR5.ApplyEffect");
            labelEnd = game.i18n.localize("SR5.SpellResisted");
            key = "applyEffectAuto";
            if (!cardData.switch?.transferEffect && !cardData.switch?.transferEffectOnItem) applyEffect = false;
            if (!prevData.spellArea) {
                if (!game.user?.isGM) {
                    await SR5_SocketHandler.emitForGM("updateChatButton", {
                        message: cardData.previousMessage.messageId,
                        buttonToUpdate: "spellResistance",
                    });
                } else SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "spellResistance");
            }
            break;
        case "powerDefense":
        case "martialArtDefense":
            cardData.roll.netHits = cardData.previousMessage.hits - cardData.roll.hits;
            if (cardData.switch?.transferEffect){
                label = game.i18n.localize("SR5.ApplyEffect");
                key = "applyEffectAuto";
            } else {
                label = `${game.i18n.localize("SR5.DefenseFailure")}`;
                applyEffect = false;
            }
            labelEnd = game.i18n.localize("SR5.SuccessfulDefense");
            break;
        case "etiquetteResistance":
            break;
        case "weaponResistance":
            labelEnd = game.i18n.localize("SR5.ObjectResistanceSuccess");
            if (cardData.structure > (cardData.previousMessage.hits - cardData.roll.hits)) {
                ui.notifications.info(`${game.i18n.format("SR5.INFO_StructureGreaterThanDV", {structure: cardData.structure, damage: cardData.previousMessage.hits})}`);
            } else {
                actor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
                weapon = actor.items.find(i => i.type === "itemWeapon" && i.system.isActive);
                cardData.targetItem = weapon.uuid;
                if (weapon.system.accuracy.value <= 3 && weapon.system.reach.value === 0){
                    applyEffect = false;
                    label = `${game.i18n.localize("SR5.NoEffectApplicable")}`;
                }
            }
            break;
        default :
    }

    if (cardData.roll.hits >= cardData.previousMessage.hits) {
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
        //if type is a spell with area effect, create an effect at 0 value on defender to avoir new resistance test inside the canvas template
        if (type === "spellResistance" && prevData.spellArea){
            //add effect "applyEffectAuto"
            if (cardData.roll.netHits < 0) cardData.roll.netHits = 0;
            actor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
            actor.applyExternalEffect(cardData, "customEffects");
        }
    }
    else {
        if (applyEffect) {
            if (type === "weaponResistance"){
                if (weapon.system.accuracy.value > 3) cardData.chatCard.buttons.decreaseAccuracy = SR5_RollMessage.generateChatButton("nonOpposedTest", "decreaseAccuracy", game.i18n.localize("SR5.AccuracyDecrease"));
                if (weapon.system.reach.value > 0) cardData.chatCard.buttons.decreaseReach = SR5_RollMessage.generateChatButton("nonOpposedTest", "decreaseReach", game.i18n.localize("SR5.WeaponReachDecrease"));
            } else cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton("nonOpposedTest", key, label);
        }
        else cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", label);
    }

    if (cardData.magic.drain.value > 0) cardData.chatCard.buttons.drain = SR5_RollMessage.generateChatButton("nonOpposedTest", "drain", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);
}