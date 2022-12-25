import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function vehicleTestInfo(cardData, actorId){
    if (cardData.test.typeSub !== ""){
        if (cardData.roll.hits >= cardData.threshold.value){
            cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.VehicleTestControlled"));
        } else {
            cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.VehicleTestUncontrolled"));
        }
    }
}