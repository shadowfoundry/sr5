import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_RollTest } from "./roll-test.js";
import { SR5_SocketHandler } from "../socket.js";
import { SR5Actor } from "../entities/actors/entityActor.js";
import { SR5Combat } from "../system/srcombat.js";
import { SR5_RollTestHelper } from "./roll-test-helper.js";
import { SR5_MarkHelpers } from "./roll-helpers/mark.js";
import { SR5_CalledShotHelpers } from "./roll-helpers/calledShot.js";
import { SR5_MatrixHelpers } from "./roll-helpers/matrix.js";
import { SR5_CombatHelpers } from "./roll-helpers/combat.js";
import { SR5_MiscellaneousHelpers } from "./roll-helpers/miscellaneous.js";
import { SR5_ThirdPartyHelpers } from "./roll-helpers/thirdparty.js";
import { SR5_ActorHelper } from "../entities/actors/entityActor-helpers.js";

export class SR5_RollMessage {
    //Handle reaction to roll ChatMessage
    static async chatListeners(html, data) {
        html.on("click", ".messageAction", (ev) => {
            SR5_RollMessage.chatButtonAction(ev)
        });

        //Toggle Dice details
        html.on("click", ".SR-CardHeader", (ev) => {
            ev.preventDefault();
            $(ev.currentTarget).siblings(".SR-CardContent").toggle();
        });

        if (!game.user.isGM) {
            // Hide GM stuff
            html.find(".chat-button-gm").remove();

            // Hide if player is not owner of the message
            if (data.message.speaker.actor && game.actors.get(data.message.speaker.actor)?.permission != 3) {
                html.find(".nonOpposedTest").remove();
                html.find(".owner").remove();
            }
            
            // Hide if player is not owner of the message for attackerTest
            if (data.message.flags?.sr5data?.previousMessage?.userId !== game.user.id) html.find(".attackerTest").remove();

            // Do not display "Blind" chat cards to non-gm
            if (html.hasClass("blind")) {
                html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
                html.html("").css("display", "none");
            }
        }

        // Edit manually the result of a chatmessage roll
        html.on("click", ".edit-toggle", (ev) => {
            ev.preventDefault();
            let elementsToToggle = $(ev.currentTarget).parents(".chat-card").find(".display-toggle");
            if (!elementsToToggle.length) elementsToToggle = $(ev.currentTarget).find(".display-toggle");
            for (let elem of elementsToToggle) {
                if (elem.style.display == "none") elem.style.display = "";
                else elem.style.display = "none";
            }
        });

        //Hide core content of message
        $(html).find(".SR-CardContent").hide();

        // Respond to editing chat cards 
        html.on("change", ".card-edit", async (ev) => {
            let button = $(ev.currentTarget),
                messageId = button.parents(".message").attr("data-message-id"),
                message = game.messages.get(messageId),
                actor = SR5_EntityHelpers.getRealActorFromID(message.flags.sr5data.owner.speakerId),
                newMessage = duplicate(message.flags.sr5data);

            newMessage.roll[button.attr("data-edit-type")] = parseInt(ev.target.value);

            await SR5_RollTest.addInfoToCard(newMessage, actor.id);
            if (newMessage.owner.itemUuid) SR5_RollTestHelper.updateItemAfterRoll(newMessage, actor);

            //Update message with new data
            await message.update({[`flags.sr5data.chatCard.-=buttons`]: null});
            await SR5_RollMessage.updateRollCardHelper(messageId, newMessage); 
        });

        //Toggle hidden div
        html.find(".SR-MessageToggle").click(ev => SR5_RollMessage.toggleDiv(ev, html));
    }

    //Show or Hide section of the message
    static toggleDiv(ev, html){
        let target = $(ev.currentTarget).attr("data-target"),
            action = $(ev.currentTarget).attr("data-action");
        if (action === "show"){
            $(html).find(`#${target}`).show();
            $(html).find(`[data-target=${target}]`).filter(`[data-action="show"]`).hide();
            $(html).find(`[data-target=${target}]`).filter(`[data-action="hide"]`).show();
        } else {
            $(html).find(`#${target}`).hide();
            $(html).find(`[data-target=${target}]`).filter(`[data-action="hide"]`).hide();
            $(html).find(`[data-target=${target}]`).filter(`[data-action="show"]`).show();
        }
    }

    //Handle action related to chat buttons
    static async chatButtonAction(ev){
        ev.preventDefault();
        
        const button = $(ev.currentTarget),
            messageId = button.parents(".message").data("messageId"),
            message = game.messages.get(messageId),
            action = button.data("action"),
            type = button.data("type");
                
        let speaker = ChatMessage.getSpeaker(),
            actor,
            messageData = message.flags.sr5data;

        messageData.owner.messageId = messageId;
    
        //Define actor for Opposed test or Non opposed tests
        if (action === "opposedTest") {
            actor = SR5_EntityHelpers.getRealActorFromID(speaker.token);
            if (actor == null) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActor")}`);
        } else if (action === "nonOpposedTest" && messageData) {
            if (messageData.target.actorId && (messageData.test.typeSub === "banishing"
              || messageData.test.typeSub ==="binding" || messageData.test.typeSub ==="decompileSprite"
              || messageData.test.typeSub ==="registerSprite")) actor = SR5_EntityHelpers.getRealActorFromID(messageData.target.actorId);
            else actor = SR5_EntityHelpers.getRealActorFromID(messageData.owner.speakerId);
        }

        // If there is a matrix action Author, get the Actor to do stuff with him later
        let originalActionActor, targetActor;
        if (messageData.previousMessage.actorId) originalActionActor = SR5_EntityHelpers.getRealActorFromID(messageData.previousMessage.actorId);
        if (messageData.target.hasTarget) targetActor = SR5_EntityHelpers.getRealActorFromID(messageData.target.actorId);

        switch(type) {
            case "defenseMeleeWeapon":
            case "defenseRangedWeapon":
            case "defenseAstralCombat":
                actor.rollTest("defense", null, messageData);
                break;
            case "defenseThroughAndInto":
                actor.rollTest("defense", null, messageData.originalAttackMessage);
                break;
            case "matrixDefense":
                if ((messageData.test.typeSub === "dataSpike" 
                    || messageData.test.typeSub === "controlDevice"
                    || messageData.test.typeSub === "formatDevice"
                    || messageData.test.typeSub === "hackOnTheFly"
                    || messageData.test.typeSub === "spoofCommand"
                    || messageData.test.typeSub === "bruteForce"
                    || messageData.test.typeSub === "rebootDevice")
                    && (actor.type !== "actorDevice" && actor.type !== "actorSprite" && actor.type !== "actorDrone" && actor.type !== "actorAgent")){
                        SR5_MatrixHelpers.chooseMatrixDefender(messageData, actor);
                    } else actor.rollTest(type, messageData.test.typeSub, messageData);
                    break;
            case "powerDefense":
            case "resistanceCard":
            case "resistanceCardAura":
            case "complexFormDefense":
            case "iceAttack":
            case "sensorDefense":
            case "decompilingResistance":
            case "registeringResistance":
            case "banishingResistance":
            case "iceDefense":
            case "spellResistance":                                        
            case "rammingDefense":
            case "martialArtDefense":
            case "drain":
            case "fading":
            case "objectResistance":
            case "passThroughDefense":
            case "fatiguedCard":
            case "calledShotFear":
            case "calledShotStunned":   
            case "calledShotBuckled":   
            case "calledShotNauseous":
            case "calledShotKnockdown":
            case "matrixResistance":
            case "vehicleTest":
                actor.rollTest(type, null, messageData);
                break;
            case "resistanceCardContinuousDamage":
                messageData.test.typeSub = "continuousDamage";
                actor.rollTest("resistanceCard", null, messageData);
                break;
            case "bindingResistance":
                if (actor.system.isBounded) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_SpiritAlreadyBounded")}`);
                actor.rollTest(type, null, messageData);
                break;
            case "applyEffect":
            case "applyEffectAuto":
                actor.applyExternalEffect(messageData, "customEffects");
                if (messageData.magic.spell.area < 1) SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "applyEffectOnItem":
                actor.applyExternalEffect(messageData, "itemEffects");
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "firstAid":
                let healData = {
                    test: {},
                    roll:{netHits: messageData.roll.netHits,},
                }
                if (actor.type === "actorPc") healData.test.typeSub = await SR5_CombatHelpers.chooseDamageType();
                else healData.test.typeSub = "condition";
                let healedID = (actor.isToken ? actor.token.id : actor.id);
                SR5_ActorHelper.heal(healedID, healData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type, healData.test.typeSub);
                break;
            case "damage":
                if (messageData.test.typeSub === "firstAid") targetActor.takeDamage(messageData);
                else if (messageData.combat.calledShot?.name === "splittingDamage") actor.takeSplitDamage(messageData);
                else actor.takeDamage(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "intimidation":
            case "performance":
            case "negociation":
            case "con":
            case "leadership":
                actor.rollTest("skillDicePool", type, messageData);
                break;
            case "impersonation":
            case "etiquette":
                actor.rollTest("skillDicePool", "perception", messageData);
                break;
            case "calledShotEffect":
                if (messageData.combat.calledShot.name === "trickShot") await originalActionActor.applyCalledShotsEffect(messageData);
                else await actor.applyCalledShotsEffect(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "applyFearEffect":
            case "applyStunnedEffect":
                SR5Combat.changeInitInCombatHelper(actor.id, -messageData.combat.calledShot.initiative);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "templatePlace":
                let item = await fromUuid(messageData.owner.itemUuid);
                await item.placeGabarit(messageId);
                break;
            case "templateRemove":
                SR5_RollMessage.removeTemplate(messageId, messageData.owner.itemUuid);
                break;
            case "summonSpirit":
            case "compileSprite":
            case "createPreparation":
                await SR5_ThirdPartyHelpers.buildItem(messageData, type, actor);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "secondeChance":
                SR5_RollTest.secondeChance(message, actor);
                break;
            case "pushLimit":
                SR5_RollTest.pushTheLimit(message, actor);
                break;
            case "extended":
                SR5_RollTest.extendedRoll(message, actor);
                break;
            case "attackerPlaceMark":
                await SR5_MarkHelpers.markItem(actor.id, messageData.previousMessage.actorId, messageData.matrix.mark, messageData.target.itemUuid);
                // if defender is a drone and is slaved, add mark to master
                if (actor.type === "actorDrone" && actor.system.slaved){
                    if (!game.user?.isGM) {
                        SR5_SocketHandler.emitForGM("markItem", {
                            targetActor: actor.system.vehicleOwner.id,
                            attackerID: originalActionActor.id,
                            mark: messageData.matrix.mark,
                        });
                    } else { 
                        await SR5_MarkHelpers.markItem(actor.system.vehicleOwner.id, messageData.previousMessage.actorId, messageData.matrix.mark);
                    }
                }
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "defenderPlaceMark":
                let attackerID;
                if (actor.isToken) attackerID = actor.token.id;
                else attackerID = actor.id;
                if (!game.user?.isGM) {
                    SR5_SocketHandler.emitForGM("markItem", {
                        targetActor: originalActionActor.id,
                        attackerID: attackerID,
                        mark: 1,
                    });
                } else await SR5_MarkHelpers.markItem(originalActionActor.id, attackerID, 1);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "overwatch":
                if (!game.user?.isGM) {
                    SR5_SocketHandler.emitForGM("overwatchIncrease", {
                        defenseHits: messageData.roll.hits,
                        actorId: originalActionActor.id,
                    });
                } else await SR5_ActorHelper.overwatchIncrease(messageData.roll.hits, originalActionActor.id);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "defenderDoMatrixDamage":
                if (originalActionActor.type === "actorPc" || originalActionActor.type === "actorGrunt"){
                    if (originalActionActor.items.find((item) => item.type === "itemDevice" && item.system.isActive && (item.system.type === "livingPersona" || item.system.type === "headcase"))){
                        originalActionActor.takeDamage(messageData);
                    } else SR5_MatrixHelpers.applyDamageToDecK(originalActionActor, messageData, actor, true);
                } else originalActionActor.takeDamage(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "takeMatrixDamage":
                if (actor.type === "actorPc" || actor.type === "actorGrunt") SR5_MatrixHelpers.applyDamageToDecK(actor, messageData);
                else actor.takeDamage(messageData);
                //Special case for Derezz Complex Form.
                if (messageData.test.typeSub === "derezz") SR5_MatrixHelpers.applyDerezzEffect(messageData, originalActionActor, actor);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "defenderDoBiofeedbackDamage":
                originalActionActor.rollTest("resistanceCard", null, messageData);
                break;
            case "attackerDoBiofeedbackDamage":
                if (actor.type === "actorDrone") actor = SR5_EntityHelpers.getRealActorFromID(actor.system.vehicleOwner.id)
                if (actor) actor.rollTest("resistanceCard", null, messageData);
                break;
            case "scatter":
                SR5_CombatHelpers.rollScatter(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "iceEffect":
                SR5_MatrixHelpers.applyIceEffect(messageData, originalActionActor, actor);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "linkLock":
                SR5_MatrixHelpers.applylinkLockEffect(originalActionActor, actor);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "catchFire":
                SR5_ActorHelper.fireDamageEffect(actor.id);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "targetLocked":
                SR5_CombatHelpers.lockTarget(messageData, originalActionActor, actor);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "jackOut":
                SR5_MatrixHelpers.rollJackOut(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "jackOutSuccess":
                SR5_MatrixHelpers.jackOut(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "eraseMark":
                SR5_MarkHelpers.eraseMarkChoice(messageData);
                break;
            case "eraseMarkSuccess":
                if (!game.user?.isGM) {
                    SR5_SocketHandler.emitForGM("eraseMark", {
                        cardData: messageData,
                    });
                } else SR5_MarkHelpers.eraseMark(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "checkOverwatchScore":
                SR5_MatrixHelpers.rollOverwatchDefense(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "matrixJamSignals":
                SR5_MatrixHelpers.jamSignals(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "reduceService":
            case "reduceTask":
                SR5_ThirdPartyHelpers.reduceSideckickService(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "registerSprite":
            case "bindSpirit":
                SR5_ThirdPartyHelpers.enslavedSidekick(messageData, type);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "ritualSealed":
                SR5_ThirdPartyHelpers.sealRitual(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "killComplexFormResistance":
            case "dispellResistance":
            case "disjointingResistance":
            case "enchantmentResistance":
            case "summoningResistance":
            case "compileSpriteResist":
            case "preparationResist":
            case "ritualResistance":
            case "escapeEngulfDefense":
            case "weaponResistance":
                SR5_ThirdPartyHelpers.createItemResistance(messageData, messageId);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "desactivateFocus":
                SR5_ThirdPartyHelpers.desactivateFocus(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "reduceSpell":
            case "reduceComplexForm":
            case "reducePreparationPotency":
                await SR5_ThirdPartyHelpers.reduceTransferedEffect(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "toxinEffect":
                actor.applyToxinEffect(messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "escapeEngulf":
                actor.rollTest(type, null, messageData);
                break;
            case "regeneration":
                SR5_ActorHelper.regenerate(messageData.owner.speakerId, messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "heal":
                SR5_ActorHelper.heal(messageData.owner.actorId, messageData);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "decreaseReach":
            case "decreaseAccuracy":
                await SR5_ThirdPartyHelpers.applyEffectToItem(messageData, type);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "removeCase":
                await SR5_MiscellaneousHelpers.updateActorData(messageData.targetActor, "maglock.caseRemoved", 0, true);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            case "removeAntiTamper":
                await SR5_MiscellaneousHelpers.updateActorData(messageData.targetActor, "maglock.hasAntiTamper", 0, true);
                SR5_RollMessage.updateChatButtonHelper(messageId, type);
                break;
            default:
                SR5_SystemHelpers.srLog(1, `Unknown '${type}' type in chatButtonAction`);
        }               

        //Attacker test : previous Actor or token is automatically selected
        if (action === "attackerTest" && messageData) {
            if (!game.user.isGM && game.user.id !== messageData.previousMessage.userId) return ui.notifications.warn(game.i18n.localize("SR5.WARN_DontHavePerm"));
            switch (type) {
                case "spendNetHits":
                    let targetActor = SR5_EntityHelpers.getRealActorFromID(messageData.owner.actorId);
                    SR5_CalledShotHelpers.chooseSpendNetHits(message, targetActor);
                    break;
                case "trickShot":
                    actor = SR5_EntityHelpers.getRealActorFromID(messageData.previousMessage.actorId);
                    await actor.applyCalledShotsEffect(messageData);
                    break;
                default:
                    SR5_SystemHelpers.srLog(1, `Unknown '${type}' type in chatButtonAction (attacker Test)`);
            }
        }
    }

    //Remove or change buttons after action is done
    static async updateChatButton(message, buttonToUpdate, firstOption){
        if (buttonToUpdate === undefined) return;

        //Delete useless buttons
        message = await game.messages.get(message);
        if (!message) return;
        let messageData = duplicate(message.flags?.sr5data);
        for (let key in messageData.chatCard.buttons){
            if (key === buttonToUpdate) await message.update({[`flags.sr5data.chatCard.buttons.-=${key}`]: null}, {render: false});
        }
        messageData = duplicate(message.flags.sr5data);

        //Get actor if any
        let actor;
        if (messageData.owner.actorId) actor = SR5_EntityHelpers.getRealActorFromID(messageData.owner.actorId);

        //Special cases : add buttons or end action description
        let endLabel, hits;

        switch (buttonToUpdate) {
            case "damage":
                if (messageData.combat.calledShot.name === "splittingDamage") {
                    if (messageData.damage.splittedTwo){
                        messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.damage.splittedOne}${game.i18n.localize('SR5.DamageTypeStunShort')} & ${messageData.damage.splittedTwo}${game.i18n.localize('SR5.DamageTypePhysicalShort')} ${game.i18n.localize("SR5.AppliedDamage")}`);
                    } else messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.damage.splittedOne}${game.i18n.localize('SR5.DamageTypeStunShort')} ${game.i18n.localize("SR5.AppliedDamage")}`);
                } else messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.damage.value}${game.i18n.localize(SR5.damageTypesShort[messageData.damage.type])} ${game.i18n.localize("SR5.AppliedDamage")}`);
                break;
            case "takeMatrixDamage":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.damage.matrix.value} ${game.i18n.localize("SR5.AppliedDamage")}`);
                break;
            case "eraseMarkSuccess":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.MatrixActionEraseMarkSuccess"));
                break;
            case "reduceTask":
                if ((actor.system.tasks.value - messageData.roll.netHits) <= 0 ) endLabel = game.i18n.localize("SR5.DecompiledSprite");
                else endLabel = `${game.i18n.format('SR5.INFO_TasksReduced', {task: messageData.roll.netHits})}`;
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", endLabel);
                break;
            case "reduceService":
                if ((actor.system.services.value - messageData.roll.netHits) <= 0 ) endLabel = game.i18n.localize("SR5.BanishedSpirit");
                else endLabel = `${game.i18n.format('SR5.INFO_ServicesReduced', {service: messageData.roll.netHits})}`;
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", endLabel);
                break;
            case "reduceComplexForm":
                let targetedComplexForm = await fromUuid(messageData.target.itemUuid);
                if (targetedComplexForm.system.hits <= 0) endLabel = `${game.i18n.format('SR5.INFO_ComplexFormKilled', {name: targetedComplexForm.name})}`
                else endLabel = `${game.i18n.format('SR5.INFO_ComplexFormReduced', {name: targetedComplexForm.name, hits: messageData.roll.netHits})}`
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", endLabel);
                break;
            case "applyEffect":
            case "applyEffectAuto":
            case "calledShotEffect":
            case "applyStunnedEffect":
            case "applyFearEffect":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.EffectApplied"));
                break;
            case "decreaseReach":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.WeaponReachDecreased"));
                if (messageData.chatCard.buttons.decreaseAccuracy) delete messageData.chatCard.buttons.decreaseAccuracy;
                break;
            case "decreaseAccuracy":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.AccuracyDecreased"));
                if (messageData.chatCard.buttons.decreaseReach) delete messageData.chatCard.buttons.decreaseReach;
                break;
            case "iceEffect":
                hits = messageData.previousMessage.hits - messageData.roll.hits;
                switch (messageData.test.typeSub){
                    case "iceBlaster":
                        messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.EffectLinkLockedConnection"));
                        break;
                    case "iceAcid":
                        messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", `${game.i18n.format('SR5.EffectReduceFirewallDone', {hits: hits})}`);
                        break;
                    case "iceJammer":
                        messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", `${game.i18n.format('SR5.EffectReduceAttackDone', {hits: hits})}`);
                        break;
                    case "iceBinder":
                        messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", `${game.i18n.format('SR5.EffectReduceDataProcessingDone', {hits: hits})}`);
                        break;
                    case "iceMarker":
                        messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", `${game.i18n.format('SR5.EffectReduceSleazeDone', {hits: hits})}`);
                        break;
                }
                break;
            case "toxinEffect":
                if (messageData.damage.toxin.type === "airEngulf"){
                    //Generate Resistance chat button
			        let label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${messageData.damage.base}${game.i18n.localize(SR5.damageTypesShort[messageData.damage.type])}`;
			        if (messageData.combat.armorPenetration) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${messageData.combat.armorPenetration}`;
			        messageData.chatCard.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCard",label);
                    messageData.damage.resistanceType = "physicalDamage";
                    let oldMessage = game.messages.get(messageData.previousMessage.messageId);
                    if (oldMessage) await oldMessage.delete();
                    //Escape engulf
                    messageData.chatCard.buttons.escapeEngulf = SR5_RollMessage.generateChatButton("nonOpposedTest","escapeEngulf", game.i18n.localize("SR5.EscapeEngulfAttempt"));
                    messageData.previousMessage.messageId = message.id;
                }
                break;
            case "regeneration":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.roll.netHits} ${game.i18n.localize("SR5.HealedBox")}`);
                break;
            case "heal":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.roll.hits}${game.i18n.localize(SR5.damageTypesShort[messageData.test.typeSub])} ${game.i18n.localize("SR5.Healed")}`);
                messageData.extendedTest = false;
                break;
            case "firstAid":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.roll.netHits}${game.i18n.localize(SR5.damageTypesShort[firstOption])} ${game.i18n.localize("SR5.Healed")}`);
                break;
            case "removeCase":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.MaglockCaseRemoved"));
                break;
            case "removeAntiTamper":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.MaglockAntiTamperRemoved"));
                break;
            case "bindSpirit":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.BoundSpirit"));
                break;
            case "reduceSpell":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", `${game.i18n.localize("SR5.DispellingSuccessful")} (${messageData.roll.netHits} ${game.i18n.localize("SR5.DiceHits")})`);
                break;
            //case "reduceComplexForm":
            case "reducePreparationPotency":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", `${game.i18n.localize("SR5.DisjointingSuccessful")} (${messageData.roll.netHits} ${game.i18n.localize("SR5.DiceHits")})`);
                break
            case "createPreparation":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.PreparationCreateSuccessful"));
                break;
            case "jackOutSuccess":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.MatrixActionJackOutSuccessFul"));
                break;
            case "compileSprite":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", `${game.i18n.localize("SR5.CompiledSprite")} [${game.i18n.localize(SR5.spriteTypes[messageData.matrix.spriteType])} (${messageData.matrix.level})]`);
                break;
            case "ritualSealed":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.RitualSealed"));
                break;
            default:
        }

        if (buttonToUpdate === "templateRemove") messageData.chatCard.templateRemove = false;
        if (buttonToUpdate === "templatePlace") {
            messageData.chatCard.templateRemove = true;
            messageData.chatCard.templatePlace = false;
        }

        //Remove Edge action & Edit succes so it can't be used after action end
        if (buttonToUpdate !== "templateRemove" && buttonToUpdate !== "templatePlace"){
            messageData.edge.canUseEdge = false;
            //messageData.chatCard.canEditResult = false;
        }

        await SR5_RollMessage.updateRollCardHelper(message.id, messageData);
    }

    //Update the stat of a chatMessage button
    static async updateChatButtonHelper(message, button, firstOption){
        if (!game.user?.isGM) {
            await SR5_SocketHandler.emitForGM("updateChatButton", {
                message: message,
                buttonToUpdate: button,
                firstOption: firstOption,
            });
        } else await SR5_RollMessage.updateChatButton(message, button, firstOption);
    }

    static async _socketUpdateChatButton(message){
        await SR5_RollMessage.updateChatButton(message.data.message, message.data.buttonToUpdate, message.data.firstOption);
    }

    //Return data for a chat button
    static generateChatButton(testType, actionType, label, gmAction){
        if (gmAction) gmAction = "chat-button-gm";
        else gmAction = "";

        let button = {
            testType: testType,
            actionType: actionType,
            label: label,
            gmAction: gmAction,
        }
        return button;
    }

    //Update data on roll chatMessage
    static async updateRollCard(message, newMessage){
        let messageToUpdate = await game.messages.get(message);
        let template = messageToUpdate.flags.sr5template;
        return renderTemplate(template, newMessage).then((html) => {
            let newHtml = $(html);
	        let divButtons = newHtml.find('[id="srButtonTest"]');
	        for (let button in newMessage.chatCard.buttons){
		        divButtons.append(`<button class="messageAction ${newMessage.chatCard.buttons[button].testType}" data-action="${newMessage.chatCard.buttons[button].testType}" data-type="${newMessage.chatCard.buttons[button].actionType}">${newMessage.chatCard.buttons[button].label}</button>`);
	        }
	        html = newHtml[0].outerHTML;
            messageToUpdate.update({
                "flags.sr5data": newMessage,
                content: html,
            })
        });
    }

    static async _socketUpdateRollCard(message){
        await SR5_RollMessage.updateRollCard(message.data.message, message.data.newMessage);
    }

    static async updateRollCardHelper(message, newMessage){
        if (!game.user?.isGM) {
            await SR5_SocketHandler.emitForGM("updateRollCard", {
                message: message,
                newMessage: newMessage,
            });
        } else await SR5_RollMessage.updateRollCard(message, newMessage);
    }

    //Remove a template from scene on click
    static async removeTemplate(message, itemUuid){
        if (!canvas.scene){
            SR5_RollMessage.updateChatButtonHelper(message, "templateRemove");
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActiveScene")}`);
            return;
        }
        let template = canvas.scene.templates.find((t) => t.flags.sr5.itemUuid === itemUuid);
        if (template){
            canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id]);
            if (message) SR5_RollMessage.updateChatButtonHelper(message, "templateRemove");
        } else {
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoTemplateInScene")}`);
            if (message) SR5_RollMessage.updateChatButtonHelper(message, "templateRemove");
        }
    }

    
}