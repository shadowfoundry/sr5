import { SR5_RollMessage } from "../roll-message.js";

export default async function defenseResultInfo(cardData, type){
    let key, label, labelEnd, successTestType = "nonOpposedTest", failedTestType = "SR-CardButtonHit endTest", failedKey = "";
    let originalMessage, prevData;
    if (cardData.previousMessage.messageId){
        originalMessage = game.messages.get(cardData.previousMessage.messageId);
        prevData = originalMessage.flags?.sr5data;
    }

    switch (type){
        case "jackOutDefense":
            label = game.i18n.localize("SR5.MatrixActionJackOutSuccess");
            labelEnd = game.i18n.localize("SR5.MatrixActionJackOutFailed");
            key = "jackOutSuccess";
            break;
        case "sensorDefense":
            label = game.i18n.localize("SR5.SensorLockedTarget");
            labelEnd = game.i18n.localize("SR5.SuccessfulDefense");
            key = "targetLocked";
            break;
        case "preparationResistance":
            label = game.i18n.localize("SR5.PreparationCreate");
            labelEnd = game.i18n.localize("SR5.PreparationCreateFailed");
            key = "createPreparation";
            break;
        case "compilingResistance":
            label = game.i18n.localize("SR5.CompileSprite");
            labelEnd = game.i18n.localize("SR5.FailedCompiling");
            key = "compileSprite";
            cardData.fadingValue = cardData.roll.hits * 2;
            if (cardData.level > cardData.actorResonance) cardData.fadingType = "physical";
            else cardData.fadingType = "stun";
            if (cardData.fadingValue < 2) cardData.fadingValue = 2;
            cardData.chatCard.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fading", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);
            break;
        case "summoningResistance":
            label = game.i18n.localize("SR5.SummonSpirit");
            labelEnd = game.i18n.localize("SR5.FailedSummon");
            key = "summonSpirit";
            cardData.magic.drain.value = cardData.roll.hits * 2;
            /*if (cardData.magic.force > cardData.actorMagic) cardData.magic.drain.type = "physical";
            else cardData.magic.drain.type = "stun";*/
            if (cardData.magic.drain.value < 2) cardData.magic.drain.value = 2;
            cardData.chatCard.buttons.drain = SR5_RollMessage.generateChatButton("nonOpposedTest", "drain", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);
            break;
        case "ritualResistance":
            label = game.i18n.localize("SR5.RitualSuccess");
            labelEnd = game.i18n.localize("SR5.RitualFailed");
            cardData.magic.drain.value = cardData.roll.hits * 2;
            if (prevData.test.realHits > prevData.actorMagic) cardData.magic.drain.type = "physical";
            else cardData.magic.drain.type = "stun";
            if (cardData.magic.reagentsSpent > cardData.magic.force) {
                cardData.drainMod = {};
                cardData.drainMod.hits = {
                    value: cardData.roll.hits * 2,
                    label: game.i18n.localize(SR5.drainModTypes["hits"]),
                };
                cardData.magic.drain.value -= (cardData.magic.reagentsSpent - cardData.magic.force);
                cardData.drainMod.reagents = {
                    value: -(cardData.magic.reagentsSpent - cardData.magic.force),
                    label: game.i18n.localize(SR5.drainModTypes["reagents"]),
                };
            }
            key = "ritualSealed";
            if (cardData.magic.drain.value < 2) cardData.magic.drain.value = 2;
            cardData.chatCard.buttons.drain = SR5_RollMessage.generateChatButton("opposedTest", "drain", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);

            let item = await fromUuid(cardData.itemUuid);
            if (item.system.durationMultiplier === "netHits"){
                let realActor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
                SR5_DiceHelper.srDicesUpdateItem(cardData, realActor);
            }
            break;
        case "eraseMark":
            label = game.i18n.localize("SR5.MatrixActionEraseMark");
            labelEnd = game.i18n.localize("SR5.MatrixActionEraseMarkFailed");
            key = "eraseMarkSuccess";
            if (prevData.buttons?.eraseMark) {
                if (!game.user?.isGM) {
                    await SR5_SocketHandler.emitForGM("updateChatButton", {
                        message: cardData.previousMessage.messageId,
                        buttonToUpdate: "eraseMark",
                    });
                } else SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "eraseMark");
            }
            break;
        case "passThroughDefense":
            label = game.i18n.localize("SR5.PassThroughBarrierSuccess");
            labelEnd = game.i18n.localize("SR5.PassThroughBarrierFailed");
            successTestType = "SR-CardButtonHit endTest";
            if (prevData.buttons?.passThroughDefense) {
                if (!game.user?.isGM) {
                    await SR5_SocketHandler.emitForGM("updateChatButton", {
                        message: cardData.previousMessage.messageId,
                        buttonToUpdate: "passThroughDefense",
                    });
                } else SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "passThroughDefense");
            }
            break;
        case "intimidationResistance":
            label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.CS_AS_ExtremeIntimidation")}`;
            labelEnd = game.i18n.localize("SR5.Resisted");
            key = "applyFearEffect";
            if (prevData.buttons?.fear) SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "calledShotFear");
            break;
        case "ricochetResistance":
            label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.STATUSES_Shaked")}`;
            labelEnd = game.i18n.localize("SR5.Resisted");
            key = "calledShotEffect";
            if (prevData.buttons?.fear) SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "calledShotFear");
            break;
        case "warningResistance":
            label = `${game.i18n.localize("SR5.ShiftAttitude")}`;
            labelEnd = game.i18n.localize("SR5.Resisted");
            successTestType = "SR-CardButtonHit endTest";
            key = "warningShotEnd";
            if (prevData.buttons?.fear) SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "calledShotFear");
            break;
        case "stunnedResistance":
            label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.STATUSES_Stunned")}`;
            labelEnd = game.i18n.localize("SR5.Resisted");
            key = "applyStunnedEffect";
            if (prevData.buttons?.stunned) SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "calledShotStunned");
            break;
        case "buckledResistance":
            label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.STATUSES_Buckled")}`;
            labelEnd = game.i18n.localize("SR5.Resisted");
            key = "calledShotEffect";
            if (prevData.buttons?.buckled) SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "buckled");
            break;
        case "nauseousResistance":
            label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.STATUSES_Nauseous")}`;
            labelEnd = game.i18n.localize("SR5.Resisted");
            key = "calledShotEffect";
            if (prevData.buttons?.nauseous) SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "calledShotNauseous");
            break;
        case "knockdownResistance":
            label = `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.STATUSES_Knockdown")}`;
            labelEnd = game.i18n.localize("SR5.Resisted");
            key = "calledShotEffect";
            if (prevData.buttons?.knockdown) SR5_RollMessage.updateChatButtonHelper(cardData.previousMessage.messageId, "calledShotKnockdown");
            break;
        case "engulfResistance":
            label = game.i18n.localize("SR5.EscapeEngulfSuccess");
            labelEnd = game.i18n.localize("SR5.EscapeEngulfFailed");
            successTestType = "SR-CardButtonHit endTest";
            if (cardData.roll.hits < cardData.previousMessage.hits) {
                let parentMessage = game.messages.find(m => m.flags.sr5data.buttons.escapeEngulf && m.flags.sr5data.attackerId === cardData.attackerId)
                if (parentMessage) prevData = parentMessage.flags?.sr5data;
                if (prevData.buttons?.escapeEngulf) {
                    if (!game.user?.isGM) {
                        await SR5_SocketHandler.emitForGM("updateChatButton", {
                            message: parentMessage.id,
                            buttonToUpdate: "escapeEngulf",
                        });
                        await SR5_SocketHandler.emitForGM("updateChatButton", {
                            message: parentMessage.id,
                            buttonToUpdate: "resistanceCard",
                        });
                    } else {
                        SR5_RollMessage.updateChatButton(parentMessage.id, "escapeEngulf");
                        SR5_RollMessage.updateChatButton(parentMessage.id, "resistanceCard");
                    }
                }
            }
            break;
    }

    if (cardData.roll.hits < cardData.previousMessage.hits) cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton(successTestType, key, label);
    else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton(failedTestType, failedKey, labelEnd);
}