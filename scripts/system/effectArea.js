
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
    static async templateEffect(tokenDocument){
        let token = tokenDocument._object,
            scene = tokenDocument.parent,
            actor = await SR5_EntityHelpers.getRealActorFromID(tokenDocument.id),
            environmentalEffect, noiseEffect, magicEffect, customEffect, hasItem, sourceItem;

        for (let t of scene.templates){
            let templateObject = t._object;
            if (templateObject.shape.contains(token.center.x - templateObject.x, token.center.y - templateObject.y)) {
                let sourceName = game.i18n.localize("SR5.AreaEffect");
                if (t.flags.sr5.itemUuid) sourceItem = await fromUuid(t.flags.sr5.itemUuid);
                if (sourceItem) sourceName = sourceItem.name;
                else sourceName = game.i18n.localize("SR5.AreaEffect");
                //environmental effects
                if (t.flags.sr5.environmentalModifiers?.light && (parseInt(t.flags.sr5.environmentalModifiers?.light) !== 0) && !actor.system.visions.astral?.isActive) {
                    environmentalEffect = await SR5_EntityHelpers.generateItemEffect(sourceName, "areaEffect", t, game.i18n.localize("SR5.EnvironmentalModLight"), parseInt(t.flags.sr5.environmentalModifiers?.light), 0, "permanent");
                    customEffect = await SR5_EntityHelpers.generateCustomEffect("environmentalModifiers", `system.itemsProperties.environmentalMod.light`, "value", parseInt(t.flags.sr5.environmentalModifiers?.light), true);
                    environmentalEffect.system.customEffects.push(customEffect);
                    hasItem = actor.items.find(i => i.type === "itemEffect" && i.system.ownerID === environmentalEffect.system.ownerID && i.system.customEffects?.find(e => e.target === "system.itemsProperties.environmentalMod.light"));
                    if (!hasItem) await actor.createEmbeddedDocuments("Item", [environmentalEffect]);
                }
                if (t.flags.sr5.environmentalModifiers?.glare && (parseInt(t.flags.sr5.environmentalModifiers?.glare) !== 0) && !actor.system.visions.astral?.isActive) {
                    environmentalEffect = await SR5_EntityHelpers.generateItemEffect(sourceName, "areaEffect", t, game.i18n.localize("SR5.EnvironmentalModGlare"), parseInt(t.flags.sr5.environmentalModifiers?.glare), 0, "permanent");
                    customEffect = await SR5_EntityHelpers.generateCustomEffect("environmentalModifiers", `system.itemsProperties.environmentalMod.glare`, "value", parseInt(t.flags.sr5.environmentalModifiers?.glare), true);
                    environmentalEffect.system.customEffects.push(customEffect);
                    hasItem = actor.items.find(i => i.type === "itemEffect" && i.system.ownerID === environmentalEffect.system.ownerID && i.system.customEffects?.find(e => e.target === "system.itemsProperties.environmentalMod.glare"));
                    if (!hasItem) await actor.createEmbeddedDocuments("Item", [environmentalEffect]);
                }
                if (t.flags.sr5.environmentalModifiers?.visibility && (parseInt(t.flags.sr5.environmentalModifiers?.visibility) !== 0) && !actor.system.visions.astral?.isActive) {
                    environmentalEffect = await SR5_EntityHelpers.generateItemEffect(sourceName, "areaEffect", t, game.i18n.localize("SR5.EnvironmentalModVisibility"), parseInt(t.flags.sr5.environmentalModifiers?.visibility), 0, "permanent");
                    customEffect = await SR5_EntityHelpers.generateCustomEffect("environmentalModifiers", `system.itemsProperties.environmentalMod.visibility`, "value", parseInt(t.flags.sr5.environmentalModifiers?.visibility), true);
                    environmentalEffect.system.customEffects.push(customEffect);
                    hasItem = actor.items.find(i => i.type === "itemEffect" && i.system.ownerID === environmentalEffect.system.ownerID && i.system.customEffects?.find(e => e.target === "system.itemsProperties.environmentalMod.visibility"));
                    if (!hasItem) await actor.createEmbeddedDocuments("Item", [environmentalEffect]);
                }
                if (t.flags.sr5.environmentalModifiers?.wind && (parseInt(t.flags.sr5.environmentalModifiers?.wind) !== 0)) {
                    environmentalEffect = await SR5_EntityHelpers.generateItemEffect(sourceName, "areaEffect", t, game.i18n.localize("SR5.EnvironmentalModWind"), parseInt(t.flags.sr5.environmentalModifiers?.wind), 0, "permanent");
                    customEffect = await SR5_EntityHelpers.generateCustomEffect("environmentalModifiers", `system.itemsProperties.environmentalMod.wind`, "value", parseInt(t.flags.sr5.environmentalModifiers?.wind), true);
                    environmentalEffect.system.customEffects.push(customEffect);
                    hasItem = actor.items.find(i => i.type === "itemEffect" && i.system.ownerID === environmentalEffect.system.ownerID && i.system.customEffects?.find(e => e.target === "system.itemsProperties.environmentalMod.wind"));
                    if (!hasItem) await actor.createEmbeddedDocuments("Item", [environmentalEffect]);
                }
                //matrix noise effect
                if (t.flags.sr5.matrixNoise && t.flags.sr5.matrixNoise !== 0){
                    noiseEffect = await SR5_EntityHelpers.generateItemEffect(sourceName, "areaEffect", t, `${game.i18n.localize("SR5.MatrixNoise")}`, -parseInt(t.flags.sr5.matrixNoise), 0, "permanent");
                    customEffect = await SR5_EntityHelpers.generateCustomEffect("matrixAttributes", "system.matrix.noise", "value", -parseInt(t.flags.sr5.matrixNoise), true);
                    noiseEffect.system.customEffects.push(customEffect);
                    if (noiseEffect && noiseEffect.system.customEffects.length) {
                        hasItem = actor.items.find(i => i.type === "itemEffect" && i.system.ownerID === noiseEffect.system.ownerID && i.system.customEffects?.find(e => e.target ==="system.matrix.noise"));
                        if (!hasItem) await actor.createEmbeddedDocuments("Item", [noiseEffect]);
                    }
                }
                //Background count
                if (t.flags.sr5.backgroundCountValue && t.flags.sr5.backgroundCountValue !== 0){
                    sourceName = game.i18n.localize("SR5.SceneBackgroundCount");
                    let effectValue = actor.system.magic?.tradition === t.flags.sr5.backgroundCountAlignement ? t.flags.sr5.backgroundCountValue : -t.flags.sr5.backgroundCountValue;
                    magicEffect = await SR5_EntityHelpers.generateItemEffect(sourceName, "areaEffect", t, `${game.i18n.localize("SR5.Magic")}`, effectValue, 0, "permanent");
                    magicEffect.system.customEffects.push(await SR5_EntityHelpers.generateCustomEffect("astralValues", "system.magic.bgCount", "value", effectValue, true));
                    if (magicEffect && magicEffect.system.customEffects.length) {
                        hasItem = actor.items.find(i => i.type === "itemEffect" && i.system.ownerID === magicEffect.system.ownerID && i.system.customEffects?.find(e => e.target ==="system.magic.bgCount"));
                        if (!hasItem) await actor.createEmbeddedDocuments("Item", [magicEffect]);
                    }
                }
            } else {
                for (let item of actor.items){
                    if (item.type === "itemEffect" && item.system.ownerID === t.id) await actor.deleteEmbeddedDocuments("Item", [item.id]);
                }
            }
        }

	}

    //Add effect on a token when a template is created
    static async initiateTemplateEffect(template){
        if (template.actorSheet) return;
        if (!template.document.flags.sr5?.environmentalModifiers) return;
        
        for (let t of template.document.parent.tokens){
            if (!t._object) continue;
            if (template.shape.contains(t._object.center.x - template.x, t._object.center.y - template.y)) {
                await this.templateEffect(t);
            }
        }
    }

    //Remove effect on tokens when template is deleted
    static async removeTemplateEffect(template){
        if (!template.document.flags.sr5?.environmentalModifiers) return;
        for (let t of template.document.parent.tokens){
            let actor = await SR5_EntityHelpers.getRealActorFromID(t.id);
            if (!actor) return;
            let hasItem = await actor.items.find(i => i.type === "itemEffect" && i.system.ownerID === template.id);
            if (hasItem) await actor.deleteEmbeddedDocuments("Item", [hasItem.id]);
        }
    }
}