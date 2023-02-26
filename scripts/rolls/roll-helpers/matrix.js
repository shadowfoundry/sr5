import { SR5 } from "../../config.js";
import { SR5_SocketHandler } from "../../socket.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5_RollTest } from "../roll-test.js";
import { SR5_ConverterHelpers } from "./converter.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_MarkHelpers } from "./mark.js";
import { SR5_PrepareRollTest } from "../roll-prepare.js";
import { _getSRStatusEffect } from "../../system/effectsList.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";

export class SR5_MatrixHelpers {
    //Get time spent on a matrix search
    static async getMatrixSearchDuration(cardData, netHits){
        let timeSpent, duration = "";
        cardData.matrix.searchUnit = SR5_ConverterHelpers.matrixSearchTypeToUnitTime(cardData.threshold.type);
		cardData.matrix.searchTime = SR5_ConverterHelpers.matrixSearchTypeToTime(cardData.threshold.type);

        if (cardData.matrix.searchUnit === "minute") timeSpent = (cardData.matrix.searchTime * 60)/netHits;
        if (cardData.matrix.searchUnit === "hour") timeSpent = (cardData.matrix.searchTime * 60 * 60)/netHits;
        
        let time = new Date(null);
        time.setSeconds(timeSpent);
        let seconds = time.getSeconds();
        let minutes = time.getMinutes();
        let hours = time.getHours()-1;
        
        if (hours) duration = `${hours}${game.i18n.localize("SR5.HoursUnit")} `;
        if (minutes) duration += `${minutes}${game.i18n.localize("SR5.MinuteUnit")} `;
        if (seconds) duration += `${seconds}${game.i18n.localize("SR5.SecondUnit")} `;
        
        return duration;
    }

    /** Apply Matrix Damage to a Deck
    * @param {Object} targetActor - The Target Actor who owns the deck/item
    * @param {Object} cardData - Message data
    * @param {Object} attacker - Actor who do the damage
    */
    static async applyDamageToDecK(targetActor, cardData, defender, defenderWin) {
        let damageValue = cardData.damage.matrix.value;
        let targetItem;
        if (cardData.target.itemUuid && !defenderWin) targetItem = await fromUuid(cardData.target.itemUuid);
        if (!targetItem) targetItem = targetActor.items.find((item) => item.type === "itemDevice" && item.system.isActive);
        let newItem = duplicate(targetItem);

        //targetActor.takeDamage(cardData);
        if (targetItem.system.type === "livingPersona" || targetItem.system.type === "headcase" ){
            return targetActor.takeDamage(cardData);
        }
        
        if (targetActor.system.matrix.programs.virtualMachine.isActive) damageValue += 1;

        newItem.system.conditionMonitors.matrix.actual.base += damageValue;
        SR5_EntityHelpers.updateValue(newItem.system.conditionMonitors.matrix.actual, 0, newItem.system.conditionMonitors.matrix.value);
        if (newItem.system.conditionMonitors.matrix.actual.value >= newItem.system.conditionMonitors.matrix.value){
            if (targetItem.type === "itemDevice" && targetActor.system.matrix.userMode !== "ar"){
                let dumpshockData = {
                    damage:{resistanceType: "dumpshock"}
                };
                targetActor.rollTest("resistanceCard", null, dumpshockData);
                ui.notifications.info(`${targetActor.name} ${game.i18n.localize("SR5.INFO_IsDisconnected")}.`);
            }
            newItem.system.isActive = false;
            newItem.system.wirelessTurnedOn = false;
        }
        if (game.user?.isGM) targetItem.update({system: newItem.system});
        else SR5_SocketHandler.emitForGM("updateItem", {
            item: targetItem.uuid,
            info: newItem.system,
        });

        if (defender) ui.notifications.info(`${defender.name} ${game.i18n.format("SR5.INFO_ActorDoMatrixDamage", {damageValue: damageValue})} ${targetActor.name}.`); 
        else ui.notifications.info(`${targetActor.name} (${targetItem.name})${game.i18n.localize("SR5.Colons")} ${damageValue} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
    }



    // Update Matrix Damage to a Deck
    static async updateMatrixDamage(cardData, netHits, defender){
        let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.previousMessage.actorId),
            attackerData = attacker?.system,
            damage = cardData.damage.matrix.base,
            item = await fromUuid(cardData.target.itemUuid),
            mark = await SR5_MarkHelpers.findMarkValue(item.system, attacker.id);

        if (attacker.type === "actorDevice"){
            if (attacker.system.matrix.deviceType = "ice"){
                mark = await SR5_MarkHelpers.findMarkValue(item.system, attacker.id);
            }
        }
        cardData.damage.matrix.modifiers = {};
        cardData.damage.matrix.modifiers.netHits = netHits;
        cardData.damage.matrix.modifiers.markQty = mark;
        
        //Mugger program
        if (mark > 0 && attackerData.matrix.programs.mugger.isActive) {
            mark = mark * 2;
            cardData.damage.matrix.modifiers.muggerIsActive = true;
        }

        //Guard program
        if (defender.system.matrix.programs.guard.isActive) {
            damage = cardData.damage.matrix.base + netHits + mark;
            cardData.damage.matrix.modifiers.guardIsActive = true;
            cardData.damage.matrix.modifiers.markDamage = mark;
        } else {
            damage = cardData.damage.matrix.base + netHits + (mark * 2);
            cardData.damage.matrix.modifiers.markDamage = mark*2;
        }

        //Hammer program
        if (attackerData.matrix.programs.hammer.isActive) {
            damage += 2;
            cardData.damage.matrix.modifiers.hammerDamage = 2;
        }

        cardData.damage.matrix.value = damage;
        return cardData;
    }

    static async chooseMatrixDefender(cardData, actor){
        let cancel = true;
        let list = {};
        for (let key of Object.keys(actor.system.matrix.connectedObject)){
            if (Object.keys(actor.system.matrix.connectedObject[key]).length) {
                list[key] = SR5_EntityHelpers.sortObjectValue(actor.system.matrix.connectedObject[key]);
            }
        }
        let dialogData = {
            device: actor.system.matrix.deviceName,
            list: list,
        };
        renderTemplate("systems/sr5/templates/interface/itemMatrixTarget.html", dialogData).then((dlg) => {
            new Dialog({
              title: game.i18n.localize('SR5.ChooseMatrixTarget'),
              content: dlg,
              buttons: {
                ok: {
                  label: "Ok",
                  callback: () => (cancel = false),
                },
                cancel: {
                  label: "Cancel",
                  callback: () => (cancel = true),
                },
              },
              default: "ok",
              close: (html) => {
                if (cancel) return;
                let targetItem = html.find("[name=target]").val();
                if (targetItem !== "device") cardData.target.itemUuid = targetItem;
                actor.rollTest("matrixDefense", cardData.test.typeSub, cardData);
              },
            }).render(true);
        });
    }

    static async rollOverwatchDefense(cardData){
        let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);
        let rollData = SR5_PrepareRollTest.getBaseRollData(null, actor);

        rollData.test.type = "overwatchResistance";
        rollData.test.title = `${game.i18n.localize("SR5.OverwatchResistance")} (${cardData.roll.hits})`;
        rollData.dicePool.value = 6;
        rollData.dicePool.base = 6;
        rollData.previousMessage.actorId = cardData.owner.actorId;
        rollData.previousMessage.hits = cardData.roll.hits;

        rollData.roll = await SR5_RollTest.rollDice({ dicePool: 6 });

        await SR5_RollTest.addInfoToCard(rollData, cardData.owner.actorId);
        SR5_RollTest.renderRollCard(rollData);
    }

    static async rollJackOut(cardData){
        let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);
        let dicePool;

        let itemEffectID;
        for (let i of actor.items){
            if (i.type === "itemEffect"){
                if (Object.keys(i.system.customEffects).length){
                    for (let e of Object.values(i.system.customEffects)){
                        if (e.target === "system.matrix.isLinkLocked"){
                            dicePool = i.system.value;
                            itemEffectID = i.id;
                        }
                    }
                }
            }
        }

        let rollData = SR5_PrepareRollTest.getBaseRollData(null, actor);
        rollData.test.type = "jackOutDefense";
        rollData.test.title = `${game.i18n.localize("SR5.MatrixActionJackOutResistance")} (${cardData.roll.hits})`;
        rollData.dicePool.base = dicePool;
        rollData.dicePool.value = dicePool;
        rollData.previousMessage.hits = cardData.roll.hits;
        rollData.previousMessage.itemUuid = itemEffectID;
        rollData.roll = await SR5_RollTest.rollDice({ dicePool: dicePool });

        await SR5_RollTest.addInfoToCard(rollData, cardData.previousMessage.actorId);
        SR5_RollTest.renderRollCard(rollData);
    }

    static async jackOut(cardData){
        let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);
        await actor.deleteEmbeddedDocuments("Item", [cardData.previousMessage.itemUuid]);
        await SR5_EntityHelpers.deleteEffectOnActor(actor, "linkLock");

        if (actor.system.matrix.userMode === "hotsim"){
            let dumpshockData = SR5_PrepareRollTest.getBaseRollData(null, actor);
            dumpshockData.damage.resistanceType = "dumpshock";
            actor.rollTest("resistanceCard", null, dumpshockData);
        }
    }

    static async jamSignals(cardData){
        let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);
        let effect = {
            name: game.i18n.localize("SR5.EffectSignalJam"),
            type: "itemEffect",
            "system.type": "signalJam",
            "system.ownerID": actor.id,
            "system.ownerName": actor.name,
            "system.duration": 0,
            "system.durationType": "permanent",
            "system.target": game.i18n.localize("SR5.MatrixNoise"),
            "system.value": -cardData.roll.hits,
            "system.customEffects": {
                "0": {
                    "category": "matrixAttributes",
                    "target": "system.matrix.noise",
                    "type": "value",
                    "value": -cardData.roll.hits,
                    "forceAdd": true,
                }
            },
        };
        await actor.createEmbeddedDocuments("Item", [effect]);
        let statusEffect = await _getSRStatusEffect("signalJam", -cardData.roll.hits);
        await actor.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
    }

    static async applyDerezzEffect(cardData, sourceActor, target){
        let itemEffect = {
            name: game.i18n.localize("SR5.EffectReduceFirewall"),
            type: "itemEffect",
            "system.target": game.i18n.localize("SR5.Firewall"),
            "system.value": -cardData.damage.matrix.value,
            "system.type": "derezz",
            "system.ownerID": sourceActor.id,
            "system.ownerName": sourceActor.name,
            "system.duration": 0,
            "system.durationType": "reboot",
            "system.customEffects": {
              "0": {
                  "category": "matrixAttributes",
                  "target": "system.matrix.attributes.firewall",
                  "type": "value",
                  "value": -cardData.damage.matrix.value,
                  "forceAdd": true,
                }
            },
        };
        if (!target.items.find(i => i.system.type === "derezz")) await target.createEmbeddedDocuments("Item", [itemEffect]);
    }

    //create link lock effet
    static async applylinkLockEffect(attacker, target){
        let effect = {
            type: "itemEffect",
            "system.type": "linkLock",
            "system.ownerID": attacker.id,
            "system.ownerName": attacker.name,
            "system.durationType": "permanent",
            name: game.i18n.localize("SR5.EffectLinkLockedConnection"),
            "system.target": game.i18n.localize("SR5.EffectLinkLockedConnection"),
            "system.value": attacker.system.matrix.actions.jackOut.defense.dicePool,
            "system.customEffects": {
                "0": {
                    "category": "special",
                    "target": "system.matrix.isLinkLocked",
                    "type": "boolean",
                    "value": "true",
                }
            },
        };
        target.createEmbeddedDocuments("Item", [effect]);
        let statusEffect = await _getSRStatusEffect("linkLock");
        await target.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
        ui.notifications.info(`${target.name}${game.i18n.format('SR5.Colons')} ${game.i18n.localize('SR5.INFO_IsLinkLocked')} ${attacker.name}`);
    }

    //create denial of service Effect
    static async applyDenialOfServiceEffect(cardData, sourceActor, target){
        
        let netHits = cardData.previousMessage.hits - cardData.roll.hits;
        let deviceTarget = await fromUuid(cardData.target.itemUuid);
        let effect = {
            name: `${game.i18n.localize('SR5.MatrixActionDenialOfService')} (${deviceTarget.name})`,
            type: "itemEffect",
            "system.type": "matrixAction",
            "system.ownerID": sourceActor.id,
            "system.ownerName": sourceActor.name,
            "system.duration": 1,
            "system.durationType": "round",
            "system.target": deviceTarget.name,
            "system.value": (netHits * 2),
            "system.customEffects": {
                "0": {
                    "category": "penaltyTypes",
                    "target": "system.penalties.special.actual",
                    "type": "value",
                    "value": -(netHits * 2),
                    "forceAdd": true,
                }
            },
            "system.gameEffect": game.i18n.localize("SR5.MatrixActionDenialOfService_GE"),
        };
        await target.createEmbeddedDocuments("Item", [effect]);
        ui.notifications.info(`${target.name}${game.i18n.format('SR5.Colons')} ${game.i18n.localize('SR5.MatrixActionDenialOfService')} (${deviceTarget.name})`);
    }

    //create I Am the Firewall Effect
    static async applyIAmTheFirewallEffect(cardData, speaker, sourceActor){

        let actor = SR5_EntityHelpers.getRealActorFromID(speaker.token);
        let hits = cardData.roll.hits;

        let effect = {
            name: `${game.i18n.format('SR5.MatrixActionIAmTheFirewall')} (${sourceActor.name})`,            
            type: "itemEffect",
            "system.target": game.i18n.localize("SR5.Firewall"),
            "system.type": "matrixAction",
            "system.value": hits,
            "system.ownerID": sourceActor.id,
            "system.ownerName": sourceActor.name,
            "system.duration": 1,
            "system.durationType": "round",
            "system.customEffects": {
                "0": {
                    "category": "matrixAttributes",
                    "target": "system.matrix.attributes.firewall",
                    "type": "value",
                    "value": hits,
                    "forceAdd": true,
                }
            },
            "system.gameEffect": game.i18n.localize("SR5.MatrixActionIAmTheFirewall_GE"),
        };
        await actor.createEmbeddedDocuments("Item", [effect]);
        ui.notifications.info(`${actor.name}${game.i18n.format('SR5.Colons')} ${game.i18n.format('SR5.EffectIncreaseFirewallDone', {hits: hits})}`);

    }

    //create Intervene Effect
    static async applyInterveneEffect(cardData, speaker, sourceActor){

        let actor = SR5_EntityHelpers.getRealActorFromID(speaker.token);
        let hits = cardData.roll.hits;

        let effect = {
            name: `${game.i18n.format('SR5.MatrixActionIntervene')} (${sourceActor.name})`,            
            type: "itemEffect",
            "system.target": game.i18n.localize("SR5.Defense"),
            "system.type": "matrixAction",
            "system.value": hits,
            "system.ownerID": sourceActor.id,
            "system.ownerName": sourceActor.name,
            "system.duration": 1,
            "system.durationType": "action",
            "system.customEffects": {
                "0": {
                    "category": "matrixAttributes",
                    "target": "system.matrix.attributes.firewall",
                    "type": "value",
                    "value": hits,
                    "forceAdd": true,
                },
                "1": {
                    "category": "matrixAttributes",
                    "target": "system.matrix.attributes.dataProcessing",
                    "type": "value",
                    "value": hits,
                    "forceAdd": true,
                },
                "2": {
                    "category": "matrixAttributes",
                    "target": "system.matrix.attributes.sleaze",
                    "type": "value",
                    "value": hits,
                    "forceAdd": true,
                },
                "3": {
                    "category": "matrixAttributes",
                    "target": "system.matrix.attributes.attack",
                    "type": "value",
                    "value": hits,
                    "forceAdd": true,
                }
            },
            "system.gameEffect": game.i18n.localize("SR5.MatrixActionIntervene_GE"),
        };
        await actor.createEmbeddedDocuments("Item", [effect]);
        ui.notifications.info(`${actor.name}${game.i18n.format('SR5.Colons')} ${game.i18n.format('SR5.MatrixActionInterveneEffect', {hits: hits})}`);

    }

    //create popup Effect
    static async applyPopupEffect(cardData, sourceActor, target){
        let netHits = cardData.previousMessage.hits - cardData.roll.hits;
        let deviceTarget = await fromUuid(cardData.target.itemUuid);
        let action = cardData.test.typeSub;
        let effect = {
            name: `${game.i18n.localize(SR5.matrixKillCodeActions[action])} (${deviceTarget.name})`,
            type: "itemEffect",
            "system.type": "matrixAction",
            "system.ownerID": sourceActor.id,
            "system.ownerName": sourceActor.name,
            "system.duration": 1,
            "system.durationType": "round",
            "system.target": deviceTarget.name,
            "system.value": netHits,
            "system.customEffects": {
                "0": {
                    "category": "penaltyTypes",
                    "target": "system.penalties.special.actual",
                    "type": "value",
                    "value": -netHits,
                    "forceAdd": true,
                }
            },
            "system.gameEffect": game.i18n.localize(SR5.matrixKillCodeActions[action] + "_GE"),
        };
        await target.createEmbeddedDocuments("Item", [effect]);
        ui.notifications.info(`${target.name}${game.i18n.format('SR5.Colons')} ${game.i18n.localize(SR5.matrixKillCodeActions[action])}`);
    }
    

    /** Handle ICE specific attack effect
    * @param {Object} cardData - The chat message data
    * @param {Object} ice - The ICE actor
    * @param {Object} target - Actor who is the target of the ICE attack
    */
    static async applyIceEffect(cardData, ice, target){
        let effect = {
            type: "itemEffect",
            "system.type": "iceAttack",
            "system.ownerID": ice.id,
            "system.ownerName": ice.name,
            "system.durationType": "reboot",
        };

        switch(cardData.test.typeSub){
            case "iceAcid":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceFirewall"),
                    "system.target": game.i18n.localize("SR5.Firewall"),
                    "system.value": -1,
                    "system.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "system.matrix.attributes.firewall",
                            "type": "value",
                            "value": -1,
                            "forceAdd": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
                break;
            case "iceBinder":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceDataProcessing"),
                    "system.target": game.i18n.localize("SR5.DataProcessing"),
                    "system.value": -1,
                    "system.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "system.matrix.attributes.dataProcessing",
                            "type": "value",
                            "value": -1,
                            "forceAdd": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
                break;
            case "iceCatapult":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceFirewall"),
                    "system.target": game.i18n.localize("SR5.Firewall"),
                    "system.value": -1,
                    "system.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "system.matrix.attributes.firewall",
                            "type": "value",
                            "value": -1,
                            "forceAdd": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
                break;
            case "iceCrash":
                let programs = [];
                for (let i of target.items){
                    if (i.type === "itemProgram" && (i.system.type === "hacking" || i.system.type === "common") && i.system.isActive){
                        programs.push(i);
                    }
                }
                let randomProgram = programs[Math.floor(Math.random()*programs.length)]
                randomProgram.update({"system.isActive": false});
                ui.notifications.info(`${randomProgram.name} ${game.i18n.localize("SR5.INFO_CrashProgram")}`);
                break;
            case "iceJammer":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceAttack"),
                    "system.target": game.i18n.localize("SR5.MatrixAttack"),
                    "system.value": -1,
                    "system.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "system.matrix.attributes.attack",
                            "type": "value",
                            "value": -1,
                            "forceAdd": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
                break;
            case "iceMarker":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceSleaze"),
                    "system.target": game.i18n.localize("SR5.Sleaze"),
                    "system.value": -1,
                    "system.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "system.matrix.attributes.sleaze",
                            "type": "value",
                            "value": -1,
                            "forceAdd": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
                break;
            case "iceScramble":
                if (target.system.matrix.userMode !== "ar"){
                    cardData.damage.resistanceType = "dumpshock";
                    target.rollTest("resistanceCard", null, cardData);
                }
                let deck = target.items.find((item) => item.type === "itemDevice" && item.system.isActive);
                target.rebootDeck(deck);
                break;
            case "iceBlaster":
            case "iceBlack":
            case "iceTarBaby":
            case "iceBlueGoo":
                await SR5_MatrixHelpers.applylinkLockEffect(ice, target);
                break;
            case "iceShocker":
            case "iceSparky":
            case "iceKiller":
            case "iceTrack":
            case "icePatrol":
            case "iceProbe":
            case "iceBloodhound":
                break;
            case "iceFlicker":
                
                let item = await fromUuid(cardData.target.itemUuid),
                existingMark = await SR5_MarkHelpers.findMarkValue(item.system, ice.id);
                if (!target.system.matrix.isLinkLocked) 
                await SR5_MatrixHelpers.applylinkLockEffect(ice, target);
                if (existingMark >= 2) {                    
                if (target.system.matrix.userMode !== "ar"){
                    cardData.damage.resistanceType = "dumpshock";
                    target.rollTest("resistanceCard", null, cardData);
                }
                let deck_iceFlicker = target.items.find((item) => item.type === "itemDevice" && item.system.isActive);
                target.rebootDeck(deck_iceFlicker);
                }
                break;
            default:
                SR5_SystemHelpers.srLog(1, `Unknown '${cardData.test.typeSub}' type in applyIceEffect`);
        }
    }

}