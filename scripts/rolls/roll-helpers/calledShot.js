import { SR5 } from "../../config.js";
import { SR5_SocketHandler } from "../../socket.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5_RollTest } from "../roll-test.js";
import SR5_SpendDialog from "../../interface/spendNetHits-dialog.js";
import { SR5_ActorHelper } from "../../entities/actors/entityActor-helpers.js";

export class SR5_CalledShotHelpers {

    static getThresholdEffect(location){
        switch(location){
			case "genitals":
                return 4;
			case "neck":
			case "eye":
			case "foot":
			case "sternum": 
                return 3;
			case "gut":                    
			case "knee":
            case "jaw":
			case "hand":
			case "ear":
                return 2;
			case "shoulder":
                return 1;
            default: return 0;
		}
    }

    static getInitiativeEffect(location){
        switch(location){
			case "gut": 
			case "shoulder":   
            case "jaw":
		    case "hand":
			case "foot":
                return 5;
			case "neck":                
			case "knee":
			case "eye":
			case "genitals":
			case "sternum":
			case "ear":
                return 10;
            default: return 0;
		}
    }

    static async chooseSpendNetHits(message, actor){
        let messageData = message.flags.sr5data;
        let cancel = true;
        let effects = [];
        let numberCheckedEffects = 0, 
            checkedEffects = {};
        let dialogData = {
            calledShot: messageData.combat.calledShot,
            disposableHits: messageData.roll.netHits - 1,
        };

        renderTemplate("systems/sr5/templates/interface/chooseSpendNetHits.html", dialogData).then((dlg) => {
            new SR5_SpendDialog({
                title: game.i18n.localize('SR5.SpendHitsForStatus'),
                content: dlg,
                data: dialogData,
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
                close: async (html) => {
                    if (cancel) return;
                    numberCheckedEffects = html.find("[name='checkDisposableHitsEffects']:checked").length;
                    for (let i = 0; i < numberCheckedEffects; ++i) {
                        let name = html.find("[name='checkDisposableHitsEffects']:checked")[i].value;
                        checkedEffects = {
                            name: name,
                            type: messageData.combat.calledShot.location,
                            threshold: (name === "stunned") ? SR5_CalledShotHelpers.getThresholdEffect(messageData.combat.calledShot.location) : 0,
                            initiative: (name === "stunned") ? SR5_CalledShotHelpers.getInitiativeEffect(messageData.combat.calledShot.location) : 0,
                            initialDV: messageData.damage.value,
                        };
                        effects.push(checkedEffects);
                    }
                    ui.notifications.info(`${game.i18n.format('SR5.INFO_SpendHitsOnEffects', {checkedEffects: numberCheckedEffects})}`);      
                    messageData = mergeObject(messageData, {
                        "combat.calledShot.hitsSpent": true,
                        "combat.calledShot.effects": effects,
                    });
                    //Update chatMessage
                    let newMessage = duplicate(messageData);
                    newMessage.previousMessage.hits -= numberCheckedEffects;
                    await SR5_RollTest.addInfoToCard(newMessage, actor.id);
                    SR5_RollMessage.updateRollCardHelper(messageData.owner.messageId, newMessage);
                },
            }).render(true);
        });
    }

    static async getCalledShotsEffect(effecType, info, actor, weakSideSpecific){
        let itemEffects = [],
            calledShotsType = effecType.name,
            hasEffect = actor.items.find(i => i.system.type === calledShotsType),
            duration, 
            hasWeakSide = actor.items.find(i => i.system.type === "weakSide");

        let effect = {
            name: game.i18n.localize(SR5.calledShotsEffects[calledShotsType]),
            type: "itemEffect",
            "system.type": calledShotsType,
        }
        let effect2 = effect;

        switch (calledShotsType){
            case "bleedOut": //done, can't be automatised
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_BleedOut_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "blinded": //partially done: effect apply to all sight action, but for now only perception is concerned
                if (hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.SightPenalty"),
                        "system.value": -8,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                              "category": "skills",
                              "target": "system.skills.perception.perceptionType.sight.test",
                              "type": "value",
                              "value": -8,
                            }
                          },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Blinded_GE"),
                    });
                    await actor.deleteEmbeddedDocuments("Item", [hasEffect.id]);
                    itemEffects.push(effect);
                } else {
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.SightPenalty"),
                        "system.value": -4,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Blinded_GE"),
                        "system.customEffects": {
                            "0": {
                              "category": "skills",
                              "target": "system.skills.perception.perceptionType.sight.test",
                              "type": "value",
                              "value": -4,
                            }
                          },
                    });
                    itemEffects.push(effect);
                }
                break;
            case "brokenGrip": //Partially done: can't apply an effect based on arm usage
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -1,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_BrokenGrip_GE"),
                    });
                    itemEffects.push(effect);
                }
                if (hasWeakSide || weakSideSpecific) {
                    if(hasWeakSide) await actor.deleteEmbeddedDocuments("Item", [hasWeakSide.id]);
                    effect2 = mergeObject(effect2, {
                        "name": game.i18n.localize(SR5.calledShotsEffects["weakSide"]),
                        "system.type": "weakSide",
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -1,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                                "category": "characterDefenses",
                                "target": "system.defenses.block",
                                "type": "value",
                                "value": -1,
                            },
                            "1": {
                                "category": "characterDefenses",
                                "target": "system.defenses.defend",
                                "type": "value",
                                "value": -1,
                            },
                            "2": {
                                "category": "characterDefenses",
                                "target": "system.defenses.dodge",
                                "type": "value",
                                "value": -1,
                            },
                            "3": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryBlades",
                                "type": "value",
                                "value": -1,
                            },
                            "4": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryClubs",
                                "type": "value",
                                "value": -1,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_WeakSide_GE"),
                    });
                    itemEffects.push(effect2);
                }
                break;
            case "buckled": //done
                duration = {
                    type: "round",
                    duration: info.previousMessage.hits - info.roll.hits,
                }
                await SR5_ActorHelper.createProneEffect(actor.id, 0, 0, duration, "buckled");
                break;
            case "deafened": //done        
                if (hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.HearingPenalty"),
                        "system.value": -4,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                              "category": "skills",
                              "target": "system.skills.perception.perceptionType.hearing.test",
                              "type": "value",
                              "value": -4,
                            }
                          },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Deafened_GE"),
                    });
                    await actor.deleteEmbeddedDocuments("Item", [hasEffect.id]);
                    itemEffects.push(effect);
                }
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.HearingPenalty"),
                        "system.value": -2,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                              "category": "skills",
                              "target": "system.skills.perception.perceptionType.hearing.test",
                              "type": "value",
                              "value": -2,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Deafened_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "dirtyTrick": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.value": effecType.value || -4,
                        "system.duration": 1,
                        "system.durationType": "action",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": effecType.value || -4,
                                "forceAdd": true,
                            }
                        },                    
                        "system.gameEffect": game.i18n.format("SR5.STATUSES_DirtyTrick_GE", {value: effecType.value || -4}),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "entanglement": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Agility"),
                        "system.value": -effecType.netHits,
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.customEffects": {
                            "0": {
                                "category": "characterAttributes",
                                "target": "system.attributes.agility.augmented",
                                "type": "value",
                                "value": -effecType.netHits,
                            }
                        },                    
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Entanglement_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "feint":  //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -info.roll.netHits,
                        "system.duration": 1,
                        "system.durationType": "action",
                        "system.customEffects": {
                            "0": {
                                "category": "characterDefenses",
                                "target": "system.defenses.block",
                                "type": "value",
                                "value": -info.roll.netHits,
                            },
                            "1": {
                                "category": "characterDefenses",
                                "target": "system.defenses.defend",
                                "type": "value",
                                "value": -info.roll.netHits,
                            },
                            "2": {
                                "category": "characterDefenses",
                                "target": "system.defenses.dodge",
                                "type": "value",
                                "value": -info.roll.netHits,
                            },
                            "3": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryBlades",
                                "type": "value",
                                "value": -info.roll.netHits,
                            },
                            "4": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryClubs",
                                "type": "value",
                                "value": -info.roll.netHits,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Feint_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "flared": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.value": -8,
                        "system.duration": 1,
                        "system.durationType": "action",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": -8,
                                "forceAdd": true,
                            }
                        }, 
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Flared_GE"),
                    });
                    effect2 = mergeObject(effect2, {
                        "system.target": game.i18n.localize("SR5.SightPenalty"),
                        "system.value": -99,
                        "system.duration": 10,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.skills.perception.perceptionType.sight.test",
                                "type": "value",
                                "value": -99,
                                "forceAdd": true,
                            }
                        }, 
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Flared_GE"),
                    });
                    itemEffects.push(effect, effect2);
                }
                break;
            case "knockdown": //done
                duration = {
                    type: "special",
                    duration: 0,
                }
                await SR5_ActorHelper.createProneEffect(actor.id, 0, 0, duration, "knockdown");
                break;
            case "oneArmBandit": //Partially done: can't apply an effect based on arm usage
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -6,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_OneArmBandit_GE"),
                    });
                    itemEffects.push(effect);
                }
                //Apply weak side effect in the same time
                if (hasWeakSide || weakSideSpecific) {
                    if (hasWeakSide) await actor.deleteEmbeddedDocuments("Item", [hasWeakSide.id]);
                    effect2 = mergeObject(effect2, {
                        "name": game.i18n.localize(SR5.calledShotsEffects["weakSide"]),
                        "system.type": "weakSide",
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -1,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                                "category": "characterDefenses",
                                "target": "system.defenses.block",
                                "type": "value",
                                "value": -1,
                            },
                            "1": {
                                "category": "characterDefenses",
                                "target": "system.defenses.defend",
                                "type": "value",
                                "value": -1,
                            },
                            "2": {
                                "category": "characterDefenses",
                                "target": "system.defenses.dodge",
                                "type": "value",
                                "value": -1,
                            },
                            "3": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryBlades",
                                "type": "value",
                                "value": -1,
                            },
                            "4": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryClubs",
                                "type": "value",
                                "value": -1,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_WeakSide_GE"),
                    });
                    itemEffects.push(effect2);
                }
                break;
            case "onPinsAndNeedles": //done, can't be automatised
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.MovementPenalty"),
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_OnPinsAndNeedles_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "nauseous": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.value": -4,
                        "system.duration": info.previousMessage.hits - info.roll.hits,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": -4,
                                "forceAdd": true,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Nauseous_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "pin": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Defenses"),
                        "system.value": effecType.initialDV,
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.customEffects": {
                            "0": {
                                "category": "characterDefenses",
                                "target": "system.defenses.block",
                                "type": "value",
                                "value": -2,
                            },
                            "1": {
                                "category": "characterDefenses",
                                "target": "system.defenses.defend",
                                "type": "value",
                                "value": -2,
                            },
                            "2": {
                                "category": "characterDefenses",
                                "target": "system.defenses.dodge",
                                "type": "value",
                                "value": -2,
                            },
                            "3": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryBlades",
                                "type": "value",
                                "value": -2,
                            },
                            "4": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryClubs",
                                "type": "value",
                                "value": -2,
                            }
                        },                       
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Pin_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "shaked": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.value": -1,
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": -1,
                                "forceAdd": true,
                            }
                        }, 
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Shaked_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;  
            case "slowDeath": //done, can't be automatised
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_SlowDeath_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "slowed": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.MovementPenalty"),
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.customEffects": {
                            "0": {
                              "category": "movements",
                              "target": "system.movements.run.movement",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                            "1": {
                              "category": "movements",
                              "target": "system.movements.run.extraMovement",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                            "2": {
                              "category": "movements",
                              "target": "system.movements.run.maximum",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                            "3": {
                              "category": "movements",
                              "target": "system.movements.walk.movement",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                            "4": {
                              "category": "movements",
                              "target": "system.movements.walk.extraMovement",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                            "5": {
                              "category": "movements",
                              "target": "system.movements.walk.maximum",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                          },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Slowed_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "trickShot": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.SkillIntimidation"),
                        "system.value": info.previousMessage.attackerNetHits,
                        "system.duration": "1",
                        "system.durationType": "action",
                        "system.customEffects": {
                            "0": {
                                "category": "skills",
                                "target": "system.skills.intimidation.test",
                                "type": "value",
                                "value": info.previousMessage.attackerNetHits,

                            }
                        },                    
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_TrickShot_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "unableToSpeak": //done, can't be automatised
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Language"),
                        "system.value": "",
                        "system.duration": info.damage.value,
                        "system.durationType": "hour",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_UnableToSpeak_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "weakSide": //done
                let hasBrokenGrip = actor.items.find(i => i.system.type === "brokenGrip");
                let hasOneArm = actor.items.find(i => i.system.type === "oneArmBandit");
                if (hasEffect) await actor.deleteEmbeddedDocuments("Item", [hasEffect.id]);
                if (hasBrokenGrip || hasOneArm) {
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -1,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                                "category": "characterDefenses",
                                "target": "system.defenses.block",
                                "type": "value",
                                "value": -1,
                            },
                            "1": {
                                "category": "characterDefenses",
                                "target": "system.defenses.defend",
                                "type": "value",
                                "value": -1,
                            },
                            "2": {
                                "category": "characterDefenses",
                                "target": "system.defenses.dodge",
                                "type": "value",
                                "value": -1,
                            },
                            "3": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryBlades",
                                "type": "value",
                                "value": -1,
                            },
                            "4": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryClubs",
                                "type": "value",
                                "value": -1,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_WeakSide_GE"),
                    });
                    itemEffects.push(effect);
                } else if(!weakSideSpecific) {
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_WeakSide_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "winded": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.ComplexAction"),
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Winded_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "antenna":
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_Antenna"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",                  
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Antenna_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "engineBlock": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_EngineBlock"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",                
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_EngineBlock_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "windowMotor":
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_WindowMotor"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_WindowMotor_GE"),
                    });
                itemEffects.push(effect);
                }
                break;
            case "doorLock":
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_DoorLock"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",              
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_DoorLock_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "axle":
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_Axle"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",
                        "system.customEffects":  {
                            "0": {
                                "category": "vehicleAttributes",
                                "target": "system.attributes.speed.augmented",
                                "type": "valueReplace",
                                "value": 1,
                                "multiplier": null,
                                "wifi": false,
                                "transfer": false
                            },
                            "1": {
                                "category": "vehicleAttributes",
                                "target": "system.attributes.speedOffRoad.augmented",
                                "type": "valueReplace",
                                "value": 1,
                                "multiplier": null,
                                "wifi": false,
                                "transfer": false
                            }
                        },                   
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Axle_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "fuelTankBattery":
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_FuelTankBattery"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_FuelTankBattery_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            default:
        }
        return itemEffects;
    }

    static convertCalledShotToMod(calledShot, ammoType){
        switch(calledShot) {
            case "shakeUp":
            case "trickShot":
            case "breakWeapon":
            case "disarm":
            case "feint":
            case "knockdown":
            case "reversal":
            case "splittingDamage":
            case "pin":
            case "entanglement":
            case "dirtyTrick":
            case "windowMotor":
            case "engineBlock":
            case "extremeIntimidation":
            case "onPinsAndNeedles": 
            case "tag":
            case "bullsEye":
            case "blastOutOfHand":
            case "shakeRattle":
            case "shreddedFlesh":
            case "upTheAnte":
            case "harderKnock":
            case "vitals":
                return -4;
            case "gut": 
            case "forearm":
            case "shin": 
            case "shoulder":                   
            case "thigh": 
            case "hip": 
            case "doorLock":
            case "axle":
            case "fuelTankBattery":
            case "flashBlind":
            case "hitEmWhereItCounts":
            case "warningShot":
            case "ricochetShot":
                return -6;
            case "ankle":
            case "knee":
            case "hand":
            case "foot":
            case "neck":
            case "jaw":
            case "antenna":
            case "bellringer":
            case "downTheGullet":
                return -8;
            case "ear":
            case "eye":
            case "genitals":
            case "sternum":
                return -10;
            case "flameOn": 
                switch(ammoType) {
                    case "flare":
                    case "gyrojet": 
                        return -10;
                    case "tracer": 
                        return -6;
                }
            default:
                return 0;
        }
    }

    static convertCalledShotToLimitDV(calledShot, ammoType){
        switch(calledShot) {
            case "gut": 
                return 8;               
            case "forearm":
            case "shin": 
            case "jaw":
            case "antenna":
            case "downTheGullet":
            case "flashBlind":
                return 2;
            case "shoulder":                   
            case "thigh": 
            case "hip": 
                return 3;
            case "ankle":
            case "knee":
            case "hand":
            case "foot":
            case "ear":
            case "eye":
            case "flameOn":
            case "hitEmWhereItCounts":
            case "throughAndInto":
                return 1;
            case "sternum":
            case "neck":
            case "shreddedFlesh":
                return 10;
            case "genitals":
            case "bellringer":
                return 4;
            case "axle":
                return 6;
            case "blastOutOfHand":
                switch(ammoType) {
                    case "explosive": 
                    case "gel": 
                    case "hollowPoint": 
                    case "flechette":
                        return 2;
                    case "exExplosive": 
                        return 3;                      
                    default:                     
                        return 0;
                }
            case "dirtyTrick": 
                if (ammoType === "gel" || ammoType === "gyrojet") return 2;
                else return 0;
            default:
                return 0;
        }
    }


    static convertCalledShotToEffect(calledShot, ammoType){
        let effect;
        switch(calledShot) {
            case "dirtyTrick":
                switch(ammoType) { 
                    case "exExplosive":  
                        return effect = {"0": {"name": calledShot, "value": -6}};
                    case "explosive":
                    case "frangible": 
                    case "hollowPoint": 
                        return effect = {"0": {"name": calledShot, "value": -5}};
                    case "gel":
                    case "gyrojet":
                        return effect = {"0": {"name": calledShot, "value": -4}};
                    default:                     
                        return effect = {"0": {"name": calledShot, "value": -4,}};
                }
            case "antenna":
            case "axle":
            case "doorLock": 
            case "engineBlock":
            case "fuelTankBattery":
            case "windowMotor":
            case "onPinsAndNeedles":
            case "trickShot":
            case "feint":
                return effect = {"0": {"name": calledShot,}};
            case "blastOutOfHand":
                switch(ammoType) {
                    case "explosive": 
                    case "gel": 
                    case "hollowPoint": 
                        return effect = {"0": {"name": calledShot, "modFingerPopper": 0,}};
                    case "exExplosive": 
                        return effect = {"0": {"name": calledShot, "modFingerPopper": 1,}};
                    default:                     
                        return effect = {"0": {"name": calledShot, "modFingerPopper": -1,}};
                }
            case "flashBlind":
                return effect = {"0": {"name": "flared",}};               
            case "shreddedFlesh":
                return effect = {"0": {"name": "bleedOut",}};
            default:
                return effect = {};
        }
    }

    static convertCalledShotToInitiativeMod(ammoType){
        switch(ammoType) {
            case "explosive": 
                return -6; 
            case "exExplosive": 
                return -8;
            default:                     
                return -5;
        }
    }
}