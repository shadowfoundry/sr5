import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function overwatchResistanceInfo(cardData){
    let label;
    let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor);
    let currentOS = attacker.system.matrix.overwatchScore;
    cardData.attackerName = attacker.name;
    
    if (cardData.roll.hits < cardData.hits) label = `${game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreSuccess")} ${currentOS}`;
    else label = game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreFailed");

    cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", label);
}