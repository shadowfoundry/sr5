import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utility.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_Dice } from "./dice.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5Combat } from "../system/srcombat.js";
import SR5_RollDialog from "./roll-dialog.js";

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
                html.find(".chat-button-owner").remove();
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
            SR5_Dice.srDicesAddInfoToCard(newMessage, actor.data);
            if (newMessage.item) SR5_DiceHelper.srDicesUpdateItem(newMessage, actor);
            //Update message with new data
            SR5_RollMessage.updateRollCard(message, newMessage); 
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

        messageData.originalMessage = message
    
        //Opposed test : need to select a Token to operate
        if (action === "opposedTest") {
            actor = SR5_EntityHelpers.getRealActorFromID(speaker.token);
            if (actor == null) {
                ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActor")}`);
                return;
            }
    
            switch(type) {
                case "msgTest_defenseMeleeWeapon":
                case "msgTest_defenseRangedWeaponn":
                    actor.rollTest("defenseCard", null, messageData);
                    break;
                case "msgTest_matrixDefense":
                    if (messageData.typeSub === "dataSpike") {
                        SR5_DiceHelper.chooseMatrixDefender(messageData, actor);
                    } else {
                        actor.rollTest("matrixDefense", messageData.typeSub, messageData);
                    }
                    break;
                case "msgTest_attackResistance":
                    actor.rollTest("resistanceCard", null, messageData);
                    break;
                case "msgTest_powerDefense":
                    actor.rollTest("powerDefense", null, messageData);
                    break;
                case "msgTest_complexFormDefense":
                    actor.rollTest("complexFormDefense", null, messageData);
                    break;
                case "msgTest_iceDefense":
                    actor.rollTest("iceDefense", null, messageData);
                    break;
                case "msgTest_sensorDefense":
                    actor.rollTest("activeSensorDefense", null, messageData);
                    break;
                default:
                    SR5_SystemHelpers.srLog(1, `Unknown '${type}' type in chatListeners`);
            }
        }
    
        //Non-Opposed test : Actor or token is automatically selected
        if (action === "nonOpposedTest" && messageData) {
            if (!game.user.isGM && game.user.id !== senderId) {
                ui.notifications.warn(`Vous ne disposez pas de la permission !`) //TODO : translate
                return;
            }
            actor = SR5_EntityHelpers.getRealActorFromID(message.data.flags.speakerId);
    
            // If there is a matrix action Author, get the Actor to do stuff with him later
            let originalActionAuthor;
            if (messageData.originalActionAuthor){
                originalActionAuthor = SR5_EntityHelpers.getRealActorFromID(messageData.originalActionAuthor)
            }
    
            switch (type) {
                case "msgTest_attackResistance":
                    actor.rollTest("resistanceCard", null, messageData);
                    break;
                case "msgTest_drainResistance":
                    actor.rollTest("drainCard", null, messageData);
                    break;
                case "msgTest_fadingResistance":
                    actor.rollTest("fadingCard", null, messageData);
                    break;
                case "msgTest_damage":
                    actor.takeDamage(messageData);
                    SR5_RollMessage.updateChatButton(message, "takeDamage");
                    break;
                case "msgTest_matrixResistance":
                    actor.rollTest("matrixResistance", messageData.matrixResistanceType, messageData);
                    break;
                case "msgTest_templatePlace":
                    let item = actor.items.get(messageData.item._id);
                    item.placeGabarit();
                    SR5_RollMessage.updateChatButton(message, "removeTemplate");
                    break;
                case "msgTest_templateRemove":
                    SR5_RollMessage.removeTemplate(message, messageData.item._id);
                    break;
                case "msgTest_summonSpiritResist":
                    SR5_DiceHelper.createItemResistance(message);
                    SR5_RollMessage.updateChatButton(message, "summonSpiritResist");
                    break;
                case "msgTest_compileSpriteResist":
                    SR5_DiceHelper.createItemResistance(message);
                    SR5_RollMessage.updateChatButton(message, "compileSpriteResist");
                    break;
                case "msgTest_preparationResist":
                    SR5_DiceHelper.createItemResistance(message);
                    SR5_RollMessage.updateChatButton(message, "preparationResist");
                    break;
                case "msgTest_createSpirit":
                    let spirit = await SR5_RollMessage.buildSpirit(messageData);
                    actor.createEmbeddedDocuments("Item", [spirit]);
                    ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_SummonSpirit")} ${game.i18n.localize(SR5.spiritTypes[messageData.spiritType])} (${messageData.force})`); 
                    SR5_RollMessage.updateChatButton(message, "summonSpirit");
                    break;
                case "msgTest_createSprite":
                    let sprite = await SR5_RollMessage.buildSprite(messageData);
                    actor.createEmbeddedDocuments("Item", [sprite]);
                    ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_CompileSprite")} ${game.i18n.localize(SR5.spriteTypes[messageData.spriteType])} (${messageData.level})`);
                    SR5_RollMessage.updateChatButton(message, "compileSprite");
                    break;
                case "msgTest_createPreparation":
                    let preparation = await SR5_RollMessage.buildPreparation(messageData);
                    actor.createEmbeddedDocuments("Item", [preparation]);
                    ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_CreatePreparation")} ${messageData.item.name}`);
                    SR5_RollMessage.updateChatButton(message, "createPreparation");
                    break;
                case "secondeChance":
                    SR5_Dice.secondeChance(message, actor);
                    break;
                case "pushLimit":
                    SR5_Dice.pushTheLimit(message, actor);
                    break;
                case "msgTest_extended":
                    SR5_Dice.extendedRoll(message, actor);
                    break;
                case "msgTest_attackerAddMark":
                    SR5_DiceHelper.markActor(actor, messageData.originalActionAuthor, messageData.mark);
                    // Si le défenseur est un objet asservi, placer la marque sur le serveur
                    if (actor.data.data.matrix.deviceType === "slavedDevice") {
                        for (let server of game.actors) {
                            if (server.id === actor.id && server.data.data.matrix.deviceType === "host") {
                                SR5_DiceHelper.markActor(server, messageData.originalActionAuthor, messageData.mark);
                            }
                        }
                    }
                    if (actor.data.type === "actorDrone" && actor.data.data.vehicleOwner.id){
                        let controler = SR5_EntityHelpers.getRealActorFromID(actor.data.data.vehicleOwner.id);
                        SR5_DiceHelper.markActor(controler, messageData.originalActionAuthor, messageData.mark);
                    }
                    SR5_RollMessage.updateChatButton(message, "attackerPlaceMark");
                    break;
                case "msgTest_defenderAddMark":
                    let attackerID;
                    if (actor.isToken) attackerID = actor.token.id;
                    else attackerID = actor.id;
                    SR5_DiceHelper.markActor(originalActionAuthor, attackerID, 1);
                    SR5_RollMessage.updateChatButton(message, "defenderPlaceMark");
                    break;
                case "msgTest_increaseOverwatch":
                    originalActionAuthor.overwatchIncrease(messageData.test.hits);
                    SR5_RollMessage.updateChatButton(message, "overwatch");
                    break;
                case "msgTest_defenderDoDeckDamage":
                    if (originalActionAuthor.data.type === "actorPc" || originalActionAuthor.data.type === "actorGrunt"){
                        if (originalActionAuthor.items.find((item) => item.type === "itemDevice" && item.data.data.isActive && (item.data.data.type === "livingPersona" || item.data.data.type === "headcase"))){
                            originalActionAuthor.takeDamage(messageData);
                        } else {
                            SR5_DiceHelper.applyDamageToDecK(originalActionAuthor, messageData.matrixDamageValue, actor);
                        }
                    } else {
                        originalActionAuthor.takeDamage(messageData);
                    }
                    SR5_RollMessage.updateChatButton(message, "defenderDoMatrixDamage");
                    break;
                case "msgTest_takeMatrixDamage":
                    if (actor.data.type === "actorPc" || actor.data.type === "actorGrunt"){
                        if (actor.items.find((item) => item.type === "itemDevice" && item.data.data.isActive && (item.data.data.type === "livingPersona" || item.data.data.type === "headcase"))){
                            actor.takeDamage(messageData);
                        } else {
                            SR5_DiceHelper.applyDamageToDecK(actor, messageData.matrixDamageValue);
                        }
                    } else {
                        actor.takeDamage(messageData);
                    }
                    SR5_RollMessage.updateChatButton(message, "takeMatrixDamage");
                    break;
                case "msgTest_defenderDoBiofeedbackDamage":
                    originalActionAuthor.rollTest("resistanceCard", null, messageData);
                    SR5_RollMessage.updateChatButton(message, "defenderDoBiofeedbackDamage");
                    break;
                case "msgTest_attackerDoBiofeedbackDamage":
                    if (actor.type === "actorDrone") actor = SR5_EntityHelpers.getRealActorFromID(actor.data.data.vehicleOwner.id)
                    actor.rollTest("resistanceCard", null, messageData);
                    SR5_RollMessage.updateChatButton(message, "attackerDoBiofeedbackDamage");
                    break;
                case "msgTest_scatter":
                    SR5_DiceHelper.rollScatter(messageData);
                    SR5_RollMessage.updateChatButton(message, "scatter");
                    break;
                case "msgTest_iceEffect":
                    SR5_DiceHelper.applyIceEffect(messageData, originalActionAuthor, actor);
                    SR5_RollMessage.updateChatButton(message, "iceEffect");
                    break;
                case "msgTest_catchFire":
                    actor.fireDamageEffect(messageData);
                    SR5_RollMessage.updateChatButton(message, "catchFire");
                    break;
                case "msgTest_targetLocked":
                    SR5_DiceHelper.lockTarget(messageData, originalActionAuthor, actor);
                    SR5_RollMessage.updateChatButton(message, "targetLocked");
                    break;
                default:
            }
        }
    }

    //Update the stat of a chatMessage button
    static updateChatButton(message, buttonToUpdate){
        if (message.data.flags.sr5data.typeSub === "grenade" && buttonToUpdate !== "scatter") return;
        let newMessage = duplicate(message.data.flags.sr5data);
        newMessage.button[buttonToUpdate] = !newMessage.button[buttonToUpdate];
        switch (buttonToUpdate) {
            case "takeDamage":
                newMessage.button.takenDamage = true;
                break;
            case "removeTemplate":
                newMessage.button.placeTemplate = false;
                break;
            default:
        }
        SR5_RollMessage.updateRollCard(message, newMessage);     
    }

    //Update data on roll chatMessage
    static updateRollCard(message, newMessage){
        let template = message.data.flags.sr5template;
        return renderTemplate(template, newMessage).then((html) => {
            message.update({
                "flags.sr5data": newMessage,
                content: html,
            })
            .then((newMsg) => {
                ui.chat.updateMessage(newMsg);
                return newMsg;
            });
        });
    }

    //Remove a template from scene on click
    static async removeTemplate(message, itemId){
        if (!canvas.scene){
            SR5_RollMessage.updateChatButton(message, "removeTemplate");
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActiveScene")}`);
            return;
        }
        let template = canvas.scene.data.templates.find((t) => t.data.flags.item === itemId);
        if (template){
            canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id]);
            if (message) SR5_RollMessage.updateChatButton(message, "removeTemplate");
        } else {
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoTemplateInScene")}`);
            if (message) SR5_RollMessage.updateChatButton(message, "removeTemplate");
        }
    }

    //Build summoned spirit
    static async buildSpirit(messageData){
        let spirit = {
            name: `${game.i18n.localize("SR5.SummonedSpirit")} (${game.i18n.localize(SR5.spiritTypes[messageData.spiritType])}, ${messageData.force})`,
            type: "itemSpirit",
            img: `systems/sr5/img/items/itemSpirit.svg`,
            ["data.type"]: messageData.spiritType,
            ["data.itemRating"]: messageData.force,
            ["data.services.max"]: messageData.hits - messageData.test.hits,
            ["data.services.value"]: messageData.hits - messageData.test.hits,
            ["data.summonerMagic"]: messageData.actor.data.specialAttributes.magic.augmented.value,
        };
        return spirit;
    }

    //Build compiled sprite
    static async buildSprite(messageData){
        let sprite = {
            name: `${game.i18n.localize("SR5.CompiledSprite")} (${game.i18n.localize(SR5.spriteTypes[messageData.spriteType])}, ${messageData.level})`,
            type: "itemSprite",
            img: `systems/sr5/img/items/itemSprite.svg`,
            ["data.type"]: messageData.spriteType,
            ["data.itemRating"]: messageData.level,
            ["data.tasks.max"]: messageData.hits - messageData.test.hits,
            ["data.tasks.value"]: messageData.hits - messageData.test.hits,
            ["data.compilerResonance"]: messageData.actor.data.specialAttributes.resonance.augmented.value,
        };
        return sprite;
    }

    //Build compiled sprite
    static async buildPreparation(messageData){
        let preparation = {
            "data": messageData.item.data,
        };
        preparation = mergeObject(preparation, {
            name: `${game.i18n.localize("SR5.Preparation")}${game.i18n.localize("SR5.Colons")} ${messageData.item.name}`,
            type: "itemPreparation",
            img: `systems/sr5/img/items/itemPreparation.svg`,
            ["data.trigger"]: messageData.preparationTrigger,
            ["data.potency"]: messageData.hits - messageData.test.hits,
            ["data.force"]: messageData.force,
            ["data.freeSustain"]: true,
            ["data.hits"]: 0,
        });
        return preparation;
    }
}