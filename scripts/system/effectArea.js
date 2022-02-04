
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_SystemHelpers } from "../system/utility.js";
import { _getSRStatusEffect } from "../system/effectsList.js"
import { SR5_SocketHandler } from "../socket.js";

export class SR5_EffectArea {

    //Manage token aura
    static async tokenAura(token){
        const scene = game.scenes.get(token._object.scene.id);
        for (let t of scene.data.tokens){
            if (t.id !== token.id) {
                let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(token._object._validPosition, t._object._validPosition);
                SR5_EffectArea.checkAuraJamming(token, t, distance)
            }
        }
    }

    //Check jamming aura change
    static async checkAuraJamming(active, passive, distance){
        let actor = active.getActor();
        let passivActor = passive.getActor();
        let actorJammedEffect = actor.items.find(i => i.data.data.type === "signalJammed");
        let actorJamEffect =  actor.items.find(i => i.data.data.type === "signalJam");
        let passiveJammedEffect = passivActor.items.find(i => i.data.data.type === "signalJammed");
        let passiveJamEffect = passivActor.items.find(i => i.data.data.type === "signalJam");
        //passive token is jamming
        if (passiveJamEffect){
            //check distance
            if (distance > 100) {
                if (actorJammedEffect?.data?.data?.ownerID === passivActor.id){
                    if (game.user?.isGM) {
                        let jammedActiveEffect = actor.data.effects.find(i => i.data.origin === "signalJammed");
                        await actor.deleteEmbeddedDocuments("ActiveEffect", [jammedActiveEffect.id]);
                        await actor.deleteEmbeddedDocuments("Item", [actorJammedEffect.id]);
                    }
                }
            } else {
                if (actorJammedEffect?.data?.data?.ownerID !== passivActor.id){ 
                    if (game.user?.isGM) await SR5_EffectArea.createJammedEffect(passivActor, actor, passiveJamEffect.data.data.value);
                }
            }
        }
        //active token is jamming
        if (actorJamEffect){
            //check distance
            if (distance <= 100) {
                if (passiveJammedEffect?.data?.data?.ownerID !== actor.id){
                    if (game.user?.isGM) await SR5_EffectArea.createJammedEffect(actor, passivActor, actorJamEffect.data.data.value);
                }
            } else {
                if (passiveJammedEffect?.data?.data?.ownerID === actor.id){
                    if (game.user?.isGM) {
                        let jammedActiveEffect = passivActor.data.effects.find(i => i.data.origin === "signalJammed");
                        await passivActor.deleteEmbeddedDocuments("ActiveEffect", [jammedActiveEffect.id]);
                        await passivActor.deleteEmbeddedDocuments("Item", [passiveJammedEffect.id]);
                    }
                }
            }
        }
    }

    //Start jamming
    static async onJamCreation(actorID){
        if (!canvas.scene) return;
        let activeActor = SR5_EntityHelpers.getRealActorFromID(actorID);
        let activeToken = canvas.tokens.placeables.find(t => t.actor.id === actorID);
        let jamEffect =  activeActor.items.find(i => i.data.data.type === "signalJam" && i.data.data.ownerID === activeActor.id);

        for (let token of canvas.tokens.placeables){
            if (token.id !== activeToken.id){
                let tokenActor = SR5_EntityHelpers.getRealActorFromID(token.document.id);
                let distance =  SR5_SystemHelpers.getDistanceBetweenTwoPoint(activeToken._validPosition, token._validPosition);
                let jammedEffect = tokenActor.data.items.find(i => i.data.data.type === "signalJammed" && i.data.data.ownerID === actorID);
                if (distance < 100 && !jammedEffect){
                    if (game.user?.isGM) await SR5_EffectArea.createJammedEffect(activeActor, tokenActor, jamEffect.data.data.value);
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
                let jammedEffect = tokenActor.data.items.find(i => i.data.data.type === "signalJammed" && i.data.data.ownerID === actorID);
                if (jammedEffect) {
                    let jammedActiveEffect = tokenActor.data.effects.find(i => i.data.origin === "signalJammed");
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
            "data.type": "signalJammed",
            "data.ownerID": jammer.id,
            "data.ownerName": jammer.name,
            "data.duration": "permanent",
            "data.target": game.i18n.localize("SR5.MatrixNoise"),
            "data.value": value,
            "data.customEffects": {
                "0": {
                    "category": "matrixAttributes",
                    "target": "data.matrix.noise",
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