import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utility.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_Dice } from "./dice.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_SocketHandler } from "../socket.js";
import { SR5Actor } from "../entities/actors/entityActor.js";

export class SR5_RollMessage {

    //Handle reaction to roll ChatMessage
    static async chatListeners(html, data) {
        html.on("click", ".messageAction", (ev) => {
            SR5_RollMessage.chatButtonAction(ev)
        });
        
        // Toggle Dice details
        html.on("click", ".SR-CardHeader", (ev) => {
            ev.preventDefault();
            $(ev.currentTarget).siblings(".SR-CardContent").toggle();
        });
        
        // Hide GM stuff
        if (!game.user.isGM) {
            html.find(".chat-button-gm").remove();
        }
        
        // Hide if player is not owner of the message
        if (!game.user.isGM) {
            if (data.message.speaker.actor && game.actors.get(data.message.speaker.actor)?.permission != 3) {
                html.find(".nonOpposedTest").remove();
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
        
        $(html).find(".SR-CardContent").hide();
        
        // Respond to editing chat cards 
        html.on("change", ".card-edit", async (ev) => {
            let button = $(ev.currentTarget),
                messageId = button.parents(".message").attr("data-message-id"),
                message = game.messages.get(messageId),
                actor = SR5_EntityHelpers.getRealActorFromID(message.data.flags.speakerId),
                newMessage = duplicate(message.data.flags.sr5data);

            newMessage.test[button.attr("data-edit-type")] = parseInt(ev.target.value);

            //update the original message data to stay sinchronous on hide/show buttons
            if (newMessage.originalMessage){
                let updatedOriginalMessage = await game.messages.get(newMessage.originalMessage._id);
                let flagdata = await duplicate(updatedOriginalMessage.data.flags.sr5data);
                newMessage.originalMessage.flags.sr5data = flagdata;
            }

            await SR5_Dice.srDicesAddInfoToCard(newMessage, actor.data);
            if (newMessage.item) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);

            //Update message with new data
            await SR5_RollMessage.updateRollCard(message.data, newMessage); 
        });
    }

    static async chatButtonAction(ev){
        ev.preventDefault();
        
        const button = $(ev.currentTarget),
            messageId = button.parents(".message").data("messageId"),
            senderId = game.messages.get(messageId).user.id,
            message = game.messages.get(messageId),
            action = button.data("action"),
            type = button.data("type");
                
        let speaker = ChatMessage.getSpeaker(),
            actor,
            messageData = message.data.flags.sr5data;

        messageData.originalMessage = message.data;
    
        //Opposed test : need to select a Token to operate
        if (action === "opposedTest") {
            actor = SR5_EntityHelpers.getRealActorFromID(speaker.token);
            if (actor == null) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActor")}`);
    
            switch(type) {
                case "defenseMeleeWeapon":
                case "defenseRangedWeapon":
                    actor.rollTest("defenseCard", null, messageData);
                    break;
                case "matrixDefense":
                    if ((messageData.typeSub === "dataSpike" 
                        || messageData.typeSub === "controlDevice"
                        || messageData.typeSub === "formatDevice"
                        || messageData.typeSub === "hackOnTheFly"
                        || messageData.typeSub === "spoofCommand"
                        || messageData.typeSub === "bruteForce"
                        || messageData.typeSub === "rebootDevice")
                        && (actor.data.type !== "actorDevice" && actor.data.type !== "actorSprite" && actor.data.type !== "actorDrone" && actor.data.type !== "actorAgent")
                        && (actor.data.data.matrix.pan.content.length)){
                        SR5_DiceHelper.chooseMatrixDefender(messageData, actor);
                    } else actor.rollTest(type, messageData.typeSub, messageData);
                    break;
                case "powerDefense":
                case "resistanceCard":
                case "complexFormDefense":
                case "iceDefense":
                case "activeSensorDefense":
                case "decompilingResistance":
                case "registeringResistance":
                case "banishingResistance":
                    actor.rollTest(type, null, messageData);
                    break;
                case "bindingResistance":
                    if (actor.data.data.isBounded) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_SpiritAlreadyBounded")}`);
                    actor.rollTest(type, null, messageData);
                    break;
                case "applyEffect":
                    actor.applyExternalEffect(messageData, "customEffects");
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "applyEffectOnItem":
                    actor.applyExternalEffect(messageData, "itemEffects");
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                default:
                    SR5_SystemHelpers.srLog(1, `Unknown '${type}' type in chatButtonAction (opposed Test)`);
            }
        }
    
        //Non-Opposed test : Actor or token is automatically selected
        if (action === "nonOpposedTest" && messageData) {
            if (!game.user.isGM && game.user.id !== senderId) return ui.notifications.warn(game.i18n.localize("SR5.WARN_DontHavePerm"));
            actor = SR5_EntityHelpers.getRealActorFromID(message.data.flags.speakerId);
    
            // If there is a matrix action Author, get the Actor to do stuff with him later
            let originalActionAuthor, targetActor;
            if (messageData.originalActionAuthor) originalActionAuthor = SR5_EntityHelpers.getRealActorFromID(messageData.originalActionAuthor);
            if (messageData.targetActor) targetActor = SR5_EntityHelpers.getRealActorFromID(messageData.targetActor);
    
            switch (type) {
                case "resistanceCard":
                case "drainCard":
                case "fadingCard":
                    actor.rollTest(type, null, messageData);
                    break;
                case "takeDamage":
                    actor.takeDamage(messageData);
                    SR5_RollMessage.updateChatButton(message.data, "takeDamage");
                    break;
                case "matrixResistance":
                    actor.rollTest(type, messageData.matrixResistanceType, messageData);
                    break;
                case "templatePlace":
                    let item = actor.items.get(messageData.item._id);
                    item.placeGabarit();
                    SR5_RollMessage.updateChatButton(message.data, "removeTemplate");
                    break;
                case "templateRemove":
                    SR5_RollMessage.removeTemplate(message, messageData.item._id);
                    break;
                case "summonSpirit":
                case "compileSprite":
                case "createPreparation":
                    await SR5_RollMessage.buildItem(messageData, type, actor);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "secondeChance":
                    SR5_Dice.secondeChance(message, actor);
                    break;
                case "pushLimit":
                    SR5_Dice.pushTheLimit(message, actor);
                    break;
                case "extended":
                    SR5_Dice.extendedRoll(message, actor);
                    break;
                case "attackerPlaceMark":
                    await SR5_DiceHelper.markItem(actor.id, messageData.originalActionAuthor, messageData.mark, messageData.matrixTargetItem);
                    // if defender is a drone and is slaved, add mark to master
                    if (actor.data.type === "actorDrone" && actor.data.data.slaved){
                        if (!game.user?.isGM) {
                            SR5_SocketHandler.emitForGM("markItem", {
                                targetActor: actor.data.data.vehicleOwner.id,
                                attackerID: originalActionAuthor,
                                mark: mark,
                            });
                        } else { 
                            await SR5_DiceHelper.markItem(actor.data.data.vehicleOwner.id, messageData.originalActionAuthor, messageData.mark);
                        }
                    }
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "defenderAddMark":
                    let attackerID;
                    if (actor.isToken) attackerID = actor.token.id;
                    else attackerID = actor.id;
                    if (!game.user?.isGM) {
                        SR5_SocketHandler.emitForGM("markItem", {
                            targetActor: originalActionAuthor.id,
                            attackerID: attackerID,
                            mark: 1,
                        });
                      } else {  
                        await SR5_DiceHelper.markItem(originalActionAuthor.id, attackerID, 1);
                    }
                    
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "overwatch":
                    if (!game.user?.isGM) {
                        SR5_SocketHandler.emitForGM("overwatchIncrease", {
                            defenseHits: messageData.test.hits,
                            actorId: originalActionAuthor.id,
                        });
                      } else {  
                        await SR5Actor.overwatchIncrease(messageData.test.hits, originalActionAuthor.id);
                    }
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "defenderDoMatrixDamage":
                    if (originalActionAuthor.data.type === "actorPc" || originalActionAuthor.data.type === "actorGrunt"){
                        if (originalActionAuthor.items.find((item) => item.type === "itemDevice" && item.data.data.isActive && (item.data.data.type === "livingPersona" || item.data.data.type === "headcase"))){
                            originalActionAuthor.takeDamage(messageData);
                        } else {
                            SR5_DiceHelper.applyDamageToDecK(originalActionAuthor, messageData, actor);
                        }
                    } else {
                        originalActionAuthor.takeDamage(messageData);
                    }
                    await SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "takeMatrixDamage":
                    if (actor.data.type === "actorPc" || actor.data.type === "actorGrunt"){
                        if (actor.items.find((item) => item.type === "itemDevice" && item.data.data.isActive && (item.data.data.type === "livingPersona" || item.data.data.type === "headcase"))){
                            actor.takeDamage(messageData);
                        } else {
                            SR5_DiceHelper.applyDamageToDecK(actor, messageData);
                        }
                    } else {
                        actor.takeDamage(messageData);
                    }
                    //Special case for Derezz Complex Form.
                    if (messageData.typeSub === "derezz"){
                        SR5_DiceHelper.applyDerezzEffect(messageData, originalActionAuthor, actor);
                    }
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "defenderDoBiofeedbackDamage":
                    originalActionAuthor.rollTest("resistanceCard", null, messageData);
                    break;
                case "attackerDoBiofeedbackDamage":
                    if (actor.type === "actorDrone") actor = SR5_EntityHelpers.getRealActorFromID(actor.data.data.vehicleOwner.id)
                    actor.rollTest("resistanceCard", null, messageData);
                    break;
                case "scatter":
                    SR5_DiceHelper.rollScatter(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "iceEffect":
                    SR5_DiceHelper.applyIceEffect(messageData, originalActionAuthor, actor);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "linkLock":
                    SR5_DiceHelper.linkLock(originalActionAuthor, actor);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "catchFire":
                    actor.fireDamageEffect(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "targetLocked":
                    SR5_DiceHelper.lockTarget(messageData, originalActionAuthor, actor);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "jackOut":
                    SR5_DiceHelper.rollJackOut(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "jackOutSuccess":
                    SR5_DiceHelper.jackOut(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "eraseMark":
                    SR5_DiceHelper.eraseMarkChoice(messageData);
                    break;
                case "eraseMarkSuccess":
                    SR5_DiceHelper.eraseMark(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "checkOverwatchScore":
                    SR5_DiceHelper.rollOverwatchDefense(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "matrixJamSignals":
                    SR5_DiceHelper.jamSignals(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "reduceService":
                case "reduceTask":
                    SR5_DiceHelper.reduceSideckickService(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "registerSprite":
                    SR5_DiceHelper.registerSprite(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "applyEffectAuto":
                    actor.applyExternalEffect(messageData, "customEffects");
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "killComplexFormResistance":
                case "dispellResistance":
                case "disjointingResistance":
                case "enchantmentResistance":
                case "summoningResistance":
                case "compileSpriteResist":
                case "preparationResist":
                    SR5_DiceHelper.createItemResistance(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "desactivateFocus":
                    SR5_DiceHelper.desactivateFocus(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "reduceSpell":
                case "reduceComplexForm":
                case "reducePreparationPotency":
                    await SR5_DiceHelper.reduceTransferedEffect(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                case "bindingResistance":
                case "banishingResistance":
                case "decompilingResistance":
                    targetActor.rollTest(type, null, messageData);
                    break;
                case "bindSpirit":
                    SR5_DiceHelper.bindSpirit(messageData);
                    SR5_RollMessage.updateChatButton(message.data, type);
                    break;
                default:
                    SR5_SystemHelpers.srLog(1, `Unknown '${type}' type in chatButtonAction (non-opposed Test)`);
            }
        }
    }

    //Update the stat of a chatMessage button
    static async updateChatButton(message, buttonToUpdate){
        if (buttonToUpdate === undefined) return;

        //Delete useless buttons
        message = game.messages.get(message._id);
        let messageData = duplicate(message.data.flags.sr5data);
        for (let key in messageData.buttons){
            if (key === buttonToUpdate) await message.update({[`flags.sr5data.buttons.-=${key}`]: null});
        }
        messageData = duplicate(message.data.flags.sr5data);

        //Special cases : add buttons or end action description
        let endLabel;
        switch (buttonToUpdate) {
            case "takeDamage":
                messageData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.damageValue}${game.i18n.localize(SR5.damageTypesShort[messageData.damageType])} ${game.i18n.localize("SR5.AppliedDamage")}`);
                break;
            case "takeMatrixDamage":
                messageData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${messageData.matrixDamageValue} ${game.i18n.localize("SR5.AppliedDamage")}`);
                break;
            case "eraseMarkSuccess":
                messageData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", game.i18n.localize("SR5.MatrixActionEraseMarkSuccess"));
                break;
            case "reduceTask":
                if ((messageData.actor.data.tasks.value - messageData.netHits) <= 0 ) endLabel = game.i18n.localize("SR5.DecompiledSprite");
                else endLabel = `${game.i18n.format('SR5.INFO_TasksReduced', {task: messageData.netHits})}`;
                messageData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", endLabel);
                break;
            case "reduceService":
                if ((messageData.actor.data.services.value - messageData.netHits) <= 0 ) endLabel = game.i18n.localize("SR5.BanishedSpirit");
                else endLabel = `${game.i18n.format('SR5.INFO_ServicesReduced', {service: messageData.netHits})}`;
                messageData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", endLabel);
                break;
            case "reduceComplexForm":
                let targetedComplexForm = await fromUuid(messageData.targetEffect);
                if (targetedComplexForm.data.data.hits <= 0) endLabel = `${game.i18n.format('SR5.INFO_ComplexFormKilled', {name: targetedComplexForm.name})}`
                else endLabel = `${game.i18n.format('SR5.INFO_ComplexFormReduced', {name: targetedComplexForm.name, hits: messageData.netHits})}`
                messageData.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", endLabel);
                break;
            default:
        }

        //Remove Edge action so it can't be used after action end
        messageData.secondeChanceUsed = true;
        messageData.pushLimitUsed = true;
        //Remove Edit success button
        messageData.editResult = false;
        //await message.update({'flags.sr5data': messageData});
        await SR5_RollMessage.updateRollCard(message.data, messageData);
    }

    static generateChatButton(testType, actionType, label){
        let button = {
            testType: testType,
            actionType: actionType,
            label: label,
        }
        return button;
    }
    //Update the stat of a chatMessage button
    /*static async updateChatButton(message, buttonToUpdate){
        message = game.messages.get(message._id);
        if (message.data?.flags?.sr5data?.typeSub === "grenade" && buttonToUpdate !== "scatter") return;
        let newMessage = duplicate(message.data.flags.sr5data);
        newMessage.button[buttonToUpdate] = !newMessage.button[buttonToUpdate];
        switch (buttonToUpdate) {
            case "removeTemplate":
                newMessage.button.placeTemplate = false;
                break;
            default:
        }
        await SR5_RollMessage.updateRollCard(message.data, newMessage);
    }*/

    //Update data on roll chatMessage
    static async updateRollCard(message, newMessage){
        let template = message.flags.sr5template;
        let messageToUpdate = game.messages.get(message._id);
        return renderTemplate(template, newMessage).then((html) => {
            let newHtml = $(html);
	        let divButtons = newHtml.find('[id="srButtonTest"]');
	        for (let button in newMessage.buttons){
		        divButtons.append(`<button class="messageAction ${newMessage.buttons[button].testType}" data-action="${newMessage.buttons[button].testType}" data-type="${newMessage.buttons[button].actionType}">${newMessage.buttons[button].label}</button>`);
	        }
	        html = newHtml[0].outerHTML;
            messageToUpdate.update({
                "flags.sr5data": newMessage,
                content: html,
            })
            /*.then((newMsg) => {
                ui.chat.updateMessage(newMsg);
                return newMsg;
            });*/
        });
    }

    //Remove a template from scene on click
    static async removeTemplate(message, itemId){
        if (!canvas.scene){
            SR5_RollMessage.updateChatButton(message.data, "removeTemplate");
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActiveScene")}`);
            return;
        }
        let template = canvas.scene.data.templates.find((t) => t.data.flags.item === itemId);
        if (template){
            canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id]);
            if (message) SR5_RollMessage.updateChatButton(message.data, "removeTemplate");
        } else {
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoTemplateInScene")}`);
            if (message) SR5_RollMessage.updateChatButton(message.data, "removeTemplate");
        }
    }

    //Build summoned spirit
    static async buildItem(messageData, itemType, actor){
        let item;
        switch (itemType){
            case"summonSpirit":
                item = {
                    name: `${game.i18n.localize("SR5.SummonedSpirit")} (${game.i18n.localize(SR5.spiritTypes[messageData.spiritType])}, ${messageData.force})`,
                    type: "itemSpirit",
                    img: `systems/sr5/img/items/itemSpirit.svg`,
                    ["data.type"]: messageData.spiritType,
                    ["data.itemRating"]: messageData.force,
                    ["data.services.max"]: messageData.hits - messageData.test.hits,
                    ["data.services.value"]: messageData.hits - messageData.test.hits,
                    ["data.summonerMagic"]: messageData.actor.data.specialAttributes.magic.augmented.value,
                    ["data.magic.tradition"]: messageData.actor.data.magic.tradition,
                };
                ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_SummonSpirit")} ${game.i18n.localize(SR5.spiritTypes[messageData.spiritType])} (${messageData.force})`); 
                break;
            case "compileSprite":
                item = {
                    name: `${game.i18n.localize("SR5.CompiledSprite")} (${game.i18n.localize(SR5.spriteTypes[messageData.spriteType])}, ${messageData.level})`,
                    type: "itemSprite",
                    img: `systems/sr5/img/items/itemSprite.svg`,
                    ["data.type"]: messageData.spriteType,
                    ["data.itemRating"]: messageData.level,
                    ["data.tasks.max"]: messageData.hits - messageData.test.hits,
                    ["data.tasks.value"]: messageData.hits - messageData.test.hits,
                    ["data.compilerResonance"]: messageData.actor.data.specialAttributes.resonance.augmented.value,
                };
                ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_CompileSprite")} ${game.i18n.localize(SR5.spriteTypes[messageData.spriteType])} (${messageData.level})`);
                break;
            case "createPreparation":
                item = {"data": messageData.item.data,};
                item = mergeObject(item, {
                    name: `${game.i18n.localize("SR5.Preparation")}${game.i18n.localize("SR5.Colons")} ${messageData.item.name}`,
                    type: "itemPreparation",
                    img: `systems/sr5/img/items/itemPreparation.svg`,
                    ["data.trigger"]: messageData.preparationTrigger,
                    ["data.potency"]: messageData.hits - messageData.test.hits,
                    ["data.force"]: messageData.force,
                    ["data.freeSustain"]: true,
                    ["data.hits"]: 0,
                    ["data.drainValue"]: messageData.item.data.drainValue,
                });
                ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_CreatePreparation")} ${messageData.item.name}`);
                break;
            default: 
                SR5_SystemHelpers.srLog(1, `Unknown '${itemType}' type in 'buildItem()'`);
        }

        await actor.createEmbeddedDocuments("Item", [item]);
    }
}