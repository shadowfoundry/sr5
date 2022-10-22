import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5 } from "../config.js";

export class SR5_PrepareRollHelper {
    //Get rolling actor
    static getRollingActor(document){
        let actor;
        if (document.documentName === "Actor") return actor = document;
        else if (document.documentName === "Item") return actor = document.actor;
    }

    //Return the base dice pool
    static getBaseDicepool(rollData){
        for (let m of rollData.dicePool.composition){
            rollData.dicePool.base += m.value;
        }
        return rollData.dicePool.base;
    }

    //Return dice pool modifiers object;
    static getDicepoolModifiers(rollData, modifiers){
        for (let m of modifiers){
            if (m.type !== "skillRating" && m.type !== "linkedAttribute" && m.type !== "skillGroup"){
                rollData.dicePool.modifiers[m.type] = {};
                rollData.dicePool.modifiers[m.type].label = m.source;
                rollData.dicePool.modifiers[m.type].value = m.value;
            }
        }
        return rollData.dicePool.modifiers;
    }

    //Return the actor object targeted on canvas
    static async getTargetedActor(){
        let targets = Array.from(game.user.targets);
        let targetActorId = targets[0].actor.isToken ? targets[0].actor.token.id : targets[0].actor.id;
        return SR5_EntityHelpers.getRealActorFromID(targetActorId);
    }

    static async getTargetedActorID(){
        let targets = Array.from(game.user.targets);
        let targetActorId = targets[0].actor.isToken ? targets[0].actor.token.id : targets[0].actor.id;
        return targetActorId;
    }

    //Return tagerted token info
    static async getTargetData(rollData){
        let targetActor = await this.getTargetedActor();
        if (targetActor){
            rollData = mergeObject(rollData, {
                "target.hasTarget": true,
                "target.actorID": await this.getTargetedActorID(),
            });
        }
        return rollData;
    }

    //Add background count limit modifiers
    static addBackgroundCountLimitModifiers(rollData, actor){
        rollData.limit.modifiers.backgroundCount = {
            value: actor.system.magic.bgCount.value,
            label: game.i18n.localize(SR5.limitModTypes["backgroundCount"]),
        }
        return rollData;
    }

    //Check if a transferable effect is present and add details to roll data
    static addTransferableEffect(rollData, item){
        //Check if an effect is transferable on taget actor and give the necessary infos
        for (let e of Object.values(item.system.customEffects)){
            if (e.transfer) {
                rollData.effects.canApplyEffect = true;
                //If spell has area effect, effect will be automatically applied by canvas template
                if (item.system.range === "area") rollData.effects.canApplyEffect = false;
                continue;
            }
        }

        //Check if an effect is transferable on target item and give the necessary infos
        for (let e of Object.values(item.system.itemEffects)){
            if (e.transfer) {
                rollData.effects.canApplyEffectOnItem = true;
                continue;
            }
        }

        return rollData;
    }
}