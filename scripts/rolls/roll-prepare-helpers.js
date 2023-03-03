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
        rollData.dicePool.base = 0;
        for (let m of rollData.dicePool.composition){
            rollData.dicePool.base += m.value;
        }
        return rollData.dicePool.base;
    }

    //Return base dice pool composition
    static getDicepoolComposition(composition){
        let dicePoolComposition = composition.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
        return dicePoolComposition;
    }

    //Return dice pool modifiers object;
    static getDicepoolModifiers(rollData, modifiers){
        rollData.dicePool.modifiers = {};
        for (let m of modifiers){
            if (m.type !== "skillRating" && m.type !== "linkedAttribute" && m.type !== "skillGroup" && m.type !== "matrixAttribute" && m.type !== "devicRating"){
                rollData.dicePool.modifiers[m.type] = {};
                rollData.dicePool.modifiers[m.type].label = m.source;
                rollData.dicePool.modifiers[m.type].value = m.value;
            }
        }
        return rollData.dicePool.modifiers;
    }

    //Return the base limit
    static getBaseLimit(limitBase, limitModifiers){
        for (let m of limitModifiers){
            limitBase -= m.value;
        }
        return limitBase;
    }

    //Return limit modifiers object
    static getLimitModifiers(rollData, limitModifiers){
        for (let m of limitModifiers){
            rollData.limit.modifiers[m.type] = {};
            rollData.limit.modifiers[m.type].label = m.source;
            rollData.limit.modifiers[m.type].value = m.value;
        }
        return rollData.limit.modifiers;
    }

    //Return the actor object targeted on canvas
    static async getTargetedActor(){
        let targets = Array.from(game.user.targets);
        let targetActorId = targets[0].actor.isToken ? targets[0].actor.token.id : targets[0].actor.id;
        return SR5_EntityHelpers.getRealActorFromID(targetActorId);
    }

    //Return the actor ID targeted on canvas
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
                "target.actorId": await this.getTargetedActorID(),
            });
        }
        return rollData;
    }

    //Add dicepool modifier
    static addDicepoolModifier(rollData, modifier, modifierValue, modifierLabel){
        rollData.dicePool.modifiers[modifier] = {};
        rollData.dicePool.modifiers[modifier].value = modifierValue;
        rollData.dicePool.modifiers[modifier].label = modifierLabel;
    }

    //Add background count limit modifiers
    static addBackgroundCountLimitModifiers(rollData, actor){
        rollData.limit.modifiers.backgroundCount = {
            value: actor.system.magic.bgCount.value,
            label: game.i18n.localize(SR5.limitModTypes["backgroundCount"]),
        }
        return rollData;
    }

    //Get scene Noise modifier
    static getSceneNoise(){
        if (canvas.scene) {
            if (game.scenes.active) return -game.scenes.active.getFlag("sr5", "matrixNoise") || 0;
        } else return null;
    }

    //Get Cumulative defense 
    static handleCumulativeDefense(rollData, actor){
        let cumulativeDefense = actor.getFlag("sr5", "cumulativeDefense");
        if(cumulativeDefense !== undefined) {
            actor.setFlag("sr5", "cumulativeDefense", cumulativeDefense + 1);
            rollData.dicePool.modifiers.cumulativeDefense = {};
            rollData.dicePool.modifiers.cumulativeDefense.value = -cumulativeDefense;
            rollData.dicePool.modifiers.cumulativeDefense.label = game.i18n.localize("SR5.CumulativeDefense");
        } else {
            actor.setFlag("sr5", "cumulativeDefense", 0);
        }
    
        return rollData;
    }

    //Check if a transferable effect is present and add details to roll data
    static addTransferableEffect(rollData, item){
        //Check if an effect is transferable on taget actor and give the necessary infos
        for (let e of Object.values(item.system.customEffects)){
            if (e.transfer) {
                rollData.effects.canApplyEffect = true;
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

        //Check if an object can resist to spell
        for (let e of Object.values(item.system.systemEffects)){
            if (e.value === "sre_ObjectResistance"){
                rollData.magic.spell.objectCanResist = true;
            }
        }

        return rollData;
    }

    //Check if a spirit can aid sorcery
    static handleSpiritAid(actor, item, rollData) {
        let spiritAid = actor.items.find(i => (i.type === "itemSpirit" && i.system.isBounded && i.system.spellType === item.system.category && i.system.services.value > 0));
        if (spiritAid) {
            rollData.dialogSwitch.spiritAid = true;
            rollData.magic.spiritAid.id = spiritAid.uuid;
            rollData.magic.spiritAid.modifier = spiritAid.system.itemRating;
        }
    }

    //Handle Choke settings on attack
    static chokeSettingsOnDamage(modifier, range) {

        switch (modifier){
            case "narrow":
                return 0;
            case "medium":
                switch (range){
                    case "short":
                        return 1;
                    case "medium":
                        return 3;
                    case "long":
                        return 5;
                    case "extreme":
                        return 7;
                    default:
                        return 0;
                }
            case "wide":
                switch (range){
                    case "short":
                        return 3;
                    case "medium":
                        return 5;
                    case "long":
                        return 7;
                    case "extreme":
                        return 9;
                    default:
                        return;
                }
            default:
                return;
        }
    }

        //Handle Choke settings on attack
        static chokeSettingsOnLimit(modifier, range) {
            
            switch (modifier){
                case "narrow":
                    return 0;
                case "medium":
                    switch (range){
                        case "short":
                        case "medium":
                        case "long":
                            return 0;
                        case "extreme":
                           return -1;
                        default:
                            return 0;
                    }
                case "wide":
                    switch (range){
                        case "short":
                        case "medium":                           
                            return 0;
                        case "long":
                        case "extreme":
                            return -1;
                        default:
                            return 0;
                    }
                default:
                    return 0;
            }
        }

        //Handle Choke settings on attack
        static chokeSettingsOnDefense(modifier, range) {
            
            switch (modifier){
                case "narrow":
                    return -1;
                case "medium":
                    switch (range){
                        case "short":
                        case "medium":
                        case "long":
                        case "extreme":
                           return -3;
                        default:
                            return 0;
                    }
                case "wide":
                    switch (range){
                        case "short":
                        case "medium": 
                        case "long":
                        case "extreme":
                            return -5;
                        default:
                            return 0;
                    }
                default:
                    return 0;
            }
        }

}