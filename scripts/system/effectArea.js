
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_SystemHelpers } from "./utilitySystem.js";
import { _getSRStatusEffect } from "../system/effectsList.js"
import { SR5_SocketHandler } from "../socket.js";

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

}