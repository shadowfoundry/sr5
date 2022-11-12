import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_RollTest } from "./roll-test.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_SocketHandler } from "../socket.js";
import { SR5Actor } from "../entities/actors/entityActor.js";
import { SR5Combat } from "../system/srcombat.js";

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

        //Toggle Dice composition details
        if (!game.user.isGM) {
            // Hide GM stuff
            html.find(".chat-button-gm").remove();
            // Hide if player is not owner of the message
            if (data.message.speaker.actor && game.actors.get(data.message.speaker.actor)?.permission != 3) {
                html.find(".nonOpposedTest").remove();
            }
            // Hide if player is not owner of the message for attackerTest
            if (game.user.id !== data.message.flags.sr5data.originalActionUser) {
                html.find(".attackerTest").remove();
            }
        }

        // Do not display "Blind" chat cards to non-gm
        if (html.hasClass("blind") && !game.user.isGM) {
            html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
            html.html("").css("display", "none");
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

            await SR5_RollTest.srDicesAddInfoToCard(newMessage, actor.id);
            if (newMessage.itemId) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

            //Update message with new data
            await message.update({[`flags.sr5data.-=buttons`]: null});
            await SR5_RollMessage.updateRollCard(messageId, newMessage); 
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

    static async chatButtonAction(ev){
        ev.preventDefault();
        
        const button = $(ev.currentTarget),
            messageId = button.parents(".message").data("messageId"),
            message = game.messages.get(messageId),
            action = button.data("action"),
            type = button.data("type");
                
        let speaker = ChatMessage.getSpeaker(),
            actor,
            messageData = message.flags.sr5data,
            senderId = messageData.speakerId;

        messageData.originalMessage = messageId;
    
        //Opposed test : need to select a Token to operate
        if (action === "opposedTest") {
            actor = SR5_EntityHelpers.getRealActorFromID(speaker.token);
            if (actor == null) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActor")}`);
    
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
                        SR5_DiceHelper.chooseMatrixDefender(messageData, actor);
                    } else actor.rollTest(type, messageData.test.typeSub, messageData);
                    break;
                case "powerDefense":
                case "resistanceCard":
                case "complexFormDefense":
                case "iceAttack":
                case "sensorDefense":
                case "decompilingResistance":
                case "registeringResistance":
                case "banishingResistance":
                case "iceDefense":
                case "resistSpell":                                        
                case "rammingDefense":
                case "martialArtDefense":
                    actor.rollTest(type, null, messageData);
                    break;
                case "bindingResistance":
                    if (actor.system.isBounded) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_SpiritAlreadyBounded")}`);
                    actor.rollTest(type, null, messageData);
                    break;
                case "applyEffect":
                    actor.applyExternalEffect(messageData, "customEffects");
                    if (!messageData.spellArea > 0) SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "applyEffectOnItem":
                    actor.applyExternalEffect(messageData, "itemEffects");
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "drain":
                    actor.rollTest(type, null, messageData);
                    break;
                case "firstAid":
                    let healData = {
                        test: {},
                        roll:{
                            netHits: messageData.roll.netHits,
                        },
                    }
                    if (actor.type === "actorPc"){
                        healData.test.typeSub = await SR5_DiceHelper.chooseDamageType();
                    } else healData.test.typeSub = "condition";
                    let healedID = (actor.isToken ? actor.token.id : actor.id);
                    SR5Actor.heal(healedID, healData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type, healData.test.typeSub);
                    break;
                case "damage":
                    actor.takeDamage(messageData);
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
                default:
                    SR5_SystemHelpers.srLog(1, `Unknown '${type}' type in chatButtonAction (opposed Test)`);
            }
        }
    
        //Non-Opposed test : Actor or token is automatically selected
        if (action === "nonOpposedTest" && messageData) {
            if (!game.user.isGM && messageData.owner.speakerId !== senderId) return ui.notifications.warn(game.i18n.localize("SR5.WARN_DontHavePerm"));
            actor = SR5_EntityHelpers.getRealActorFromID(messageData.owner.speakerId);
    
            // If there is a matrix action Author, get the Actor to do stuff with him later
            let originalActionActor, targetActor;
            if (messageData.originalActionActor) originalActionActor = SR5_EntityHelpers.getRealActorFromID(messageData.originalActionActor);
            if (messageData.target.hasTarget) targetActor = SR5_EntityHelpers.getRealActorFromID(messageData.target.actorId);
    
            switch (type) {
                case "resistanceCard":
                case "resistanceCardAura":
                case "drain":
                case "fading":
                case "objectResistance":
                case "passThroughDefense":
                case "accidentCard":
                case "fatiguedCard":
                    actor.rollTest(type, null, messageData);                   
                    break;
                case "calledShotFear":
                case "calledShotStunned":   
                case "calledShotBuckled":   
                case "calledShotNauseous":
                case "calledShotKnockdown":
                    actor.rollTest(type, null, messageData);
                    break;
                case "damage":
                    if (messageData.test.typeSub === "firstAid") targetActor.takeDamage(messageData);
                    else if (messageData.combat.calledShot?.name === "splittingDamage") actor.takeSplitDamage(messageData);
                    else actor.takeDamage(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "calledShotEffect":
                    if (messageData.combat.calledShot.name === "trickShot"){
                        originalActionActor = SR5_EntityHelpers.getRealActorFromID(messageData.attackerId);
                        await originalActionActor.applyCalledShotsEffect(messageData);
                    } else await actor.applyCalledShotsEffect(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "applyFearEffect":
                case "applyStunnedEffect":
                    SR5Combat.changeInitInCombat(actor, -messageData.initiativeMod);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "matrixResistance":
                    actor.rollTest(type, messageData.matrixResistanceType, messageData);
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
                    await SR5_RollMessage.buildItem(messageData, type, actor);
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
                    await SR5_DiceHelper.markItem(actor.id, messageData.originalActionActor, messageData.mark, messageData.matrixTargetItemUuid);
                    // if defender is a drone and is slaved, add mark to master
                    if (actor.type === "actorDrone" && actor.system.slaved){
                        if (!game.user?.isGM) {
                            SR5_SocketHandler.emitForGM("markItem", {
                                targetActor: actor.system.vehicleOwner.id,
                                attackerID: originalActionActor,
                                mark: mark,
                            });
                        } else { 
                            await SR5_DiceHelper.markItem(actor.system.vehicleOwner.id, messageData.originalActionActor, messageData.mark);
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
                    } else await SR5_DiceHelper.markItem(originalActionActor.id, attackerID, 1);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "overwatch":
                    if (!game.user?.isGM) {
                        SR5_SocketHandler.emitForGM("overwatchIncrease", {
                            defenseHits: messageData.roll.hits,
                            actorId: originalActionActor.id,
                        });
                    } else await SR5Actor.overwatchIncrease(messageData.roll.hits, originalActionActor.id);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "defenderDoMatrixDamage":
                    if (originalActionActor.type === "actorPc" || originalActionActor.type === "actorGrunt"){
                        if (originalActionActor.items.find((item) => item.type === "itemDevice" && item.system.isActive && (item.system.type === "livingPersona" || item.system.type === "headcase"))){
                            originalActionActor.takeDamage(messageData);
                        } else SR5_DiceHelper.applyDamageToDecK(originalActionActor, messageData, actor, true);
                    } else originalActionActor.takeDamage(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "takeMatrixDamage":
                    if (actor.type === "actorPc" || actor.type === "actorGrunt"){
                        SR5_DiceHelper.applyDamageToDecK(actor, messageData);
                    } else actor.takeDamage(messageData);
                    //Special case for Derezz Complex Form.
                    if (messageData.test.typeSub === "derezz") SR5_DiceHelper.applyDerezzEffect(messageData, originalActionActor, actor);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "defenderDoBiofeedbackDamage":
                    originalActionActor.rollTest("resistanceCard", null, messageData);
                    break;
                case "attackerDoBiofeedbackDamage":
                    if (actor.type === "actorDrone") actor = SR5_EntityHelpers.getRealActorFromID(actor.system.vehicleOwner.id)
                    actor.rollTest("resistanceCard", null, messageData);
                    break;
                case "scatter":
                    SR5_DiceHelper.rollScatter(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "iceEffect":
                    SR5_DiceHelper.applyIceEffect(messageData, originalActionActor, actor);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "linkLock":
                    SR5_DiceHelper.linkLock(originalActionActor, actor);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "catchFire":
                    actor.fireDamageEffect(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "targetLocked":
                    SR5_DiceHelper.lockTarget(messageData, originalActionActor, actor);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "jackOut":
                    SR5_DiceHelper.rollJackOut(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "jackOutSuccess":
                    SR5_DiceHelper.jackOut(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "eraseMark":
                    SR5_DiceHelper.eraseMarkChoice(messageData);
                    break;
                case "eraseMarkSuccess":
                    SR5_DiceHelper.eraseMark(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "checkOverwatchScore":
                    SR5_DiceHelper.rollOverwatchDefense(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "matrixJamSignals":
                    SR5_DiceHelper.jamSignals(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "reduceService":
                case "reduceTask":
                    SR5_DiceHelper.reduceSideckickService(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "registerSprite":
                case "bindSpirit":
                    SR5_DiceHelper.enslavedSidekick(messageData, type);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "applyEffectAuto":
                    actor.applyExternalEffect(messageData, "customEffects");
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "ritualSealed":
                    SR5_DiceHelper.sealRitual(messageData);
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
                    SR5_DiceHelper.createItemResistance(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "desactivateFocus":
                    SR5_DiceHelper.desactivateFocus(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "reduceSpell":
                case "reduceComplexForm":
                case "reducePreparationPotency":
                    await SR5_DiceHelper.reduceTransferedEffect(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "bindingResistance":
                case "banishingResistance":
                case "decompilingResistance":
                case "registeringResistance":
                    targetActor.rollTest(type, null, messageData);
                    break;
                case "toxinEffect":
                    actor.applyToxinEffect(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "escapeEngulf":
                    actor.rollTest(type, null, messageData);
                    break;
                case "regeneration":
                    actor.regenerate(messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "heal":
                    SR5Actor.heal(messageData.actorId, messageData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "firstAid":
                    let healData = {
                        test: {},
                        roll:{
                            netHits: messageData.roll.netHits,
                        },
                    }
                    if (targetActor.type === "actorPc") healData.test.typeSub = await SR5_DiceHelper.chooseDamageType();
                    else healData.test.typeSub = "condition";
                    let targetHealedID = (targetActor.isToken ? targetActor.token.id : targetActor.id);
                    SR5Actor.heal(targetHealedID, healData);
                    if (!game.user?.isGM) await SR5_SocketHandler.emitForGM("heal", {targetActor: targetHealedID, healData: healData});
                    else SR5Actor.heal(targetHealedID, healData);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type, healData.test.typeSub);
                    break;
                case "decreaseReach":
                case "decreaseAccuracy":
                    await SR5_DiceHelper.applyEffectToItem(messageData, type);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "removeCase":
                    await SR5_DiceHelper.updateActorData(messageData.targetActor, "maglock.caseRemoved", 0, true);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                case "removeAntiTamper":
                    await SR5_DiceHelper.updateActorData(messageData.targetActor, "maglock.hasAntiTamper", 0, true);
                    SR5_RollMessage.updateChatButtonHelper(messageId, type);
                    break;
                default:
                    SR5_SystemHelpers.srLog(1, `Unknown '${type}' type in chatButtonAction (non-opposed Test)`);
            }
        }

        //Attacker test : previous Actor or token is automatically selected
        if (action === "attackerTest" && messageData) {
            if (!game.user.isGM && game.user.id !== messageData.originalActionUser) return ui.notifications.warn(game.i18n.localize("SR5.WARN_DontHavePerm"));
            let targetActor = SR5_EntityHelpers.getRealActorFromID(message.flags.speakerId);
            actor = SR5_EntityHelpers.getRealActorFromID(message.flags.originalActionUser)            
            switch (type) {
                case "spendNetHits":
                    SR5_DiceHelper.chooseSpendNetHits(message, targetActor);
                    break;
                case "trickShot":
                    await actor.applyCalledShotsEffect(messageData);
                    break;
                default:
                    SR5_SystemHelpers.srLog(1, `Unknown '${type}' type in chatButtonAction (attacker Test)`);
            }
        }
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

    static async updateChatButton(message, buttonToUpdate, firstOption){
        if (buttonToUpdate === undefined) return;
        //Delete useless buttons
        message = await game.messages.get(message);
        let messageData = duplicate(message.flags.sr5data);
        for (let key in messageData.chatCard.buttons){
            if (key === buttonToUpdate) await message.update({[`flags.sr5data.chatCard.buttons.-=${key}`]: null}, {render: false});
        }
        messageData = duplicate(message.flags.sr5data);

        //Get actor if any
        let actor;
        if (messageData.actorId) actor = SR5_EntityHelpers.getRealActorFromID(messageData.actorId);

        //Special cases : add buttons or end action description
        let endLabel, hits;

        switch (buttonToUpdate) {
            case "damage":
                if (messageData.combat.calledShot.name === "splittingDamage") {
                    if (messageData.splittedDamageTwo){
                        messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.splittedDamageOne}${game.i18n.localize('SR5.DamageTypeStunShort')} & ${messageData.splittedDamageTwo}${game.i18n.localize('SR5.DamageTypePhysicalShort')} ${game.i18n.localize("SR5.AppliedDamage")}`);
                    } else messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.splittedDamageOne}${game.i18n.localize('SR5.DamageTypeStunShort')} ${game.i18n.localize("SR5.AppliedDamage")}`);
                } else messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.damage.value}${game.i18n.localize(SR5.damageTypesShort[messageData.damage.type])} ${game.i18n.localize("SR5.AppliedDamage")}`);
                break;
            case "takeMatrixDamage":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.matrixDamageValue} ${game.i18n.localize("SR5.AppliedDamage")}`);
                break;
            case "eraseMarkSuccess":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.MatrixActionEraseMarkSuccess"));
                break;
            case "reduceTask":
                if ((actor.system.tasks.value - messageData.netHits) <= 0 ) endLabel = game.i18n.localize("SR5.DecompiledSprite");
                else endLabel = `${game.i18n.format('SR5.INFO_TasksReduced', {task: messageData.netHits})}`;
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", endLabel);
                break;
            case "reduceService":
                if ((actor.system.services.value - messageData.netHits) <= 0 ) endLabel = game.i18n.localize("SR5.BanishedSpirit");
                else endLabel = `${game.i18n.format('SR5.INFO_ServicesReduced', {service: messageData.netHits})}`;
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", endLabel);
                break;
            case "reduceComplexForm":
                let targetedComplexForm = await fromUuid(messageData.targetEffect);
                if (targetedComplexForm.system.hits <= 0) endLabel = `${game.i18n.format('SR5.INFO_ComplexFormKilled', {name: targetedComplexForm.name})}`
                else endLabel = `${game.i18n.format('SR5.INFO_ComplexFormReduced', {name: targetedComplexForm.name, hits: messageData.netHits})}`
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", endLabel);
                break;
            case "applyEffectAuto":
            case "calledShotEffect":
            case "applyStunnedEffect":
            case "applyFearEffect":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.EffectApplied"));
                break;
            case "decreaseReach":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.WeaponReachDecreased"));
                if (messageData.chatCard.buttons.decreaseAccuracy) delete messageData.buttons.decreaseAccuracy;
                break;
            case "decreaseAccuracy":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.AccuracyDecreased"));
                if (messageData.chatCard.buttons.decreaseReach) delete messageData.buttons.decreaseReach;
                break;
            case "iceEffect":
                hits = messageData.hits - messageData.roll.hits;
                switch (messageData.iceType){
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
                if (messageData.toxin.type === "airEngulf"){
                    //Generate Resistance chat button
			        let label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${messageData.damageValueBase}${game.i18n.localize(SR5.damageTypesShort[messageData.damageType])}`;
			        if (messageData.incomingPA) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${messageData.incomingPA}`;
			        messageData.chatCard.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCard",label);
                    messageData.damageResistanceType = "physicalDamage";
                    let oldMessage = game.messages.get(messageData.continuousDamageId);
                    if (oldMessage) await oldMessage.delete();
                    //Escape engulf
                    messageData.chatCard.buttons.escapeEngulf = SR5_RollMessage.generateChatButton("nonOpposedTest","escapeEngulf", game.i18n.localize("SR5.EscapeEngulfAttempt"));
                    messageData.continuousDamageId = message.id;
                }
                break;
            case "regeneration":
                messageData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.netHits} ${game.i18n.localize("SR5.HealedBox")}`);
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
            default:
        }

        if (buttonToUpdate === "templateRemove") messageData.chatCard.templateRemove = false;
        if (buttonToUpdate === "templatePlace") {
            messageData.chatCard.templateRemove = true;
            messageData.chatCard.templatePlace = false;
        }

        //Remove Edge action & Edit succes so it can't be used after action end
        if (buttonToUpdate !== "templateRemove" && buttonToUpdate !== "templatePlace"){
            messageData.secondeChanceUsed = true;
            messageData.pushLimitUsed = true;
            messageData.chatCard.canEditResult = false;
        }

        await SR5_RollMessage.updateRollCard(message.id, messageData);
    }

    static async _socketupdateChatButton(message){
        await SR5_RollMessage.updateChatButton(message.data.message, message.data.buttonToUpdate, message.data.firstOption);
    }


    static async _socketupdateRollCard(message){
        SR5_SystemHelpers.srLog(3, `_socketupdateRollCard : message.data.message : '${message.data.message}', message.data.newMessage '${message.data.newMessage}'`);
        await SR5_RollMessage.updateRollCard(message.data.message, message.data.newMessage);
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

    //Remove a template from scene on click
    static async removeTemplate(message, itemUuid){
        if (!canvas.scene){
            SR5_RollMessage.updateChatButton(message, "templateRemove");
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActiveScene")}`);
            return;
        }
        let template = canvas.scene.templates.find((t) => t.flags.sr5.itemUuid === itemUuid);
        if (template){
            canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id]);
            if (message) SR5_RollMessage.updateChatButton(message, "templateRemove");
        } else {
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoTemplateInScene")}`);
            if (message) SR5_RollMessage.updateChatButton(message, "templateRemove");
        }
    }

    //Build summoned spirit
    static async buildItem(messageData, itemType, actor){
        let actorData = actor.system;
        let buildItem;

        switch (itemType){
            case"summonSpirit":
            buildItem = {
                    name: `${game.i18n.localize("SR5.SummonedSpirit")} (${game.i18n.localize(SR5.spiritTypes[messageData.spiritType])}, ${messageData.force})`,
                    type: "itemSpirit",
                    img: `systems/sr5/img/items/itemSpirit.svg`,
                    ["system.type"]: messageData.spiritType,
                    ["system.itemRating"]: messageData.force,
                    ["system.services.max"]: messageData.hits - messageData.roll.hits,
                    ["system.services.value"]: messageData.hits - messageData.roll.hits,
                    ["system.summonerMagic"]: actorData.specialAttributes.magic.augmented.value,
                    ["system.magic.tradition"]: actorData.magic.tradition,
                };
                ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_SummonSpirit")} ${game.i18n.localize(SR5.spiritTypes[messageData.spiritType])} (${messageData.force})`); 
                break;
            case "compileSprite":
                buildItem = {
                    name: `${game.i18n.localize("SR5.CompiledSprite")} (${game.i18n.localize(SR5.spriteTypes[messageData.spriteType])}, ${messageData.level})`,
                    type: "itemSprite",
                    img: `systems/sr5/img/items/itemSprite.svg`,
                    ["system.type"]: messageData.spriteType,
                    ["system.itemRating"]: messageData.level,
                    ["system.tasks.max"]: messageData.hits - messageData.roll.hits,
                    ["system.tasks.value"]: messageData.hits - messageData.roll.hits,
                    ["system.compilerResonance"]: actorData.specialAttributes.resonance.augmented.value,
                };
                ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_CompileSprite")} ${game.i18n.localize(SR5.spriteTypes[messageData.spriteType])} (${messageData.level})`);
                break;
            case "createPreparation":
                let preparation = actor.items.find(i => i.id === messageData.itemId);
                buildItem = {"system": preparation.system,};
                buildItem = mergeObject(buildItem, {
                    name: `${game.i18n.localize("SR5.Preparation")}${game.i18n.localize("SR5.Colons")} ${preparation.name}`,
                    type: "itemPreparation",
                    img: `systems/sr5/img/items/itemPreparation.svg`,
                    ["system.trigger"]: messageData.preparationTrigger,
                    ["system.potency"]: messageData.hits - messageData.roll.hits,
                    ["system.force"]: messageData.force,
                    ["system.freeSustain"]: true,
                    ["system.hits"]: 0,
                    ["system.drainValue"]:preparation.system.drainValue,
                });
                ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_CreatePreparation")} ${preparation.name}`);
                break;
            default: 
                SR5_SystemHelpers.srLog(1, `Unknown '${itemType}' type in 'buildItem()'`);
        }

        await actor.createEmbeddedDocuments("Item", [buildItem]);
    }
}