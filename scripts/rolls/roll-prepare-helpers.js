import { SR5_EntityHelpers } from "../entities/helpers.js";

export class SR5_PrepareRollHelper {
    //Get rolling actor
    static getRollingActor(document){
        let actor;
        if (document.documentName === "Actor") return actor = document;
        else if (document.documentName === "Item") return actor = document.actor;
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
}