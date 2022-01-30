
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_SystemHelpers } from "../system/utility.js";
import { _getSRStatusEffect } from "../system/effectsList.js"

export class SR5_EffectArea {

    //Jam signals management
    static async manageJam(caller, source){
        let callerData = caller.document.actor.data;
        let actor = SR5_EntityHelpers.getRealActorFromID(source.object.document.id);
        
        if (actor.data.effects.find(e => e.data.origin === "signalJam")) await SR5_EffectArea.signalJamArea(source.object.id, caller.id);
        if (actor.data.effects.find(e => e.data.origin === "signalJammed")) await SR5_EffectArea.signalJammedArea(source.object.id, caller.id);
        if (callerData.effects.find(e => e.data.origin === "signalJammed")) await SR5_EffectArea.signalJammedArea(source.object.id, caller.id);
        if (callerData.effects.find(e => e.data.origin === "signalJam")) await SR5_EffectArea.signalJamArea(caller.id, source.object.id);
    }

    static async signalJamArea(jammerTokenID, jammedTokenID) {
        let jammerToken = await canvas.scene.tokens.get(jammerTokenID);
        let jammedToken = await canvas.scene.tokens.get(jammedTokenID);
        let jammerActor = await jammerToken.getActor();
        let jammedActor = await jammedToken.getActor();
        let jammedEffect = await jammedActor.items.find(i => i.data.data.type === "signalJammed" && i.data.data.ownerID === jammerActor.id);
        let distance = await SR5_SystemHelpers.getDistanceBetweenTwoPoint(jammerToken._object._validPosition, jammedToken._object._validPosition);

        if (distance > 100) {
            if (jammedEffect){
                await jammedActor.deleteEmbeddedDocuments("Item", [jammedEffect.id]);
                return;
            } else return;
        }
        if (jammedEffect) return;

        let jamEffect = await jammerActor.items.find(i => i.data.data.type === "signalJam" && i.data.data.ownerID === jammerActor.id);
        if (jamEffect) await SR5_EffectArea.createJammedEffect(jammerActor, jammedActor, jamEffect.data.data.value);
    }

    static async signalJammedArea(jammedTokenID, jammerTokenID) {
        //debugger;
        let jammerToken = await canvas.scene.tokens.get(jammerTokenID);
        let jammedToken = await canvas.scene.tokens.get(jammedTokenID);
        let jammerActor = await jammerToken.getActor();
        let jammedActor = await jammedToken.getActor();
        let jammedEffect = await jammedActor.items.find(i => i.data.data.type === "signalJammed" && i.data.data.ownerID === jammerActor.id);
        let jamEffect = await jammerActor.items.find(i => i.data.data.type === "signalJam" && i.data.data.ownerID === jammerActor.id);
        let distance = await SR5_SystemHelpers.getDistanceBetweenTwoPoint(jammerToken._object._validPosition, jammedToken._object._validPosition);

        if (!jamEffect && jammedEffect) {
            await jammedActor.deleteEmbeddedDocuments("Item", [jammedEffect.id]);
            return;
        }
        if (!jammedEffect && distance > 100) return;
        if (!jammedEffect && distance <=100){
            return SR5_EffectArea.signalJamArea(jammerTokenID, jammedTokenID);
        }
        if (distance > 100) {
            await jammedActor.deleteEmbeddedDocuments("Item", [jammedEffect.id]);
            return;
        }
    }

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
        //console.log(targetActor);
        await jammed.createEmbeddedDocuments("Item", [effect]);
        let statusEffect = await _getSRStatusEffect("signalJammed", value);
        await jammed.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
    }

}