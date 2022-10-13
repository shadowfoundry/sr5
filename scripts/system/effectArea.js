
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_SystemHelpers } from "./utilitySystem.js";
import { _getSRStatusEffect } from "../system/effectsList.js"
import { SR5 } from "../config.js";

export class SR5_EffectArea {

    //Manage token aura
    static async tokenAura(token){
        const scene = game.scenes.get(token._object.scene.id);
        for (let t of scene.tokens){
            if (t.id !== token.id) {
                let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint({x: token.x, y: token.y}, {x: t.x, y: t.y});
                await SR5_EffectArea.checkAuraJamming(token, t, distance)
            }
        }
    }

    //Check jamming aura change
    static async checkAuraJamming(active, passive, distance){
        let actor = SR5_EntityHelpers.getRealActorFromID(active.id);
        let passiveActor = SR5_EntityHelpers.getRealActorFromID(passive.id);

        let actorJammedEffect = actor.items.find(i => i.system.type === "signalJammed");
        let actorJamEffect = actor.items.find(i => i.system.type === "signalJam");
        let passiveJammedEffect = passiveActor.items.find(i => i.system.type === "signalJammed");
        let passiveJamEffect = passiveActor.items.find(i => i.system.type === "signalJam");
        //passive token is jamming
        if (passiveJamEffect){
            //check distance
            if (distance > 100) {
                if (actorJammedEffect?.system?.ownerID === passiveActor.id){
                    if (game.user?.isGM) {
                        let jammedActiveEffect = actor.effects.find(i => i.origin === "signalJammed");
                        if (jammedActiveEffect){
                            await actor.deleteEmbeddedDocuments("ActiveEffect", [jammedActiveEffect.id]);
                            await actor.deleteEmbeddedDocuments("Item", [actorJammedEffect.id]);
                        }
                    }
                }
            } else {
                if (actorJammedEffect?.system?.ownerID !== passiveActor.id){ 
                    if (game.user?.isGM) await SR5_EffectArea.createJammedEffect(passiveActor, actor, passiveJamEffect.system.value);
                }
            }
        }
        //active token is jamming
        if (actorJamEffect){
            //check distance
            if (distance <= 100) {
                if (passiveJammedEffect?.system?.ownerID !== actor.id){
                    if (game.user?.isGM) await SR5_EffectArea.createJammedEffect(actor, passiveActor, actorJamEffect.system.value);
                }
            } else {
                if (passiveJammedEffect?.system?.ownerID === actor.id){
                    if (game.user?.isGM) {
                        let jammedActiveEffect = passiveActor.effects.find(i => i.origin === "signalJammed");
                        await passiveActor.deleteEmbeddedDocuments("ActiveEffect", [jammedActiveEffect.id]);
                        await passiveActor.deleteEmbeddedDocuments("Item", [passiveJammedEffect.id]);
                    }
                }
            }
        }
    }

    //Start jamming
    static async onJamCreation(actorID){
        if (!canvas.scene) return;
        let activeActor = SR5_EntityHelpers.getRealActorFromID(actorID);
        let activeToken;
        if (activeActor.isToken){
            activeToken = canvas.tokens.placeables.find(t => t.id === actorID);
        } else {
            activeToken = canvas.tokens.placeables.find(t => t.actor.id === actorID);
        }
        let jamEffect =  activeActor.items.find(i => i.system.type === "signalJam" && i.system.ownerID === activeActor.id);

        for (let token of canvas.tokens.placeables){
            if (token.id !== activeToken.id){
                let tokenActor = SR5_EntityHelpers.getRealActorFromID(token.document.id);
                let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint({x: activeToken.x, y: activeToken.y}, {x: token.x, y: token.y});
                let jammedEffect = tokenActor.items.find(i => i.system.type === "signalJammed" && i.system.ownerID === actorID);
                if (distance < 100 && !jammedEffect){
                    if (game.user?.isGM) await SR5_EffectArea.createJammedEffect(activeActor, tokenActor, jamEffect.system.value);
                }
            }
        }
    }

    //End jamming
    static async onJamEnd(actorID){
        if (!canvas.scene) return;
        let activeToken = canvas.tokens.placeables.find(t => t.actor.id === actorID);
        for (let token of canvas.tokens.placeables){
            if (token.id !== activeToken.id){
                let tokenActor = SR5_EntityHelpers.getRealActorFromID(token.document.id);
                let jammedEffect = tokenActor.items.find(i => i.system.type === "signalJammed" && i.system.ownerID === actorID);
                if (jammedEffect) {
                    let jammedActiveEffect = tokenActor.effects.find(i => i.origin === "signalJammed");
                    if (game.user?.isGM){
                        await tokenActor.deleteEmbeddedDocuments("ActiveEffect", [jammedActiveEffect.id]);
                        await tokenActor.deleteEmbeddedDocuments("Item", [jammedEffect.id]);
                    }
                }
            }
        }
    }

    //Create jammed effect on target based on jammer
    static async createJammedEffect(jammer, jammed, value){
        let effect = {
            name: game.i18n.localize("SR5.EffectSignalJammed"),
            type: "itemEffect",
            "system.type": "signalJammed",
            "system.ownerID": jammer.id,
            "system.ownerName": jammer.name,
            "system.durationType": "permanent",
            "system.target": game.i18n.localize("SR5.MatrixNoise"),
            "system.value": value,
            "system.customEffects": {
                "0": {
                    "category": "matrixAttributes",
                    "target": "system.matrix.noise",
                    "type": "value",
                    "value": value,
                    "forceAdd": true,
                }
            },
        };
        
        let statusEffect = await _getSRStatusEffect("signalJammed", value);
        await jammed.createEmbeddedDocuments("Item", [effect]);
        await jammed.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
    }    

    //Add effect on a token moving inside a template
    static async createTemplateEffect(token, template){
        let actor = await SR5_EntityHelpers.getRealActorFromID(token.id),
            templateData = template.flags.sr5,
            effect, customEffect, hasItem, sourceItem;

        if (!actor) return;
        let sourceName = game.i18n.localize("SR5.AreaEffect");
        if (templateData.itemUuid) sourceItem = await fromUuid(templateData.itemUuid);
        if (sourceItem) sourceName = sourceItem.name;
        
        //environmental effects
        if (templateData.environmentalModifiers){
            for (let [key, value] of Object.entries(templateData.environmentalModifiers)){
                value = parseInt(value);
                if (value === 0) continue;
                let effectTarget = 'SR5.EnvironmentalMod'+(key[0].toUpperCase() + key.slice(1));
                effect = await SR5_EntityHelpers.generateItemEffect(sourceName, "areaEffect", template, game.i18n.localize(effectTarget), value, 0, "permanent");
                customEffect = await SR5_EntityHelpers.generateCustomEffect("environmentalModifiers", `system.itemsProperties.environmentalMod.${key}`, "value", value, true);
                effect.system.customEffects.push(customEffect);
                hasItem = actor.items.find(i => i.type === "itemEffect" && i.system.ownerID === effect.system?.ownerID && i.system.customEffects?.find(e => e.target === `system.itemsProperties.environmentalMod.${key}`));
                if (!hasItem) await actor.createEmbeddedDocuments("Item", [effect]);
            }
        }
        //matrix noise effect
        if (templateData.matrixNoise && templateData.matrixNoise !== 0){
            effect = await SR5_EntityHelpers.generateItemEffect(sourceName, "areaEffect", template, `${game.i18n.localize("SR5.MatrixNoise")}`, -parseInt(templateData.matrixNoise), 0, "permanent");
            customEffect = await SR5_EntityHelpers.generateCustomEffect("matrixAttributes", "system.matrix.noise", "value", -parseInt(templateData.matrixNoise), true);
            effect.system.customEffects.push(customEffect);
            if (effect && effect.system.customEffects.length) {
                hasItem = actor.items.find(i => i.type === "itemEffect" && i.system.ownerID === effect.system.ownerID && i.system.customEffects?.find(e => e.target ==="system.matrix.noise"));
                if (!hasItem) await actor.createEmbeddedDocuments("Item", [effect]);
            }
        }
        //Background count
        if (templateData.backgroundCountValue && templateData.backgroundCountValue !== 0){
            sourceName = game.i18n.localize("SR5.SceneBackgroundCount");
            let effectValue = actor.system.magic?.tradition === templateData.backgroundCountAlignement ? templateData.backgroundCountValue : -templateData.backgroundCountValue;
            effect = await SR5_EntityHelpers.generateItemEffect(sourceName, "areaEffect", template, `${game.i18n.localize("SR5.Magic")}`, effectValue, 0, "permanent");
            effect.system.customEffects.push(await SR5_EntityHelpers.generateCustomEffect("astralValues", "system.magic.bgCount", "value", effectValue, true));
            if (effect && effect.system.customEffects.length) {
                hasItem = actor.items.find(i => i.type === "itemEffect" && i.system.ownerID === effect.system.ownerID && i.system.customEffects?.find(e => e.target ==="system.magic.bgCount"));
                if (!hasItem) await actor.createEmbeddedDocuments("Item", [effect]);
            }
        }
        //Other effects
        if (templateData.itemHasEffect){
            hasItem = actor.items.find(i => i.type === "itemEffect" && i.system.ownerItem === templateData.itemUuid);
            //Check if effect is not already on
            if (!hasItem){
                //Build necessary data to apply effect
                let data = {
                    itemUuid: templateData.itemUuid,
                    actorId : template.id,
                    ownerName: sourceItem.actor.name,
                    test: {hits: sourceItem.system.hits},
                }
                //If effect is not resisted, apply effect to actor
                if (!sourceItem.system.resisted) await actor.applyExternalEffect(data, "customEffects");
                else {
                    let message = game.messages.find(m => m.flags.sr5data?.type === "spell" && m.flags.sr5data?.itemUuid === templateData.itemUuid)
                    let messageData = message.flags.sr5data;
				    if (messageData) actor.rollTest("resistSpell", null, messageData);
                }
            }
        }
	}

    //Delete an effect applied by a template on actor
    static async deleteTemplateEffect(actor, effectID){
        for (let item of actor.items){
            if (item.type === "itemEffect" && item.system.ownerItem === effectID) await actor.deleteEmbeddedDocuments("Item", [item.id]);
        }
    }

    //Check if given actor already have given effect
    static async checkIfHasEffect(actor, effectID){
        return await actor.items.find(i => i.type === "itemEffect" && i.system.ownerItem === effectID);
    }

    //Test if a template contains a given token
    static async checkIfTemplateContainsToken(template, token){
        let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint({x: template.x, y: template.y}, {x: token.x, y: token.y});
        if (distance <= template.distance) return true;
        else return false;
    }

    //Iterate through canvas template to check if current token is inside
    static async checkIfTokenIsInTemplate(tokenDocument){
        for (let templateDocument of tokenDocument.parent.templates){
            if (templateDocument.flags.sr5.environmentalModifiers || templateDocument.flags.sr5.itemHasEffect){
                let isInTemplate = await this.checkIfTemplateContainsToken(templateDocument, tokenDocument);
                let actor = await SR5_EntityHelpers.getRealActorFromID(tokenDocument.id);
                let effectID = templateDocument.uuid;
                if (templateDocument.flags.sr5.itemHasEffect) effectID = templateDocument.flags.sr5.itemUuid;
                let hasEffect = await this.checkIfHasEffect(actor, effectID);
                if (isInTemplate) {
                    if (!hasEffect) await this.createTemplateEffect(tokenDocument, templateDocument);
                } else {
                    if (hasEffect) await this.deleteTemplateEffect(actor, effectID);
                }
            }
        }
    }

    //Add effect on a token when a template is created
    static async initiateTemplateEffect(template){
        let templateDocument = template.document;
        if (!templateDocument.flags.sr5?.environmentalModifiers && !templateDocument.flags.sr5?.itemHasEffect) return;
        for (let t of templateDocument.parent.tokens){
            let isInTemplate = await this.checkIfTemplateContainsToken(templateDocument, t);
            if (isInTemplate) await this.createTemplateEffect(t, templateDocument);
        }
    }

    //Remove effect on tokens when template is deleted
    static async removeTemplateEffect(templateDocument){
        if (!templateDocument.flags.sr5?.environmentalModifiers && !templateDocument.flags.sr5?.itemHasEffect) return;
        for (let t of templateDocument.parent.tokens){
            let actor = await SR5_EntityHelpers.getRealActorFromID(t.id);
            let effectID = templateDocument.uuid;
            if (templateDocument.flags.sr5.itemHasEffect) effectID = templateDocument.flags.sr5.itemUuid;
            if (!actor) return;
            this.deleteTemplateEffect(actor, effectID)
        }
    }

    static async checkUpdatedTemplateEffect(templateDocument){
        if (!templateDocument.flags.sr5?.environmentalModifiers && !templateDocument.flags.sr5?.itemHasEffect) return;
        for (let t of templateDocument.parent.tokens){
            SR5_EffectArea.checkIfTokenIsInTemplate(t);
        }
    }
}