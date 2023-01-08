import { SR5_EntityHelpers } from "../../entities/helpers.js";

export default async function liftInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
    let derivedBaseValue = actor.system.movements[cardData.test.typeSub].movement.value;
    let derivedExtraValue= actor.system.movements[cardData.test.typeSub].extraMovement.value;
    cardData.various.unit = game.i18n.localize("SR5.MeterUnit");
    
    switch (cardData.test.typeSub){
        case "treadWater":
            cardData.various.unit = game.i18n.localize("SR5.MinuteUnit");
            break;
        case "holdBreath":
            cardData.various.unit = game.i18n.localize("SR5.SecondUnit");
            break;
        default:
        }

    cardData.various.movementTotal = derivedBaseValue + (cardData.roll.hits * derivedExtraValue);
}
//