import { SR5_EntityHelpers } from "../../entities/helpers.js";

export default async function liftInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
    let derivedBaseValue = actor.system.weightActions[cardData.test.typeSub].baseWeight.value;
    let derivedExtraValue= actor.system.weightActions[cardData.test.typeSub].extraWeight.value;

    cardData.various.weightTotal = derivedBaseValue + (cardData.roll.hits * derivedExtraValue);
}