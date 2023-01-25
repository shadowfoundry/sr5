import { SR5 } from "../../config.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_ConverterHelpers } from "./converter.js";
import { _getSRStatusEffect } from "../../system/effectsList.js";

export class SR5_CombatHelpers {

    //Handle environmental modifiers
    static handleEnvironmentalModifiers(scene, actor, noWind, areaEffect = {visibility:0, light:0, glare:0, wind:0}){
        let actorData = actor.itemsProperties.environmentalMod;
        let visibilityMod = Math.min(Math.max(parseInt(scene.getFlag("sr5", "environModVisibility")) + areaEffect.visibility + actorData.visibility.value, 0), 4);
        let lightMod = Math.min(Math.max(parseInt(scene.getFlag("sr5", "environModLight")) + areaEffect.light + actorData.light.value, 0), 4);
        if (actor.visions.lowLight.isActive && (parseInt(scene.getFlag("sr5", "environModLight")) + areaEffect.light > 2)) lightMod = 0;
        let glareMod = Math.min(Math.max(parseInt(scene.getFlag("sr5", "environModGlare")) + areaEffect.glare + actorData.glare.value, 0), 4);
        let windMod = Math.min(Math.max(parseInt(scene.getFlag("sr5", "environModWind")) + areaEffect.wind + actorData.wind.value, 0), 4);

        let arrayMod = [visibilityMod, lightMod, glareMod, windMod];
        if (noWind) arrayMod = [visibilityMod, lightMod, glareMod];
        let finalMod = Math.max(...arrayMod);

        if (finalMod > 0 && finalMod < 4) {
            let nbrOfMaxValue = 0;
            for (let i = 0; i < arrayMod.length; i++) {
                if (arrayMod[i] === finalMod) nbrOfMaxValue++;
            }
            if (nbrOfMaxValue > 1) finalMod++;
        }

        if (finalMod > 4) finalMod = 4;
        let dicePoolMod = SR5_ConverterHelpers.environmentalLineToMod(finalMod);
        return dicePoolMod;
    }

    //Apply Full defense effect to an actor
    static async applyFullDefenseEffect(actor){
        let effect = await _getSRStatusEffect("fullDefense");
        actor.createEmbeddedDocuments("ActiveEffect", [effect]);
    }

    //Handle grenade scatter
    static async rollScatter(cardData){
        let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);
        let item = actor.items.find(i => i.id === cardData.owner.itemId);
        let itemData = item.system;

        if (!canvas.scene) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActiveScene")}`);

        let distanceMod = cardData.roll.hits;
        let gridUnit = canvas.scene.grid.size;
    
        let template = canvas.scene.templates.find((t) => t.flags.sr5.item === cardData.owner.itemId);
        if (template === undefined) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoTemplateInScene")}`);
    
        let distanceDice = 1;
        if (itemData.aerodynamic) distanceDice = 2;

        if (itemData.ammunition.type){
            switch(itemData.ammunition.type){
                case "fragmentationRocket":
                case "highlyExplosiveRocket":
                case "antivehicleRocket":
                    distanceDice = 5;
                    break;
                case "fragmentationMissile":
                case "highlyExplosiveMissile":
                case "antivehicleMissile":
                    distanceDice = 4;
                    break;
            }
        }
        
        let directionRoll = new Roll(`1d8`);
        await directionRoll.evaluate({async: true});
    
        let distanceFormula = `${distanceDice}d6 - ${distanceMod}`;
        let distanceRoll= new Roll(distanceFormula);
        await distanceRoll.evaluate({async: true});

        if (distanceRoll.total < 1) return ui.notifications.info(`${game.i18n.localize("SR5.INFO_NoScattering")}`);
        else ui.notifications.info(`${game.i18n.format("SR5.INFO_ScatterDistance", {distance: distanceRoll.total})}`);
        
        let coordinate = {x:0, y:0};
        switch(directionRoll.total){
            case 1:
                coordinate = {
                    x: 0, 
                    y: distanceRoll.total*gridUnit,
                };
                break;
            case 2:
                coordinate = {
                    x: -(distanceRoll.total*gridUnit)/2, 
                    y: (distanceRoll.total*gridUnit)/2, 
                };
                break;
            case 3:
                coordinate = {
                    x: -distanceRoll.total*gridUnit, 
                    y: 0,
                };
                break;
            case 4:
                coordinate = {
                    x: -(distanceRoll.total*gridUnit)/2, 
                    y: -(distanceRoll.total*gridUnit)/2, 
                };
                break;
            case 5:
                coordinate = {
                    x: 0, 
                    y: -distanceRoll.total*gridUnit,
                };
                break;
            case 6:
                coordinate = {
                    x: (distanceRoll.total*gridUnit)/2, 
                    y: -(distanceRoll.total*gridUnit)/2, 
                };
                break;
            case 7:
                coordinate = {
                    x: distanceRoll.total*gridUnit, 
                    y: 0,
                };
                break;
            case 8:
                coordinate = {
                    x: (distanceRoll.total*gridUnit)/2, 
                    y: (distanceRoll.total*gridUnit)/2, 
                };
                break;
        }
    
        let newPosition = duplicate(template);
        newPosition.x += coordinate.x;
        newPosition.y += coordinate.y;
    
        template.update(newPosition);
    }

    static async chooseDamageType(){
        let cancel = true;
        let dialogData = {list: SR5.PCConditionMonitors}
        return new Promise((resolve, reject) => {
            renderTemplate("systems/sr5/templates/interface/chooseDamageType.html", dialogData).then((dlg) => {
                new Dialog({
                title: game.i18n.localize('SR5.ChooseDamageType'),
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
                    let damageType = html.find("[name=damageType]").val();
                    resolve(damageType);
                },
                }).render(true);
            });
        });
    }

    static async chooseToxinVector(vectors){
        let cancel = true;
        let dialogData = {list: vectors}
        return new Promise((resolve, reject) => {
            renderTemplate("systems/sr5/templates/interface/chooseVector.html", dialogData).then((dlg) => {
                new Dialog({
                title: game.i18n.localize('SR5.ChooseToxinVector'),
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
                    let vector = html.find("[name=vector]").val();
                    resolve(vector);
                },
                }).render(true);
            });
        });
    }

    static async getToxinEffect(effecType, info, actor){
        let itemEffects = [];
        let toxinType = info.damage.toxin.type;
        let hasEffect;

        let effect = {
            name: game.i18n.localize(SR5.toxinTypes[toxinType]),
            type: "itemEffect",
        }

        switch (effecType){
            case "disorientation":
                hasEffect = actor.items.find(i => i.system.type === "toxinEffectDisorientation");
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.type": "toxinEffectDisorientation",
                        "system.value": -2,
                        "system.duration": 10,
                        "system.durationType": "minute",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": -2,
                                "forceAdd": true,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.ToxinEffectDisorientation_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "nausea":
                hasEffect = actor.items.find(i => i.system.type === "toxinEffectNausea");
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.PenaltyDouble"),
                        "system.type": "toxinEffectNausea",
                        "system.value": "x2",
                        "system.duration": 10,
                        "system.durationType": "minute",
                        "system.customEffects": {
                            "0": {
                                "category": "specialProperties",
                                "target": "system.specialProperties.doublePenalties",
                                "type": "boolean",
                                "value": "true",
                                "forceAdd": true,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.ToxinEffectNausea_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "paralysis":
                hasEffect = actor.items.find(i => i.system.type === "toxinEffectParalysis");
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.type": "toxinEffectParalysis",
                        "system.value": -2,
                        "system.duration": 1,
                        "system.durationType": "hour",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": -2,
                                "forceAdd": true,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.ToxinEffectParalysis_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "agony":
                hasEffect = actor.items.find(i => i.system.type === "toxinEffectAgony");
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.type": "toxinEffectAgony",
                        "system.value": 1,
                        "system.duration": 10,
                        "system.durationType": "minute",
                        "system.gameEffect": game.i18n.localize("SR5.ToxinEffectAgony_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            default:
        }
    
        return itemEffects;
    }

    //create sensor lock effect
    static async lockTarget(cardData, drone, target){
        let value = cardData.roll.hits - cardData.previousMessage.hits;
        let effect = {
            name: game.i18n.localize("SR5.EffectSensorLock"),
            type: "itemEffect",
            "system.type": "sensorLock",
            "system.ownerID": drone.id,
            "system.ownerName": drone.name,
            "system.durationType": "permanent",
            "system.target": game.i18n.localize("SR5.Defense"),
            "system.value": value,
        };
        target.createEmbeddedDocuments("Item", [effect]);
        let statusEffect = await _getSRStatusEffect("sensorLock");
        await target.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
    }
}